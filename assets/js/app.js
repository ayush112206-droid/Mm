/**
 * V2 v3.0 – Main Application JavaScript
 * All TMDB calls go through /api/proxy.php — API key never exposed to browser.
 */
'use strict';

/* ── CONFIG (no API key here — all server-side) ─────────────────────────── */
const CFG = {
  W500:  'https://image.tmdb.org/t/p/w500',
  ORIG:  'https://image.tmdb.org/t/p/original',
  PROXY: '/api/proxy.php',
  PLAYER:'/api/player.php',
  PLATFORMS: [
    { id:'',    name:'All',       region:'IN' },
    { id:'8',   name:'Netflix',   region:'IN', logo:'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg' },
    { id:'119', name:'Prime',     region:'IN', logo:'https://upload.wikimedia.org/wikipedia/commons/f/f1/Prime_Video.png' },
    { id:'337', name:'Disney+',   region:'IN', logo:'https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_logo.svg' },
    { id:'350', name:'Apple TV+', region:'US', logo:'https://upload.wikimedia.org/wikipedia/commons/2/28/Apple_TV_Plus_Logo.svg', invert:true },
    { id:'531', name:'Max',       region:'US', logo:'https://upload.wikimedia.org/wikipedia/commons/c/ce/Max_logo.svg' },
    { id:'15',  name:'Hulu',      region:'US', logo:'https://www.svgrepo.com/download/354004/hulu.svg' },
    { id:'232', name:'ZEE5',      region:'IN', color:'#9B30FF' },
    { id:'315', name:'hoichoi',   region:'IN', color:'#E91E63' },
    { id:'611', name:'ULLU',      region:'IN', color:'#FF6B00' },
    { id:'300', name:'ALTBalaji', region:'IN', color:'#FF0055' },
  ],
  MOOD_GENRES: { action:'28', comedy:'35', romance:'10749', horror:'27', scifi:'878', thriller:'53', animation:'16', documentary:'99', family:'10751' }
};

/* ── STATE ───────────────────────────────────────────────────────────────── */
const State = {
  type:'movie', page:1, lang:'', provider:'', region:'IN',
  query:'', isSearch:false, view:'grid',
  isHomeView:true, isBrowseView:false, isWatchlistView:false,
  filters:{genres:[],year:null,rating:null},
  activeId:null, activeType:null, activeData:null, activeServer:0,
  watchlist:   JSON.parse(localStorage.getItem('pf_watchlist')||'[]'),
  history:     JSON.parse(localStorage.getItem('pf_history')||'[]'),
  searches:    JSON.parse(localStorage.getItem('pf_searches')||'[]'),
  continueWatch:JSON.parse(localStorage.getItem('pf_continue')||'[]'),
  isLoading:false, serverList:[]
};

/* ── UTILS ───────────────────────────────────────────────────────────────── */
const Utils = {
  toast(msg, type='success') {
    const icons = {success:'fa-check-circle', error:'fa-exclamation-circle', info:'fa-info-circle'};
    document.getElementById('toast-text').textContent = msg;
    document.getElementById('toast-icon').className = `fas ${icons[type]||icons.success} toast-icon`;
    document.getElementById('toast-inner').className = `toast-inner ${type}`;
    const w = document.getElementById('toast-wrap');
    w.classList.add('show');
    clearTimeout(Utils._t);
    Utils._t = setTimeout(()=>w.classList.remove('show'), 2800);
  },
  progress(on) {
    const outer = document.getElementById('progress-bar-outer');
    const bar   = document.getElementById('progress-bar-inner');
    if(on){ outer.style.opacity='1'; bar.style.width='30%'; setTimeout(()=>bar.style.width='72%',220); }
    else  { bar.style.width='100%'; setTimeout(()=>{ outer.style.opacity='0'; setTimeout(()=>bar.style.width='0%',320); },320); }
  },
  year: d => d ? d.split('-')[0] : 'N/A',
  stars(r) {
    const n = Math.round((r/10)*5);
    return Array.from({length:5},(_,i)=>`<i class="${i<n?'fas':'far'} fa-star ${i<n?'star-filled':'star-empty'}"></i>`).join('');
  },
  runtime(m) { return m ? `${Math.floor(m/60)}h ${m%60}m` : ''; },
  img(path, size='W500') { return path ? CFG[size]+path : '/assets/img/no-poster.svg'; },
  copyLink() { navigator.clipboard.writeText(window.location.href); Utils.toast('Link copied!','info'); },
  share(p) {
    const title = State.activeData ? (State.activeData.title||State.activeData.name) : 'V2';
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`Watch "${title}" on V2! `);
    const link = p==='twitter'
      ? `https://twitter.com/intent/tweet?text=${text}&url=${url}`
      : `https://api.whatsapp.com/send?text=${text}${url}`;
    window.open(link,'_blank');
  }
};

/* ── API (proxy-based, no key in browser) ────────────────────────────────── */
const API = {
  async fetch(endpoint, params={}) {
    try {
      const qs = new URLSearchParams({ endpoint, ...params }).toString();
      const r = await fetch(`${CFG.PROXY}?${qs}`);
      if(!r.ok) return null;
      return await r.json();
    } catch(e) { console.error('[API]', e); return null; }
  },
  discoverUrl() {
    const p = {
      endpoint: `discover/${State.type}`,
      page: State.page,
    };
    if(State.lang)                   p.lang     = State.lang;
    if(State.provider)               p.provider = State.provider;
    if(State.region)                 p.region   = State.region;
    if(State.filters.genres.length)  p.genres   = State.filters.genres.join(',');
    if(State.filters.year)           p.year     = State.filters.year;
    if(State.filters.rating)         p.rating   = State.filters.rating;
    p.type = State.type;
    return p;
  },
  searchParams() {
    return { endpoint:'search/multi', query:State.query, page:State.page };
  }
};

