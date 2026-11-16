<?php
declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    exit(1);
}

// 1. Auto-create .env if missing on the server
$envPath = dirname(__DIR__) . '/.env';
if (!file_exists($envPath)) {
    $defaultEnv = <<<ENV
DB_NAME=ssjmuk3d
DB_USER=ssjmuk3d
DB_PASS=bB0hUgunQuUYi4zNQvkrE9ZG
MYSQL_ROOT_PASSWORD=MigmIt1B8PbeA9U0kdxo5-sc
COOKIE_SECURE=0
DB_HOST=127.0.0.1
ENV;
    @file_put_contents($envPath, $defaultEnv . "\n");
    echo "[INFO] Created missing .env file with default configuration.\n";
}

require __DIR__ . '/../src/bootstrap.php';

// 2. Establish robust database connection
$host = env('DB_HOST', '127.0.0.1');
if ($host === 'db' && gethostbyname('db') === 'db') {
    $host = '127.0.0.1';
}
$port = env('DB_PORT', '3306');
$dbName = env('DB_NAME', 'ssjmuk3d');

$candidates = [
    [env('DB_USER', 'ssjmuk3d'), env('DB_PASS', 'bB0hUgunQuUYi4zNQvkrE9ZG')],
    ['root', 'MigmIt1B8PbeA9U0kdxo5-sc'],
    ['root', ''],
    ['root', 'root'],
];

$connectedPdo = null;
$connectedUser = '';

foreach ($candidates as [$u, $p]) {
    try {
        // Try connecting directly to the database
        $dsn = "mysql:host={$host};port={$port};dbname={$dbName};charset=utf8mb4";
        $testPdo = new PDO($dsn, $u, $p, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);
        $connectedPdo = $testPdo;
        $connectedUser = $u;
        break;
    } catch (Throwable) {
        // Try connecting to MySQL server root to create database if missing
        try {
            $dsnServer = "mysql:host={$host};port={$port};charset=utf8mb4";
            $serverPdo = new PDO($dsnServer, $u, $p, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            ]);
            $serverPdo->exec("CREATE DATABASE IF NOT EXISTS `{$dbName}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
            // If created, retry database connection
            $dsn = "mysql:host={$host};port={$port};dbname={$dbName};charset=utf8mb4";
            $connectedPdo = new PDO($dsn, $u, $p, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]);
            $connectedUser = $u;
            break;
        } catch (Throwable) {
            // continue next candidate
        }
    }
}

if (!$connectedPdo) {
    fwrite(STDERR, "[ERROR] Cannot connect to MySQL server at {$host}:{$port}. Please ensure MySQL is running.\n");
    exit(1);
}

// 3. Ensure required tables exist
$connectedPdo->exec("
CREATE TABLE IF NOT EXISTS users (
    id            INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    username      VARCHAR(64)  NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role          ENUM('admin','editor') NOT NULL DEFAULT 'editor',
    department_id INT UNSIGNED NULL,
    is_active     TINYINT(1) NOT NULL DEFAULT 1,
    failed_logins SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    locked_until  DATETIME NULL,
    last_login_at DATETIME NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS rate_limits (
    bucket     VARCHAR(100) NOT NULL,
    ip         VARCHAR(45)  NOT NULL,
    hits       INT UNSIGNED NOT NULL DEFAULT 1,
    reset_at   INT UNSIGNED NOT NULL,
    PRIMARY KEY (bucket, ip)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS data_version (
    id      TINYINT UNSIGNED NOT NULL PRIMARY KEY,
    version BIGINT UNSIGNED NOT NULL
) ENGINE=InnoDB;
INSERT IGNORE INTO data_version (id, version) VALUES (1, 1);
");

// 4. Set admin user password to 123456
$username = 'admin';
$password = '123456';
$hash = password_hash($password, PASSWORD_DEFAULT);

$stmt = $connectedPdo->prepare('INSERT INTO users (username, password_hash, role, is_active, failed_logins, locked_until)
               VALUES (?, ?, "admin", 1, 0, NULL)
               ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), role = "admin", is_active = 1,
                                       failed_logins = 0, locked_until = NULL');
$stmt->execute([$username, $hash]);

// 5. Clear rate limits
try {
    $connectedPdo->exec("DELETE FROM rate_limits WHERE bucket LIKE 'login:%'");
} catch (Throwable) {}

echo "\n[OK] Connected to MySQL successfully as '{$connectedUser}'!\n";
echo "[OK] Admin account 'admin' password set to '123456' successfully!\n";
echo "     Failed login attempts reset and all account locks cleared.\n\n";
