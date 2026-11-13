<?php
declare(strict_types=1);

// Public JSON API handlers (no login). Back-office logic lives in services.php and is used by public/admin/*.php.

// ============================ PUBLIC ============================

function h_snapshot(?array $user): never
{
    $version = (int)db()->query('SELECT version FROM data_version WHERE id = 1')->fetchColumn();
    // Date in the ETag: the bookings window (today .. +7d) moves daily even without writes.
    $etag = '"v' . $version . '-' . date('Ymd') . '"';
    $cacheHeaders = ['ETag' => $etag, 'Cache-Control' => 'public, max-age=60'];
    if (trim($_SERVER['HTTP_IF_NONE_MATCH'] ?? '') === $etag) {
        http_response_code(304);
        foreach ($cacheHeaders as $k => $v) {
            header("$k: $v");
        }
        exit;
    }

    $buildings = db()->query('SELECT id, name, name_en AS nameEn, short_name AS shortName, short_name_en AS shortNameEn,
                              floors, width, depth,
                              center_x AS centerX, center_z AS centerZ, rot_y AS rotY, color
                              FROM buildings ORDER BY sort_order, id')->fetchAll();
    foreach ($buildings as &$b) {
        $b['floors'] = (int)$b['floors'];
        $b['width'] = (float)$b['width'];
        $b['depth'] = (float)$b['depth'];
        $b['centerX'] = (float)$b['centerX'];
        $b['centerZ'] = (float)$b['centerZ'];
        $b['rotY'] = (float)$b['rotY'];
    }
    unset($b);

    $rooms = db()->query("
        SELECT r.id, r.building_id AS building, r.floor, r.room_no AS roomNo, r.label,
               r.lx, r.lz, r.w, r.d,
               d.id AS deptId, d.name, d.name_en AS nameEn, d.head_title AS head, d.phone_ext AS phone,
               d.description AS `desc`, d.description_en AS descEn, d.type
        FROM rooms r
        LEFT JOIN room_assignments ra ON ra.id = (
            SELECT ra2.id FROM room_assignments ra2
            WHERE ra2.room_id = r.id AND " . str_replace('ra.', 'ra2.', CURRENT_ASSIGNMENT_SQL) . "
            ORDER BY ra2.valid_from DESC, ra2.id DESC LIMIT 1)
        LEFT JOIN departments d ON d.id = ra.department_id AND d.is_active = 1
        ORDER BY r.building_id, r.floor, r.room_no")->fetchAll();

    $out = [];
    foreach ($rooms as $r) {
        $out[] = [
            'id' => $r['id'], 'building' => $r['building'], 'floor' => (int)$r['floor'], 'roomNo' => $r['roomNo'],
            'name' => $r['name'] ?? $r['label'], 'head' => $r['head'] ?? '', 'phone' => $r['phone'] ?? '',
            'type' => $r['type'] ?? 'admin', 'desc' => $r['desc'] ?? '',
            'nameEn' => $r['nameEn'] ?? '', 'descEn' => $r['descEn'] ?? '',
            'lx' => (float)$r['lx'], 'lz' => (float)$r['lz'], 'w' => (float)$r['w'], 'd' => (float)$r['d'],
        ];
    }

    // services -> the room(s) currently holding that department
    $services = db()->query("
        SELECT s.keyword, ra.room_id AS roomId
        FROM services s
        JOIN departments d ON d.id = s.department_id AND d.is_active = 1
        JOIN room_assignments ra ON ra.department_id = d.id AND " . CURRENT_ASSIGNMENT_SQL . "
        ORDER BY s.keyword")->fetchAll();

    $nodes = db()->query('SELECT id, building_id AS buildingId, floor, x, y, z, kind, label, label_en AS labelEn FROM nav_nodes')->fetchAll();
    foreach ($nodes as &$n) {
        $n['x'] = (float)$n['x']; $n['y'] = (float)$n['y']; $n['z'] = (float)$n['z'];
        $n['floor'] = (int)$n['floor'];
    }
    unset($n);
    $edges = db()->query('SELECT from_id AS a, to_id AS b, is_accessible AS `accessible` FROM nav_edges')->fetchAll();
    foreach ($edges as &$e) {
        $e['accessible'] = (bool)(int)$e['accessible'];
    }
    unset($e);

    // Upcoming bookings; the client decides "in use now" from the clock.
    $bookings = db()->query("
        SELECT b.room_id AS roomId, b.title, d.name AS department,
               DATE_FORMAT(b.starts_at, '%Y-%m-%dT%H:%i:00+07:00') AS startsAt,
               DATE_FORMAT(b.ends_at,   '%Y-%m-%dT%H:%i:00+07:00') AS endsAt
        FROM bookings b LEFT JOIN departments d ON d.id = b.department_id
        WHERE b.ends_at >= CURDATE() AND b.starts_at < CURDATE() + INTERVAL 8 DAY
        ORDER BY b.starts_at")->fetchAll();

    // Photos list for viewer / clients
    $photos = [];
    try {
        $photos = db()->query('SELECT photo_key as photoKey, title, title_en as titleEn, category, file_name as fileName,
                                      file_size as fileSize, width, height, room_id as roomId, spot_index as spotIndex
                               FROM photos ORDER BY category, spot_index, id')->fetchAll();
    } catch (Throwable) {
        $photos = [];
    }

    json_out([
        'version'   => $version,
        'buildings' => $buildings,
        'rooms'     => $out,
        'services'  => $services,
        'nav'       => ['nodes' => $nodes, 'edges' => $edges],
        'bookings'  => $bookings,
        'photos'    => $photos,
    ], 200, $cacheHeaders);
}

/** Anonymous search statistics. No IP/user stored; per-IP rate limit only in rate_limits (pruned daily). */
function h_search_log(?array $user): never
{
    // application/json forces a CORS preflight, which we never answer: other sites can't post here.
    if (stripos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') !== 0) {
        throw new HttpError(415, 'application/json required');
    }
    rate_limit('search:' . client_ip(), 60, 600);
    $in = json_in();
    $q = v_str($in, 'q', 200);
    $count = v_int_or_null($in, 'results') ?? 0;
    $norm = normalize_search_query($q);
    if (mb_strlen($norm) < 2) {
        json_out(['ok' => true]);
    }
    db()->prepare('INSERT INTO search_stats (day, query_norm, hits, zero_results) VALUES (CURDATE(), ?, 1, ?)
                   ON DUPLICATE KEY UPDATE hits = hits + 1, zero_results = zero_results + VALUES(zero_results)')
        ->execute([$norm, $count === 0 ? 1 : 0]);
    json_out(['ok' => true]);
}

function normalize_search_query(string $q): string
{
    $q = mb_strtolower(trim(preg_replace('/\s+/u', ' ', $q) ?? ''));
    $q = preg_replace('/\d{4,}/u', '#', $q) ?? '';          // phone / national ID / HN numbers
    $q = preg_replace('/\S+@\S+/u', '[email]', $q) ?? '';   // e-mail addresses
    return mb_substr($q, 0, 100);
}
