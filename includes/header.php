<?php
require_once __DIR__ . '/config.php';
$title = $pageTitle ?? SITE_NAME;
$desc  = $pageDesc  ?? 'Watch movies and TV shows online free in HD. No subscription required.';
$ogImg = $pageOgImg ?? '';
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"/>
<meta name="theme-color" content="#060608"/>
<meta name="apple-mobile-web-app-capable" content="yes"/>
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"/>
<title><?= htmlspecialchars($title) ?></title>
<meta name="description" content="<?= htmlspecialchars($desc) ?>"/>
<meta property="og:title" content="<?= htmlspecialchars($title) ?>"/>
<meta property="og:description" content="<?= htmlspecialchars($desc) ?>"/>
<meta property="og:type" content="website"/>
<?php if ($ogImg): ?><meta property="og:image" content="<?= htmlspecialchars($ogImg) ?>"/><?php endif; ?>
<meta name="robots" content="index,follow"/>
<link rel="icon" href="/assets/img/favicon.ico" type="image/x-icon"/>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"/>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap"/>
<link rel="stylesheet" href="/assets/css/style.css"/>
</head>
<body>

<!-- Progress Bar -->
<div id="progress-bar-outer"><div id="progress-bar-inner"></div></div>

<!-- Toast -->
<div class="toast-wrap" id="toast-wrap">
  <div class="toast-inner" id="toast-inner">
    <i class="fas fa-check-circle toast-icon" id="toast-icon"></i>
    <span id="toast-text"></span>
  </div>
</div>

<!-- Navbar -->
<nav class="navbar" id="navbar">
  <div class="nav-left">
    <a class="logo" href="/" id="logo-link">
      <div class="logo-icon"><i class="fas fa-play"></i></div>
      <?= htmlspecialchars(SITE_NAME) ?>
    </a>
    <div class="nav-links">
      <button class="nav-btn<?= (!isset($activeNav) || $activeNav==='movie') ? ' active' : '' ?>" data-nav="movie" onclick="App.setType('movie')">Movies</button>
      <button class="nav-btn<?= (isset($activeNav) && $activeNav==='tv') ? ' active' : '' ?>" data-nav="tv" onclick="App.setType('tv')">TV Shows</button>
      <button class="nav-btn" data-nav="watchlist" onclick="App.showWatchlist()"><i class="fas fa-heart"></i> My List</button>
    </div>
  </div>
  <div class="nav-right">
    <button class="mobile-search-toggle" onclick="document.getElementById('main-search-wrap').classList.toggle('mobile-open')">
      <i class="fas fa-search"></i>
    </button>
    <div class="search-wrap" id="main-search-wrap">
      <div class="search-bar">
        <i class="fas fa-search search-icon-btn" onclick="Search.execute()"></i>
        <input id="search-input" type="text" placeholder="Search movies, shows..." autocomplete="off"/>
        <i class="fas fa-microphone voice-btn" id="voice-btn" title="Voice Search"></i>
      </div>
      <div class="search-dropdown" id="search-dropdown">
        <div class="sdrop-label">Quick Results</div>
        <div id="sdrop-results"></div>
        <div class="sdrop-label">Recent</div>
        <div class="sdrop-recent" id="sdrop-recent"></div>
      </div>
    </div>
    <button class="notif-btn" id="notif-btn" title="Notifications">
      <i class="fas fa-bell"></i>
      <span class="notif-badge" id="notif-badge"></span>
    </button>
  </div>
</nav>
