<?php
declare(strict_types=1);

// Create (or reset) an admin account from the CLI. Password is read from stdin, never argv
// (argv is visible in process lists / shell history).
//   docker compose exec -T web php bin/create-admin.php <username>  < password.txt
//   docker compose exec web php bin/create-admin.php <username>      (then type password + Enter)
if (PHP_SAPI !== 'cli') {
    exit(1);
}
require __DIR__ . '/../src/bootstrap.php';

$username = $argv[1] ?? '';
if (!preg_match('/^[a-zA-Z0-9._-]{3,64}$/', $username)) {
    fwrite(STDERR, "usage: php bin/create-admin.php <username>  (password on stdin, >= 6 chars)\n");
    exit(2);
}
$password = rtrim((string)fgets(STDIN), "\r\n");
if (mb_strlen($password) < 6) {
    fwrite(STDERR, "password must be at least 6 characters\n");
    exit(2);
}

db()->prepare('INSERT INTO users (username, password_hash, role) VALUES (?, ?, \'admin\')
               ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), role = \'admin\', is_active = 1,
                                       failed_logins = 0, locked_until = NULL')
    ->execute([$username, password_hash($password, PASSWORD_DEFAULT)]);
db()->prepare('INSERT INTO audit_log (user_id, username, action, entity, entity_id, ip) VALUES (NULL, ?, ?, ?, ?, ?)')
    ->execute(['cli', 'user.admin_cli', 'user', $username, 'cli']);
echo "admin '$username' ready\n";
