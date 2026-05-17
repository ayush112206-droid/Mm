<?php
require_once __DIR__ . '/includes/config.php';
$pageTitle = SITE_NAME . ' — Stream Movies & TV Shows Free';
$pageDesc  = 'Watch the latest movies and TV shows online for free in HD. No subscription needed.';
require_once __DIR__ . '/includes/header.php';
?>

<!-- OTT Platform Tabs -->
<div class="ott-section">
  <div class="ott-label"><i class="fas fa-bolt" style="color:var(--gold)"></i> Explore Platforms</div>
  <div class="ott-scroll" id="ott-tabs"></div>
</div>

<!-- Hero Slider -->
<div class="hero-section" id="hero-wrap">
  <div class="hero-stage">
    <div class="hero-track" id="hero-track"></div>
    <div class="hero-controls">
      <div class="hero-dots" id="hero-dots"></div>
    </div>
  </div>
</div>

<!-- Stats Bar -->
<div class="stats-bar" id="stats-bar">
  <div class="stat-item"><span class="stat-num" id="stat-movies">10K+</span><span class="stat-label">Movies</span></div>
  <div class="stat-divider"></div>
  <div class="stat-item"><span class="stat-num" id="stat-shows">5K+</span><span class="stat-label">TV Shows</span></div>
  <div class="stat-divider"></div>
  <div class="stat-item"><span class="stat-num">4K</span><span class="stat-label">HDR Quality</span></div>
  <div class="stat-divider"></div>
  <div class="stat-item"><span class="stat-num">Free</span><span class="stat-label">No Subscription</span></div>
</div>

<!-- Continue Watching -->
<div class="content-rows" id="continue-section" style="display:none">
  <div class="row-section">
    <div class="section-header">
      <span class="section-title"><i class="fas fa-history"></i> Continue Watching</span>
      <button class="see-all-btn" onclick="ContinueWatch.clearAll()">Clear All <i class="fas fa-trash-alt"></i></button>
    </div>
    <div class="hz-row" id="continue-row"></div>
  </div>
</div>

<!-- Home Content Rows -->
<div class="content-rows" id="home-rows">
  <div class="row-section">
    <div class="section-header">
      <span class="section-title"><i class="fas fa-calendar-alt"></i> New Releases</span>
      <button class="see-all-btn" onclick="HomeRows.seeAll('new_releases','New Releases')">See All <i class="fas fa-chevron-right"></i></button>
    </div>
    <div class="hz-row" id="row-new">
      <?php for($i=0;$i<10;$i++): ?><div class="row-skel"></div><?php endfor; ?>
    </div>
  </div>
  <div class="row-section">
    <div class="section-header">
      <span class="section-title"><i class="fas fa-trophy"></i> Top Rated</span>
      <button class="see-all-btn" onclick="HomeRows.seeAll('top_rated','Top Rated')">See All <i class="fas fa-chevron-right"></i></button>
    </div>
    <div class="hz-row" id="row-top">
      <?php for($i=0;$i<10;$i++): ?><div class="row-skel"></div><?php endfor; ?>
    </div>
  </div>

  <!-- Collection Banner -->
  <div class="collection-banner" onclick="HomeRows.seeAll('action','Action &amp; Thriller')">
    <div class="collection-banner-bg" id="collection-bg"></div>
    <div class="collection-banner-glow"></div>
    <div class="collection-banner-content">
      <div>
        <div class="collection-label"><i class="fas fa-fire"></i> Featured Collection</div>
        <div class="collection-title">Action &amp; Thriller</div>
        <div class="collection-sub">Heart-pounding movies &amp; shows hand-picked for you</div>
      </div>
      <button class="collection-cta"><i class="fas fa-play"></i> Explore Now</button>
    </div>
  </div>

  <div class="row-section">
    <div class="section-header">
      <span class="section-title"><i class="fas fa-language"></i> Bengali Cinema</span>
      <button class="see-all-btn" onclick="HomeRows.seeAll('bengali','Bengali Cinema')">See All <i class="fas fa-chevron-right"></i></button>
    </div>
    <div class="hz-row" id="row-bengali">
      <?php for($i=0;$i<10;$i++): ?><div class="row-skel"></div><?php endfor; ?>
    </div>
  </div>

  <div class="row-section">
    <div class="section-header">
      <span class="section-title"><i class="fas fa-film"></i> Hindi Movies</span>
      <button class="see-all-btn" onclick="HomeRows.seeAll('hindi','Hindi Movies')">See All <i class="fas fa-chevron-right"></i></button>
    </div>
    <div class="hz-row" id="row-hindi">
      <?php for($i=0;$i<10;$i++): ?><div class="row-skel"></div><?php endfor; ?>
    </div>
  </div>

  <div class="row-section">
    <div class="section-header">
      <span class="section-title"><i class="fas fa-globe-asia"></i> Korean Drama</span>
      <button class="see-all-btn" onclick="HomeRows.seeAll('korean','Korean Drama')">See All <i class="fas fa-chevron-right"></i></button>
    </div>
    <div class="hz-row" id="row-korean">
      <?php for($i=0;$i<10;$i++): ?><div class="row-skel"></div><?php endfor; ?>
    </div>
  </div>

  <div class="row-section">
    <div class="section-header">
      <span class="section-title"><i class="fas fa-bolt"></i> Action &amp; Thriller</span>
      <button class="see-all-btn" onclick="HomeRows.seeAll('action','Action &amp; Thriller')">See All <i class="fas fa-chevron-right"></i></button>
    </div>
    <div class="hz-row" id="row-action">
      <?php for($i=0;$i<10;$i++): ?><div class="row-skel"></div><?php endfor; ?>
    </div>
  </div>

  <div class="row-section">
    <div class="section-header">
      <span class="section-title"><i class="fas fa-tv"></i> Popular Web Series</span>
      <button class="see-all-btn" onclick="HomeRows.seeAll('webseries','Web Series')">See All <i class="fas fa-chevron-right"></i></button>
    </div>
    <div class="hz-row" id="row-web">
      <?php for($i=0;$i<10;$i++): ?><div class="row-skel"></div><?php endfor; ?>
    </div>
  </div>
