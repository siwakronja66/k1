<?php
declare(strict_types=1);

// Public JSON API for the 3D viewer: /api/v1/snapshot and /api/v1/search-log.
// No login, no session. The staff back-office is server-rendered PHP under /admin/.
require __DIR__ . '/../../src/bootstrap.php';
require __DIR__ . '/../../src/services.php';
require __DIR__ . '/../../src/handlers.php';

header('Cache-Control: no-store');
header('X-Frame-Options: DENY');
header("Content-Security-Policy: default-src 'none'; frame-ancestors 'none'");

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
$path = '/' . trim((string)preg_replace('#^.*?/api/v1#', '', $path), '/');

// path => [method => handler]
$routes = [
    '/snapshot'   => ['GET' => 'h_snapshot'],
    '/search-log' => ['POST' => 'h_search_log'],
];

try {
    if (!isset($routes[$path])) {
        throw new HttpError(404, 'Not found');
    }
    $handler = $routes[$path][$method] ?? null;
    if ($handler === null) {
        header('Allow: ' . implode(', ', array_keys($routes[$path])));
        throw new HttpError(405, 'Method not allowed');
    }
    $handler(null);
} catch (HttpError $e) {
    json_out(['error' => $e->getMessage()], $e->status);
} catch (PDOException $e) {
    error_log('[ssjmuk3d] DB error: ' . $e->getMessage());
    json_out(['error' => 'Database error'], 500);
} catch (Throwable $e) {
    error_log('[ssjmuk3d] ' . $e);
    json_out(['error' => 'Server error'], 500);
}