/* ── NAV SCROLL ─────────────────────────────────────────────────────────── */
const NavScroll = {
  init() {
    let last = 0;
    window.addEventListener('scroll', ()=>{
      const y = window.scrollY;
      const nav = document.getElementById('navbar');
      if(nav) {
        if(y>60) nav.classList.add('scrolled'); else nav.classList.remove('scrolled');
        if(y > last+5 && y>200) nav.classList.add('nav-hidden');
        else if(y < last-5) nav.classList.remove('nav-hidden');
        last = y;
      }
    }, {passive:true});
  }
};

/* ── OTT TABS ───────────────────────────────────────────────────────────── */
const OTTTabs = {
  render() {
    const el = document.getElementById('ott-tabs');
    if(!el) return;
    el.innerHTML = CFG.PLATFORMS.map((p,i)=>{
      const inner = p.logo
        ? `<img src="${p.logo}" alt="${p.name}" class="ott-logo${p.invert?' invert':''}" onerror="this.style.display='none';this.nextElementSibling.style.display='block'"/><span class="ott-text" style="display:none;color:${p.color||'#fff'}">${p.name}</span>`
        : `<span class="ott-text" style="color:${p.color||'#fff'}">${p.name}</span>`;
      return `<div class="ott-chip${i===0?' active':''}" onclick="OTTTabs.select('${p.id}','${p.region||'IN'}',this)">${inner}</div>`;
    }).join('');
  },
  select(id, region, el) {
    State.provider=id; State.region=region; State.isSearch=false;
    document.querySelectorAll('.ott-chip').forEach(c=>c.classList.remove('active'));
    el.classList.add('active');
    const name = el.querySelector('.ott-text')?.textContent || el.querySelector('.ott-logo')?.alt || 'Trending';
    App.showBrowse(id ? name : 'Trending Now', 'fa-bolt');
    App.loadContent(true);
  }
};

/* ── HERO SLIDER ─────────────────────────────────────────────────────────── */
const Hero = {
  _timer:null, _idx:0,
  async init() {
    const data = await API.fetch(`trending/${State.type}/day`, {page:1});
    if(!data?.results) return;
    const slides = data.results.slice(0,6);
    const track = document.getElementById('hero-track');
    const dots  = document.getElementById('hero-dots');
    if(!track||!dots) return;
    track.innerHTML=''; dots.innerHTML='';
    slides.forEach((item,i)=>{
      const type = item.media_type || State.type;
      const inWL = State.watchlist.some(w=>w.id===item.id);
      const s = document.createElement('div');
      s.className = 'hero-slide';
      s.style.backgroundImage = `url(${Utils.img(item.backdrop_path,'ORIG')})`;
      s.innerHTML = `
        <div class="hero-content">
          <div class="hero-badges">
            <span class="badge-rank">#${i+1} Trending</span>
            <span class="badge-type">${type==='movie'?'Movie':'TV Show'}</span>
            <span class="badge-quality">4K HDR</span>
          </div>
          <h2 class="hero-title">${item.title||item.name||''}</h2>
          <div class="hero-meta-row">
            <div class="hero-rating"><div class="hero-stars">${Utils.stars(item.vote_average||0)}</div>&nbsp;${(item.vote_average||0).toFixed(1)}</div>
            <span class="hero-dot-divider"></span>
            <span>${Utils.year(item.release_date||item.first_air_date)}</span>
          </div>
          <p class="hero-desc">${item.overview||''}</p>
          <div class="hero-actions">
            <button class="btn-hero-play" onclick="Modals.openFull(${item.id},'${type}')"><i class="fas fa-play"></i> Stream Now</button>
            <button class="btn-hero-info" onclick="Modals.openQuick(${item.id},'${type}')"><i class="fas fa-info-circle"></i> More Info</button>
            <button class="btn-hero-watchlist${inWL?' in-list':''}" id="hero-wl-${item.id}"
              onclick="event.stopPropagation();Watchlist.toggleById(${item.id},'${type}','${(item.title||item.name||'').replace(/'/g,"\\'")}','${item.poster_path||''}',${(item.vote_average||0).toFixed(1)},'${Utils.year(item.release_date||item.first_air_date)}')">
              <i class="fas ${inWL?'fa-check':'fa-plus'}"></i>
            </button>
          </div>
        </div>`;
      track.appendChild(s);
      const dot = document.createElement('div');
      dot.className = `hero-dot${i===0?' active':''}`;
      dot.onclick = ()=>{ Hero._idx=i; Hero.update(); };
      dots.appendChild(dot);
    });
    const bg = document.getElementById('collection-bg');
    if(bg && slides[2]?.backdrop_path) bg.style.backgroundImage=`url(${Utils.img(slides[2].backdrop_path,'ORIG')})`;
    Hero._idx=0;
    clearInterval(Hero._timer);
    Hero._timer = setInterval(()=>{ Hero._idx=(Hero._idx+1)%slides.length; Hero.update(); }, 7000);
  },
  update() {
    const t = document.getElementById('hero-track');
    if(t) t.style.transform=`translateX(-${Hero._idx*100}%)`;
    document.querySelectorAll('.hero-dot').forEach((d,i)=>d.classList.toggle('active',i===Hero._idx));
  }
};