</div>

<!-- Browse / Search View -->
<div id="browse-view" style="display:none">
  <!-- Mood Chips -->
  <div class="mood-bar" id="mood-bar">
    <div class="mood-chip active" onclick="Mood.set(this,'')"><span class="mood-emoji">🎬</span> All</div>
    <div class="mood-chip" onclick="Mood.set(this,'action')"><span class="mood-emoji">💥</span> Action</div>
    <div class="mood-chip" onclick="Mood.set(this,'comedy')"><span class="mood-emoji">😂</span> Comedy</div>
    <div class="mood-chip" onclick="Mood.set(this,'romance')"><span class="mood-emoji">❤️</span> Romance</div>
    <div class="mood-chip" onclick="Mood.set(this,'horror')"><span class="mood-emoji">👻</span> Horror</div>
    <div class="mood-chip" onclick="Mood.set(this,'scifi')"><span class="mood-emoji">🚀</span> Sci-Fi</div>
    <div class="mood-chip" onclick="Mood.set(this,'thriller')"><span class="mood-emoji">🔪</span> Thriller</div>
    <div class="mood-chip" onclick="Mood.set(this,'animation')"><span class="mood-emoji">🎨</span> Animation</div>
    <div class="mood-chip" onclick="Mood.set(this,'documentary')"><span class="mood-emoji">📽️</span> Documentary</div>
    <div class="mood-chip" onclick="Mood.set(this,'family')"><span class="mood-emoji">👨‍👩‍👧</span> Family</div>
  </div>

  <!-- Controls Bar -->
  <div class="controls-bar">
    <div class="controls-left">
      <div class="view-heading" id="view-heading"><i class="fas fa-fire"></i> Trending</div>
      <div class="lang-tabs">
        <button class="lang-btn active" onclick="App.setLang('',event)">All</button>
        <button class="lang-btn" onclick="App.setLang('en',event)">English</button>
        <button class="lang-btn" onclick="App.setLang('hi',event)">Hindi</button>
        <button class="lang-btn" onclick="App.setLang('bn',event)">Bengali</button>
        <button class="lang-btn" onclick="App.setLang('ko',event)">Korean</button>
      </div>
    </div>
    <div class="controls-right">
      <button class="ctrl-btn" id="filter-toggle-btn" onclick="FilterPanel.toggle()" title="Filters"><i class="fas fa-sliders-h"></i></button>
      <button class="ctrl-btn active" id="btn-grid-view" onclick="App.setView('grid')"><i class="fas fa-th-large"></i></button>
      <button class="ctrl-btn" id="btn-list-view" onclick="App.setView('list')"><i class="fas fa-list"></i></button>
    </div>
  </div>

  <!-- Filter Panel -->
  <div class="filter-panel" id="filter-panel">
    <div class="filter-grid">
      <div class="filter-group">
        <h4>Genre</h4>
        <div class="genre-cloud" id="genre-cloud"></div>
      </div>
      <div class="filter-group">
        <h4>Release Year</h4>
        <div class="range-wrap">
          <input type="range" class="range-slider" id="filter-year" min="1990" max="2030" value="2024" oninput="document.getElementById('yr-val').textContent=this.value"/>
          <div class="range-display"><span>1990</span><span class="range-val" id="yr-val">2024</span></div>
        </div>
      </div>
      <div class="filter-group">
        <h4>Min. Rating</h4>
        <div class="range-wrap">
          <input type="range" class="range-slider" id="filter-rating" min="0" max="10" step="0.5" value="5" oninput="document.getElementById('rt-val').textContent=this.value"/>
          <div class="range-display"><span>0</span><span class="range-val" id="rt-val">5.0</span></div>
        </div>
      </div>
    </div>
    <div class="filter-actions">
      <button class="btn-ghost" onclick="FilterPanel.reset()">Reset Filters</button>
      <button class="btn-primary" onclick="FilterPanel.apply()">Apply Filters</button>
    </div>
  </div>

  <!-- Media Grid -->
  <div class="media-section">
    <div class="media-grid" id="media-grid"></div>
    <div class="load-more-area" id="load-more-area">
      <button class="btn-load-more" onclick="App.loadMore()"><i class="fas fa-sync-alt"></i> Load More</button>
    </div>
  </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
