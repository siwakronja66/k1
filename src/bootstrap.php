<?php
declare(strict_types=1);

// Shared bootstrap for the API and CLI scripts. Lives outside the web root.

function env(string $key, ?string $default = null): string
{
    $v = getenv($key);
    if ($v === false || $v === '') {
        if ($default === null) {
            throw new RuntimeException("Missing required env var $key");
        }
        return $default;
    }
    return $v;
}

function db(): PDO
{
    static $pdo = null;
    if ($pdo === null) {
        $dsn = sprintf('mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4',
            env('DB_HOST', 'db'), env('DB_PORT', '3306'), env('DB_NAME', 'ssjmuk3d'));
        $pdo = new PDO($dsn, env('DB_USER'), env('DB_PASS'), [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]);
    }
    return $pdo;
}

final class HttpError extends RuntimeException
{
    public function __construct(public readonly int $status, string $message)
    {
        parent::__construct($message);
    }
}

function json_out(mixed $data, int $status = 200, array $headers = []): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('X-Content-Type-Options: nosniff');
    foreach ($headers as $k => $v) {
        header("$k: $v");
    }
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
    exit;
}

function json_in(): array
{
    $raw = file_get_contents('php://input') ?: '';
    if (strlen($raw) > 65536) {
        throw new HttpError(413, 'Request too large');
    }
    if ($raw === '') {
        return [];
    }
    $data = json_decode($raw, true);
    if (!is_array($data)) {
        throw new HttpError(400, 'Invalid JSON body');
    }
    return $data;
}

// ---- Validation helpers: throw 422 with a field-specific message ----

function v_str(array $in, string $key, int $max, bool $required = true): string
{
    $v = $in[$key] ?? null;
    if ($v === null || $v === '') {
        if ($required) {
            throw new HttpError(422, "$key is required");
        }
        return '';
    }
    if (!is_string($v)) {
        throw new HttpError(422, "$key must be a string");
    }
    $v = trim($v);
    if (mb_strlen($v) > $max) {
        throw new HttpError(422, "$key must be at most $max characters");
    }
    if ($required && $v === '') {
        throw new HttpError(422, "$key is required");
    }
    return $v;
}

function v_enum(array $in, string $key, array $allowed): string
{
    $v = $in[$key] ?? null;
    if (!is_string($v) || !in_array($v, $allowed, true)) {
        throw new HttpError(422, "$key must be one of: " . implode(', ', $allowed));
    }
    return $v;
}

function v_int_or_null(array $in, string $key): ?int
{
    $v = $in[$key] ?? null;
    if ($v === null || $v === '') {
        return null;
    }
    if (!is_int($v) && !(is_string($v) && ctype_digit($v))) {
        throw new HttpError(422, "$key must be an integer");
    }
    return (int)$v;
}

// ---- Session / auth / CSRF ----

function start_session(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }
    $secure = env('COOKIE_SECURE', '1') === '1';
    session_name('ssj3d_sid');
    session_set_cookie_params([
        'lifetime' => 0,
        'path'     => '/',
        'secure'   => $secure,
        'httponly' => true,
        'samesite' => 'Strict',
    ]);
    ini_set('session.use_strict_mode', '1');
    ini_set('session.gc_maxlifetime', '7200');
    session_start();

    // Idle timeout: 2h
    $now = time();
    if (isset($_SESSION['last_seen']) && $now - $_SESSION['last_seen'] > 7200) {
        $_SESSION = [];
        session_regenerate_id(true);
    }
    $_SESSION['last_seen'] = $now;
}

