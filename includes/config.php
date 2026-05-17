<?php
/**
 * V4 Configuration
 * API key is stored SERVER-SIDE ONLY — never exposed to browser/network.
 */

define('TMDB_API_KEY', '05902896074695709d7763505bb88b4d');
define('TMDB_BASE',    'https://api.themoviedb.org/3');
define('TMDB_W500',    'https://image.tmdb.org/t/p/w500');
define('TMDB_ORIG',    'https://image.tmdb.org/t/p/original');
define('SITE_NAME',    'V4');
define('SITE_TAGLINE', 'Stream Movies & TV Shows Free');
define('SITE_URL',     '');  // Leave blank for relative URLs

// Allowed TMDB endpoints for the proxy whitelist
define('ALLOWED_ENDPOINTS', [
    'trending/movie/day', 'trending/tv/day', 'trending/all/day',
    'movie/popular', 'movie/top_rated', 'movie/now_playing', 'movie/upcoming',
    'tv/popular', 'tv/top_rated', 'tv/on_the_air', 'tv/airing_today',
    'discover/movie', 'discover/tv',
    'search/movie', 'search/tv', 'search/multi',
    'genre/movie/list', 'genre/tv/list',
]);

// Rate limiting (requests per minute per IP)
define('RATE_LIMIT', 60);

// Video streaming servers (server-side rendered for security)
define('VIDEO_SERVERS', [
    ['name' => 'VidSrc',    'icon' => 'fa-server',
     'movie' => 'https://vidsrc.xyz/embed/movie/{id}',
     'tv'    => 'https://vidsrc.xyz/embed/tv/{id}/{s}/{e}'],
    ['name' => 'VidAPI',    'icon' => 'fa-bolt',
     'movie' => 'https://vidapi.xyz/embed/movie/{id}',
     'tv'    => 'https://vidapi.xyz/embed/tv/{id}&s={s}&e={e}'],
    ['name' => '2Embed',    'icon' => 'fa-play-circle',
     'movie' => 'https://www.2embed.cc/embed/{id}',
     'tv'    => 'https://www.2embed.cc/embedtv/{id}&s={s}&e={e}'],
    ['name' => 'EmbedSu',   'icon' => 'fa-film',
     'movie' => 'https://embed.su/embed/movie/{id}',
     'tv'    => 'https://embed.su/embed/tv/{id}/{s}/{e}'],
]);