/* ── HOME ROWS ──────────────────────────────────────────────────────────── */
const HomeRows = {
  async init() {
    const rows = [
      { id:'row-new',     endpoint:'movie/now_playing', params:{} },
      { id:'row-top',     endpoint:'movie/top_rated',   params:{} },
      { id:'row-action',  endpoint:'discover/movie',    params:{genres:'28,53'} },
      { id:'row-hindi',   endpoint:'discover/movie',    params:{lang:'hi'} },
      { id:'row-bengali', endpoint:'discover/movie',    params:{lang:'bn'} },
      { id:'row-korean',  endpoint:'discover/tv',       params:{lang:'ko'} },
      { id:'row-web',     endpoint:'tv/popular',        params:{} },
    ];
    // Show skeletons
    rows.forEach(r=>{ const el=document.getElementById(r.id); if(el) el.innerHTML=Array(10).fill('<div class="row-skel"></div>').join(''); });
    // Fetch in parallel
    await Promise.all(rows.map(async r=>{
      const data = await API.fetch(r.endpoint, {page:1, ...r.params});
      if(!data?.results) return;
      const el = document.getElementById(r.id);
      if(!el) return;
      const type = r.endpoint.startsWith('tv')||r.endpoint.includes('tv') ? 'tv' : 'movie';
      el.innerHTML = data.results.slice(0,15).filter(i=>i.poster_path).map((item,idx)=>{
        const t = item.media_type||type;
        return `<div class="row-card" onclick="Modals.openFull(${item.id},'${t}')">
          <div class="row-card-img-wrap">
            <img src="${Utils.img(item.poster_path)}" alt="${(item.title||item.name||'').replace(/"/g,'')}" loading="lazy"/>
            ${idx<5?`<div class="rank-badge">#${idx+1}</div>`:''}
            <div class="row-card-overlay">
              <div class="row-card-play"><i class="fas fa-play"></i></div>
              <div class="row-card-title">${item.title||item.name||''}</div>
              <div class="row-card-meta">${Utils.year(item.release_date||item.first_air_date)}</div>
            </div>
          </div>
        </div>`;
      }).join('');
    }));
    await Stats.update();
  },
  seeAll(key, heading) {
    const map = {
      new_releases: {endpoint:'movie/now_playing',params:{}},
      top_rated:    {endpoint:'movie/top_rated',params:{}},
      action:       {endpoint:'discover/movie',params:{genres:'28,53'}},
      hindi:        {endpoint:'discover/movie',params:{lang:'hi'}},
      bengali:      {endpoint:'discover/movie',params:{lang:'bn'}},
      korean:       {endpoint:'discover/tv',params:{lang:'ko'}},
      webseries:    {endpoint:'tv/popular',params:{}},
    };
    const cfg = map[key];
    if(!cfg) return;
    State.isSearch = false;
    State._customEndpoint = cfg;
    App.showBrowse(heading,'fa-fire');
    App.loadContent(true);
  }
};

/* ── SEARCH ─────────────────────────────────────────────────────────────── */
const Search = {
  init() {
    const input = document.getElementById('search-input');
    const drop  = document.getElementById('search-dropdown');
    if(!input||!drop) return;
    let debounce;
    input.addEventListener('input', e=>{
      clearTimeout(debounce);
      const q = e.target.value.trim();
      if(q.length>2) {
        debounce = setTimeout(async()=>{
          const data = await API.fetch('search/multi', {query:q, page:1});
          if(data?.results) {
            const items = data.results.filter(i=>i.poster_path).slice(0,6);
            document.getElementById('sdrop-results').innerHTML = items.map(i=>`
              <div class="sdrop-item" onclick="Search.commit('${(i.title||i.name||'').replace(/'/g,"\\'")}')">
                <img class="sdrop-img" src="${Utils.img(i.poster_path)}" alt=""/>
                <div class="sdrop-info">
                  <div class="sdrop-title">${i.title||i.name||''}</div>
                  <div class="sdrop-meta">
                    <span class="sdrop-type">${i.media_type||'movie'}</span>
                    <span><i class="fas fa-star" style="color:#FFD700;font-size:11px"></i> ${(i.vote_average||0).toFixed(1)}</span>
                  </div>
                </div>
              </div>`).join('');
            drop.classList.add('active');
          }
        }, 280);
      } else { drop.classList.remove('active'); }
    });
    input.addEventListener('focus', ()=>{ Search.renderRecent(); drop.classList.add('active'); });
    document.addEventListener('click', e=>{ if(!e.target.closest('.search-wrap')) drop.classList.remove('active'); });
    input.addEventListener('keydown', e=>{ if(e.key==='Enter') Search.execute(); });
    Search.renderRecent();
    Search.initVoice();
  },
  execute() { const q=document.getElementById('search-input')?.value.trim(); if(q) Search.commit(q); },
  commit(q) {
    State.isSearch=true; State.query=q; State._customEndpoint=null;
    const inp = document.getElementById('search-input');
    if(inp) inp.value=q;
    document.getElementById('search-dropdown')?.classList.remove('active');
    document.getElementById('main-search-wrap')?.classList.remove('mobile-open');
    State.searches = [q,...State.searches.filter(s=>s!==q)].slice(0,8);
    localStorage.setItem('pf_searches', JSON.stringify(State.searches));
    Search.renderRecent();
    App.showBrowse(`Results for "${q}"`, 'fa-search');
    App.loadContent(true);
  },
  renderRecent() {
    const el = document.getElementById('sdrop-recent');
    if(!el) return;
    el.innerHTML = State.searches.map(q=>`<span class="sdrop-pill" onclick="Search.commit('${q.replace(/'/g,"\\'")}')" ><i class="fas fa-history"></i> ${q}</span>`).join('');
  },
  initVoice() {
    const btn = document.getElementById('voice-btn');
    if(!btn) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if(!SR) { btn.style.display='none'; return; }
    const r = new SR(); r.continuous=false;
    btn.addEventListener('click', ()=>{ r.start(); btn.classList.add('recording'); });
    r.onresult = e=>{ const t=e.results[0][0].transcript; if(document.getElementById('search-input')) document.getElementById('search-input').value=t; Search.commit(t); };
    r.onend = ()=>btn.classList.remove('recording');
  }
};

/* ── FILTER PANEL ────────────────────────────────────────────────────────── */
const FilterPanel = {
  async initGenres() {
    const [m,t] = await Promise.all([
      API.fetch('genre/movie/list', {}),
      API.fetch('genre/tv/list', {})
    ]);
    if(m&&t) {
      const all = [...(m.genres||[]),...(t.genres||[])];
      const uniq = Array.from(new Set(all.map(a=>a.id))).map(id=>all.find(a=>a.id===id));
      const el = document.getElementById('genre-cloud');
      if(el) el.innerHTML = uniq.map(g=>`<span class="genre-tag" data-id="${g.id}" onclick="this.classList.toggle('active')">${g.name}</span>`).join('');
    }
  },
  toggle() {
    const p = document.getElementById('filter-panel');
    const btn = document.getElementById('filter-toggle-btn');
    if(!p) return;
    p.classList.toggle('open');
    btn?.classList.toggle('active', p.classList.contains('open'));
  },
  apply() {
    State.filters.genres = [...document.querySelectorAll('.genre-tag.active')].map(c=>c.dataset.id);
    State.filters.year   = document.getElementById('filter-year')?.value;
    State.filters.rating = document.getElementById('filter-rating')?.value;
    State.isSearch=false; State._customEndpoint=null;
    document.getElementById('filter-panel')?.classList.remove('open');
    document.getElementById('filter-toggle-btn')?.classList.remove('active');
    App.loadContent(true);
  },
  reset() {
    document.querySelectorAll('.genre-tag').forEach(c=>c.classList.remove('active'));
    const fy=document.getElementById('filter-year'), yr=document.getElementById('yr-val');
    const fr=document.getElementById('filter-rating'), rv=document.getElementById('rt-val');
    if(fy){fy.value=2024;} if(yr)yr.textContent='2024';
    if(fr){fr.value=5;}   if(rv)rv.textContent='5.0';
    State.filters={genres:[],year:null,rating:null};
  }
};

/* ── MOOD ─────────────────────────────────────────────────────────────────── */
const Mood = {
  set(el, mood) {
    document.querySelectorAll('.mood-chip').forEach(c=>c.classList.remove('active'));
    el.classList.add('active');
    State.filters.genres = mood && CFG.MOOD_GENRES[mood] ? [CFG.MOOD_GENRES[mood]] : [];
    State._customEndpoint = null;
    State.isSearch = false;
    App.loadContent(true);
  }
};

/* ── GRID UI ─────────────────────────────────────────────────────────────── */
const GridUI = {
  showSkeletons() {
    const g = document.getElementById('media-grid');
    if(g) g.innerHTML = Array(16).fill('<div class="card-skel"></div>').join('');
  },
  render(items, reset) {
    const grid = document.getElementById('media-grid');
    if(!grid) return;
    if(reset) grid.innerHTML='';
    if(!items.length && reset) {
      grid.innerHTML=`<div class="empty-state"><div class="empty-icon-wrap"><i class="fas fa-ghost"></i></div><div class="empty-title">No Results Found</div><div class="empty-subtitle">Try different filters or search terms.</div></div>`;
      return;
    }
    const frag = document.createDocumentFragment();
    items.forEach((item)=>{
      if(!item.poster_path) return;
      const type = item.media_type||State.type;
      const title = item.title||item.name||'';
      const year  = Utils.year(item.release_date||item.first_air_date);
      const rating= (item.vote_average||0).toFixed(1);
      const inWL  = State.watchlist.some(w=>w.id===item.id);
      const card = document.createElement('div');
      card.className=`media-card${State.view==='list'?' list-card':''}`;
      card.innerHTML=`
        <div class="card-img-wrap">
          <img class="card-img" src="${Utils.img(item.poster_path)}" alt="${title.replace(/"/g,'')}" loading="lazy"/>
          <div class="card-badge"><i class="fas fa-star"></i> ${rating}</div>
          <div class="card-type-badge">${type==='movie'?'Movie':'TV'}</div>
          <div class="card-overlay">
            <div class="card-play-wrap">
              <div class="card-play-btn"><i class="fas fa-play"></i></div>
              <button class="card-wl-btn${inWL?' in-list':''}" onclick="event.stopPropagation();Watchlist.toggleById(${item.id},'${type}','${title.replace(/'/g,"\\'")}','${item.poster_path||''}',${rating},'${year}')">
                <i class="fas ${inWL?'fa-check':'fa-plus'}"></i>
              </button>
            </div>
            <div class="card-ov-title">${title}</div>
            <div class="card-ov-meta">${year}</div>
          </div>
        </div>
        <div class="card-info">
          <div class="card-title">${title}</div>
          <div class="card-meta">
            <span class="card-year">${year}</span>
            <span class="card-rating"><i class="fas fa-star"></i> ${rating}</span>
          </div>
        </div>`;
      card.onclick = ()=>Modals.openFull(item.id, type);
      frag.appendChild(card);
    });
    grid.appendChild(frag);
  }
};

/* ── WATCHLIST ───────────────────────────────────────────────────────────── */
const Watchlist = {
  toggleById(id, type, title, poster, rating, year) {
    const idx = State.watchlist.findIndex(w=>w.id===id);
    if(idx>-1) {
      State.watchlist.splice(idx,1);
      Utils.toast(`Removed from My List`,'info');
    } else {
      State.watchlist.push({id,type,title,poster,rating,year});
      Utils.toast(`Added to My List`,'success');
    }
    localStorage.setItem('pf_watchlist', JSON.stringify(State.watchlist));
    Watchlist._updateButtons(id);
  },
  _updateButtons(id) {
    const inList = State.watchlist.some(w=>w.id===id);
    const icon = inList ? 'fa-check' : 'fa-plus';
    document.querySelectorAll(`[id*="wl-${id}"]`).forEach(btn=>{
      btn.classList.toggle('in-list', inList);
      const i = btn.querySelector('i');
      if(i) i.className=`fas ${icon}`;
    });
    const fvBtn = document.getElementById('fv-wl-btn');
    if(fvBtn && State.activeId==id) {
      fvBtn.classList.toggle('in-list', inList);
      const i = fvBtn.querySelector('i');
      if(i) i.className=`fas ${icon}`;
      fvBtn.innerHTML = `<i class="fas ${icon}"></i> ${inList?'In List':'My List'}`;
    }
  }
};

/* ── CONTINUE WATCHING ────────────────────────────────────────────────────── */
const ContinueWatch = {
  render() {
    const row = document.getElementById('continue-row');
    const sec = document.getElementById('continue-section');
    if(!row||!sec) return;
    if(!State.continueWatch.length) { sec.style.display='none'; return; }
    sec.style.display='block';
    row.innerHTML = State.continueWatch.map(item=>`
      <div class="continue-card row-card" onclick="Modals.openFull(${item.id},'${item.type}')">
        <div class="continue-thumb">
          <img src="${Utils.img(item.poster)}" alt="${(item.title||'').replace(/"/g,'')}"/>
          <div class="continue-progress"><div class="continue-bar" style="width:${item.progress||30}%"></div></div>
          <div class="continue-play"><i class="fas fa-play"></i></div>
        </div>
        <div class="continue-title">${item.title||''}</div>
        <div class="continue-meta">${item.type==='tv'?`S${item.season||1}:E${item.episode||1}`:'Movie'}</div>
      </div>`).join('');
  },
  add(id, type, title, poster, season, episode) {
    State.continueWatch = State.continueWatch.filter(i=>i.id!==id);
    State.continueWatch.unshift({id,type,title,poster,season,episode,progress:30,ts:Date.now()});
    State.continueWatch = State.continueWatch.slice(0,12);
    localStorage.setItem('pf_continue', JSON.stringify(State.continueWatch));
  },
  clearAll() {
    State.continueWatch=[];
    localStorage.removeItem('pf_continue');
    document.getElementById('continue-section').style.display='none';
  }
};

/* ── MODALS ─────────────────────────────────────────────────────────────── */
const Modals = {
  close() {
    document.getElementById('qv-box').style.display='none';
    document.getElementById('fv-box').style.display='none';
    document.getElementById('modal-veil').classList.remove('open');
    document.body.style.overflow='';
    const player = document.getElementById('main-player');
    if(player) player.src='about:blank';
  },
  async openQuick(id, type) {
    Utils.progress(true);
    const data = await API.fetch(`${type}/${id}`, {append:'credits,videos'});
    if(!data) { Utils.progress(false); Utils.toast('Failed to load','error'); return; }
    State.activeId=id; State.activeType=type; State.activeData=data;
    const title = data.title||data.name||'';
    const inWL = State.watchlist.some(w=>w.id===id);
    // Populate quick view
    const bd = document.getElementById('qv-backdrop');
    if(bd){ bd.src=Utils.img(data.backdrop_path,'ORIG'); bd.alt=title; }
    document.getElementById('qv-title').textContent=title;
    const rating=(data.vote_average||0).toFixed(1);
    document.getElementById('qv-meta').innerHTML=`
      <span><i class="fas fa-star" style="color:#FFD700"></i> ${rating}</span>
      <span class="hero-dot-divider"></span>
      <span>${Utils.year(data.release_date||data.first_air_date)}</span>
      ${data.runtime?`<span class="hero-dot-divider"></span><span>${Utils.runtime(data.runtime)}</span>`:''}`;
    const desc = document.getElementById('qv-desc');
    if(desc) desc.textContent=data.overview||'';
    const genres = document.getElementById('qv-genres');
    if(genres) genres.innerHTML=(data.genres||[]).map(g=>`<span class="qv-tag">${g.name}</span>`).join('');
    const qvPlay = document.getElementById('qv-play-btn');
    const qvInfo = document.getElementById('qv-info-btn');
    const qvWl   = document.getElementById('qv-wl-btn');
    if(qvPlay) qvPlay.onclick = ()=>Modals.openFull(id, type);
    if(qvInfo) qvInfo.onclick = ()=>Modals.openFull(id, type);
    if(qvWl) {
      qvWl.className=`btn-hero-watchlist${inWL?' in-list':''}`;
      qvWl.innerHTML=`<i class="fas ${inWL?'fa-check':'fa-plus'}"></i>`;
      qvWl.onclick=()=>{ Watchlist.toggleById(id,type,title,data.poster_path,rating,Utils.year(data.release_date||data.first_air_date)); };
    }
    document.getElementById('qv-box').style.display='block';
    document.getElementById('fv-box').style.display='none';
    document.getElementById('modal-veil').classList.add('open');
    document.body.style.overflow='hidden';
    Utils.progress(false);
  },
  async openFull(id, type) {
    Utils.progress(true);
    Modals.close();
    const data = await API.fetch(`${type}/${id}`, {append:'credits,videos,similar'});
    if(!data) { Utils.progress(false); Utils.toast('Failed to load','error'); return; }
    State.activeId=id; State.activeType=type; State.activeData=data;
    const title = data.title||data.name||'';
    const rating=(data.vote_average||0).toFixed(1);
    const year = Utils.year(data.release_date||data.first_air_date);
    const inWL = State.watchlist.some(w=>w.id===id);
    // Backdrop
    const bd=document.getElementById('fv-backdrop'); if(bd){ bd.src=Utils.img(data.backdrop_path,'ORIG'); bd.alt=title; }
    // Poster
    const po=document.getElementById('fv-poster'); if(po){ po.src=Utils.img(data.poster_path); po.alt=title; }
    // Title
    document.getElementById('fv-title').textContent=title;
    // Meta
    const meta=document.getElementById('fv-meta-row');
    if(meta) meta.innerHTML=`
      <span class="fv-meta-chip rated"><i class="fas fa-star"></i> ${rating}</span>
      <span class="fv-meta-chip">${year}</span>
      ${data.runtime?`<span class="fv-meta-chip">${Utils.runtime(data.runtime)}</span>`:''}
      ${(data.genres||[]).map(g=>`<span class="fv-meta-chip">${g.name}</span>`).join('')}`;
    // Tagline
    const tl=document.getElementById('fv-tagline'); if(tl) tl.textContent=data.tagline||'';
    // Overview
    const desc=document.getElementById('fv-desc'); if(desc) desc.textContent=data.overview||'';
    // WL button
    const wlBtn=document.getElementById('fv-wl-btn');
    if(wlBtn) {
      wlBtn.className=`fv-wl-btn${inWL?' in-list':''}`;
      wlBtn.innerHTML=`<i class="fas ${inWL?'fa-check':'fa-plus'}"></i> ${inWL?'In List':'My List'}`;
      wlBtn.onclick=()=>{ Watchlist.toggleById(id,type,title,data.poster_path,rating,year); };
    }
    // Cast
    const cast=document.getElementById('fv-cast');
    if(cast) {
      const credits = data.credits||data.aggregate_credits;
      cast.innerHTML = (credits?.cast||[]).slice(0,15).map(p=>`
        <div class="person-card">
          <img class="person-img" src="${p.profile_path?Utils.img(p.profile_path):'/assets/img/no-avatar.svg'}" alt="${p.name}" loading="lazy"/>
          <div class="person-name">${p.name}</div>
          <div class="person-role">${p.character||p.roles?.[0]?.character||''}</div>
        </div>`).join('');
    }
    // Similar
    const similar=document.getElementById('fv-related');
    if(similar) {
      similar.innerHTML = ((data.similar||data.recommendations)?.results||[]).filter(i=>i.poster_path).slice(0,10).map(i=>`
        <div class="row-card" onclick="Modals.openFull(${i.id},'${i.media_type||type}')">
          <div class="row-card-img-wrap">
            <img src="${Utils.img(i.poster_path)}" alt="${(i.title||i.name||'').replace(/"/g,'')}" loading="lazy"/>
            <div class="row-card-overlay">
              <div class="row-card-play"><i class="fas fa-play"></i></div>
              <div class="row-card-title">${i.title||i.name||''}</div>
            </div>
          </div>
        </div>`).join('');
    }
    // Player
    await Player.init(id, type);
    // Add to continue watching
    ContinueWatch.add(id, type, title, data.poster_path, 1, 1);
    // Reset tabs
    FVTabs.show('overview', document.querySelector('.fv-tab'));
    document.getElementById('qv-box').style.display='none';
    document.getElementById('fv-box').style.display='block';
    document.getElementById('modal-veil').classList.add('open');
    document.body.style.overflow='hidden';
    Utils.progress(false);
  }
};

/* ── FULL VIEW TABS ──────────────────────────────────────────────────────── */
const FVTabs = {
  show(tab, el) {
    document.querySelectorAll('.fv-tab').forEach(t=>t.classList.remove('active'));
    document.querySelectorAll('.fv-tab-pane').forEach(p=>p.classList.remove('active'));
    if(el) el.classList.add('active');
    const pane = document.getElementById(`tab-${tab}`);
    if(pane) pane.classList.add('active');
  }
};

/* ── PLAYER ──────────────────────────────────────────────────────────────── */
const Player = {
  async init(id, type) {
    // Fetch server list from PHP (keeps server config server-side)
    const data = await fetch(`${CFG.PLAYER}?id=${id}&type=${type}&server=0`).then(r=>r.json()).catch(()=>null);
    if(!data) return;
    State.serverList = data.servers||[];
    State.activeServer = 0;
    // Render server tabs
    const tabs = document.getElementById('server-tabs');
    if(tabs) {
      tabs.innerHTML = (data.servers||[]).map((s,i)=>`
        <button class="server-tab${i===0?' active':''}" onclick="Player.changeServer(${i},'${id}','${type}')">
          <i class="fas ${s.icon}"></i> ${s.name}
        </button>`).join('');
    }
    // Episode controls for TV
    const epRow = document.getElementById('ep-row');
    if(epRow) {
      if(type==='tv') {
        epRow.style.display='flex';
        document.getElementById('btn-ep-go').onclick=()=>Player.loadVideo(id, type);
      } else {
        epRow.style.display='none';
      }
    }
    // Load video
    const player = document.getElementById('main-player');
    const loader = document.getElementById('player-loader');
    if(player){ player.src='about:blank'; }
    if(loader) loader.style.display='flex';
    player.onload = ()=>{ if(loader) loader.style.display='none'; };
    if(player) player.src = data.url;
  },
  async changeServer(idx, id, type) {
    State.activeServer=idx;
    document.querySelectorAll('.server-tab').forEach((b,i)=>b.classList.toggle('active',i===idx));
    await Player.loadVideo(id, type, idx);
  },
  async loadVideo(id, type, serverIdx) {
    id = id || State.activeId;
    type = type || State.activeType;
    const s = serverIdx ?? State.activeServer;
    const season  = document.getElementById('ep-season')?.value||1;
    const episode = document.getElementById('ep-episode')?.value||1;
    const loader = document.getElementById('player-loader');
    if(loader) loader.style.display='flex';
    const data = await fetch(`${CFG.PLAYER}?id=${id}&type=${type}&server=${s}&s=${season}&e=${episode}`).then(r=>r.json()).catch(()=>null);
    if(!data?.url) { Utils.toast('Stream unavailable, try another server','error'); return; }
    const player = document.getElementById('main-player');
    if(player) {
      player.src='about:blank';
      setTimeout(()=>{ player.src=data.url; }, 100);
    }
    if(type==='tv') ContinueWatch.add(id, type, State.activeData?.name||'', State.activeData?.poster_path||'', season, episode);
  },
  async playTrailer() {
    if(!State.activeData) return;
    const videos = State.activeData.videos?.results||[];
    const tr = videos.find(v=>v.type==='Trailer'&&v.site==='YouTube');
    if(tr) {
      const player = document.getElementById('main-player');
      if(player) player.src=`https://www.youtube.com/embed/${tr.key}?autoplay=1`;
    } else Utils.toast('Trailer not available','error');
  }
};

/* ── INFINITE SCROLL ─────────────────────────────────────────────────────── */
const InfiniteScroll = {
  init() {
    const sentinel = document.createElement('div');
    sentinel.id='scroll-sentinel';
    document.getElementById('load-more-area')?.after(sentinel);
    new IntersectionObserver(entries=>{
      if(entries[0].isIntersecting && State.isBrowseView && !State.isLoading) App.loadMore();
    }, {rootMargin:'300px'}).observe(sentinel);
  }
};

/* ── STATS ───────────────────────────────────────────────────────────────── */
const Stats = {
  async update() {
    const [m,t] = await Promise.all([
      API.fetch('discover/movie', {page:1}),
      API.fetch('discover/tv',    {page:1})
    ]);
    const fmt = n => n>9999 ? `${(n/1000).toFixed(0)}K+` : n;
    if(m) { const el=document.getElementById('stat-movies'); if(el) el.textContent=fmt(m.total_results); }
    if(t) { const el=document.getElementById('stat-shows');  if(el) el.textContent=fmt(t.total_results); }
  }
};

/* ── MOBILE BOTTOM NAV ───────────────────────────────────────────────────── */
const MobNav = {
  go(tab, el) {
    document.querySelectorAll('.bnav-btn').forEach(b=>b.classList.remove('active'));
    el.classList.add('active');
    if(tab==='home')   App.goHome();
    else if(tab==='movies') { State.type='movie'; App.showBrowse('Movies','fa-film'); App.loadContent(true); Hero.init(); }
    else if(tab==='tv')     { State.type='tv';    App.showBrowse('TV Shows','fa-tv'); App.loadContent(true); Hero.init(); }
    else if(tab==='mylist') App.showWatchlist();
    else if(tab==='search') {
      const sw=document.getElementById('main-search-wrap');
      sw?.classList.add('mobile-open');
      setTimeout(()=>document.getElementById('search-input')?.focus(), 100);
    }
  }
};

/* ── APP CORE ────────────────────────────────────────────────────────────── */
const App = {
  async init() {
    OTTTabs.render();
    NavScroll.init();
    Search.init();
    FilterPanel.initGenres();
    InfiniteScroll.init();
    ContinueWatch.render();
    await Hero.init();
    await HomeRows.init();
    // Close modal on veil click
    document.getElementById('modal-veil')?.addEventListener('click', Modals.close);
    // Keyboard ESC
    document.addEventListener('keydown', e=>{ if(e.key==='Escape') Modals.close(); });
  },
  goHome() {
    State.isHomeView=true; State.isBrowseView=false; State.isWatchlistView=false;
    State.query=''; State._customEndpoint=null;
    const inp=document.getElementById('search-input'); if(inp) inp.value='';
    document.getElementById('home-rows').style.display='block';
    document.getElementById('browse-view').style.display='none';
    document.getElementById('hero-wrap').style.display='block';
    document.querySelector('.ott-section').style.display='block';
    document.getElementById('stats-bar').style.display='flex';
    const cont=document.getElementById('continue-section');
    if(State.continueWatch.length&&cont) cont.style.display='block';
    document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
    document.querySelector('[data-nav="movie"]')?.classList.add('active');
    State.type='movie';
    document.getElementById('bnav-home')?.parentElement.querySelectorAll('.bnav-btn').forEach(b=>b.classList.remove('active'));
    document.getElementById('bnav-home')?.classList.add('active');
  },
  showBrowse(heading, icon='fa-fire') {
    State.isHomeView=false; State.isBrowseView=true;
    document.getElementById('home-rows').style.display='none';
    document.getElementById('browse-view').style.display='block';
    document.getElementById('hero-wrap').style.display='none';
    document.getElementById('stats-bar').style.display='none';
    document.getElementById('continue-section').style.display='none';
    document.getElementById('view-heading').innerHTML=`<i class="fas ${icon}"></i> ${heading}`;
    window.scrollTo({top:0, behavior:'smooth'});
    document.getElementById('mood-bar').style.display='flex';
    document.getElementById('load-more-area').style.display='block';
  },
  setType(t) {
    State.type=t; State.isSearch=false; State._customEndpoint=null;
    State.filters={genres:[],year:null,rating:null}; State.lang=''; State.provider='';
    document.querySelectorAll('.nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.nav===t));
    this.showBrowse(`Trending ${t==='movie'?'Movies':'Shows'}`, t==='movie'?'fa-film':'fa-tv');
    Hero.init(); this.loadContent(true);
  },
  setLang(l, e) {
    State.lang=l; State._customEndpoint=null;
    document.querySelectorAll('.lang-btn').forEach(b=>b.classList.remove('active'));
    e.target.classList.add('active');
    this.loadContent(true);
  },
  setView(v) {
    State.view=v;
    document.getElementById('btn-grid-view')?.classList.toggle('active',v==='grid');
    document.getElementById('btn-list-view')?.classList.toggle('active',v==='list');
    document.getElementById('media-grid').className=`media-grid${v==='list'?' list-view':''}`;
  },
  async loadContent(reset=false) {
    if(State.isLoading) return;
    State.isLoading=true;
    if(reset) { State.page=1; GridUI.showSkeletons(); }
    Utils.progress(true);
    let params;
    if(State.isSearch) {
      params = { endpoint:'search/multi', query:State.query, page:State.page };
    } else if(State._customEndpoint) {
      params = { endpoint:State._customEndpoint.endpoint, page:State.page, ...State._customEndpoint.params };
    } else {
      params = App._buildDiscoverParams();
    }
    const data = await API.fetch(params.endpoint, Object.fromEntries(Object.entries(params).filter(([k])=>k!=='endpoint')));
    if(data) {
      let items = data.results||[];
      if(State.isSearch) items = items.filter(i=>i.media_type==='movie'||i.media_type==='tv');
      GridUI.render(items, reset);
      const lma=document.getElementById('load-more-area');
      if(lma) lma.style.display=(data.page>=data.total_pages||!items.length)?'none':'block';
    }
    Utils.progress(false);
    State.isLoading=false;
  },
  _buildDiscoverParams() {
    const p = { endpoint:`discover/${State.type}`, page:State.page, type:State.type };
    if(State.lang)                   p.lang=State.lang;
    if(State.provider)               { p.provider=State.provider; p.region=State.region; }
    if(State.filters.genres.length)  p.genres=State.filters.genres.join(',');
    if(State.filters.year)           p.year=State.filters.year;
    if(State.filters.rating)         p.rating=State.filters.rating;
    return p;
  },
  loadMore() { State.page++; this.loadContent(false); },
  showWatchlist() {
    State.isWatchlistView=true; State._customEndpoint=null;
    document.querySelectorAll('.nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.nav==='watchlist'));
    this.showBrowse('My List','fa-heart');
    document.getElementById('mood-bar').style.display='none';
    document.getElementById('load-more-area').style.display='none';
    const grid=document.getElementById('media-grid');
    if(!State.watchlist.length) {
      grid.innerHTML=`<div class="empty-state"><div class="empty-icon-wrap"><i class="fas fa-heart-broken"></i></div><div class="empty-title">Your List is Empty</div><div class="empty-subtitle">Add movies &amp; shows you want to watch.</div></div>`;
    } else GridUI.render(State.watchlist, true);
  }
};

/* ── BOOT ────────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', ()=>App.init());
