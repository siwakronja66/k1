<?php
declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    exit(1);
}
require __DIR__ . '/../src/bootstrap.php';

$username = 'admin';
$password = '123456';
$hash = password_hash($password, PASSWORD_DEFAULT);

db()->prepare('INSERT INTO users (username, password_hash, role, is_active, failed_logins, locked_until)
               VALUES (?, ?, "admin", 1, 0, NULL)
               ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), role = "admin", is_active = 1,
                                       failed_logins = 0, locked_until = NULL')
    ->execute([$username, $hash]);

try {
    db()->exec("DELETE FROM rate_limits WHERE bucket LIKE 'login:%'");
} catch (Throwable) {}

echo "\n[OK] Admin account 'admin' password set to '123456' successfully!\n";
echo "     Failed login attempts reset and all account locks cleared.\n\n";
