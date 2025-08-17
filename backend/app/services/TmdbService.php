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
        return Cache::remember("tmdb:trending:$type:$page", 600, function () use ($type, $page) {
            return $this->get("/trending/{$type}/week", ['page' => $page]);
        });
    }

    public function popular(string $type = 'movie', int $page = 1)
    {
        $path = $type === 'movie' ? '/movie/popular' : '/tv/popular';
        return Cache::remember("tmdb:popular:$type:$page", 600, fn() => $this->get($path, ['page' => $page]));
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

    // -------- Mappers (to your frontend shape) --------
    public function mapCard(array $raw): array
    {
        $title  = $raw['title'] ?? $raw['name'] ?? 'Untitled';
        $year   = substr(($raw['release_date'] ?? $raw['first_air_date'] ?? ''), 0, 4);
        $poster = $raw['poster_path'] ? "{$this->imgBase}/w342{$raw['poster_path']}" : null;

        return [
            'id'     => $raw['id'],
            'type'   => isset($raw['title']) ? 'movie' : 'series',
            'title'  => $title,
            'year'   => $year ?: null,
            'rating' => round((float)($raw['vote_average'] ?? 0), 1),
            'poster' => $poster,
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
            'trailer'  => $yt,                                  // YouTube link (for info)
        ];
    }
}
