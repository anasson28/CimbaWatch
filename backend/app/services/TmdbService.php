<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class TmdbService
{
    protected string $base = 'https://api.themoviedb.org/3';
    protected string $apiKey;
    protected string $lang;
    protected string $imgBase;

    public function __construct()
    {
        $this->apiKey  = config('services.tmdb.key', env('TMDB_API_KEY'));
        $this->lang    = env('TMDB_LANG', 'en-US');
        $this->imgBase = env('TMDB_IMAGE_BASE', 'https://image.tmdb.org/t/p');
    }

    protected function get(string $path, array $params = [])
    {
        $url = "{$this->base}{$path}";
        $query = array_filter([
            'api_key'  => $this->apiKey,
            'language' => $this->lang,
        ] + $params);

        $res = Http::acceptJson()->get($url, $query);
        $res->throw();
        return $res->json();
    }

    // -------- Collections --------
    public function trending(string $type = 'movie', int $page = 1)
    {
        // Map internal 'series' and 'tv' to TMDB 'tv'
        $tmdbType = ($type === 'series' || $type === 'tv') ? 'tv' : 'movie';
        return Cache::remember("tmdb:trending:$type:$page", 600, function () use ($tmdbType, $page) {
            return $this->get("/trending/{$tmdbType}/week", ['page' => $page]);
        });
    }

    public function popular(string $type = 'movie', int $page = 1)
    {
        $path = $type === 'movie' ? '/movie/popular' : '/tv/popular';
        return Cache::remember("tmdb:popular:$type:$page", 600, fn() => $this->get($path, ['page' => $page]));
    }

    public function topRated(string $type = 'movie', int $page = 1)
    {
        $path = $type === 'movie' ? '/movie/top_rated' : '/tv/top_rated';
        return Cache::remember("tmdb:top_rated:$type:$page", 600, fn() => $this->get($path, ['page' => $page]));
    }

    public function search(string $query, string $type = 'movie', int $page = 1)
    {
        $path = $type === 'movie' ? '/search/movie' : '/search/tv';
        return $this->get($path, ['query' => $query, 'page' => $page, 'include_adult' => false]);
    }

    // -------- Details --------
    public function movie(int $id)
    {
        return Cache::remember("tmdb:movie:$id", 3600, function () use ($id) {
            return $this->get("/movie/{$id}", [
                'append_to_response' => 'videos,images,credits',
                'include_image_language' => $this->lang . ',null'
            ]);
        });
    }

    public function tv(int $id)
    {
        return Cache::remember("tmdb:tv:$id", 3600, function () use ($id) {
            return $this->get("/tv/{$id}", [
                'append_to_response' => 'videos,images,aggregate_credits',
                'include_image_language' => $this->lang . ',null'
            ]);
        });
    }

    public function movieExternalIds(int $id)
    {
        return Cache::remember("tmdb:movie_ext_ids:$id", 3600, function () use ($id) {
            return $this->get("/movie/{$id}/external_ids");
        });
    }

    protected function genreMap(string $type = 'movie'): array
    {
        $cacheKey = "tmdb:genres:{$type}";
        return Cache::remember($cacheKey, 86400, function () use ($type) {
            $path = $type === 'movie' ? '/genre/movie/list' : '/genre/tv/list';
            $res = $this->get($path);
            $map = [];
            foreach (($res['genres'] ?? []) as $g) {
                $map[(int)($g['id'] ?? 0)] = (string)($g['name'] ?? '');
            }
            return $map;
        });
    }

    // -------- Mappers (to your frontend shape) --------
    public function mapCard(array $raw): array
    {
        $title    = $raw['title'] ?? $raw['name'] ?? 'Untitled';
        $year     = substr(($raw['release_date'] ?? $raw['first_air_date'] ?? ''), 0, 4);
        $poster   = $raw['poster_path'] ? "{$this->imgBase}/w342{$raw['poster_path']}" : null;
        $isMovie  = isset($raw['title']);
        $lang     = $raw['original_language'] ?? null;
        $countries= !$isMovie ? (array)($raw['origin_country'] ?? []) : [];
        $genreIds = (array)($raw['genre_ids'] ?? []);
        $gmap     = $this->genreMap($isMovie ? 'movie' : 'tv');
        $genres   = array_values(array_filter(array_map(function ($id) use ($gmap) {
            $id = (int)$id;
            return $gmap[$id] ?? null;
        }, $genreIds)));

        return [
            'id'     => $raw['id'],
            'type'   => $isMovie ? 'movie' : 'series',
            'title'  => $title,
            'year'   => $year ?: null,
            'rating' => round((float)($raw['vote_average'] ?? 0), 1),
            'poster' => $poster,
            'language' => $lang ?: null,
            'countries' => $countries,
            'genres' => $genres,
        ];
    }

    public function mapDetail(array $raw): array
    {
        $isMovie   = isset($raw['title']);
        $genres    = array_map(fn($g) => $g['name'], $raw['genres'] ?? []);
        $backdrop  = $raw['backdrop_path'] ? "{$this->imgBase}/original{$raw['backdrop_path']}" : null;
        $poster    = $raw['poster_path'] ? "{$this->imgBase}/w500{$raw['poster_path']}" : null;

        // pick first YouTube trailer if available
        $yt = null;
        foreach (($raw['videos']['results'] ?? []) as $v) {
            if (($v['site'] ?? '') === 'YouTube' && ($v['type'] ?? '') === 'Trailer') {
                $yt = "https://www.youtube.com/watch?v={$v['key']}";
                break;
            }
        }

        return [
            'id'       => $raw['id'],
            'type'     => $isMovie ? 'movie' : 'series',
            'title'    => $raw['title'] ?? $raw['name'] ?? 'Untitled',
            'overview' => $raw['overview'] ?? '',
            'year'     => substr(($raw['release_date'] ?? $raw['first_air_date'] ?? ''), 0, 4) ?: null,
            'rating'   => round((float)($raw['vote_average'] ?? 0), 1),
            'genres'   => $genres,
            'poster'   => $poster,
            'backdrop' => $backdrop,
            'runtime'  => $raw['runtime'] ?? null,             // movies
            'seasons'  => $raw['number_of_seasons'] ?? null,    // tv
            'episodes' => $raw['number_of_episodes'] ?? null,   // tv
            'seasonEpisodes' => array_values(array_map(function ($s) {
                return [
                    'season'   => $s['season_number'] ?? null,
                    'episodes' => $s['episode_count'] ?? null,
                    'name'     => $s['name'] ?? null,
                ];
            }, $raw['seasons'] ?? [])),
            'trailer'  => $yt,                                  // YouTube link (for info)
        ];
    }
}
