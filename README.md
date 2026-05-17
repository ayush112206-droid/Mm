# 🎬 V4 – Premium Movie Streaming Website

A full-featured, Netflix-style movie streaming website built with PHP + vanilla JS.
Uses TMDB API proxied server-side so **your API key is never exposed in the browser**.

---

## 🚀 Features

- ✅ Netflix-style UI with hero slider, horizontal rows, grid view
- ✅ **Secure API Proxy** – TMDB API key stays server-side only
- ✅ 4 video streaming servers (VidSrc, VidAPI, 2Embed, EmbedSu)
- ✅ Search with live suggestions + voice search
- ✅ Advanced filters: genre, year, rating
- ✅ OTT platform tabs (Netflix, Prime, Disney+, ZEE5, etc.)
- ✅ My List / Watchlist (localStorage)
- ✅ Continue Watching
- ✅ Mood/Vibe quick filters
- ✅ Language tabs (All, English, Hindi, Bengali, Korean)
- ✅ Rate limiting on proxy (60 req/min per IP)
- ✅ Full mobile-responsive with Android-app-like bottom nav
- ✅ No ads, no subscription prompts
- ✅ Loading skeleton animations
- ✅ Ad-blocker built-in for streaming iframes

---

## 📁 File Structure

```
playflix/
├── index.php              ← Main homepage
├── .htaccess              ← Apache security rules
├── render.yaml            ← Render.com deploy config
├── includes/
│   ├── config.php         ← 🔒 API key lives here (server-side only)
│   ├── header.php         ← Shared HTML head + navbar
│   └── footer.php         ← Shared footer + modals + JS include
├── api/
│   ├── proxy.php          ← Secure TMDB API proxy
│   └── player.php         ← Secure video URL builder
└── assets/
    ├── css/style.css      ← Full premium stylesheet
    ├── js/app.js          ← Main application JS
    └── img/
        ├── no-poster.svg
        └── no-avatar.svg
```

---

## ⚙️ Setup

### Option A — Shared Hosting (cPanel / Apache)
1. Upload entire `playflix/` folder contents to `public_html/`
2. Make sure `mod_rewrite` is enabled (most hosts have it)
3. Visit your domain — done!

### Option B — Render.com (Free)
1. Push to a GitHub repo
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your repo
4. Set **Environment** = `PHP`, **Build** = leave blank
5. **Start Command**: `php -S 0.0.0.0:$PORT`
6. Deploy — Render gives you a free `.onrender.com` URL

### Option C — Local (PHP built-in server)
```bash
cd playflix
php -S localhost:8080
# Open http://localhost:8080
```

---

## 🔑 API Key

Your TMDB API key is in `includes/config.php`:
```php
define('TMDB_API_KEY', 'your_key_here');
```

To get your own key: https://www.themoviedb.org/settings/api

The key is **never sent to the browser** — all TMDB requests go through `/api/proxy.php`.

---

## 🔒 Security

| Feature | Details |
|---|---|
| API Key Protection | Stored in PHP config only, never in JS or network responses |
| Rate Limiting | 60 requests/minute per IP on the proxy |
| Endpoint Whitelist | Only TMDB endpoints we define are accessible |
| Input Sanitization | All proxy inputs sanitized/whitelisted |
| Security Headers | X-Frame-Options, X-XSS-Protection, etc. via .htaccess |
| Directory Listing | Disabled via `Options -Indexes` |
| Includes Protection | Direct access to `/includes/` blocked |

---

## 📱 Mobile

The site behaves like a native Android app:
- Fixed bottom navigation bar
- Swipeable hero slider
- Touch-optimized card interactions
- Smooth animations matching mobile app feel
- Voice search support

---

## 🎨 Customization

| What | Where |
|---|---|
| Site name | `includes/config.php` → `SITE_NAME` |
| Accent color | `assets/css/style.css` → `--brand` |
| Add video server | `includes/config.php` → `VIDEO_SERVERS` |
| Add OTT platform | `assets/js/app.js` → `CFG.PLATFORMS` |
