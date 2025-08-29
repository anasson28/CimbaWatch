import React, { useState, useEffect } from 'react';
import { Star, Clock, Calendar, Download } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { fetchMovie } from '../api';
import { useCollection } from '../hooks/useCollection';
import MovieGrid from '../components/movies/MovieGrid';
import { API_BASE } from '../api/http';


export default function MovieDetailPage({ onPlay }) {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch movie details by ID from URL
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    fetchMovie(id)
      .then((data) => {
        if (!mounted) return;
        const normalized = data?.type ? data : { ...data, type: 'movie' };
        setMovie(normalized);
      })
      .catch((e) => { if (mounted) setError(e); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [id]);

  // Similar movies (trending as a simple proxy)
  const similar = useCollection({ type: 'movie', sort: 'trending', limit: 12 });

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center text-zinc-600 dark:text-zinc-300">Loading…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center text-red-500">Failed to load movie.</div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center text-zinc-600 dark:text-zinc-300">Movie not found.</div>
      </div>
    );
  }

  const genres = movie.genre || movie.genres || [];

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Header moved into right column */}

      {/* Section: Poster + Details */}
      <section className="mt-4 grid gap-6 md:grid-cols-[280px_1fr] items-start">
        <div className="md:w-[280px] md:max-w-[280px]">
          <img
            src={movie.poster}
            alt={movie.title}
            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 object-cover aspect-[2/3]"
            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963f?q=80&w=600&auto=format&fit=crop'; }}
          />
        </div>
        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{movie.title}</h1>
            {movie.tagline && (
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{movie.tagline}</p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-600 dark:text-zinc-300">
            {movie.year && (
              <span className="inline-flex items-center gap-1"><Calendar className="h-4 w-4" />{movie.year}</span>
            )}
            {movie.runtime && (
              <span className="inline-flex items-center gap-1"><Clock className="h-4 w-4" />{movie.runtime} min</span>
            )}
            {typeof movie.rating !== 'undefined' && (
              <span className="inline-flex items-center gap-1"><Star className="h-4 w-4 text-yellow-500" />{movie.rating}</span>
            )}
          </div>
          {movie.overview && (
            <p className="text-zinc-700 dark:text-zinc-200 leading-relaxed">{movie.overview}</p>
          )}
          {!!genres?.length && (
            <div className="flex flex-wrap gap-2">
              {genres.map((g) => (
                <span key={g} className="px-2 py-0.5 rounded-md text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700">{g}</span>
              ))}
            </div>
          )}
        </div>
      </section>
      
      {/* Section 2: streaming */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-4">Streaming</h2>
        <div className="mb-3">
          <a
            href={`${API_BASE}/player.php?video_id=${movie.id}&tmdb=1`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white/90 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 hover:bg-white dark:hover:bg-zinc-800"
          >
            <Download className="h-4 w-4" /> Download
          </a>
        </div>
        <div className="relative w-full overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
          <div className="relative w-full pt-[56.25%] bg-black">
            <div className="absolute inset-0">
              <iframe
                src={`${API_BASE}/player.php?video_id=${movie.id}&tmdb=1`}
                title="Player"
                className="w-full h-full"
                allow="autoplay; fullscreen"
                allowFullScreen
                frameBorder="0"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Similar movies */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-4">Similar movies</h2>
        <MovieGrid
          items={(similar.items || []).filter((m) => m.id !== movie.id)}
          loading={similar.loading}
          onPlay={onPlay}
        />
      </section>
    </main>
  );
}
