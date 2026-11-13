<?php
declare(strict_types=1);
require __DIR__ . '/../../src/admin.php';

$user = admin_page();

if (is_post()) {
    $action = (string)($_POST['action'] ?? '');
    // stats.php posts here too ("add as keyword"); return there afterwards
    $back = ($_POST['return'] ?? '') === 'stats' ? 'stats.php' : 'services.php';
    handle_post(function () use ($user, $action) {
        if ($action === 'create') {
            service_create($user, $_POST);
            return 'เพิ่มคำค้นแล้ว';
        }
        if ($action === 'delete') {
            service_delete($user, (int)($_POST['id'] ?? 0));
            return 'ลบคำค้นแล้ว';
        }
        throw new HttpError(400, 'คำสั่งไม่ถูกต้อง');
    }, $back);
}

$depts = dept_list($user);
$services = service_list($user);
$canAdd = (bool)array_filter($depts, fn($d) => $d['can_edit'] && $d['is_active']);

page_start('คำค้นบริการ', 'services.php', $user);
?>
<h1 class="font-heading font-bold text-lg mb-1">คำค้นบริการ</h1>
<p class="text-xs text-slate-400 mb-3">ประชาชนพิมพ์ตามเรื่องที่มาติดต่อ ไม่ใช่ชื่อกลุ่มงาน คำเหล่านี้ทำให้ค้นเจอห้องที่ถูกต้อง เขียนแบบที่ประชาชนพูด</p>
<?php if ($canAdd): ?>
<form method="post" action="services.php" class="flex flex-wrap gap-2 mb-4 items-end">
    <?= csrf_field() ?><input type="hidden" name="action" value="create">
    <label class="flex-1 min-w-[14rem] block text-sm text-slate-300">เรื่องที่ประชาชนมาติดต่อ
        <input name="keyword" required maxlength="255" placeholder="เช่น ต่อใบอนุญาตร้านยา" class="mt-1 <?= INPUT_CLS ?>">
    </label>
    <label class="flex-1 min-w-[14rem] block text-sm text-slate-300">กลุ่มงานที่รับผิดชอบ
        <select name="department_id" required class="mt-1 <?= INPUT_CLS ?>"><?= dept_options($depts, null, false, true) ?></select>
    </label>
    <button class="<?= BTN_PRIMARY ?>">+ เพิ่ม</button>
</form>
<?php endif;
table_start(['คำค้น', 'กลุ่มงาน', '']);
foreach ($services as $s): ?>
    <tr>
        <td class="px-3 py-2"><?= e($s['keyword']) ?></td>
        <td class="px-3 py-2"><?= e($s['department_name']) ?></td>
        <td class="px-3 py-2">
<?php if ($s['can_edit']): ?>
            <form method="post" action="services.php" data-confirm="ลบคำค้น &quot;<?= e($s['keyword']) ?>&quot;?">
                <?= csrf_field() ?><input type="hidden" name="action" value="delete"><input type="hidden" name="id" value="<?= (int)$s['id'] ?>">
                <button class="<?= BTN_DANGER ?>">ลบ</button>
            </form>
<?php endif; ?>
        </td>
    </tr>
<?php endforeach;
table_end();
page_end();
