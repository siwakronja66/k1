<?php
declare(strict_types=1);
require __DIR__ . '/../../src/admin.php';

$user = admin_page();
if (!is_admin($user)) {
    flash('เฉพาะผู้ดูแลระบบ', false);
    redirect('departments.php');
}

if (is_post()) {
    $action = (string)($_POST['action'] ?? '');
    handle_post(function () use ($user, $action) {
        if ($action === 'create') {
            user_create($user, $_POST);
            return 'เพิ่มผู้ใช้แล้ว';
        }
        if ($action === 'update') {
            user_update($user, (int)($_POST['id'] ?? 0), $_POST);
            return 'บันทึกผู้ใช้แล้ว';
        }
        throw new HttpError(400, 'คำสั่งไม่ถูกต้อง');
    }, 'users.php');
}

$depts = dept_list($user);
$users = user_list($user);
$editId = isset($_GET['edit']) ? (int)$_GET['edit'] : null;
$edit = $editId ? user_row($editId) : null;
$creating = isset($_GET['new']);

page_start('ผู้ใช้', 'users.php', $user);

if ($edit || $creating):
    $u = $edit ?? ['id' => 0, 'username' => '', 'role' => 'editor', 'department_id' => null, 'is_active' => 1];
?>
<form method="post" action="users.php" class="max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
    <?= csrf_field() ?>
    <input type="hidden" name="action" value="<?= $edit ? 'update' : 'create' ?>">
    <input type="hidden" name="id" value="<?= (int)$u['id'] ?>">
    <h1 class="font-heading font-bold text-lg"><?= $edit ? 'แก้ไขผู้ใช้ ' . e($u['username']) : 'เพิ่มผู้ใช้' ?></h1>
<?php if (!$edit): ?>
    <label class="block text-sm text-slate-300">ชื่อผู้ใช้ (a-z 0-9 . _ -)
        <input name="username" required pattern="[a-zA-Z0-9._\-]{3,64}" autocomplete="off" class="mt-1 <?= INPUT_CLS ?>">
    </label>
<?php endif; ?>
    <label class="block text-sm text-slate-300">สิทธิ์
        <select name="role" class="mt-1 <?= INPUT_CLS ?>">
            <option value="editor"<?= $u['role'] === 'editor' ? ' selected' : '' ?>>ผู้แก้ไขกลุ่มงาน (แก้ได้เฉพาะกลุ่มงานตนเอง)</option>
            <option value="admin"<?= $u['role'] === 'admin' ? ' selected' : '' ?>>ผู้ดูแลระบบ</option>
        </select>
    </label>
    <label class="block text-sm text-slate-300">กลุ่มงาน (สำหรับผู้แก้ไข)
        <select name="department_id" class="mt-1 <?= INPUT_CLS ?>"><?= dept_options($depts, $u['department_id'] === null ? null : (int)$u['department_id'], true) ?></select>
    </label>
    <label class="block text-sm text-slate-300"><?= $edit ? 'ตั้งรหัสผ่านใหม่ (เว้นว่างถ้าไม่เปลี่ยน)' : 'รหัสผ่าน (อย่างน้อย 6 ตัว)' ?>
        <input name="password" type="password" minlength="6" autocomplete="new-password"<?= $edit ? '' : ' required' ?> class="mt-1 <?= INPUT_CLS ?>">
    </label>
<?php if ($edit): ?>
    <label class="flex items-center gap-2 text-sm"><input type="checkbox" name="is_active" value="1"<?= (int)$u['is_active'] ? ' checked' : '' ?>> เปิดใช้งาน (บันทึกจะปลดล็อกบัญชีด้วย)</label>
<?php else: ?>
    <input type="hidden" name="is_active" value="1">
<?php endif; ?>
    <div class="flex gap-2 pt-2">
        <button class="<?= BTN_PRIMARY ?>">บันทึก</button>
        <a href="users.php" class="px-3 py-2 rounded-lg text-sm bg-slate-800 hover:bg-slate-700">ยกเลิก</a>
    </div>
</form>
<?php else: ?>
<div class="flex items-center justify-between mb-3">
    <h1 class="font-heading font-bold text-lg">ผู้ใช้</h1>
    <a href="users.php?new=1" class="<?= BTN_PRIMARY ?>">+ เพิ่มผู้ใช้</a>
</div>
<?php table_start(['ชื่อผู้ใช้', 'สิทธิ์', 'กลุ่มงาน', 'สถานะ', 'เข้าใช้ล่าสุด', '']);
foreach ($users as $u):
    $locked = $u['locked_until'] !== null && strtotime($u['locked_until']) > time(); ?>
    <tr class="<?= (int)$u['is_active'] ? '' : 'opacity-50' ?>">
        <td class="px-3 py-2"><?= e($u['username']) ?></td>
        <td class="px-3 py-2"><?= $u['role'] === 'admin' ? 'ผู้ดูแลระบบ' : 'ผู้แก้ไขกลุ่มงาน' ?></td>
        <td class="px-3 py-2"><?= e($u['department_name'] ?? '—') ?></td>
        <td class="px-3 py-2"><?= (int)$u['is_active'] ? ($locked ? 'ล็อกชั่วคราว' : 'ใช้งาน') : 'ปิด' ?></td>
        <td class="px-3 py-2"><?= e($u['last_login_at'] ?? '—') ?></td>
        <td class="px-3 py-2"><a href="users.php?edit=<?= (int)$u['id'] ?>" class="<?= BTN_GHOST ?>">แก้ไข</a></td>
    </tr>
<?php endforeach;
table_end();
endif;
page_end();
