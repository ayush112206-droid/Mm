<?php
/**
 * V2 – Secure Video URL Builder
 * Generates embed URLs server-side. Video server list never exposed in JS.
 */
require_once dirname(__DIR__) . '/includes/config.php';

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

$id     = preg_replace('/[^0-9]/', '', $_GET['id'] ?? '');
$type   = in_array($_GET['type'] ?? '', ['movie', 'tv']) ? $_GET['type'] : 'movie';
$server = max(0, min(count(VIDEO_SERVERS) - 1, (int)($_GET['server'] ?? 0)));
$season = max(1, (int)($_GET['s'] ?? 1));
$episode= max(1, (int)($_GET['e'] ?? 1));

if (!$id) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing id']);
    exit;
}

$s = VIDEO_SERVERS[$server];
if ($type === 'movie') {
    $url = str_replace('{id}', $id, $s['movie']);
} else {
    $url = str_replace(['{id}', '{s}', '{e}'], [$id, $season, $episode], $s['tv']);
}

// Return server list metadata (no API keys) + the specific embed URL
$servers = array_map(fn($sv) => ['name' => $sv['name'], 'icon' => $sv['icon']], VIDEO_SERVERS);

echo json_encode([
    'url'     => $url,
    'servers' => $servers,
    'active'  => $server,
]);
