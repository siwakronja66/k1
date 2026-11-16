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

$dsnPairs = [
    ["mysql:host={$host};port={$port};dbname={$dbName};charset=utf8mb4", "mysql:host={$host};port={$port};charset=utf8mb4"],
    ["mysql:host=localhost;dbname={$dbName};charset=utf8mb4", "mysql:host=localhost;charset=utf8mb4"],
];
if (file_exists('/var/run/mysqld/mysqld.sock')) {
    $dsnPairs[] = [
        "mysql:unix_socket=/var/run/mysqld/mysqld.sock;dbname={$dbName};charset=utf8mb4",
        "mysql:unix_socket=/var/run/mysqld/mysqld.sock;charset=utf8mb4"
    ];
}

$candidates = [
    [env('DB_USER', 'ssjmuk3d'), env('DB_PASS', 'bB0hUgunQuUYi4zNQvkrE9ZG')],
    ['root', 'MigmIt1B8PbeA9U0kdxo5-sc'],
    ['root', ''],
    ['root', 'root'],
];

$connectedPdo = null;
$connectedUser = '';
$errors = [];

foreach ($dsnPairs as [$dsnDb, $dsnServer]) {
    foreach ($candidates as [$u, $p]) {
        try {
            $testPdo = new PDO($dsnDb, $u, $p, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]);
            $connectedPdo = $testPdo;
            $connectedUser = $u;
            break 2;
        } catch (Throwable $e1) {
            $errors[] = "[$u@{$dsnDb}]: " . $e1->getMessage();
            try {
                $serverPdo = new PDO($dsnServer, $u, $p, [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                ]);
                $serverPdo->exec("CREATE DATABASE IF NOT EXISTS `{$dbName}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
                $testPdo = new PDO($dsnDb, $u, $p, [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                ]);
                $connectedPdo = $testPdo;
                $connectedUser = $u;
                break 2;
            } catch (Throwable $e2) {
                $errors[] = "[$u@{$dsnServer}]: " . $e2->getMessage();
            }
        }
    }
}

if (!$connectedPdo) {
    echo "\n[ERROR] ไม่สามารถเชื่อมต่อฐานข้อมูล MySQL ได้ กรุณาตรวจสอบว่าบริการ MySQL กำลังทำงาน\n";
    exit(1);
}

// Grant privileges if connected as root
if ($connectedUser === 'root') {
    try {
        $connectedPdo->exec("CREATE USER IF NOT EXISTS 'ssjmuk3d'@'localhost' IDENTIFIED BY 'bB0hUgunQuUYi4zNQvkrE9ZG'");
        $connectedPdo->exec("CREATE USER IF NOT EXISTS 'ssjmuk3d'@'127.0.0.1' IDENTIFIED BY 'bB0hUgunQuUYi4zNQvkrE9ZG'");
        $connectedPdo->exec("GRANT ALL PRIVILEGES ON `{$dbName}`.* TO 'ssjmuk3d'@'localhost'");
        $connectedPdo->exec("GRANT ALL PRIVILEGES ON `{$dbName}`.* TO 'ssjmuk3d'@'127.0.0.1'");
        $connectedPdo->exec("FLUSH PRIVILEGES");
    } catch (Throwable) {}
}

// 3. Ensure required tables and seed data exist
$hasBuildings = false;
try {
    $res = $connectedPdo->query("SHOW TABLES LIKE 'buildings'")->fetchColumn();
    $hasBuildings = !empty($res);
} catch (Throwable) {}

if (!$hasBuildings) {
    echo "[INFO] กำลังนำเข้าโครงสร้างฐานข้อมูลเริ่มต้น (Schema & Seed data)...\n";
    $sqlFiles = [
        __DIR__ . '/../db/schema.sql',
        __DIR__ . '/../db/seed.sql',
        __DIR__ . '/../db/nav-seed.sql',
    ];
    foreach ($sqlFiles as $file) {
        if (file_exists($file)) {
            $sql = file_get_contents($file);
            try {
                $connectedPdo->exec($sql);
            } catch (Throwable) {
                $queries = array_filter(array_map('trim', explode(";\n", $sql)));
                foreach ($queries as $q) {
                    if ($q !== '') {
                        try { $connectedPdo->exec($q); } catch (Throwable) {}
                    }
                }
            }
        }
    }
    echo "[OK] นำเข้าข้อมูลอาคาร ห้อง และกลุ่มงานเริ่มต้นเรียบร้อยแล้ว!\n";
}

// Ensure correct rate_limits schema (fixed-window counter with window_start)
try {
    $colCheck = $connectedPdo->query("SHOW COLUMNS FROM rate_limits LIKE 'window_start'")->fetch();
    if (!$colCheck) {
        $connectedPdo->exec("DROP TABLE IF EXISTS rate_limits;");
    }
} catch (Throwable) {}

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
    bucket       VARCHAR(100) NOT NULL,
    window_start DATETIME     NOT NULL,
    hits         INT UNSIGNED NOT NULL DEFAULT 0,
    PRIMARY KEY (bucket, window_start)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS data_version (
    id      TINYINT UNSIGNED NOT NULL PRIMARY KEY,
    version BIGINT UNSIGNED NOT NULL
) ENGINE=InnoDB;
INSERT IGNORE INTO data_version (id, version) VALUES (1, 1);
");

// Apply pending migrations automatically
$migrationsDir = __DIR__ . '/../db/migrations';
if (is_dir($migrationsDir)) {
    $connectedPdo->exec("CREATE TABLE IF NOT EXISTS schema_migrations (
        version    VARCHAR(100) NOT NULL PRIMARY KEY,
        applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB");
    $applied = array_flip($connectedPdo->query('SELECT version FROM schema_migrations')->fetchAll(PDO::FETCH_COLUMN));
    $mFiles = glob($migrationsDir . '/*.sql') ?: [];
    sort($mFiles, SORT_STRING);
    foreach ($mFiles as $mFile) {
        $vName = basename($mFile, '.sql');
        if (isset($applied[$vName])) continue;
        $mSql = (string)file_get_contents($mFile);
        $stmts = array_filter(array_map('trim', preg_split('/;\s*$/m', $mSql)), fn($s) => $s !== '' && !preg_match('/^(--[^\n]*\s*)+$/', $s));
        foreach ($stmts as $s) {
            try { $connectedPdo->exec($s); } catch (Throwable) {}
        }
        try {
            $connectedPdo->prepare('INSERT INTO schema_migrations (version) VALUES (?)')->execute([$vName]);
            echo "[INFO] Migration applied: {$vName}\n";
        } catch (Throwable) {}
    }
}

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
