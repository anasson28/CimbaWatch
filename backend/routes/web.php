<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProxyController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::get('/', function () {
    return view('welcome');
});

// Proxy embed route (served without /api prefix for iframe src)
Route::get('/proxy/embed/{type}/{id}', [ProxyController::class, 'embed']);
// Generic ad-filtering fetch proxy
Route::get('/proxy/fetch', [ProxyController::class, 'fetch']);
