<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\TmdbService;

class DetailController extends Controller
{
    public function showMovie(int $id, TmdbService $tmdb)
    {
        $raw = $tmdb->movie($id);
        return response()->json($tmdb->mapDetail($raw));
    }

    public function showSeries(int $id, TmdbService $tmdb)
    {
        $raw = $tmdb->tv($id);
        return response()->json($tmdb->mapDetail($raw));
    }
}
