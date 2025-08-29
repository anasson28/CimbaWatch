import React, { useState, useEffect } from 'react';
import { Star, Clock, Calendar, Download } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { fetchSeries } from '../api';
import { useCollection } from '../hooks/useCollection';
import MovieGrid from '../components/movies/MovieGrid';
import { API_BASE } from '../api/http';
// Using backend PHP player via iframe

export default function SerieDetailPage({ onPlay }) {
  const { id } = useParams();
  const [series, setSeries] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [season, setSeason] = useState(null);
  const [episode, setEpisode] = useState(1);

  // Fetch series details by ID from URL
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    fetchSeries(id)
      .then((data) => {
        if (!mounted) return;
        const normalized = data?.type ? data : { ...data, type: 'series' };
        setSeries(normalized);
      })
      .catch((e) => { if (mounted) setError(e); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [id]);

  // Similar series (trending as a simple proxy)
  const similar = useCollection({ type: 'series', sort: 'trending', limit: 12 });

  // Initialize season/episode when series loads
  useEffect(() => {
    if (!series) return;
    const seasonsList = (series.seasonEpisodes || [])
      .filter((s) => typeof s?.season === 'number' && (s.season ?? 0) >= 1 && (s.episodes ?? 0) > 0)
      .sort((a, b) => a.season - b.season);
    const defaultSeason = seasonsList[0]?.season ?? 1;
    setSeason(defaultSeason);
    setEpisode(1);
  }, [series]);

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
        <div className="text-center text-red-500">Failed to load series.</div>
      </div>
    );
  }

  if (!series) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center text-zinc-600 dark:text-zinc-300">Series not found.</div>
      </div>
    );
  }

  const genres = series.genre || series.genres || [];

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Section: Poster + Details (title and description next to poster) */}
      <section className="mt-4 grid gap-6 md:grid-cols-[280px_1fr] items-start">
        <div className="md:w-[280px] md:max-w-[280px]">
          <img
            src={series.poster}
            alt={series.title}
            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 object-cover aspect-[2/3]"
            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963f?q=80&w=600&auto=format&fit=crop'; }}
          />
        </div>
        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{series.title}</h1>
            {series.tagline && (
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{series.tagline}</p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-600 dark:text-zinc-300">
            {series.year && (
              <span className="inline-flex items-center gap-1"><Calendar className="h-4 w-4" />{series.year}</span>
            )}
            {series.seasons && (
              <span className="inline-flex items-center gap-1"><Clock className="h-4 w-4" />{series.seasons} seasons</span>
            )}
            {(() => {
              const eps = series.episodes ?? series.episode_count ?? series.total_episodes ?? series.episodesCount ?? series.totalEpisodes;
              return eps ? (
                <span className="inline-flex items-center gap-1"><Clock className="h-4 w-4" />{eps} episodes</span>
              ) : null;
            })()}
            {typeof series.rating !== 'undefined' && (
              <span className="inline-flex items-center gap-1"><Star className="h-4 w-4 text-yellow-500" />{series.rating}</span>
            )}
          </div>

          {series.overview && (
            <p className="text-zinc-700 dark:text-zinc-200 leading-relaxed">{series.overview}</p>
          )}
          {!!genres?.length && (
            <div className="flex flex-wrap gap-2">
              {genres.map((g) => (
                <span key={g} className="px-2 py-0.5 rounded-md text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700">{g}</span>
              ))}
            </div>
          )}
          {/* Removed Play button; inline player below */}
        </div>
      </section>

      {/* Section 2: streaming */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-4">Streaming</h2>
        {/* Season/Episode selectors (only if seasons info available) */}
        {Array.isArray(series.seasonEpisodes) && series.seasonEpisodes.length > 0 ? (
          <div className="mb-4 flex flex-wrap gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-300 mb-1">Season</label>
              <select
                value={season ?? ''}
                onChange={(e) => { const s = Number(e.target.value); setSeason(s); setEpisode(1); }}
                className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm"
              >
                {(series.seasonEpisodes || [])
                  .filter((s) => typeof s?.season === 'number' && (s.season ?? 0) >= 1 && (s.episodes ?? 0) > 0)
                  .sort((a, b) => a.season - b.season)
                  .map((s) => (
                    <option key={s.season} value={s.season}>Season {s.season}</option>
                  ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-300 mb-1">Episode</label>
              <select
                value={episode}
                onChange={(e) => setEpisode(Number(e.target.value))}
                className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm"
              >
                {(() => {
                  const meta = (series.seasonEpisodes || []).find((s) => s.season === season);
                  const count = meta?.episodes ?? 1;
                  return Array.from({ length: count }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>Episode {n}</option>
                  ));
                })()}
              </select>
            </div>
          </div>
        ) : null}

        <div className="mb-3">
          <a
            href={
              season && episode
                ? `${API_BASE}/player.php?video_id=${series.id}&tmdb=1&s=${season}&e=${episode}`
                : `${API_BASE}/player.php?video_id=${series.id}&tmdb=1`
            }
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white/90 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 hover:bg-white dark:hover:bg-zinc-800"
          >
            <Download className="h-4 w-4" /> Download
          </a>
        </div>

        {/* Embedded PHP Player */}
        <div className="relative w-full overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
          <div className="relative w-full pt-[56.25%] bg-black">
            <div className="absolute inset-0">
              <iframe
                src={
                  season && episode
                    ? `${API_BASE}/player.php?video_id=${series.id}&tmdb=1&s=${season}&e=${episode}`
                    : `${API_BASE}/player.php?video_id=${series.id}&tmdb=1`
                }
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

      {/* Section 3: Similar series */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-4">Similar series</h2>
        <MovieGrid
          items={(similar.items || []).filter((m) => m.id !== series.id)}
          loading={similar.loading}
          onPlay={onPlay}
        />
      </section>
    </main>
  );
}
