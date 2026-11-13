<?php
declare(strict_types=1);

// Domain logic shared by the back-office pages (public/admin/*.php) and the public API.
// Every function validates its own input, checks permissions and throws HttpError(status, message)
// on failure. Writes always call audit() and, if public data changed, bump_data_version().

const DEPT_TYPES = ['service', 'admin', 'academic', 'meeting', 'executive', 'digital'];
const DEPT_TYPE_LABELS = [
    'service' => 'บริการประชาชน', 'admin' => 'บริหาร/สนับสนุน', 'academic' => 'วิชาการ',
    'meeting' => 'ห้องประชุม', 'executive' => 'ผู้บริหาร', 'digital' => 'สุขภาพดิจิทัล',
];

// Current assignment = valid_from <= today AND (valid_to IS NULL OR valid_to > today)
const CURRENT_ASSIGNMENT_SQL = "ra.valid_from <= CURDATE() AND (ra.valid_to IS NULL OR ra.valid_to > CURDATE())";

const MEETING_ROOM_JOIN = "JOIN room_assignments ra ON ra.room_id = r.id AND " . CURRENT_ASSIGNMENT_SQL . "
        JOIN departments d ON d.id = ra.department_id AND d.type = 'meeting' AND d.is_active = 1";

// ============================ AUTH ============================

