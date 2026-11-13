<?php
declare(strict_types=1);
require __DIR__ . '/../../src/admin.php';

$user = admin_page();
if (is_post()) {
    handle_post(function () use ($user) {
        auth_change_password($user, $_POST);
        return 'เปลี่ยนรหัสผ่านแล้ว';
    }, 'password.php');
}

page_start('เปลี่ยนรหัสผ่าน', '', $user);
?>
<form method="post" action="password.php" class="max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
    <?= csrf_field() ?>
    <h1 class="font-heading font-bold text-lg">เปลี่ยนรหัสผ่าน</h1>
    <label class="block text-sm text-slate-300">รหัสผ่านปัจจุบัน
        <input name="current_password" type="password" required autocomplete="current-password" class="mt-1 <?= INPUT_CLS ?>">
    </label>
    <label class="block text-sm text-slate-300">รหัสผ่านใหม่ (อย่างน้อย 6 ตัว)
        <input name="new_password" type="password" required minlength="6" autocomplete="new-password" class="mt-1 <?= INPUT_CLS ?>">
    </label>
    <label class="block text-sm text-slate-300">ยืนยันรหัสผ่านใหม่
        <input name="new_password_confirm" type="password" required minlength="6" autocomplete="new-password" class="mt-1 <?= INPUT_CLS ?>">
    </label>
    <button class="<?= BTN_PRIMARY ?>">บันทึก</button>
</form>
<?php page_end();
