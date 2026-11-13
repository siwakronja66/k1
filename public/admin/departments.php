<?php
declare(strict_types=1);
require __DIR__ . '/../../src/admin.php';

$user = admin_page();

if (is_post()) {
    $action = (string)($_POST['action'] ?? '');
    $id = (int)($_POST['id'] ?? 0);
    handle_post(function () use ($user, $action, $id) {
        switch ($action) {
            case 'create':
                dept_create($user, $_POST);
                return 'เพิ่มกลุ่มงานแล้ว';
            case 'update':
                dept_update($user, $id, $_POST);   // is_active only honoured for admins (is_active_present marker)
                return 'บันทึกแล้ว';
            case 'deactivate':
                dept_deactivate($user, $id);
                return 'ปิดใช้งานกลุ่มงานแล้ว';
        }
        throw new HttpError(400, 'คำสั่งไม่ถูกต้อง');
    }, 'departments.php');
}

$depts = dept_list($user);
$editId = isset($_GET['edit']) ? (int)$_GET['edit'] : null;
$creating = isset($_GET['new']) && is_admin($user);
$edit = null;
if ($editId !== null) {
    foreach ($depts as $d) {
        if ($d['id'] === $editId && $d['can_edit']) {
            $edit = $d;
        }
    }
}

page_start('กลุ่มงาน', 'departments.php', $user);

if ($edit || $creating):
    $d = $edit ?? ['id' => 0, 'name' => '', 'name_en' => '', 'head_title' => '', 'phone_ext' => '', 'description' => '', 'description_en' => '', 'type' => 'admin', 'is_active' => true];
?>
<form method="post" action="departments.php" class="max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
    <?= csrf_field() ?>
    <input type="hidden" name="action" value="<?= $edit ? 'update' : 'create' ?>">
    <input type="hidden" name="id" value="<?= (int)$d['id'] ?>">
    <h1 class="font-heading font-bold text-lg"><?= $edit ? 'แก้ไขกลุ่มงาน' : 'เพิ่มกลุ่มงาน' ?></h1>
    <p class="text-xs text-amber-300">ข้อความทั้งหมดแสดงบนเว็บสาธารณะ: ห้ามใส่ข้อมูลระบบภายใน (ชื่อเซิร์ฟเวอร์, IP) และใส่ชื่อบุคคลเฉพาะผู้ที่ยินยอมแล้ว</p>
    <label class="block text-sm text-slate-300">ชื่อกลุ่มงาน
        <input name="name" required maxlength="255" value="<?= e($d['name']) ?>" class="mt-1 <?= INPUT_CLS ?>">
    </label>
    <label class="block text-sm text-slate-300">ชื่อภาษาอังกฤษ (ไม่บังคับ)
        <input name="name_en" maxlength="255" lang="en" value="<?= e($d['name_en']) ?>" class="mt-1 <?= INPUT_CLS ?>">
    </label>
    <div class="grid sm:grid-cols-2 gap-3">
        <label class="block text-sm text-slate-300">ตำแหน่งหัวหน้า / ผู้ติดต่อ
            <input name="head_title" maxlength="255" value="<?= e($d['head_title']) ?>" class="mt-1 <?= INPUT_CLS ?>">
        </label>
        <label class="block text-sm text-slate-300">เบอร์ต่อ
            <input name="phone_ext" maxlength="50" value="<?= e($d['phone_ext']) ?>" class="mt-1 <?= INPUT_CLS ?>">
        </label>
    </div>
    <label class="block text-sm text-slate-300">คำอธิบายงานบริการ
        <textarea name="description" rows="4" maxlength="2000" class="mt-1 <?= INPUT_CLS ?>"><?= e($d['description']) ?></textarea>
    </label>
    <label class="block text-sm text-slate-300">คำอธิบายภาษาอังกฤษ (ไม่บังคับ)
        <textarea name="description_en" rows="3" maxlength="2000" lang="en" class="mt-1 <?= INPUT_CLS ?>"><?= e($d['description_en']) ?></textarea>
    </label>
    <label class="block text-sm text-slate-300">ประเภท
        <select name="type" class="mt-1 <?= INPUT_CLS ?>">
<?php foreach (DEPT_TYPE_LABELS as $k => $label): ?>
            <option value="<?= e($k) ?>"<?= $d['type'] === $k ? ' selected' : '' ?>><?= e($label) ?></option>
<?php endforeach; ?>
        </select>
    </label>
<?php if ($edit && is_admin($user)): ?>
    <input type="hidden" name="is_active_present" value="1">
    <label class="flex items-center gap-2 text-sm"><input type="checkbox" name="is_active" value="1"<?= $d['is_active'] ? ' checked' : '' ?>> เปิดใช้งาน</label>
<?php endif; ?>
    <div class="flex gap-2 pt-2">
        <button class="<?= BTN_PRIMARY ?>">บันทึก</button>
        <a href="departments.php" class="px-3 py-2 rounded-lg text-sm bg-slate-800 hover:bg-slate-700">ยกเลิก</a>
    </div>
</form>
<?php else: ?>
<div class="flex items-center justify-between mb-3">
    <h1 class="font-heading font-bold text-lg">กลุ่มงาน (<?= count($depts) ?>)</h1>
<?php if (is_admin($user)): ?>
    <a href="departments.php?new=1" class="<?= BTN_PRIMARY ?>">+ เพิ่มกลุ่มงาน</a>
<?php endif; ?>
</div>
<p class="text-xs text-slate-400 mb-3">ข้อความแสดงบนเว็บสาธารณะ ใส่ชื่อบุคคลเฉพาะผู้ที่ยินยอมแล้ว</p>
<?php table_start(['ชื่อกลุ่มงาน', 'ประเภท', 'เบอร์ต่อ', 'ห้อง', 'สถานะ', '']);
foreach ($depts as $d): ?>
    <tr class="<?= $d['is_active'] ? '' : 'opacity-50' ?>">
        <td class="px-3 py-2 align-top"><div class="font-semibold"><?= e($d['name']) ?></div><div class="text-xs text-slate-400"><?= e($d['name_en'] ?: $d['head_title']) ?></div></td>
        <td class="px-3 py-2 align-top"><?= e(DEPT_TYPE_LABELS[$d['type']] ?? $d['type']) ?></td>
        <td class="px-3 py-2 align-top"><?= e($d['phone_ext']) ?></td>
        <td class="px-3 py-2 align-top"><?= e(implode(', ', $d['rooms']) ?: '—') ?></td>
        <td class="px-3 py-2 align-top"><?= $d['is_active'] ? 'ใช้งาน' : 'ปิด' ?></td>
        <td class="px-3 py-2 align-top">
            <div class="flex gap-1">
<?php if ($d['can_edit']): ?>
                <a href="departments.php?edit=<?= (int)$d['id'] ?>" class="<?= BTN_GHOST ?>">แก้ไข</a>
<?php endif; ?>
<?php if (is_admin($user) && $d['is_active']): ?>
                <form method="post" action="departments.php" data-confirm="ปิดใช้งาน &quot;<?= e($d['name']) ?>&quot; และนำออกจากห้องที่ครองอยู่?">
                    <?= csrf_field() ?><input type="hidden" name="action" value="deactivate"><input type="hidden" name="id" value="<?= (int)$d['id'] ?>">
                    <button class="<?= BTN_DANGER ?>">ปิดใช้งาน</button>
                </form>
<?php endif; ?>
            </div>
        </td>
    </tr>
<?php endforeach;
table_end();
endif;
page_end();
