<?php
declare(strict_types=1);
require __DIR__ . '/../../src/admin.php';

$user = admin_page();

// Base URL of the public site: ?base=... (validated) or derived from this request
$scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$host = preg_replace('/[^A-Za-z0-9.:\-\[\]]/', '', (string)($_SERVER['HTTP_HOST'] ?? 'localhost'));
$default = $scheme . '://' . $host . rtrim(dirname(dirname($_SERVER['SCRIPT_NAME'] ?? '/admin/qr.php')), '/\\') . '/';
$base = (string)($_GET['base'] ?? $default);
$parts = parse_url($base);
if (!$parts || !in_array($parts['scheme'] ?? '', ['http', 'https'], true) || empty($parts['host'])) {
    $base = $default;
}

$depts = dept_list($user);
$deptById = array_column($depts, null, 'id');
$rooms = room_list();

page_start('QR ห้อง', 'qr.php', $user, ['../vendor/qrcode.js', 'assets/qr.js']);
?>
<form method="get" action="qr.php" class="no-print flex flex-wrap items-end gap-2 mb-3">
    <h1 class="font-heading font-bold text-lg mr-2">QR ติดหน้าห้อง</h1>
    <label class="block text-sm text-slate-300">URL หน้าสาธารณะ
        <input name="base" value="<?= e($base) ?>" class="mt-1 <?= INPUT_INLINE ?> min-w-[20rem]">
    </label>
    <button class="<?= BTN_GHOST ?> py-2">สร้างใหม่</button>
    <button type="button" id="btn-print" class="<?= BTN_PRIMARY ?>">พิมพ์</button>
</form>
<p class="no-print text-xs text-slate-400 mb-3">สแกนแล้วเปิดผังพร้อมเลือกห้องนั้น รหัสห้องคงที่ กลุ่มงานย้ายห้องไม่ต้องพิมพ์ QR ใหม่</p>
<div class="qr-grid grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
<?php foreach ($rooms as $r):
    $url = rtrim($base, '/') . '/?room=' . rawurlencode($r['id']);
    $dept = $r['department_id'] ? ($deptById[$r['department_id']] ?? null) : null; ?>
    <div class="qr-card bg-slate-900 border border-slate-800 rounded-xl p-3 text-center break-inside-avoid">
        <div class="qr-svg bg-white rounded-lg p-2 w-40 h-40 mx-auto" data-url="<?= e($url) ?>" role="img" aria-label="QR ห้อง <?= e($r['room_no']) ?>"></div>
        <div class="font-heading font-bold mt-2">ห้อง <?= e($r['room_no']) ?></div>
        <div class="text-xs text-slate-300"><?= e($dept['name'] ?? $r['label']) ?></div>
        <div class="text-[10px] text-slate-500 break-all mt-1"><?= e($url) ?></div>
    </div>
<?php endforeach; ?>
</div>
<?php page_end();
