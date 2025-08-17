<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;

class StreamController extends Controller
{
    // DEV ONLY: return a test HLS/MP4 URL so your React player works.
    // Later, replace with your own S3/CDN signed URL generator.
    public function streamMovie(int $id)
    {
        return response()->json(['url' => env('DEV_STREAM_URL')]);
    }

    public function streamSeries(int $id)
    {
        return response()->json(['url' => env('DEV_STREAM_URL')]);
    }
}
