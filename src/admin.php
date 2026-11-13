<?php
declare(strict_types=1);

// Bootstrap + helpers for the server-rendered back-office (public/admin/*.php).
// Pattern for every page:
//   $user = admin_page();                       // session + login required (redirects to login.php)
//   if (is_post()) handle_post(fn() => ..., 'page.php');   // CSRF-checked, flash + redirect (PRG)
//   page_start('Title', 'page', $user); ... page_end();
// Output: always through e(). No inline <script>/<style>/on* attributes (CSP script-src 'self').

require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/services.php';

header('Cache-Control: no-store');
header('X-Frame-Options: DENY');

/** HTML-escape for text and attribute values. */
function e(mixed $v): string
{
    return htmlspecialchars((string)($v ?? ''), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function is_post(): bool
{
    return ($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'POST';
}

/** Redirect to a page inside /admin/ only (no open redirects). */
function redirect(string $target): never
{
    if (!preg_match('#^[a-z_]+\.php(\?[A-Za-z0-9_=&%.\-]*)?$#', $target)) {
        $target = 'departments.php';
    }
    header('Location: ' . $target, true, 303);
    exit;
}

function flash(string $msg, bool $ok = true): void
{
    $_SESSION['flash'] = ['msg' => $msg, 'ok' => $ok];
}

function flash_take(): ?array
{
    $f = $_SESSION['flash'] ?? null;
    unset($_SESSION['flash']);
    return $f;
}

function csrf_field(): string
{
    return '<input type="hidden" name="_csrf" value="' . e(csrf_token()) . '">';
}

function verify_form_csrf(): void
{
    $sent = $_POST['_csrf'] ?? '';
    if (!is_string($sent) || empty($_SESSION['csrf']) || !hash_equals($_SESSION['csrf'], $sent)) {
        throw new HttpError(403, 'แบบฟอร์มหมดอายุ กรุณาลองใหม่');
    }
}

/** Start session; require a logged-in active user (else go to login). */
function admin_page(): array
{
    start_session();
    try {
        return current_user();
    } catch (HttpError) {
        redirect('login.php');
    }
}

/**
 * Run a POST action: verify CSRF, run $fn (which may return a success message),
 * flash the result and redirect (Post/Redirect/Get). Errors become a red flash, never a stack trace.
 */
function handle_post(callable $fn, string $back): never
{
    try {
        verify_form_csrf();
        $msg = $fn();
        flash(is_string($msg) ? $msg : 'บันทึกแล้ว');
    } catch (HttpError $e) {
        flash($e->getMessage(), false);
    } catch (PDOException $e) {
        error_log('[ssjmuk3d] DB error: ' . $e->getMessage());
        flash($e->getCode() === '23000' ? 'ข้อมูลซ้ำหรือถูกอ้างอิงอยู่' : 'เกิดข้อผิดพลาดของฐานข้อมูล', false);
    } catch (Throwable $e) {
        error_log('[ssjmuk3d] ' . $e);
        flash('เกิดข้อผิดพลาด กรุณาลองใหม่', false);
    }
    redirect($back);
}

function is_admin(array $user): bool
{
    return $user['role'] === 'admin';
}

const ADMIN_MENU = [
    // file => [label, adminOnly]
    'departments.php' => ['กลุ่มงาน', false],
    'rooms.php'       => ['ห้อง / ผัง', false],
    'buildings.php'   => ['อาคาร', true],
    'services.php'    => ['คำค้นบริการ', false],
    'bookings.php'    => ['จองห้องประชุม', false],
    'photos.php'      => ['รูปภาพ', true],
    'qr.php'          => ['QR ห้อง', false],
    'stats.php'       => ['สถิติคำค้น', true],
    'users.php'       => ['ผู้ใช้', true],
    'audit.php'       => ['บันทึกการแก้ไข', true],
];

function page_start(string $title, string $active, ?array $user, array $scripts = []): void
{
    $flash = flash_take();
    ?>
<!DOCTYPE html>
<html lang="th" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="robots" content="noindex, nofollow">
    <title><?= e($title) ?> · หลังบ้าน ผังอาคาร สสจ.มุกดาหาร</title>
    <link rel="icon" href="../assets/icon.svg" type="image/svg+xml">
<?php
    $appCssVer = @filemtime(__DIR__ . '/../public/vendor/app.css') ?: time();
    $confirmJsVer = @filemtime(__DIR__ . '/../public/admin/assets/confirm.js') ?: time();
?>
    <link rel="stylesheet" href="../vendor/fonts.css">
    <link rel="stylesheet" href="../vendor/fontawesome/css/all.min.css">
    <link rel="stylesheet" href="../vendor/app.css?v=<?= $appCssVer ?>">
    <script src="assets/confirm.js?v=<?= $confirmJsVer ?>" defer></script>
<?php foreach ($scripts as $src):
    $sFile = __DIR__ . '/../public/admin/' . ltrim($src, '/');
    $sVer = @filemtime($sFile) ?: time();
?>
    <script src="<?= e($src) ?>?v=<?= $sVer ?>" defer></script>
<?php endforeach; ?>
</head>
<body class="admin-body bg-slate-950 text-slate-100 min-h-screen font-sans">
<?php if ($user): ?>
<header class="bg-slate-900 border-b border-slate-800 px-4 py-2 flex flex-wrap items-center gap-3 no-print">
    <a href="../" class="flex items-center gap-2 font-heading font-bold">
        <img src="../assets/icon.svg" alt="" class="w-7 h-7"> หลังบ้าน ผังอาคาร
    </a>
    <nav class="flex flex-wrap gap-1 text-sm font-heading" aria-label="เมนูหลังบ้าน">
<?php foreach (ADMIN_MENU as $file => [$label, $adminOnly]):
        if ($adminOnly && !is_admin($user)) continue;
        $on = $file === $active; ?>
        <a href="<?= e($file) ?>" class="px-3 py-1.5 rounded-lg <?= $on ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-800' ?>"<?= $on ? ' aria-current="page"' : '' ?>><?= e($label) ?></a>
<?php endforeach; ?>
    </nav>
    <div class="ml-auto flex items-center gap-2 text-sm">
        <span class="text-slate-300"><?= e($user['username']) ?> (<?= is_admin($user) ? 'ผู้ดูแลระบบ' : 'ผู้แก้ไขกลุ่มงาน' ?>)</span>
        <a href="password.php" class="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700">เปลี่ยนรหัสผ่าน</a>
        <form method="post" action="logout.php"><?= csrf_field() ?>
            <button class="px-2 py-1 rounded-lg bg-slate-800 hover:bg-rose-700">ออกจากระบบ</button>
        </form>
    </div>
</header>
<?php endif; ?>
<?php if ($flash): ?>
<div class="mx-4 mt-3 rounded-lg px-3 py-2 text-sm <?= $flash['ok'] ? 'bg-emerald-900/70 text-emerald-200' : 'bg-rose-900/70 text-rose-200' ?>" role="status"><?= e($flash['msg']) ?></div>
<?php endif; ?>
<main class="p-4 max-w-7xl mx-auto">
<?php
}

function page_end(): void
{
    echo "</main>\n</body>\n</html>\n";
}

// ---------- small view helpers ----------

const INPUT_BASE = 'bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-lg px-3 py-2 outline-none text-sm';
const INPUT_CLS = 'w-full ' . INPUT_BASE;        // stacked form fields
const INPUT_INLINE = 'w-auto ' . INPUT_BASE;     // pickers inside a row
const BTN = 'px-2.5 py-1 rounded-lg text-xs font-heading';
const BTN_PRIMARY = 'px-3 py-2 rounded-lg text-sm font-heading font-semibold bg-emerald-600 hover:bg-emerald-500';
const BTN_DANGER = 'px-2.5 py-1 rounded-lg text-xs font-heading bg-rose-900/60 hover:bg-rose-800';
const BTN_GHOST = 'px-2.5 py-1 rounded-lg text-xs font-heading bg-slate-800 hover:bg-slate-700';

/** <option>s for departments. */
function dept_options(array $depts, ?int $selected, bool $allowEmpty = false, bool $onlyEditable = false): string
{
    $html = $allowEmpty ? '<option value="">— ว่าง / ไม่ระบุ —</option>' : '';
    foreach ($depts as $d) {
        if (!$d['is_active'] || ($onlyEditable && !$d['can_edit'])) {
            continue;
        }
        $sel = $selected === $d['id'] ? ' selected' : '';
        $html .= '<option value="' . (int)$d['id'] . '"' . $sel . '>' . e($d['name']) . '</option>';
    }
    return $html;
}

function table_start(array $headers): void
{
    echo '<div class="overflow-x-auto rounded-xl border border-slate-800"><table class="w-full text-sm">';
    echo '<thead class="bg-slate-900 text-slate-400 text-left"><tr>';
    foreach ($headers as $h) {
        echo '<th class="px-3 py-2 font-heading font-medium">' . e($h) . '</th>';
    }
    echo '</tr></thead><tbody class="divide-y divide-slate-800">';
}

function table_end(): void
{
    echo '</tbody></table></div>';
}
