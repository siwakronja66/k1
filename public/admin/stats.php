<?php
declare(strict_types=1);
require __DIR__ . '/../../src/admin.php';

$user = admin_page();
if (!is_admin($user)) {
    flash('เฉพาะผู้ดูแลระบบ', false);
    redirect('departments.php');
}
$days = (int)($_GET['days'] ?? 30);
$days = in_array($days, [7, 30, 90, 365], true) ? $days : 30;
$stats = search_stats($user, $days);
$depts = dept_list($user);

page_start('สถิติคำค้น', 'stats.php', $user);
?>
<form method="get" action="stats.php" class="flex flex-wrap items-center gap-2 mb-1">
    <h1 class="font-heading font-bold text-lg mr-2">สถิติคำค้น</h1>
    <select name="days" data-autosubmit aria-label="ช่วงเวลา" class="<?= INPUT_INLINE ?>">
<?php foreach ([7, 30, 90, 365] as $n): ?>
        <option value="<?= $n ?>"<?= $n === $days ? ' selected' : '' ?>><?= $n ?> วันล่าสุด</option>
<?php endforeach; ?>
    </select>
    <noscript><button class="<?= BTN_GHOST ?>">แสดง</button></noscript>
</form>
<p class="text-xs text-slate-400 mb-3">เก็บเฉพาะข้อความค้นหา (ตัดตัวเลขยาวและอีเมลออก) และจำนวนครั้งรายวัน ไม่เก็บ IP หรือตัวตนผู้ค้น</p>
<div class="grid lg:grid-cols-2 gap-4">
    <div>
        <h2 class="font-heading font-semibold mb-2">ค้นบ่อย</h2>
<?php table_start(['คำค้น', 'ครั้ง', 'ไม่เจอ']);
foreach ($stats['top'] as $s): ?>
        <tr><td class="px-3 py-2"><?= e($s['q']) ?></td><td class="px-3 py-2"><?= (int)$s['hits'] ?></td><td class="px-3 py-2"><?= (int)$s['zero'] ?></td></tr>
<?php endforeach;
table_end(); ?>
    </div>
    <div>
        <h2 class="font-heading font-semibold mb-2 text-amber-300">ค้นแล้วไม่เจอ: ควรเพิ่มเป็นคำค้นบริการ</h2>
<?php table_start(['คำค้น', 'ครั้ง', 'เพิ่มเป็นคำค้นของกลุ่มงาน']);
foreach ($stats['not_found'] as $s): ?>
        <tr>
            <td class="px-3 py-2"><?= e($s['q']) ?></td>
            <td class="px-3 py-2"><?= (int)$s['zero'] ?></td>
            <td class="px-3 py-2">
                <form method="post" action="services.php" class="flex gap-1">
                    <?= csrf_field() ?><input type="hidden" name="action" value="create"><input type="hidden" name="return" value="stats">
                    <input type="hidden" name="keyword" value="<?= e($s['q']) ?>">
                    <select name="department_id" required aria-label="กลุ่มงานสำหรับ <?= e($s['q']) ?>" class="<?= INPUT_CLS ?>"><?= dept_options($depts, null) ?></select>
                    <button class="<?= BTN_GHOST ?>">เพิ่ม</button>
                </form>
            </td>
        </tr>
<?php endforeach;
table_end(); ?>
    </div>
</div>
<?php page_end();
