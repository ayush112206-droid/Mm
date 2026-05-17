<?php
/**
 * V4 – Secure TMDB API Proxy
 * ─────────────────────────────────
 * All TMDB requests go through here server-side.
 * The API key is NEVER sent to the browser or visible in network tabs.
 */

// ── Bootstrap ───────────────────────────────────────────────────────────────
require_once dirname(__DIR__) . '/includes/config.php';

// ── CORS / Headers ──────────────────────────────────────────────────────────
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: SAMEORIGIN');
header('Cache-Control: public, max-age=120'); // 2-min cache

// Only accept same-origin requests
$origin = $_SERVER['HTTP_HOST'] ?? '';
$referer = $_SERVER['HTTP_REFERER'] ?? '';
if ($referer && strpos($referer, $origin) === false) {
    http_response_code(403);
    echo json_encode(['error' => 'Forbidden']);
    exit;
}

// ── Rate Limiting ────────────────────────────────────────────────────────────
$ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
$rateFile = sys_get_temp_dir() . '/pf_rate_' . md5($ip);
$now = time();
$window = 60; // 1 minute
$limit = RATE_LIMIT;

$data = file_exists($rateFile) ? json_decode(file_get_contents($rateFile), true) : ['count' => 0, 'ts' => $now];
if ($now - $data['ts'] > $window) {
    $data = ['count' => 0, 'ts' => $now];
}
$data['count']++;
file_put_contents($rateFile, json_encode($data));

if ($data['count'] > $limit) {
    http_response_code(429);
    echo json_encode(['error' => 'Too many requests']);
    exit;
}

// ── Input Validation ─────────────────────────────────────────────────────────
$endpoint = trim($_GET['endpoint'] ?? '');
$page     = max(1, min(500, (int)($_GET['page'] ?? 1)));
$query    = urlencode(strip_tags($_GET['query'] ?? ''));
$lang     = preg_replace('/[^a-z]/', '', $_GET['lang'] ?? '');
$provider = preg_replace('/[^0-9,]/', '', $_GET['provider'] ?? '');
$region   = preg_replace('/[^A-Z]/', '', strtoupper($_GET['region'] ?? 'IN'));
$genres   = preg_replace('/[^0-9,]/', '', $_GET['genres'] ?? '');
$year     = preg_replace('/[^0-9]/', '', $_GET['year'] ?? '');
$rating   = preg_replace('/[^0-9.]/', '', $_GET['rating'] ?? '');
$itemId   = preg_replace('/[^0-9]/', '', $_GET['id'] ?? '');
$type     = in_array($_GET['type'] ?? '', ['movie', 'tv']) ? $_GET['type'] : 'movie';
$append   = preg_replace('/[^a-z_,]/', '', $_GET['append'] ?? '');

if (empty($endpoint)) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing endpoint']);
    exit;
}

// ── Endpoint Whitelist ────────────────────────────────────────────────────────
$allowed = array_merge(ALLOWED_ENDPOINTS, [
    "movie/{$itemId}", "movie/{$itemId}/credits", "movie/{$itemId}/similar",
    "movie/{$itemId}/recommendations", "movie/{$itemId}/videos", "movie/{$itemId}/images",
    "tv/{$itemId}", "tv/{$itemId}/credits", "tv/{$itemId}/similar",
    "tv/{$itemId}/recommendations", "tv/{$itemId}/videos", "tv/{$itemId}/aggregate_credits",
    "person/{$itemId}", "person/{$itemId}/combined_credits",
]);

$isAllowed = false;
foreach ($allowed as $pattern) {
    if ($endpoint === $pattern) { $isAllowed = true; break; }
}
// Also allow dynamic detail endpoints via regex
if (!$isAllowed && preg_match('#^(movie|tv|person)/\d+(/[a-z_]+)?$#', $endpoint)) {
    $isAllowed = true;
}
if (!$isAllowed) {
    http_response_code(403);
    echo json_encode(['error' => 'Endpoint not allowed']);
    exit;
}

// ── Build TMDB URL ────────────────────────────────────────────────────────────
$url = TMDB_BASE . '/' . $endpoint . '?api_key=' . TMDB_API_KEY . '&page=' . $page;

if ($query)    $url .= '&query=' . $query;
if ($lang)     $url .= '&with_original_language=' . $lang;
if ($provider) $url .= '&with_watch_providers=' . $provider . '&watch_region=' . $region;
if ($genres)   $url .= '&with_genres=' . $genres;
if ($year)     $url .= '&' . ($type === 'movie' ? 'primary_release_year' : 'first_air_date_year') . '=' . $year;
if ($rating)   $url .= '&vote_average.gte=' . $rating;
if ($append)   $url .= '&append_to_response=' . $append;

// Discover sort
$sort = preg_replace('/[^a-z._]/', '', $_GET['sort'] ?? 'popularity.desc');
if (strpos($endpoint, 'discover/') === 0) {
    $url .= '&sort_by=' . $sort;
}

// ── Fetch with cURL ───────────────────────────────────────────────────────────
$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL            => $url,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT        => 10,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_SSL_VERIFYPEER => true,
    CURLOPT_HTTPHEADER     => ['Accept: application/json'],
]);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$err      = curl_error($ch);
curl_close($ch);

if ($err || $httpCode !== 200) {
    http_response_code(502);
    echo json_encode(['error' => 'Upstream error', 'code' => $httpCode]);
    exit;
}

// ── Return clean response (API key never echoed) ───────────────────────────
echo $response;
