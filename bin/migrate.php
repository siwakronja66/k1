<?php
declare(strict_types=1);

// Applies db/migrations/NNN_name.sql in order, once each, recorded in schema_migrations.
// Runs automatically when the web container starts (docker-compose `command`), and can be run by hand:
//   docker compose exec web php bin/migrate.php
// Rules for new migrations: never edit an applied file; add a new higher-numbered file instead.
if (PHP_SAPI !== 'cli') {
    exit(1);
}
require __DIR__ . '/../src/bootstrap.php';

$dir = __DIR__ . '/../db/migrations';
$pdo = db();

// Wait for DB (container start races)
for ($i = 0; ; $i++) {
    try {
        $pdo->query('SELECT 1');
        break;
    } catch (Throwable $e) {
        if ($i >= 30) {
            fwrite(STDERR, "migrate: database not reachable\n");
            exit(1);
        }
        sleep(2);
    }
}

$pdo->exec('CREATE TABLE IF NOT EXISTS schema_migrations (
    version    VARCHAR(100) NOT NULL PRIMARY KEY,
    applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB');

// Serialize concurrent runs (e.g. two containers starting)
$pdo->query("SELECT GET_LOCK('ssjmuk3d_migrate', 60)")->fetchColumn();

$applied = array_flip($pdo->query('SELECT version FROM schema_migrations')->fetchAll(PDO::FETCH_COLUMN));
$files = glob($dir . '/*.sql') ?: [];
sort($files, SORT_STRING);

$count = 0;
foreach ($files as $file) {
    $version = basename($file, '.sql');
    if (!preg_match('/^\d{3}_[a-z0-9_]+$/', $version)) {
        fwrite(STDERR, "migrate: skipping badly named file $version.sql (want NNN_snake_case.sql)\n");
        continue;
    }
    if (isset($applied[$version])) {
        continue;
    }
    $sql = (string)file_get_contents($file);
    // Split on semicolons at line end; migrations must not contain procedures/triggers.
    $statements = array_filter(array_map('trim', preg_split('/;\s*$/m', $sql)), fn($s) => $s !== '' && !preg_match('/^(--[^\n]*\s*)+$/', $s));
    try {
        foreach ($statements as $stmt) {
            $pdo->exec($stmt);
        }
        $pdo->prepare('INSERT INTO schema_migrations (version) VALUES (?)')->execute([$version]);
        echo "migrate: applied $version\n";
        $count++;
    } catch (Throwable $e) {
        // MySQL DDL auto-commits: a half-applied migration must be fixed by hand.
        fwrite(STDERR, "migrate: FAILED $version: " . $e->getMessage() . "\n");
        $pdo->query("SELECT RELEASE_LOCK('ssjmuk3d_migrate')");
        exit(1);
    }
}
$pdo->query("SELECT RELEASE_LOCK('ssjmuk3d_migrate')");
echo $count ? "migrate: $count applied\n" : "migrate: up to date\n";
