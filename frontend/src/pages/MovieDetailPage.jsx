import React, { useState, useEffect } from 'react';
import { Star, Clock, Calendar } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { fetchMovie } from '../api';
import { useCollection } from '../hooks/useCollection';
import MovieGrid from '../components/movies/MovieGrid';
import Video from '../components/player/Video';
import { extractIdFromSlug, slugToQuery } from '../utils/slug';
import { http } from '../api/http';


export default function MovieDetailPage({ onPlay }) {
  const { slug } = useParams();
  const numericId = extractIdFromSlug(slug);
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Provider switch for iframe embed
  const [provider, setProvider] = useState('vidapi'); // 'vidapi' default

  const serverOptions = [
    { key: 'vidapi', label: 'Server 1', hint: 'vidapi' },
    { key: '2embed', label: 'Server 2', hint: '2embed' },
    { key: 'embed_su', label: 'Server 3', hint: 'embed.su' },
  ];

  // Fetch movie details by slug (extract id), fallback to search by title words
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    async function load() {
      try {
        if (numericId) {
          const data = await fetchMovie(numericId);
          if (!mounted) return;
          const normalized = data?.type ? data : { ...data, type: 'movie' };
          setMovie(normalized);
          return;
        }
        // Fallback: search by slug query and pick the best match
        const q = slugToQuery(slug);
        const { data } = await http.get('/api/movies', { params: { search: q, page: 1 } });
        const first = data?.results?.[0];
        if (first?.id) {
          const full = await fetchMovie(first.id);
          if (!mounted) return;
          const normalized = full?.type ? full : { ...full, type: 'movie' };
          setMovie(normalized);
        } else {
          if (!mounted) return;
          setMovie(null);
        }
      } catch (e) {
        if (mounted) setError(e);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [slug]);

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
        <div className="relative w-full overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-gradient-to-br from-zinc-900 to-black p-[2px] aspect-video">
          <div className="relative w-full h-full rounded-[10px] overflow-hidden bg-black">
            <Video videoId={movie.id} type="movie" provider={provider} />
          </div>
          <div className="absolute top-2 left-2 text-[10px] px-2 py-1 rounded-md bg-white/10 text-white/80 tracking-wide">
            {provider === 'auto' ? 'Auto' : serverOptions.find(s => s.key === provider)?.label}
          </div>
        </div>

        {/* Server selector beneath video */}
        <div className="mt-4 grid gap-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-zinc-500 dark:text-zinc-400">Choose a server</div>
            <button
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${provider === 'auto' ? 'bg-zinc-900 text-white border-zinc-800' : 'bg-transparent text-zinc-600 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700'}`}
              onClick={() => setProvider('auto')}
              title="Let us choose the best server automatically"
            >
              Auto select
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {serverOptions.map((s) => (
              <button
                key={s.key}
                onClick={() => setProvider(s.key)}
                aria-pressed={provider === s.key}
                className={`group relative flex items-center justify-between rounded-xl border px-4 py-3 transition-colors ${provider === s.key ? 'border-zinc-800 bg-zinc-900 text-white' : 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200'}`}
              >
                <div className="font-medium">{s.label}</div>
                <div className="text-xs opacity-70">{s.hint}</div>
                <span className={`absolute inset-0 rounded-xl pointer-events-none ${provider === s.key ? 'ring-1 ring-zinc-700' : ''}`}></span>
              </button>
            ))}
          </div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400 text-center">If a server doesn’t play, try another.</div>
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
