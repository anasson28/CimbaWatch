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
        $sort  = $req->get('sort', 'trending');   // trending|popular
        $q     = trim((string) $req->get('search', ''));

        if ($q !== '') {
            $data = $tmdb->search($q, $type, $page);
        } else {
            $data = $sort === 'popular'
                ? $tmdb->popular($type, $page)
                : $tmdb->trending($type, $page);
        }

        $items = array_map(fn($r) => $tmdb->mapCard($r), $data['results'] ?? []);

        return response()->json([
            'page'    => $data['page'] ?? $page,
            'total'   => $data['total_results'] ?? count($items),
            'results' => $items,
        ]);
    }
}
