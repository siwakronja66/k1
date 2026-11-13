<?php
declare(strict_types=1);
require __DIR__ . '/../../src/admin.php';

// POST only (a GET link could be triggered cross-site)
if (!is_post()) {
    redirect('departments.php');
}
start_session();
try {
    $user = current_user();
    verify_form_csrf();
    auth_logout($user);
    flash('ออกจากระบบแล้ว');
} catch (HttpError) {
    // already logged out or stale form
}
redirect('login.php');
