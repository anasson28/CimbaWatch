<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class ProxyController extends Controller
{
    public function embed($type, $id, Request $request)
    {
        $season = $request->query('s');
        $episode = $request->query('e');

        try {
            // Choose provider (supported): embed.su, 2embed.cc, vidapi.xyz, or 'auto'
            $providerRaw = $request->query('provider', 'auto');
            $provider = (string) Str::of($providerRaw)->lower()->replace(['.', '-'], '_');
            switch ($provider) {
                case 'embed_su':
                    $base = 'https://embed.su';
                    break;
                case '2embed':
                    $base = 'https://www.2embed.cc';
                    break;
                case 'vidapi':
                    $base = 'https://vidapi.xyz';
                    break;
                case 'auto':
                    $base = '';
                    break;
                default:
                    return response('Invalid provider', 400);
            }

            // Build candidate URLs depending on provider/type
            $candidates = [];
            if ($type === 'movie') {
                $candidates = [
                    'embed_su' => 'https://embed.su/embed/movie/' . $id,
                    '2embed'   => 'https://www.2embed.cc/embed/' . $id,
                    // For vidapi prefer multi first, fallback to single
                    'vidapi_m' => 'https://vidapi.xyz/embedmulti/movie/' . $id,
                    'vidapi'   => 'https://vidapi.xyz/embed/movie/' . $id,
                ];
            } elseif ($type === 'tv') {
                $s = (int) ($season ?? 1);
                $e = (int) ($episode ?? 1);
                $candidates = [
                    'embed_su' => "https://embed.su/embed/tv/{$id}/{$s}/{$e}",
                    '2embed'   => "https://www.2embed.cc/embedtv/{$id}?s={$s}&e={$e}",
                    'vidapi'   => "https://vidapi.xyz/embed/tv/{$id}?s={$s}&e={$e}",
                ];
            } elseif ($type === 'anime') {
                $slug = trim((string) $request->query('slug', (string) $id));
                $e = (int) ($request->query('e') ?? $request->query('ep') ?? 1);
                if ($slug === '') {
                    return response('Missing anime slug', 400);
                }
                $slugEnc = rawurlencode($slug);
                $candidates = [
                    // Only these two are supported for anime
                    'vidapi'   => "https://vidapi.xyz/embed/anime/{$slugEnc}-{$e}",
                    '2embed'   => "https://www.2embed.cc/embedanime/{$slugEnc}-episode-{$e}",
                ];
            } else {
                return response('Invalid type', 400);
            }

            // If a specific provider is requested (not auto), filter candidates accordingly
            if ($provider !== 'auto') {
                $candidates = array_filter($candidates, function ($k) use ($provider) {
                    if ($provider === 'vidapi') return str_starts_with($k, 'vidapi');
                    return $k === $provider;
                }, ARRAY_FILTER_USE_KEY);
            }

            // Try candidates by order until one is alive
            $refererHints = [
                'embed_su' => 'https://embed.su/',
                '2embed'   => 'https://www.2embed.cc/',
                'vidapi'   => 'https://vidapi.xyz/',
                'vidapi_m' => 'https://vidapi.xyz/',
            ];
            $chosen = null;
            foreach ($candidates as $key => $u) {
                $ref = $refererHints[$key] ?? null;
                if ($this->urlAlive($u, $ref)) { $chosen = $u; break; }
            }
            if (!$chosen) {
                // if none confirmed alive, pick the first candidate
                $chosen = reset($candidates);
            }
            $url = $chosen;

            // Use the upstream embed URL directly to satisfy providers' domain/referrer checks.
            $src = $url;
            $wrapper = <<<HTML
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Player</title>
    <style>
      html, body, .frame { margin:0; padding:0; height:100%; width:100%; background:#000; }
      .frame { border:0; display:block; }
    </style>
  </head>
  <body>
    <iframe
      class="frame"
      src="{$src}"
      allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
      allowfullscreen
    ></iframe>
  </body>
  </html>
HTML;

            return response($wrapper, 200)
                ->header('Content-Type', 'text/html; charset=UTF-8')
                ->header('X-Content-Type-Options', 'nosniff');
        } catch (\Exception $e) {
            return response("Proxy error: " . $e->getMessage(), 500);
        }
    }

    /**
     * Generic fetch proxy with ad filtering and response cleaning.
     * GET /proxy/fetch?url=ENCODED_URL
     */
    public function fetch(Request $request)
    {
        $raw = $request->query('url');
        $url = $raw !== null ? urldecode($raw) : null;
        $refOverride = $request->query('ref');
        if (!$url) {
            return response('Missing url', 400);
        }

        // Basic scheme validation to avoid local file access, etc.
        $parts = parse_url($url);
        if (!$parts || !isset($parts['scheme']) || !in_array(strtolower($parts['scheme']), ['http', 'https'])) {
            return response('Invalid url', 400);
        }

        // Block ad requests early by URL pattern
        $adPatterns = [
            '/doubleclick/i',
            '/googlesyndication/i',
            '/adservice/i',
            '/adsystem/i',
            '/banner/i',
            '/(^|\.)ads\./i',
            '/(^|\/)ads(\/|$)/i',
        ];
        foreach ($adPatterns as $pattern) {
            if (preg_match($pattern, $url)) {
                return response('', 204);
            }
        }

        try {
            // Select an appropriate Referer based on the target host (supported providers)
            $refererMap = [
                'embed.su'       => 'https://embed.su/',
                '2embed.cc'      => 'https://www.2embed.cc/',
                'www.2embed.cc'  => 'https://www.2embed.cc/',
                'vidapi.xyz'     => 'https://vidapi.xyz/',
                'www.vidapi.xyz' => 'https://vidapi.xyz/',
                '2anime.xyz'     => 'https://2anime.xyz/',
            ];
            $parsed = parse_url($url);
            $host = $parsed['host'] ?? '';
            $referer = null;
            foreach ($refererMap as $domain => $ref) {
                if ($host && str_contains($host, $domain)) {
                    $referer = $ref;
                    break;
                }
            }
            if ($refOverride) {
                $referer = $refOverride;
            }
            if (!$referer) {
                $referer = $host ? ('https://' . $host . '/') : 'https://embed.su/';
            }

            // Spoof headers (dynamic Referer + Origin + pass through User-Agent)
            $headers = [
                'User-Agent' => $request->header('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'),
                'Accept' => 'text/html,application/json,application/vnd.apple.mpegurl;q=0.9,*/*;q=0.8',
                'Referer' => $referer,
                'Origin' => rtrim($this->getOrigin($referer), '/'),
                'Accept-Encoding' => 'identity', // avoid compression so we can transform HTML easily
            ];

            // Forward Range header for video seeking when present (mp4, etc.)
            if ($request->hasHeader('Range')) {
                $headers['Range'] = $request->header('Range');
            }

            // Attach cookies from previous requests for this host (providers often require them)
            $sessionId = method_exists($request, 'session') && $request->hasSession() ? $request->session()->getId() : ($request->ip() ?? 'anon');
            $cookieHeader = $this->buildCookieHeader($sessionId, $host);
            if ($cookieHeader) {
                $headers['Cookie'] = $cookieHeader;
            }

            $resp = Http::withHeaders($headers)
                ->timeout(15)
                ->get($url);

            // Persist any Set-Cookie headers back to our cookie jar
            $this->storeCookiesFromResponse($sessionId, $host, $resp->headers());

            $status = $resp->status();
            $contentType = $resp->header('Content-Type', '');
            $body = $resp->body();

            // Normalize/guess content type when upstream is vague
            $normalizedCT = strtolower(trim(explode(';', $contentType)[0]));
            $bodyTrim = ltrim($body);
            if ($normalizedCT === '' || $normalizedCT === 'text/plain') {
                if (stripos($url, '.m3u8') !== false || strpos($bodyTrim, '#EXTM3U') === 0) {
                    $normalizedCT = 'application/vnd.apple.mpegurl';
                } elseif (stripos($url, '.mp4') !== false) {
                    $normalizedCT = 'video/mp4';
                } elseif (stripos($url, '.json') !== false || $this->looksLikeJson($body)) {
                    $normalizedCT = 'application/json';
                } elseif (stripos($body, '<html') !== false) {
                    $normalizedCT = 'text/html';
                }
            }

            // Clean and return based on content type
            if (stripos($normalizedCT, 'text/html') !== false) {
                $clean = $this->cleanHtml($body, $url, $referer);
                return response($clean, $status)
                    ->header('Content-Type', 'text/html; charset=UTF-8')
                    ->header('X-Content-Type-Options', 'nosniff')
                    ->header('X-Proxy-Upstream-URL', $url);
            }

            // HLS playlist rewriting so nested URIs load through our proxy
            if (stripos($normalizedCT, 'application/vnd.apple.mpegurl') !== false || strpos($bodyTrim, '#EXTM3U') === 0) {
                $rewritten = $this->rewriteM3U8($body, $url, $referer);
                return response($rewritten, 200)
                    ->header('Content-Type', 'application/vnd.apple.mpegurl')
                    ->header('Cache-Control', 'no-cache')
                    ->header('X-Content-Type-Options', 'nosniff')
                    ->header('X-Proxy-Upstream-URL', $url);
            }

            if (stripos($normalizedCT, 'application/json') !== false || $this->looksLikeJson($body)) {
                $json = json_decode($body, true);
                if (json_last_error() === JSON_ERROR_NONE && is_array($json)) {
                    // Optional: filter typical ad-like entries from JSON payloads, e.g., server lists
                    if (isset($json['servers']) && is_array($json['servers'])) {
                        $json['servers'] = array_values(array_filter($json['servers'], function ($server) {
                            if (is_array($server) && isset($server['name'])) {
                                return !preg_match('/ads/i', (string)$server['name']);
                            }
                            return true;
                        }));
                    }
                    return response()->json($json, $status)
                        ->header('X-Proxy-Upstream-URL', $url);
                }
            }

            // For other content types, just passthrough (still benefited from URL-level ad blocking)
            $respOut = response($body, $status)
                ->header('Content-Type', $normalizedCT ?: ($contentType ?: 'application/octet-stream'));
            // Relay range-related headers if present
            foreach (['Content-Range', 'Accept-Ranges', 'Content-Length', 'Content-Disposition', 'Cache-Control'] as $h) {
                $v = $resp->header($h);
                if ($v !== null) $respOut->header($h, $v);
            }
            $respOut->header('X-Proxy-Upstream-URL', $url);
            return $respOut;
        } catch (\Exception $e) {
            Log::warning('Proxy fetch error', ['url' => $url, 'err' => $e->getMessage()]);
            return response("Proxy fetch error: " . $e->getMessage(), 500);
        }
    }

    private function cleanHtml(string $html, string $upstreamUrl, ?string $referer = null): string
    {
        // Remove obvious ad iframes by domain or attributes
        $html = preg_replace('/<iframe[^>]*(doubleclick|googlesyndication|adservice|adsystem|banner|\\bads\\b)[^>]*>.*?<\\/iframe>/is', '', $html);
        $html = preg_replace('/<iframe[^>]*ads[^>]*><\\/iframe>/i', '', $html);

        // Remove common ad containers
        $html = preg_replace('/<div[^>]*(ad-container|ad-banner|ad-slot|advert|advertisement|sponsor)[^>]*>.*?<\\/div>/is', '', $html);

        // Remove external ad scripts
        $html = preg_replace('/<script[^>]+src=["\']([^"\']*(doubleclick|googlesyndication|adservice|adsystem|banner|\\bads\\b)[^"\']*)["\'][^>]*>\s*<\\/script>/is', '', $html);
        // Remove nuisance/anti-devtool script if present (avoid unnecessary errors/redirects)
        $html = preg_replace('/<script[^>]+src=["\'][^"\']*disable-devtool[^"\']*["\'][^>]*>\s*<\\/script>/is', '', $html);
        // Strip CSP meta tags that could block our inline helpers
        $html = preg_replace('/<meta[^>]+http-equiv=["\']Content-Security-Policy["\'][^>]*>\s*/i', '', $html);

        // Insert <base> for correct relative URL resolution
        $baseDir = rtrim($this->getBaseDir($upstreamUrl), '/') . '/';
        if (stripos($html, '<base ') === false) {
            $html = preg_replace('/<head[^>]*>/i', '$0<base href="' . htmlspecialchars($baseDir, ENT_QUOTES) . '">', $html, 1);
        }

        // Rewrite resource URLs to pass through this proxy so future requests can be filtered too
        $html = $this->rewriteResourceUrls($html, $upstreamUrl, $referer);

        // Inject a small helper to route runtime fetch/XHR/video src and dynamic element src/href through the proxy as well
        $proxyPath = '/proxy/fetch?url='; // relative path works since page is served from our origin
        $refQuery = $referer ? ('&ref=' . rawurlencode($referer)) : '';
        $injection = '<script>(function(){\n'
            . '  var PROXY=\'' . addslashes($proxyPath) . '\';\n'
            . '  var REF=\'' . addslashes($refQuery) . '\';\n'
            . '  function abs(u){try{return new URL(u, document.baseURI).href;}catch(e){return u;}}\n'
            . '  function isWrapped(u){return typeof u===\'string\' && (u.indexOf(PROXY)===0 || u.indexOf(window.location.origin+PROXY)===0);}\n'
            . '  function wrap(u){if(!u)return u; if(isWrapped(u))return u; var a=abs(u); return PROXY+encodeURIComponent(a)+REF;}\n'
            . '  if (window.fetch){var _f=window.fetch; window.fetch=function(input, init){try{if(typeof input===\'string\'){input=wrap(input);}else if(input&&input.url){input=new Request(wrap(input.url), input);}}catch(e){} return _f(input, init);};}\n'
            . '  var _o=XMLHttpRequest.prototype.open; XMLHttpRequest.prototype.open=function(m,u){try{if(u){arguments[1]=wrap(u);}}catch(e){} return _o.apply(this, arguments);};\n'
            . '  try{var vp=HTMLMediaElement.prototype; var d=Object.getOwnPropertyDescriptor(vp, \"src\"); if(d&&d.set){Object.defineProperty(vp, \"src\", {set:function(v){try{d.set.call(this, wrap(v));}catch(e){d.set.call(this,v);}}, get:function(){return d.get.call(this);}});}}catch(e){}\n'
            . '  try{var sp=HTMLScriptElement.prototype; var sd=Object.getOwnPropertyDescriptor(sp, \"src\"); if(sd&&sd.set){Object.defineProperty(sp, \"src\", {set:function(v){try{sd.set.call(this, wrap(v));}catch(e){sd.set.call(this,v);}}, get:function(){return sd.get.call(this);}});}}catch(e){}\n'
            . '  try{var ip=HTMLImageElement.prototype; var id=Object.getOwnPropertyDescriptor(ip, \"src\"); if(id&&id.set){Object.defineProperty(ip, \"src\", {set:function(v){try{id.set.call(this, wrap(v));}catch(e){id.set.call(this,v);}}, get:function(){return id.get.call(this);}});}}catch(e){}\n'
            . '  try{var ifp=HTMLIFrameElement.prototype; var ifd=Object.getOwnPropertyDescriptor(ifp, \"src\"); if(ifd&&ifd.set){Object.defineProperty(ifp, \"src\", {set:function(v){try{ifd.set.call(this, wrap(v));}catch(e){ifd.set.call(this,v);}}, get:function(){return ifd.get.call(this);}});}}catch(e){}\n'
            . '  try{var lp=HTMLLinkElement.prototype; var ld=Object.getOwnPropertyDescriptor(lp, \"href\"); if(ld&&ld.set){Object.defineProperty(lp, \"href\", {set:function(v){try{ld.set.call(this, wrap(v));}catch(e){ld.set.call(this,v);}}, get:function(){return ld.get.call(this);}});}}catch(e){}\n'
            . '  try{var _sa=Element.prototype.setAttribute; Element.prototype.setAttribute=function(n,v){try{if(typeof v===\'string\'){var k=String(n||\'\').toLowerCase(); if(k===\'src\'||k===\'href\'){v=wrap(v);}}}catch(e){} return _sa.call(this,n,v);};}catch(e){}\n'
            . '})();</script>';
        // Place injection immediately after <head> start if possible (ensures it runs before upstream scripts)
        if (preg_match('/<head[^>]*>/i', $html)) {
            $html = preg_replace('/<head[^>]*>/i', '$0' . $injection, $html, 1);
        } elseif (stripos($html, '</body>') !== false) {
            $html = str_ireplace('</body>', $injection . '</body>', $html);
        } else {
            $html .= $injection;
        }

        return $html;
    }

    private function urlAlive(string $url, ?string $referer = null): bool
    {
        try {
            $headers = [
                'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'Accept' => 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            ];
            if ($referer) {
                $headers['Referer'] = $referer;
            }
            $resp = Http::withHeaders($headers)->timeout(6)->get($url);
            $code = $resp->status();
            return $code >= 200 && $code < 400;
        } catch (\Exception $e) {
            return false;
        }
    }

    private function rewriteM3U8(string $playlist, string $upstreamUrl, ?string $referer = null): string
    {
        $lines = preg_split('/\r?\n/', $playlist);
        $selfProxy = url('/proxy/fetch');
        $refQuery = $referer ? ('&ref=' . urlencode($referer)) : '';
        $out = [];
        foreach ($lines as $line) {
            if ($line === '' || $line[0] === '#') {
                // Rewrite URI="..." attributes inside tags
                $line = preg_replace_callback('/URI=\"([^\"]+)\"/i', function ($m) use ($upstreamUrl, $selfProxy, $refQuery) {
                    $abs = $this->resolveUrl($m[1], $upstreamUrl);
                    return 'URI="' . $selfProxy . '?url=' . urlencode($abs) . $refQuery . '"';
                }, $line);
                $out[] = $line;
                continue;
            }
            // URL line (media segment or child playlist)
            $abs = $this->resolveUrl($line, $upstreamUrl);
            if ($this->isAdUrl($abs)) {
                // Drop ad segments/playlists
                continue;
            }
            $out[] = $selfProxy . '?url=' . urlencode($abs) . $refQuery;
        }
        return implode("\n", $out);
    }

    private function resolveUrl(string $value, string $upstreamUrl): string
    {
        $scheme = parse_url($upstreamUrl, PHP_URL_SCHEME) ?: 'https';
        if ($value === '' || $value[0] === '#') return $value;
        if (strpos($value, '//') === 0) {
            return $scheme . ':' . $value;
        }
        if (preg_match('/^https?:\/\//i', $value)) {
            return $value;
        }
        $origin = $this->getOrigin($upstreamUrl);
        if ($value[0] === '/') {
            return rtrim($origin, '/') . $value;
        }
        $baseDir = $this->getBaseDir($upstreamUrl);
        return rtrim($baseDir, '/') . '/' . $value;
    }

    private function buildCookieHeader(string $sessionId, string $host): string
    {
        $key = 'proxy_cookies:' . $sessionId . ':' . $host;
        $jar = Cache::get($key, []);
        if (!is_array($jar) || empty($jar)) return '';
        $pairs = [];
        foreach ($jar as $name => $val) {
            if ($val === null || $val === '') continue;
            $pairs[] = $name . '=' . $val;
        }
        return implode('; ', $pairs);
    }

    private function storeCookiesFromResponse(string $sessionId, string $host, array $headers): void
    {
        $key = 'proxy_cookies:' . $sessionId . ':' . $host;
        $jar = Cache::get($key, []);
        if (!is_array($jar)) $jar = [];
        $setCookies = [];
        if (isset($headers['Set-Cookie'])) {
            $setCookies = is_array($headers['Set-Cookie']) ? $headers['Set-Cookie'] : [$headers['Set-Cookie']];
        }
        foreach ($setCookies as $line) {
            $parts = explode(';', $line);
            if (count($parts) > 0) {
                $nv = explode('=', trim($parts[0]), 2);
                if (count($nv) === 2) {
                    $name = $nv[0];
                    $val = $nv[1];
                    $jar[$name] = $val;
                }
            }
        }
        if (!empty($jar)) {
            Cache::put($key, $jar, now()->addMinutes(30));
        }
    }

    private function rewriteResourceUrls(string $html, string $upstreamUrl, ?string $referer = null): string
    {
        $selfProxy = url('/proxy/fetch');
        $origin = $this->getOrigin($upstreamUrl);
        $baseDir = $this->getBaseDir($upstreamUrl);
        $scheme = parse_url($upstreamUrl, PHP_URL_SCHEME) ?: 'https';
        $refQuery = $referer ? ('&ref=' . urlencode($referer)) : '';

        // attributes to rewrite
        $attrs = ['src', 'href', 'data-src', 'poster'];
        $pattern = '/\b(' . implode('|', array_map('preg_quote', $attrs)) . ')\s*=\s*(["\'])([^"\']+)\2/i';

        $html = preg_replace_callback($pattern, function ($m) use ($selfProxy, $scheme, $origin, $baseDir, $refQuery) {
            $attr = $m[1];
            $quote = $m[2];
            $value = $m[3];

            // Skip anchors and non-network schemes
            if ($value === '' || $value[0] === '#' || preg_match('/^(data:|blob:|mailto:|tel:|javascript:)/i', $value)) {
                return $m[0];
            }
            // Avoid double-wrapping
            if (Str::startsWith($value, $selfProxy)) {
                return $m[0];
            }
            // Resolve to absolute URL
            if (strpos($value, '//') === 0) {
                $abs = $scheme . ':' . $value;
            } elseif (preg_match('/^https?:\/\//i', $value)) {
                $abs = $value;
            } elseif ($value[0] === '/') {
                $abs = rtrim($origin, '/') . $value;
            } else {
                $abs = rtrim($baseDir, '/') . '/' . $value;
            }

            // Block ad URL right here by returning empty
            if ($this->isAdUrl($abs)) {
                return '';
            }

            $wrapped = $selfProxy . '?url=' . urlencode($abs) . $refQuery;
            return $attr . '=' . $quote . $wrapped . $quote;
        }, $html);

        return $html;
    }

    private function isAdUrl(string $url): bool
    {
        $adPatterns = [
            '/doubleclick/i',
            '/googlesyndication/i',
            '/adservice/i',
            '/adsystem/i',
            '/banner/i',
            '/(^|\.)ads\./i',
            '/(^|\/)ads(\/|$)/i',
        ];
        foreach ($adPatterns as $pattern) {
            if (preg_match($pattern, $url)) {
                return true;
            }
        }
        return false;
    }

    private function getOrigin(string $url): string
    {
        $p = parse_url($url);
        if (!$p || !isset($p['scheme']) || !isset($p['host'])) return '';
        $origin = $p['scheme'] . '://' . $p['host'];
        if (isset($p['port'])) {
            $origin .= ':' . $p['port'];
        }
        return $origin;
    }

    private function getBaseDir(string $url): string
    {
        $p = parse_url($url);
        $origin = $this->getOrigin($url);
        $path = isset($p['path']) ? $p['path'] : '/';
        // Ensure trailing slash for directory
        $dir = rtrim(str_replace('\\', '/', dirname($path)), '/');
        if ($dir === '.') $dir = '';
        return rtrim($origin, '/') . ($dir ? '/' . ltrim($dir, '/') : '');
    }

    private function looksLikeJson(string $body): bool
    {
        $trim = ltrim($body);
        return $trim !== '' && ($trim[0] === '{' || $trim[0] === '[');
    }
}
