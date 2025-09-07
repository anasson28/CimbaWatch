<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Http\Controllers\Controller;

class StreamController extends Controller
{
    /**
     * Direct movie stream extractor
     */
    public function directMovie($id)
    {
        $bases = [
            'https://vidsrc.xyz',
            'https://vidsrc.net',
            'https://vidsrc.pm',
            'https://vidsrc.in',
        ];
        $candidates = array_map(fn($b) => rtrim($b, '/') . "/embed/movie/{$id}", $bases);
        return $this->resolveFromEmbedCandidates($candidates);
    }

    /**
     * Direct TV stream extractor
     */
    public function directTv($id, Request $request)
    {
        $season = $request->query('season', 1);
        $episode = $request->query('episode', 1);
        // Try both season-episode and season/episode formats across mirrors
        $bases = [
            'https://vidsrc.xyz',
            'https://vidsrc.net',
            'https://vidsrc.pm',
            'https://vidsrc.in',
        ];
        $candidates = [];
        foreach ($bases as $b) {
            $b = rtrim($b, '/');
            $candidates[] = "$b/embed/tv/{$id}/{$season}-{$episode}";
            $candidates[] = "$b/embed/tv/{$id}/{$season}/{$episode}";
        }
        return $this->resolveFromEmbedCandidates($candidates);
    }

}