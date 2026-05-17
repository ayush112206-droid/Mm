<!-- Bottom Mobile Nav -->
<nav class="bottom-nav" id="bottom-nav">
  <button class="bnav-btn active" onclick="MobNav.go('home',this)" id="bnav-home">
    <i class="fas fa-home"></i><span>Home</span>
  </button>
  <button class="bnav-btn" onclick="MobNav.go('movies',this)">
    <i class="fas fa-film"></i><span>Movies</span>
  </button>
  <button class="bnav-btn" onclick="MobNav.go('tv',this)">
    <i class="fas fa-tv"></i><span>TV Shows</span>
  </button>
  <button class="bnav-btn" onclick="MobNav.go('search',this)">
    <i class="fas fa-search"></i><span>Search</span>
  </button>
  <button class="bnav-btn" onclick="MobNav.go('mylist',this)">
    <i class="fas fa-heart"></i><span>My List</span>
  </button>
</nav>

<!-- Modal Veil -->
<div class="modal-veil" id="modal-veil"></div>

<!-- Quick View Modal -->
<div class="modal-box" id="qv-box">
  <button class="modal-close" onclick="Modals.close()"><i class="fas fa-times"></i></button>
  <div class="qv-hero" id="qv-hero">
    <img id="qv-backdrop" src="" alt=""/>
    <div class="qv-hero-grad"></div>
    <div class="qv-hero-info">
      <h2 id="qv-title" class="qv-title"></h2>
      <div class="qv-meta" id="qv-meta"></div>
      <div class="qv-actions">
        <button class="btn-hero-play" id="qv-play-btn"><i class="fas fa-play"></i> Stream Now</button>
        <button class="btn-hero-info" id="qv-info-btn"><i class="fas fa-expand"></i> Full Details</button>
        <button class="btn-hero-watchlist" id="qv-wl-btn"><i class="fas fa-plus"></i></button>
      </div>
    </div>
  </div>
  <div class="qv-body">
    <p class="qv-desc" id="qv-desc"></p>
    <div class="qv-tags" id="qv-genres"></div>
  </div>
</div>

<!-- Full View Modal -->
<div class="modal-box fv-modal" id="fv-box">
  <button class="modal-close" onclick="Modals.close()"><i class="fas fa-times"></i></button>
  <div class="fv-inner">
    <!-- Player -->
    <div class="fv-player-wrap" id="fv-player-wrap">
      <div class="player-shell" id="pf-player">
        <div class="player-loader" id="player-loader">
          <div class="player-loader-spin"></div>
          <p class="player-loader-txt">Loading stream…</p>
        </div>
        <iframe id="main-player" class="player-iframe" allowfullscreen allow="autoplay; fullscreen; picture-in-picture" referrerpolicy="no-referrer" sandbox="allow-scripts allow-same-origin allow-forms allow-presentation allow-popups" src="about:blank"></iframe>
      </div>
      <!-- Server Tabs -->
      <div class="server-bar">
        <div class="server-label"><i class="fas fa-server"></i> Stream Server</div>
        <div class="server-tabs" id="server-tabs"></div>
        <div class="ep-row" id="ep-row" style="display:none">
          <label>S<input type="number" id="ep-season" class="ep-input" value="1" min="1"/></label>
          <label>E<input type="number" id="ep-episode" class="ep-input" value="1" min="1"/></label>
          <button class="btn-primary" id="btn-ep-go"><i class="fas fa-play"></i> Go</button>
        </div>
      </div>
    </div>
    <!-- Detail Info -->
    <div class="fv-detail" id="fv-detail">
      <div class="fv-backdrop-wrap">
        <img id="fv-backdrop" class="fv-backdrop" src="" alt=""/>
        <div class="fv-backdrop-grad"></div>
      </div>
      <div class="fv-content">
        <div class="fv-poster-row">
          <img id="fv-poster" class="fv-poster" src="" alt=""/>
          <div class="fv-info">
            <h1 id="fv-title" class="fv-title"></h1>
            <div class="fv-meta-row" id="fv-meta-row"></div>
            <div class="fv-tagline" id="fv-tagline"></div>
            <div class="fv-action-row">
              <button class="fv-wl-btn" id="fv-wl-btn"><i class="fas fa-plus"></i> My List</button>
              <button class="fv-share-btn" onclick="Utils.share('twitter')"><i class="fab fa-twitter"></i></button>
              <button class="fv-share-btn" onclick="Utils.share('whatsapp')"><i class="fab fa-whatsapp"></i></button>
              <button class="fv-share-btn" onclick="Utils.copyLink()"><i class="fas fa-link"></i></button>
            </div>
          </div>
        </div>
        <!-- Tabs -->
        <div class="fv-tabs">
          <button class="fv-tab active" onclick="FVTabs.show('overview',this)">Overview</button>
          <button class="fv-tab" onclick="FVTabs.show('cast',this)">Cast</button>
          <button class="fv-tab" onclick="FVTabs.show('similar',this)">Similar</button>
        </div>
        <div class="fv-tab-pane active" id="tab-overview">
          <p class="fv-desc" id="fv-desc"></p>
        </div>
        <div class="fv-tab-pane" id="tab-cast">
          <div class="hz-people" id="fv-cast"></div>
        </div>
        <div class="fv-tab-pane" id="tab-similar">
          <div class="hz-related" id="fv-related"></div>
        </div>
      </div>
    </div>
  </div>
</div>

<script src="/assets/js/app.js"></script>
</body>
</html>
