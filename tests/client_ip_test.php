<?php
declare(strict_types=1);

// Unit check for client_ip() proxy trust. Run: docker compose exec -T web php tests/client_ip_test.php
require __DIR__ . '/../src/bootstrap.php';

$cases = [
    // [TRUSTED_PROXIES, REMOTE_ADDR, X-Forwarded-For, expected, why]
    ['', '203.0.113.9', '1.2.3.4', '203.0.113.9', 'no proxy configured: XFF ignored (spoofing blocked)'],
    ['10.0.0.2', '203.0.113.9', '1.2.3.4', '203.0.113.9', 'peer is not the proxy: XFF ignored'],
    ['10.0.0.2', '10.0.0.2', '198.51.100.7', '198.51.100.7', 'trusted proxy: client from XFF'],
    ['10.0.0.2', '10.0.0.2', '6.6.6.6, 198.51.100.7', '198.51.100.7', 'client-supplied left entries ignored (rightmost untrusted wins)'],
    ['10.0.0.2,10.0.0.3', '10.0.0.2', '198.51.100.7, 10.0.0.3', '198.51.100.7', 'chained trusted proxies skipped'],
    ['10.0.0.2', '10.0.0.2', 'garbage', '10.0.0.2', 'invalid XFF falls back to peer'],
];
$fail = 0;
foreach ($cases as [$trusted, $peer, $xff, $want, $why]) {
    putenv('TRUSTED_PROXIES=' . $trusted);
    $_SERVER['REMOTE_ADDR'] = $peer;
    $_SERVER['HTTP_X_FORWARDED_FOR'] = $xff;
    $got = client_ip();
    $ok = $got === $want;
    $fail += $ok ? 0 : 1;
    printf("%s %s (got %s)\n", $ok ? 'PASS' : 'FAIL', $why, $got);
}
exit($fail ? 1 : 0);
