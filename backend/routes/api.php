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

// Details
Route::get('/movie/{id}', [DetailController::class, 'showMovie']);
Route::get('/series/{id}', [DetailController::class, 'showSeries']);

// DEV stream URL (placeholder)
Route::get('/movie/{id}/stream',  [StreamController::class, 'streamMovie']);
Route::get('/series/{id}/stream', [StreamController::class, 'streamSeries']);
