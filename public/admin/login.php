<?php
declare(strict_types=1);
require __DIR__ . '/../../src/admin.php';

start_session();
try {
    current_user();
    redirect('departments.php');          // already logged in
} catch (HttpError) {
    // not logged in: show form
}

if (is_post()) {
    try {
        verify_form_csrf();
        auth_login((string)($_POST['username'] ?? ''), (string)($_POST['password'] ?? ''));
        redirect('departments.php');
    } catch (HttpError $e) {
        flash($e->getMessage(), false);
        redirect('login.php');
    }
}

page_start('เข้าสู่ระบบ', '', null);
?>
<div class="min-h-[80vh] flex items-center justify-center">
    <form method="post" action="login.php" class="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl p-6 space-y-4 shadow-2xl">
        <?= csrf_field() ?>
        <div class="flex items-center gap-3">
            <img src="../assets/icon.svg" alt="" class="w-10 h-10">
            <div>
                <h1 class="font-heading font-bold text-lg">เข้าสู่ระบบเจ้าหน้าที่</h1>
                <p class="text-xs text-slate-400">ผังอาคาร 3 มิติ สสจ.มุกดาหาร</p>
            </div>
        </div>
        <label class="block text-sm">ชื่อผู้ใช้
            <input name="username" autocomplete="username" required maxlength="64" autofocus class="mt-1 <?= INPUT_CLS ?>">
        </label>
        <label class="block text-sm">รหัสผ่าน
            <input name="password" type="password" autocomplete="current-password" required maxlength="200" class="mt-1 <?= INPUT_CLS ?>">
        </label>
        <button class="w-full <?= BTN_PRIMARY ?>">เข้าสู่ระบบ</button>
        <a href="../" class="block text-center text-xs text-slate-400 hover:text-white">กลับหน้าผังอาคาร</a>
    </form>
</div>
<?php page_end();