/** Verifies credentials, starts a fresh session. Returns the user. Same error for every failure. */
function auth_login(string $username, string $password): array
{
    // Per-IP limit stops password spraying across usernames; per-account lockout stops guessing one.
    rate_limit('login:' . client_ip(), 20, 600);
    $username = trim($username);
    if ($username === '' || $password === '' || mb_strlen($username) > 64 || strlen($password) > 200) {
        throw new HttpError(422, 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน');
    }

    $st = db()->prepare('SELECT id, password_hash, is_active, failed_logins, locked_until FROM users WHERE username = ?');
    $st->execute([$username]);
    $u = $st->fetch();

    // Always run password_verify (similar timing for unknown users)
    $hash = $u['password_hash'] ?? '$2y$10$usesomesillystringforsaltuJ7Gq2t6QZp5hYwXyCq0M3a0Kc5W.';
    $ok = password_verify($password, $hash);

    $generic = 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง หรือบัญชีถูกล็อกชั่วคราว 15 นาที';
    if ($u && $u['locked_until'] !== null && strtotime($u['locked_until']) > time()) {
        throw new HttpError(401, $generic);
    }
    if (!$u || !$ok || !(int)$u['is_active']) {
        if ($u) {
            $fails = (int)$u['failed_logins'] + 1;
            $lock = $fails >= 5 ? date('Y-m-d H:i:s', time() + 900) : null;
            db()->prepare('UPDATE users SET failed_logins = ?, locked_until = ? WHERE id = ?')
                ->execute([$lock ? 0 : $fails, $lock, $u['id']]);
        }
        throw new HttpError(401, $generic);
    }

    if (password_needs_rehash($u['password_hash'], PASSWORD_DEFAULT)) {
        db()->prepare('UPDATE users SET password_hash = ? WHERE id = ?')
            ->execute([password_hash($password, PASSWORD_DEFAULT), $u['id']]);
    }
    db()->prepare('UPDATE users SET failed_logins = 0, locked_until = NULL, last_login_at = NOW() WHERE id = ?')
        ->execute([$u['id']]);

    session_regenerate_id(true);
    $_SESSION = ['uid' => (int)$u['id'], 'last_seen' => time()];
    $me = current_user();
    audit($me, 'auth.login', 'user', $me['id'], null, null);
    return $me;
}

function auth_logout(array $user): void
{
    audit($user, 'auth.logout', 'user', $user['id'], null, null);
    $_SESSION = [];
    session_regenerate_id(true);
}

function auth_change_password(array $user, array $in): void
{
    $old = v_str($in, 'current_password', 200);
    $new = v_str($in, 'new_password', 200);
    if (mb_strlen($new) < 6) {
        throw new HttpError(422, 'รหัสผ่านใหม่ต้องยาวอย่างน้อย 6 ตัวอักษร');
    }
    if (($in['new_password_confirm'] ?? $new) !== $new) {
        throw new HttpError(422, 'ยืนยันรหัสผ่านใหม่ไม่ตรงกัน');
    }
    $st = db()->prepare('SELECT password_hash FROM users WHERE id = ?');
    $st->execute([$user['id']]);
    if (!password_verify($old, (string)$st->fetchColumn())) {
        throw new HttpError(403, 'รหัสผ่านปัจจุบันไม่ถูกต้อง');
    }
    db()->prepare('UPDATE users SET password_hash = ? WHERE id = ?')->execute([password_hash($new, PASSWORD_DEFAULT), $user['id']]);
    session_regenerate_id(true);
    audit($user, 'auth.password_change', 'user', $user['id'], null, null);
}

// ============================ DEPARTMENTS ============================

function dept_row(int $id): ?array
{
    $st = db()->prepare('SELECT id, name, name_en, head_title, phone_ext, description, description_en, type, is_active FROM departments WHERE id = ?');
    $st->execute([$id]);
    $r = $st->fetch();
    return $r ?: null;
}

/** Key order matches the column lists in dept_create / dept_update. */
function dept_input(array $in): array
{
    return [
        'name'           => v_str($in, 'name', 255),
        'name_en'        => v_str($in, 'name_en', 255, false),
        'head_title'     => v_str($in, 'head_title', 255, false),
        'phone_ext'      => v_str($in, 'phone_ext', 50, false),
        'description'    => v_str($in, 'description', 2000, false),
        'description_en' => v_str($in, 'description_en', 2000, false),
        'type'           => v_enum($in, 'type', DEPT_TYPES),
    ];
}

function dept_list(array $user): array
{
    $rows = db()->query("
        SELECT d.id, d.name, d.name_en, d.head_title, d.phone_ext, d.description, d.description_en, d.type, d.is_active, d.updated_at,
               GROUP_CONCAT(ra.room_id ORDER BY ra.room_id) AS rooms
        FROM departments d
        LEFT JOIN room_assignments ra ON ra.department_id = d.id AND " . CURRENT_ASSIGNMENT_SQL . "
        GROUP BY d.id ORDER BY d.is_active DESC, d.name")->fetchAll();
    foreach ($rows as &$r) {
        $r['id'] = (int)$r['id'];
        $r['is_active'] = (bool)$r['is_active'];
        $r['rooms'] = $r['rooms'] ? explode(',', $r['rooms']) : [];
        $r['can_edit'] = can_edit_department($user, $r['id']);
    }
    unset($r);
    return $rows;
}

function dept_create(array $user, array $in): int
{
    require_admin($user);
    $d = dept_input($in);
    db()->prepare('INSERT INTO departments (name, name_en, head_title, phone_ext, description, description_en, type) VALUES (?, ?, ?, ?, ?, ?, ?)')
        ->execute(array_values($d));
    $id = (int)db()->lastInsertId();
    audit($user, 'department.create', 'department', $id, null, $d);
    bump_data_version();
    return $id;
}

function dept_update(array $user, int $id, array $in): void
{
    $before = dept_row($id) ?? throw new HttpError(404, 'ไม่พบกลุ่มงาน');
    if (!can_edit_department($user, $id)) {
        throw new HttpError(403, 'แก้ไขได้เฉพาะกลุ่มงานของตนเอง');
    }
    $d = dept_input($in);
    // Only admins may toggle is_active; for forms, the checkbox is present only for admins
    $active = $user['role'] === 'admin' && array_key_exists('is_active_present', $in)
        ? (int)!empty($in['is_active']) : (int)$before['is_active'];
    db()->prepare('UPDATE departments SET name = ?, name_en = ?, head_title = ?, phone_ext = ?, description = ?, description_en = ?, type = ?, is_active = ? WHERE id = ?')
        ->execute([...array_values($d), $active, $id]);
    audit($user, 'department.update', 'department', $id, $before, dept_row($id));
    bump_data_version();
}

function dept_deactivate(array $user, int $id): void
{
    require_admin($user);
    $before = dept_row($id) ?? throw new HttpError(404, 'ไม่พบกลุ่มงาน');
    // Soft delete: history in room_assignments / audit stays intact
    db()->prepare('UPDATE departments SET is_active = 0 WHERE id = ?')->execute([$id]);
    db()->prepare('UPDATE room_assignments SET valid_to = CURDATE() WHERE department_id = ? AND valid_to IS NULL')->execute([$id]);
    audit($user, 'department.deactivate', 'department', $id, $before, null);
    bump_data_version();
}

// ============================ ROOMS ============================

function room_row(string $id): ?array
{
    $st = db()->prepare("
        SELECT r.id, r.building_id, r.floor, r.room_no, r.label, r.lx, r.lz, r.w, r.d, ra.department_id
        FROM rooms r
        LEFT JOIN room_assignments ra ON ra.room_id = r.id AND " . CURRENT_ASSIGNMENT_SQL . "
        WHERE r.id = ? ORDER BY ra.valid_from DESC LIMIT 1");
    $st->execute([$id]);
    $r = $st->fetch();
    return $r ?: null;
}

function room_list(): array
{
    $rows = db()->query("
        SELECT r.id, r.building_id, b.short_name AS building_name, r.floor, r.room_no, r.label,
               r.lx, r.lz, r.w, r.d,
               (SELECT ra.department_id FROM room_assignments ra
                WHERE ra.room_id = r.id AND " . CURRENT_ASSIGNMENT_SQL . "
                ORDER BY ra.valid_from DESC, ra.id DESC LIMIT 1) AS department_id
        FROM rooms r JOIN buildings b ON b.id = r.building_id
        ORDER BY b.sort_order, r.floor, r.room_no")->fetchAll();
    foreach ($rows as &$r) {
        foreach (['lx', 'lz', 'w', 'd'] as $k) {
            $r[$k] = (float)$r[$k];
        }
        $r['floor'] = (int)$r['floor'];
        $r['department_id'] = $r['department_id'] === null ? null : (int)$r['department_id'];
    }
    unset($r);
    return $rows;
}

function building_list(): array
{
    $rows = db()->query('SELECT id, name, name_en, short_name, short_name_en, floors, width, depth,
                                center_x, center_z, rot_y, color, sort_order
                         FROM buildings ORDER BY sort_order, id')->fetchAll();
    foreach ($rows as &$b) {
        $b['floors'] = (int)$b['floors'];
        $b['width'] = (float)$b['width'];
        $b['depth'] = (float)$b['depth'];
        $b['center_x'] = (float)$b['center_x'];
        $b['center_z'] = (float)$b['center_z'];
        $b['rot_y'] = (float)$b['rot_y'];
        $b['sort_order'] = (int)$b['sort_order'];
    }
    unset($b);
    return $rows;
}

function building_row(string $id): ?array
{
    $st = db()->prepare('SELECT id, name, name_en, short_name, short_name_en, floors, width, depth,
                                center_x, center_z, rot_y, color, sort_order
                         FROM buildings WHERE id = ?');
    $st->execute([$id]);
    $b = $st->fetch();
    if (!$b) return null;
    $b['floors'] = (int)$b['floors'];
    $b['width'] = (float)$b['width'];
    $b['depth'] = (float)$b['depth'];
    $b['center_x'] = (float)$b['center_x'];
    $b['center_z'] = (float)$b['center_z'];
    $b['rot_y'] = (float)$b['rot_y'];
    $b['sort_order'] = (int)$b['sort_order'];
    return $b;
}

function building_create(array $user, array $in): string
{
    require_admin($user);
    $id = strtoupper(trim(v_str($in, 'id', 16)));
    if (!preg_match('/^[A-Z0-9_-]{1,16}$/', $id)) {
        throw new HttpError(422, 'รหัสอาคารต้องเป็นภาษาอังกฤษตัวพิมพ์ใหญ่หรือตัวเลข ไม่เกิน 16 ตัวอักษร');
    }
    if (building_row($id)) {
        throw new HttpError(422, "มีรหัสอาคาร '$id' อยู่ในระบบแล้ว");
    }
    $name = v_str($in, 'name', 200);
    $nameEn = v_str($in, 'name_en', 200, false);
    $shortName = v_str($in, 'short_name', 100);
    $shortNameEn = v_str($in, 'short_name_en', 100, false);
    $floors = max(1, min(10, (int)($in['floors'] ?? 1)));
    $width = max(2.0, min(100.0, (float)($in['width'] ?? 15.0)));
    $depth = max(2.0, min(100.0, (float)($in['depth'] ?? 10.0)));
    $centerX = max(-100.0, min(100.0, (float)($in['center_x'] ?? 0.0)));
    $centerZ = max(-100.0, min(100.0, (float)($in['center_z'] ?? 0.0)));
    $rotY = max(-6.28, min(6.28, (float)($in['rot_y'] ?? 0.0)));
    $color = trim((string)($in['color'] ?? '#10b981'));
    if (!preg_match('/^#[0-9a-fA-F]{6}$/', $color)) {
        $color = '#10b981';
    }
    $sortOrder = (int)($in['sort_order'] ?? 0);

    $pdo = db();
    $st = $pdo->prepare('INSERT INTO buildings (id, name, name_en, short_name, short_name_en, floors, width, depth, center_x, center_z, rot_y, color, sort_order)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    $st->execute([$id, $name, $nameEn, $shortName, $shortNameEn, $floors, $width, $depth, $centerX, $centerZ, $rotY, $color, $sortOrder]);

    audit($user, 'building.create', 'building', $id, null, building_row($id));
    bump_data_version();
    return $id;
}

function building_update(array $user, string $id, array $in): void
{
    require_admin($user);
    $before = building_row($id) ?? throw new HttpError(404, 'ไม่พบอาคาร');
    $name = v_str($in, 'name', 200);
    $nameEn = v_str($in, 'name_en', 200, false);
    $shortName = v_str($in, 'short_name', 100);
    $shortNameEn = v_str($in, 'short_name_en', 100, false);
    $floors = max(1, min(10, (int)($in['floors'] ?? $before['floors'])));
    $width = max(2.0, min(100.0, (float)($in['width'] ?? $before['width'])));
    $depth = max(2.0, min(100.0, (float)($in['depth'] ?? $before['depth'])));
    $centerX = max(-100.0, min(100.0, (float)($in['center_x'] ?? $before['center_x'])));
    $centerZ = max(-100.0, min(100.0, (float)($in['center_z'] ?? $before['center_z'])));
    $rotY = max(-6.28, min(6.28, (float)($in['rot_y'] ?? $before['rot_y'])));
    $color = trim((string)($in['color'] ?? $before['color']));
    if (!preg_match('/^#[0-9a-fA-F]{6}$/', $color)) {
        $color = $before['color'];
    }
    $sortOrder = (int)($in['sort_order'] ?? $before['sort_order']);

    $pdo = db();
    $st = $pdo->prepare('UPDATE buildings
                         SET name = ?, name_en = ?, short_name = ?, short_name_en = ?,
                             floors = ?, width = ?, depth = ?, center_x = ?, center_z = ?, rot_y = ?, color = ?, sort_order = ?
                         WHERE id = ?');
    $st->execute([$name, $nameEn, $shortName, $shortNameEn, $floors, $width, $depth, $centerX, $centerZ, $rotY, $color, $sortOrder, $id]);

    audit($user, 'building.update', 'building', $id, $before, building_row($id));
    bump_data_version();
}

function building_delete(array $user, string $id): void
{
    require_admin($user);
    $before = building_row($id) ?? throw new HttpError(404, 'ไม่พบอาคาร');

    $roomCount = (int)db()->query('SELECT COUNT(*) FROM rooms WHERE building_id = ' . db()->quote($id))->fetchColumn();
    if ($roomCount > 0) {
        throw new HttpError(422, "ไม่สามารถลบอาคารได้ เนื่องจากมีห้องใช้งานอยู่ในอาคารนี้ ($roomCount ห้อง) กรุณาย้ายหรือลบห้องก่อน");
    }

    $pdo = db();
    $pdo->prepare('DELETE FROM buildings WHERE id = ?')->execute([$id]);

    audit($user, 'building.delete', 'building', $id, $before, null);
    bump_data_version();
}

function room_create(array $user, array $in): string
{
    require_admin($user);
    $id = strtoupper(trim(v_str($in, 'id', 16)));
    if (!preg_match('/^[A-Z0-9_-]{1,16}$/', $id)) {
        throw new HttpError(422, 'รหัสห้องต้องเป็นภาษาอังกฤษตัวพิมพ์ใหญ่หรือตัวเลข ไม่เกิน 16 ตัวอักษร');
    }
    if (room_row($id)) {
        throw new HttpError(422, "มีรหัสห้อง '$id' อยู่ในระบบแล้ว");
    }
    $buildingId = trim((string)($in['building_id'] ?? ''));
    $bld = building_row($buildingId) ?? throw new HttpError(422, 'ไม่พบอาคารที่ระบุ');
    $floor = max(1, min($bld['floors'], (int)($in['floor'] ?? 1)));
    $roomNo = v_str($in, 'room_no', 20);
    $label = v_str($in, 'label', 200, false);
    $lx = max(-40.0, min(40.0, (float)($in['lx'] ?? 0.0)));
    $lz = max(-40.0, min(40.0, (float)($in['lz'] ?? 0.0)));
    $w = max(1.0, min(30.0, (float)($in['w'] ?? 5.0)));
    $d = max(1.0, min(30.0, (float)($in['d'] ?? 5.0)));

    $pdo = db();
    $pdo->beginTransaction();
    try {
        $st = $pdo->prepare('INSERT INTO rooms (id, building_id, floor, room_no, label, lx, lz, w, d)
                             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
        $st->execute([$id, $buildingId, $floor, $roomNo, $label, $lx, $lz, $w, $d]);

        $deptId = v_int_or_null($in, 'department_id');
        if ($deptId !== null) {
            $pdo->prepare('INSERT INTO room_assignments (room_id, department_id, valid_from) VALUES (?, ?, CURDATE())')
                ->execute([$id, $deptId]);
        }

        audit($user, 'room.create', 'room', $id, null, room_row($id));
        bump_data_version();
        $pdo->commit();
        return $id;
    } catch (Throwable $e) {
        $pdo->rollBack();
        throw $e;
    }
}

function room_delete(array $user, string $id): void
{
    require_admin($user);
    $before = room_row($id) ?? throw new HttpError(404, 'ไม่พบห้อง');
    $pdo = db();
    $pdo->beginTransaction();
    try {
        $pdo->prepare('DELETE FROM room_assignments WHERE room_id = ?')->execute([$id]);
        $pdo->prepare('DELETE FROM bookings WHERE room_id = ?')->execute([$id]);
        $pdo->prepare('DELETE FROM rooms WHERE id = ?')->execute([$id]);

        audit($user, 'room.delete', 'room', $id, $before, null);
        bump_data_version();
        $pdo->commit();
    } catch (Throwable $e) {
        $pdo->rollBack();
        throw $e;
    }
}

/** Admin: change label / footprint (2D plan editor) and/or department assignment. */
function room_update(array $user, string $id, array $in): void
{
    require_admin($user);
    $before = room_row($id) ?? throw new HttpError(404, 'ไม่พบห้อง');
    $pdo = db();
    $pdo->beginTransaction();
    try {
        if (array_key_exists('label', $in) || array_key_exists('lx', $in)) {
            $bld = building_row($before['building_id']);
            $maxLx = $bld ? round((float)$bld['width'] / 2, 2) : 40.0;
            $maxLz = $bld ? round((float)$bld['depth'] / 2, 2) : 40.0;
            $maxW = $bld ? (float)$bld['width'] : 30.0;
            $maxD = $bld ? (float)$bld['depth'] : 30.0;

            $num = function (string $k, float $min, float $max) use ($in, $before): float {
                $v = $in[$k] ?? $before[$k];
                if (!is_numeric($v) || (float)$v < $min || (float)$v > $max) {
                    throw new HttpError(422, "$k ต้องอยู่ระหว่าง $min ถึง $max");
                }
                return round((float)$v, 2);
            };
            $label = array_key_exists('label', $in) ? v_str($in, 'label', 200, false) : $before['label'];
            $pdo->prepare('UPDATE rooms SET label = ?, lx = ?, lz = ?, w = ?, d = ? WHERE id = ?')->execute([
                $label, $num('lx', -$maxLx, $maxLx), $num('lz', -$maxLz, $maxLz), $num('w', 1, $maxW), $num('d', 1, $maxD), $id,
            ]);
        }
        if (array_key_exists('department_id', $in)) {
            $deptId = v_int_or_null($in, 'department_id');
            if ($deptId !== null && !(int)(dept_row($deptId)['is_active'] ?? 0)) {
                throw new HttpError(422, 'ไม่พบกลุ่มงาน หรือกลุ่มงานถูกปิดใช้งาน');
            }
            $current = $before['department_id'] === null ? null : (int)$before['department_id'];
            if ($deptId !== $current) {
                $pdo->prepare("UPDATE room_assignments ra SET valid_to = CURDATE()
                               WHERE ra.room_id = ? AND " . CURRENT_ASSIGNMENT_SQL)->execute([$id]);
                // Same-day reassign: remove rows that became zero-length (valid_from = valid_to = today)
                $pdo->prepare('DELETE FROM room_assignments WHERE room_id = ? AND valid_from = CURDATE() AND valid_to = CURDATE()')->execute([$id]);
                if ($deptId !== null) {
                    $pdo->prepare('INSERT INTO room_assignments (room_id, department_id, valid_from) VALUES (?, ?, CURDATE())')
                        ->execute([$id, $deptId]);
                }
            }
        }
        audit($user, 'room.update', 'room', $id, $before, room_row($id));
        bump_data_version();
        $pdo->commit();
    } catch (Throwable $e) {
        $pdo->rollBack();
        throw $e;
    }
}

// ============================ SERVICE KEYWORDS ============================

function service_list(array $user): array
{
    $rows = db()->query('SELECT s.id, s.keyword, s.department_id, d.name AS department_name
                         FROM services s JOIN departments d ON d.id = s.department_id ORDER BY d.name, s.keyword')->fetchAll();
    foreach ($rows as &$r) {
        $r['id'] = (int)$r['id'];
        $r['department_id'] = (int)$r['department_id'];
        $r['can_edit'] = can_edit_department($user, $r['department_id']);
    }
    unset($r);
    return $rows;
}

function service_create(array $user, array $in): int
{
    $kw = v_str($in, 'keyword', 255);
    $deptId = v_int_or_null($in, 'department_id') ?? throw new HttpError(422, 'กรุณาเลือกกลุ่มงาน');
    if (!dept_row($deptId)) {
        throw new HttpError(422, 'ไม่พบกลุ่มงาน');
    }
    if (!can_edit_department($user, $deptId)) {
        throw new HttpError(403, 'แก้ไขได้เฉพาะกลุ่มงานของตนเอง');
    }
    db()->prepare('INSERT INTO services (keyword, department_id) VALUES (?, ?)')->execute([$kw, $deptId]);
    $id = (int)db()->lastInsertId();
    audit($user, 'service.create', 'service', $id, null, ['keyword' => $kw, 'department_id' => $deptId]);
    bump_data_version();
    return $id;
}

function service_delete(array $user, int $id): void
{
    $st = db()->prepare('SELECT id, keyword, department_id FROM services WHERE id = ?');
    $st->execute([$id]);
    $before = $st->fetch() ?: throw new HttpError(404, 'ไม่พบรายการ');
    if (!can_edit_department($user, (int)$before['department_id'])) {
        throw new HttpError(403, 'แก้ไขได้เฉพาะกลุ่มงานของตนเอง');
    }
    db()->prepare('DELETE FROM services WHERE id = ?')->execute([$id]);
    audit($user, 'service.delete', 'service', $id, $before, null);
    bump_data_version();
}

// ============================ USERS (admin) ============================

function user_list(array $user): array
{
    require_admin($user);
    return db()->query('SELECT u.id, u.username, u.role, u.department_id, d.name AS department_name, u.is_active, u.last_login_at, u.locked_until
                        FROM users u LEFT JOIN departments d ON d.id = u.department_id ORDER BY u.username')->fetchAll();
}

function user_row(int $id): ?array
{
    $st = db()->prepare('SELECT id, username, role, department_id, is_active FROM users WHERE id = ?');
    $st->execute([$id]);
    return $st->fetch() ?: null;
}

function user_input(array $in, bool $creating): array
{
    $role = v_enum($in, 'role', ['admin', 'editor']);
    $dept = v_int_or_null($in, 'department_id');
    if ($role === 'editor' && $dept === null) {
        throw new HttpError(422, 'ผู้แก้ไขกลุ่มงานต้องระบุกลุ่มงาน');
    }
    if ($dept !== null && !dept_row($dept)) {
        throw new HttpError(422, 'ไม่พบกลุ่มงาน');
    }
    $pw = v_str($in, 'password', 200, $creating);
    if ($pw !== '' && mb_strlen($pw) < 6) {
        throw new HttpError(422, 'รหัสผ่านต้องยาวอย่างน้อย 6 ตัวอักษร');
    }
    return ['role' => $role, 'department_id' => $role === 'admin' ? null : $dept, 'password' => $pw];
}

function user_create(array $user, array $in): int
{
    require_admin($user);
    $username = v_str($in, 'username', 64);
    if (!preg_match('/^[a-zA-Z0-9._-]{3,64}$/', $username)) {
        throw new HttpError(422, 'ชื่อผู้ใช้ใช้ได้เฉพาะ a-z 0-9 . _ - (3-64 ตัว)');
    }
    $u = user_input($in, true);
    db()->prepare('INSERT INTO users (username, password_hash, role, department_id) VALUES (?, ?, ?, ?)')
        ->execute([$username, password_hash($u['password'], PASSWORD_DEFAULT), $u['role'], $u['department_id']]);
    $id = (int)db()->lastInsertId();
    audit($user, 'user.create', 'user', $id, null, ['username' => $username, 'role' => $u['role'], 'department_id' => $u['department_id']]);
    return $id;
}

function user_update(array $user, int $id, array $in): void
{
    require_admin($user);
    $before = user_row($id) ?? throw new HttpError(404, 'ไม่พบผู้ใช้');
    $u = user_input($in, false);
    $active = (int)!empty($in['is_active']);
    if ($id === $user['id'] && ($u['role'] !== 'admin' || !$active)) {
        throw new HttpError(422, 'ไม่สามารถลดสิทธิ์หรือปิดบัญชีของตนเอง');
    }
    db()->prepare('UPDATE users SET role = ?, department_id = ?, is_active = ?, failed_logins = 0, locked_until = NULL WHERE id = ?')
        ->execute([$u['role'], $u['department_id'], $active, $id]);
    if ($u['password'] !== '') {
        db()->prepare('UPDATE users SET password_hash = ? WHERE id = ?')->execute([password_hash($u['password'], PASSWORD_DEFAULT), $id]);
    }
    audit($user, 'user.update', 'user', $id, $before,
        ['role' => $u['role'], 'department_id' => $u['department_id'], 'is_active' => $active, 'password_reset' => $u['password'] !== '']);
}

// ============================ AUDIT / STATS ============================

function audit_list(array $user, int $limit = 200): array
{
    require_admin($user);
    $limit = min(500, max(1, $limit));
    return db()->query('SELECT id, username, action, entity, entity_id, before_json, after_json, ip, created_at
                        FROM audit_log ORDER BY id DESC LIMIT ' . $limit)->fetchAll();
}

/** "field: old -> new | ..." for the audit table */
function audit_diff(?string $before, ?string $after): string
{
    if (!$before || !$after) {
        return '';
    }
    $b = json_decode($before, true) ?: [];
    $a = json_decode($after, true) ?: [];
    $out = [];
    foreach ($a as $k => $v) {
        if (json_encode($v) !== json_encode($b[$k] ?? null)) {
            $fmt = fn($x) => $x === null ? '∅' : (is_scalar($x) ? (string)$x : json_encode($x, JSON_UNESCAPED_UNICODE));
            $out[] = "$k: " . $fmt($b[$k] ?? null) . ' → ' . $fmt($v);
        }
    }
    return implode(' | ', $out);
}

function search_stats(array $user, int $days): array
{
    require_admin($user);
    $days = min(365, max(1, $days));
    $st = db()->prepare('SELECT query_norm AS q, SUM(hits) AS hits, SUM(zero_results) AS zero
                         FROM search_stats WHERE day >= CURDATE() - INTERVAL ? DAY
                         GROUP BY query_norm ORDER BY hits DESC LIMIT 100');
    $st->execute([$days]);
    $top = $st->fetchAll();
    $st = db()->prepare('SELECT query_norm AS q, SUM(zero_results) AS zero
                         FROM search_stats WHERE day >= CURDATE() - INTERVAL ? DAY AND zero_results > 0
                         GROUP BY query_norm ORDER BY zero DESC LIMIT 50');
    $st->execute([$days]);
    return ['top' => $top, 'not_found' => $st->fetchAll()];
}

// ============================ BOOKINGS ============================
// Any logged-in user may book a meeting-type room; only the creator or an admin may cancel.
// Titles are PUBLIC (map / kiosk).

function parse_local_datetime(array $in, string $key): DateTimeImmutable
{
    $v = $in[$key] ?? null;
    if (!is_string($v) || !preg_match('/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/', $v)) {
        throw new HttpError(422, "$key ต้องอยู่ในรูปแบบ YYYY-MM-DDTHH:MM");
    }
    $dt = DateTimeImmutable::createFromFormat('Y-m-d\TH:i', $v);
    if (!$dt || $dt->format('Y-m-d\TH:i') !== $v) {
        throw new HttpError(422, 'วันที่/เวลาไม่ถูกต้อง');
    }
    return $dt;
}

function meeting_rooms(): array
{
    return db()->query('SELECT r.id, r.room_no, d.name FROM rooms r ' . MEETING_ROOM_JOIN . ' ORDER BY r.room_no')->fetchAll();
}

function booking_list(array $user, string $from): array
{
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $from)) {
        $from = date('Y-m-d');
    }
    $st = db()->prepare("
        SELECT b.id, b.room_id, r.room_no, b.title, b.department_id, d.name AS department_name,
               DATE_FORMAT(b.starts_at, '%Y-%m-%d %H:%i') AS starts_at, DATE_FORMAT(b.ends_at, '%Y-%m-%d %H:%i') AS ends_at,
               b.created_by, u.username AS created_by_name
        FROM bookings b
        JOIN rooms r ON r.id = b.room_id
        LEFT JOIN departments d ON d.id = b.department_id
        LEFT JOIN users u ON u.id = b.created_by
        WHERE b.ends_at >= ? AND b.starts_at < ? + INTERVAL 31 DAY
        ORDER BY b.starts_at");
    $st->execute([$from, $from]);
    $rows = $st->fetchAll();
    foreach ($rows as &$r) {
        $r['id'] = (int)$r['id'];
        $r['can_delete'] = $user['role'] === 'admin' || (int)$r['created_by'] === $user['id'];
    }
    unset($r);
    return $rows;
}

function booking_create(array $user, array $in): int
{
    $roomId = v_str($in, 'room_id', 16);
    $title = v_str($in, 'title', 200);
    $deptId = v_int_or_null($in, 'department_id');
    $start = parse_local_datetime($in, 'starts_at');
    $end = parse_local_datetime($in, 'ends_at');
    if ($end <= $start) {
        throw new HttpError(422, 'เวลาสิ้นสุดต้องหลังเวลาเริ่ม');
    }
    if ($end->getTimestamp() - $start->getTimestamp() > 12 * 3600) {
        throw new HttpError(422, 'จองได้ไม่เกิน 12 ชั่วโมงต่อครั้ง');
    }
    if ($end < new DateTimeImmutable()) {
        throw new HttpError(422, 'ไม่สามารถจองย้อนหลัง');
    }
    if ($deptId !== null && !dept_row($deptId)) {
        throw new HttpError(422, 'ไม่พบกลุ่มงาน');
    }
    $st = db()->prepare('SELECT 1 FROM rooms r ' . MEETING_ROOM_JOIN . ' WHERE r.id = ?');
    $st->execute([$roomId]);
    if (!$st->fetchColumn()) {
        throw new HttpError(422, 'ห้องนี้ไม่ใช่ห้องประชุม');
    }

    $pdo = db();
    $pdo->beginTransaction();
    try {
        // Row lock on the room serializes concurrent bookings, so the overlap check can't race
        $pdo->prepare('SELECT id FROM rooms WHERE id = ? FOR UPDATE')->execute([$roomId]);
        $ov = $pdo->prepare("SELECT title, DATE_FORMAT(starts_at, '%H:%i') s, DATE_FORMAT(ends_at, '%H:%i') e
                             FROM bookings WHERE room_id = ? AND starts_at < ? AND ends_at > ? LIMIT 1");
        $ov->execute([$roomId, $end->format('Y-m-d H:i:s'), $start->format('Y-m-d H:i:s')]);
        if ($c = $ov->fetch()) {
            throw new HttpError(409, "ช่วงเวลาซ้อนกับ \"{$c['title']}\" ({$c['s']}-{$c['e']})");
        }
        $pdo->prepare('INSERT INTO bookings (room_id, title, department_id, starts_at, ends_at, created_by) VALUES (?, ?, ?, ?, ?, ?)')
            ->execute([$roomId, $title, $deptId, $start->format('Y-m-d H:i:s'), $end->format('Y-m-d H:i:s'), $user['id']]);
        $id = (int)$pdo->lastInsertId();
        audit($user, 'booking.create', 'booking', $id, null,
            ['room_id' => $roomId, 'title' => $title, 'starts_at' => $start->format('c'), 'ends_at' => $end->format('c')]);
        bump_data_version();
        $pdo->commit();
    } catch (Throwable $e) {
        $pdo->rollBack();
        throw $e;
    }
    return $id;
}

function booking_delete(array $user, int $id): void
{
    $st = db()->prepare('SELECT id, room_id, title, starts_at, ends_at, created_by FROM bookings WHERE id = ?');
    $st->execute([$id]);
    $b = $st->fetch() ?: throw new HttpError(404, 'ไม่พบการจอง');
    if ($user['role'] !== 'admin' && (int)$b['created_by'] !== $user['id']) {
        throw new HttpError(403, 'ยกเลิกได้เฉพาะการจองของตนเอง');
    }
    db()->prepare('DELETE FROM bookings WHERE id = ?')->execute([$id]);
    audit($user, 'booking.delete', 'booking', $id, $b, null);
    bump_data_version();
}

// ============================ PHOTOS ============================

function photo_list(array $user): array
{
    $st = db()->query('SELECT p.*, r.room_no, r.label as room_label, d.name as dept_name
                       FROM photos p
                       LEFT JOIN rooms r ON r.id = p.room_id
                       LEFT JOIN room_assignments ra ON ra.room_id = r.id AND ' . CURRENT_ASSIGNMENT_SQL . '
                       LEFT JOIN departments d ON d.id = ra.department_id
                       ORDER BY p.category, p.spot_index, p.id');
    $rows = $st->fetchAll();
    $assetsDir = __DIR__ . '/../public/assets/';
    foreach ($rows as &$r) {
        $filePath = $assetsDir . $r['file_name'];
        $exists = file_exists($filePath);
        $r['exists'] = $exists;
        if ($exists) {
            $r['actual_size'] = (int)filesize($filePath);
            if ($r['file_size'] === 0 || $r['width'] === 0) {
                $imgInfo = @getimagesize($filePath);
                if ($imgInfo) {
                    $r['width'] = (int)$imgInfo[0];
                    $r['height'] = (int)$imgInfo[1];
                    $r['mime_type'] = $imgInfo['mime'];
                }
                $r['file_size'] = $r['actual_size'];
            }
        } else {
            $r['actual_size'] = 0;
        }
    }
    return $rows;
}

function photo_row(int|string $idOrKey): ?array
{
    $sql = is_numeric($idOrKey) ? 'SELECT * FROM photos WHERE id = ?' : 'SELECT * FROM photos WHERE photo_key = ?';
    $st = db()->prepare($sql);
    $st->execute([$idOrKey]);
    return $st->fetch() ?: null;
}

function photo_upload(array $user, string $photoKey, array $file, ?string $title = null, ?string $roomId = null, string $category = 'spot'): array
{
    require_admin($user);

    if (empty($file) || ($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
        $code = $file['error'] ?? UPLOAD_ERR_NO_FILE;
        $msg = match ($code) {
            UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE => 'ไฟล์มีขนาดใหญ่เกินกว่าที่เซิร์ฟเวอร์กำหนด',
            UPLOAD_ERR_PARTIAL => 'ไฟล์อัปโหลดไม่สมบูรณ์',
            UPLOAD_ERR_NO_FILE => 'กรุณาเลือกไฟล์รูปภาพที่ต้องการอัปโหลด',
            default => 'เกิดข้อผิดพลาดในการอัปโหลดไฟล์ (รหัส ' . $code . ')'
        };
        throw new HttpError(400, $msg);
    }

    $tmpPath = $file['tmp_name'] ?? '';
    if (!is_file($tmpPath) || filesize($tmpPath) === 0) {
        throw new HttpError(400, 'ไม่พบไฟล์ที่อัปโหลด');
    }

    if (filesize($tmpPath) > 10 * 1024 * 1024) {
        throw new HttpError(400, 'ไฟล์รูปภาพต้องมีขนาดไม่เกิน 10 MB');
    }

    $imgInfo = @getimagesize($tmpPath);
    if (!$imgInfo) {
        throw new HttpError(400, 'ไฟล์ที่อัปโหลดไม่ใช่รูปภาพที่ถูกต้อง');
    }

    $allowedMimes = [
        'image/jpeg' => 'jpg',
        'image/png'  => 'png',
        'image/webp' => 'webp',
    ];
    $mime = $imgInfo['mime'] ?? '';
    if (!isset($allowedMimes[$mime])) {
        throw new HttpError(400, 'รองรับเฉพาะไฟล์รูปภาพ JPG, PNG หรือ WebP เท่านั้น');
    }
    $ext = $allowedMimes[$mime];

    $assetsDir = realpath(__DIR__ . '/../public/assets') ?: (__DIR__ . '/../public/assets');
    if (!is_dir($assetsDir)) {
        @mkdir($assetsDir, 0755, true);
    }

    $existing = photo_row($photoKey);
    $before = $existing;

    if ($existing) {
        $targetFileName = $existing['file_name'];
        $pathInfo = pathinfo($targetFileName);
        if (strtolower($pathInfo['extension'] ?? '') !== $ext) {
            $targetFileName = $pathInfo['filename'] . '.' . $ext;
        }
    } else {
        $cleanKey = preg_replace('/[^a-zA-Z0-9_\-]/', '_', $photoKey);
        if (empty($cleanKey)) {
            $cleanKey = 'photo_' . date('Ymd_His') . '_' . bin2hex(random_bytes(3));
        }
        $targetFileName = $cleanKey . '.' . $ext;
        $photoKey = $cleanKey;
    }

    $destPath = $assetsDir . '/' . $targetFileName;

    $moved = false;
    if (is_uploaded_file($tmpPath)) {
        $moved = @move_uploaded_file($tmpPath, $destPath);
    }
    if (!$moved) {
        $moved = @copy($tmpPath, $destPath);
        @unlink($tmpPath);
    }

    if (!$moved) {
        throw new HttpError(500, 'ไม่สามารถบันทึกไฟล์รูปภาพลงในไดเรกทอรี public/assets/ ได้ (ตรวจสอบสิทธิ์การเขียนไฟล์)');
    }

    $fileSize = (int)filesize($destPath);
    $width = (int)$imgInfo[0];
    $height = (int)$imgInfo[1];

    if ($existing) {
        $st = db()->prepare('UPDATE photos
                             SET file_name = ?, file_size = ?, mime_type = ?, width = ?, height = ?, updated_at = NOW()
                             WHERE id = ?');
        $st->execute([$targetFileName, $fileSize, $mime, $width, $height, $existing['id']]);
        $photoId = (int)$existing['id'];
    } else {
        $st = db()->prepare('INSERT INTO photos (photo_key, title, title_en, category, file_name, file_size, mime_type, width, height, room_id)
                             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
        $finalTitle = !empty($title) ? trim($title) : $photoKey;
        $st->execute([$photoKey, $finalTitle, '', $category, $targetFileName, $fileSize, $mime, $width, $height, $roomId ?: null]);
        $photoId = (int)db()->lastInsertId();
    }

    $after = photo_row($photoId);
    audit($user, 'photo.upload', 'photo', $photoKey, $before, $after);
    bump_data_version();

    return $after ?: ['id' => $photoId, 'photo_key' => $photoKey, 'file_name' => $targetFileName];
}

function photo_update(array $user, int $id, array $in): void
{
    require_admin($user);
    $p = photo_row($id) ?: throw new HttpError(404, 'ไม่พบรูปภาพ');
    $before = $p;

    $title = v_str($in, 'title', 255);
    $titleEn = isset($in['title_en']) ? v_str($in, 'title_en', 255) : ($p['title_en'] ?? '');
    $category = v_enum($in, 'category', ['spot', 'personnel', 'satellite', 'system', 'room', 'other']);
    $roomId = !empty($in['room_id']) ? v_str($in, 'room_id', 16) : null;
    if ($roomId !== null) {
        $r = room_row($roomId);
        if (!$r) {
            $roomId = null;
        }
    }

    $st = db()->prepare('UPDATE photos
                         SET title = ?, title_en = ?, category = ?, room_id = ?, updated_at = NOW()
                         WHERE id = ?');
    $st->execute([$title, $titleEn, $category, $roomId, $id]);

    $after = photo_row($id);
    audit($user, 'photo.update', 'photo', $p['photo_key'], $before, $after);
    bump_data_version();
}

function photo_delete(array $user, int $id): void
{
    require_admin($user);
    $p = photo_row($id) ?: throw new HttpError(404, 'ไม่พบรูปภาพ');
    $before = $p;

    $assetsDir = realpath(__DIR__ . '/../public/assets') ?: (__DIR__ . '/../public/assets');
    $filePath = $assetsDir . '/' . $p['file_name'];
    if (file_exists($filePath)) {
        @unlink($filePath);
    }

    // If it's a fixed system/spot photo, keep the DB row but reset file metadata
    if (in_array($p['category'], ['system', 'satellite'], true) || str_starts_with($p['photo_key'], 'spot_')) {
        $st = db()->prepare('UPDATE photos SET file_size = 0, width = 0, height = 0, updated_at = NOW() WHERE id = ?');
        $st->execute([$id]);
        $after = photo_row($id);
        audit($user, 'photo.clear', 'photo', $p['photo_key'], $before, $after);
    } else {
        // Custom photos: delete row completely
        db()->prepare('DELETE FROM photos WHERE id = ?')->execute([$id]);
        audit($user, 'photo.delete', 'photo', $p['photo_key'], $before, null);
    }

    bump_data_version();
}
