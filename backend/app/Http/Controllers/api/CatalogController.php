<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\TmdbService;
use Illuminate\Http\Request;

class CatalogController extends Controller
{
    public function list(Request $req, TmdbService $tmdb, string $type) // $type = movie|series
    {
        $type = $type === 'series' ? 'tv' : 'movie';

        $page  = (int) $req->integer('page', 1);
        $sort  = $req->get('sort', 'trending');   // trending|popular|top_rated
        $q     = trim((string) $req->get('search', ''));

        if ($q !== '') {
            $data = $tmdb->search($q, $type, $page);
        } else {
            if ($sort === 'popular') {
                $data = $tmdb->popular($type, $page);
            } elseif ($sort === 'top_rated') {
                $data = $tmdb->topRated($type, $page);
            } else {
                $data = $tmdb->trending($type, $page);
            }
        }

        $items = array_map(fn($r) => $tmdb->mapCard($r), $data['results'] ?? []);

        return response()->json([
            'page'    => $data['page'] ?? $page,
            'total'   => $data['total_results'] ?? count($items),
            'results' => $items,
        ]);
    }

    public function recommended(Request $req, TmdbService $tmdb)
    {
        $page  = (int) $req->integer('page', 1);
        $sort  = $req->get('sort', 'trending'); // trending|popular
        $limit = (int) $req->integer('limit', 20);

        if ($sort === 'popular') {
            $m = $tmdb->popular('movie', $page);
            $t = $tmdb->popular('tv', $page);
        } else {
            $m = $tmdb->trending('movie', $page);
            $t = $tmdb->trending('tv', $page);
        }

        $merged = array_merge($m['results'] ?? [], $t['results'] ?? []);
        $cards  = array_map(fn($r) => $tmdb->mapCard($r), $merged);

        // Sort by rating desc to prioritize better content
        usort($cards, function ($a, $b) {
            return ($b['rating'] <=> $a['rating']);
        });

        if ($limit > 0) {
            $cards = array_slice($cards, 0, $limit);
        }

        return response()->json([
            'page'    => $page,
            'total'   => count($cards),
            'results' => $cards,
        ]);
    }
}