function csrf_token(): string
{
    if (empty($_SESSION['csrf'])) {
        $_SESSION['csrf'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf'];
}

function require_csrf(): void
{
    $sent = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    if (!is_string($sent) || empty($_SESSION['csrf']) || !hash_equals($_SESSION['csrf'], $sent)) {
        throw new HttpError(403, 'Invalid CSRF token');
    }
}

/** @return array{id:int,username:string,role:string,department_id:?int} */
function current_user(): array
{
    $uid = $_SESSION['uid'] ?? null;
    if (!is_int($uid)) {
        throw new HttpError(401, 'กรุณาเข้าสู่ระบบ');
    }
    $st = db()->prepare('SELECT id, username, role, department_id FROM users WHERE id = ? AND is_active = 1');
    $st->execute([$uid]);
    $u = $st->fetch();
    if (!$u) {
        $_SESSION = [];
        throw new HttpError(401, 'กรุณาเข้าสู่ระบบ');
    }
    $u['id'] = (int)$u['id'];
    $u['department_id'] = $u['department_id'] === null ? null : (int)$u['department_id'];
    return $u;
}

function require_admin(array $user): void
{
    if ($user['role'] !== 'admin') {
        throw new HttpError(403, 'เฉพาะผู้ดูแลระบบ');
    }
}

function can_edit_department(array $user, int $deptId): bool
{
    return $user['role'] === 'admin' || $user['department_id'] === $deptId;
}

/**
 * Real client IP. X-Forwarded-For is trusted ONLY when the direct peer is a listed proxy
 * (env TRUSTED_PROXIES, comma-separated IPs), otherwise any client could spoof it to dodge rate limits.
 * Walks XFF right-to-left and returns the first address that is not itself a trusted proxy.
 */
function client_ip(): string
{
    $peer = (string)($_SERVER['REMOTE_ADDR'] ?? '');
    $trusted = array_filter(array_map('trim', explode(',', env('TRUSTED_PROXIES', ''))));
    if ($trusted && in_array($peer, $trusted, true) && !empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $hops = array_reverse(array_map('trim', explode(',', (string)$_SERVER['HTTP_X_FORWARDED_FOR'])));
        foreach ($hops as $ip) {
            if (filter_var($ip, FILTER_VALIDATE_IP) && !in_array($ip, $trusted, true)) {
                return substr($ip, 0, 45);
            }
        }
    }
    return substr($peer, 0, 45);
}

function audit(array $user, string $action, string $entity, string|int $entityId, ?array $before, ?array $after): void
{
    $st = db()->prepare('INSERT INTO audit_log (user_id, username, action, entity, entity_id, before_json, after_json, ip)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    $enc = fn(?array $a) => $a === null ? null : json_encode($a, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
    $st->execute([$user['id'], $user['username'], $action, $entity, (string)$entityId, $enc($before), $enc($after), client_ip()]);
    notify_webhook($user, $action, $entity, $entityId, $after);
}

/**
 * Optional outbound notification (n8n / LINE bridge). env NOTIFY_WEBHOOK_URL; NOTIFY_ACTIONS = comma list
 * of audit actions to send (default: bookings, department + room changes). Never sends before/after
 * snapshots or passwords; failures never break the request (2 s timeout).
 */
function notify_webhook(array $user, string $action, string $entity, string|int $entityId, ?array $after): void
{
    $url = env('NOTIFY_WEBHOOK_URL', '');
    if ($url === '' || !preg_match('#^https?://#i', $url)) {
        return;
    }
    $allowed = array_filter(array_map('trim', explode(',', env('NOTIFY_ACTIONS',
        'booking.create,booking.delete,department.update,department.create,department.deactivate,room.update'))));
    if (!in_array($action, $allowed, true)) {
        return;
    }
    // Only non-sensitive summary fields
    $summary = array_intersect_key($after ?? [], array_flip(['name', 'title', 'room_id', 'starts_at', 'ends_at', 'department_id']));
    $body = json_encode([
        'source' => 'ssjmuk3d', 'action' => $action, 'entity' => $entity, 'entity_id' => (string)$entityId,
        'by' => $user['username'], 'at' => date('c'), 'summary' => $summary,
    ], JSON_UNESCAPED_UNICODE);
    $headers = "Content-Type: application/json\r\n";
    $secret = env('NOTIFY_WEBHOOK_SECRET', '');
    if ($secret !== '') {
        $headers .= 'X-Signature: sha256=' . hash_hmac('sha256', (string)$body, $secret) . "\r\n";
    }
    $ctx = stream_context_create(['http' => [
        'method' => 'POST', 'header' => $headers, 'content' => $body, 'timeout' => 2, 'ignore_errors' => true,
    ]]);
    if (@file_get_contents($url, false, $ctx) === false) {
        error_log('[ssjmuk3d] notify webhook failed for ' . $action);
    }
}

/**
 * Fixed-window rate limit per bucket (usually "<purpose>:<ip>"). Throws 429 when exceeded.
 * Old windows are pruned opportunistically (1% of calls).
 */
function rate_limit(string $bucket, int $max, int $windowSeconds): void
{
    $window = date('Y-m-d H:i:s', intdiv(time(), $windowSeconds) * $windowSeconds);
    $pdo = db();
    $pdo->prepare('INSERT INTO rate_limits (bucket, window_start, hits) VALUES (?, ?, 1)
                   ON DUPLICATE KEY UPDATE hits = hits + 1')->execute([$bucket, $window]);
    $st = $pdo->prepare('SELECT hits FROM rate_limits WHERE bucket = ? AND window_start = ?');
    $st->execute([$bucket, $window]);
    if (random_int(1, 100) === 1) {
        $pdo->exec('DELETE FROM rate_limits WHERE window_start < NOW() - INTERVAL 1 DAY');
    }
    if ((int)$st->fetchColumn() > $max) {
        header('Retry-After: ' . $windowSeconds);
        throw new HttpError(429, 'ส่งคำขอถี่เกินไป กรุณารอสักครู่');
    }
}

function bump_data_version(): void
{
    db()->exec('UPDATE data_version SET version = version + 1 WHERE id = 1');
}
