<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\CatalogController;
use App\Http\Controllers\Api\DetailController;
use App\Http\Controllers\Api\StreamController;


// Listings (match your React calls)
// GET /api/movies?sort=trending|popular&search=&page=1
// GET /api/series? ... same
Route::get('/movies', fn(\Illuminate\Http\Request $r, CatalogController $c) => $c->list($r, app('App\Services\TmdbService'), 'movie'));
Route::get('/series', fn(\Illuminate\Http\Request $r, CatalogController $c) => $c->list($r, app('App\Services\TmdbService'), 'series'));
// Mixed recommended (movies + series)
Route::get('/recommended', [CatalogController::class, 'recommended']);

// Details
Route::get('/movie/{id}', [DetailController::class, 'showMovie']);
Route::get('/series/{id}', [DetailController::class, 'showSeries']);

// Stream endpoints - integrates with Node providers API
Route::get('/movie/streams', [StreamController::class, 'getMovieStreams']);
Route::get('/tv/streams', [StreamController::class, 'getTvStreams']);

// Direct extractor: attempt to fetch a playable HLS URL from VidSrc embed
Route::get('/stream/movie/{id}', [StreamController::class, 'directMovie']);
Route::get('/stream/tv/{id}', [StreamController::class, 'directTv']);

// Legacy endpoints (for backward compatibility)
Route::get('/movie/{id}/stream',  [StreamController::class, 'streamMovie']);
Route::get('/series/{id}/stream', [StreamController::class, 'streamSeries']);
Route::get('/sources/{type}/{id}', [StreamController::class, 'listServers']);