<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

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

    public function getStream($video_id, Request $request)
    {
        // Normalize and validate inputs
        $type = strtolower($request->query('type', 'movie'));
        $season = $request->query('season');
        $episode = $request->query('episode');

        // Accept "series" as alias for "tv"
        if ($type === 'series') {
            $type = 'tv';
        }

        if (!in_array($type, ['movie', 'tv'], true)) {
            return response()->json(["error" => "Invalid type. Expected 'movie' or 'tv'."], 422);
        }

        if ($type === 'tv' && (!$season || !$episode)) {
            return response()->json(["error" => "Missing 'season' or 'episode' for tv type."], 422);
        }

        // Get mw-providers API URL from config or use default
        $providersApiUrl = config('services.providers.api_url', 'http://localhost:3001');
        
        try {
            // Build payload for mw-providers API
            $payload = [
                'type' => $type,
                'id' => $video_id,
            ];
            
            // Add season and episode for TV shows
            if ($type === 'tv' && $season && $episode) {
                $payload['season'] = (int)$season;
                $payload['episode'] = (int)$episode;
            }
            
            Log::info('Calling mw-providers API', $payload);
            
            // Call mw-providers API
            $response = Http::timeout((int) config('services.providers.timeout', 30))
                ->post($providersApiUrl . '/resolve', $payload);

            if ($response->successful()) {
                $data = $response->json();
                
                // Return normalized response
                return response()->json([
                    'sources' => $data['sources'] ?? [],
                    'subtitles' => $data['subtitles'] ?? []
                ]);
            }
            
            Log::error('mw-providers API failed', [
                'status' => $response->status(),
                'body' => $response->body()
            ]);
            
            return response()->json([
                'error' => 'Failed to fetch stream',
                'sources' => [],
                'subtitles' => []
            ], 500);
            
        } catch (\Exception $e) {
            Log::error('Stream fetch exception: ' . $e->getMessage());
            return response()->json([
                'error' => 'Stream service unavailable',
                'sources' => [],
                'subtitles' => []
            ], 500);
        }
    }

    
    
}
