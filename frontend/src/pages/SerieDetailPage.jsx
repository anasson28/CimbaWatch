import React, { useState, useEffect } from 'react';
import { Star, Clock, Calendar } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { fetchSeries } from '../api';
import { useCollection } from '../hooks/useCollection';
import MovieGrid from '../components/movies/MovieGrid';
import Video from '../components/player/Video';
import { extractIdFromSlug, slugToQuery, parseSlug } from '../utils/slug';
import { http } from '../api/http';
// Using backend PHP player via iframe

export default function SerieDetailPage({ onPlay }) {
  const { slug } = useParams();
  const numericId = extractIdFromSlug(slug);
  const { titleQuery, year: slugYear } = parseSlug(slug);
  const [series, setSeries] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [season, setSeason] = useState(null);
  const [episode, setEpisode] = useState(1);
  // Provider switch for iframe embed
  const [provider, setProvider] = useState('vidplus'); // default to Vidplus for Server 1

  const serverOptions = [
    { key: 'vidplus', label: 'Server 1', hint: 'vidplus' },
    { key: 'autoembed', label: 'Server 2', hint: 'autoembed' },
    { key: '123embed', label: 'Server 3', hint: '123embed' },
  ];

  // Fetch series details by slug (extract id), fallback to search by title words
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    async function load() {
      try {
        let data = null;
        if (numericId) {
          data = await fetchSeries(numericId);
        } else {
          const q = titleQuery || slugToQuery(slug);
          const { data: res } = await http.get('/api/series', { params: { search: q, page: 1 } });
          const list = res?.results ?? [];
          const pick = (slugYear && list.find((it) => String(it.year || '') === String(slugYear))) || list[0];
          if (pick?.id) {
            data = await fetchSeries(pick.id);
          }
        }
        if (!mounted) return;
        if (data) {
          const normalized = data?.type ? data : { ...data, type: 'series' };
          setSeries(normalized);
          const seasons = (normalized.seasonEpisodes || []).map(s => s.season).filter(Boolean);
          if (seasons.length && (season == null)) setSeason(Math.min(...seasons));
        } else {
          setSeries(null);
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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Streaming</h2>
        </div>

        {/* Seasons/Episodes enhanced UI */}
        {Array.isArray(series.seasonEpisodes) && series.seasonEpisodes.length > 0 ? (
          <div className="mb-4 space-y-3">
            <div>
              <div className="text-xs font-medium text-zinc-600 dark:text-zinc-300 mb-1">Seasons</div>
              <div className="overflow-x-auto">
                <div className="flex gap-2">
                  {(series.seasonEpisodes || [])
                    .filter((s) => typeof s?.season === 'number' && (s.season ?? 0) >= 1 && (s.episodes ?? 0) > 0)
                    .sort((a, b) => a.season - b.season)
                    .map((s) => (
                      <button
                        key={s.season}
                        onClick={() => { setSeason(s.season); setEpisode(1); }}
                        className={`px-3 py-1.5 rounded-full border text-sm transition-colors ${season === s.season ? 'bg-zinc-900 text-white border-zinc-800' : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700'}`}
                      >
                        S{s.season}
                      </button>
                    ))}
                </div>
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-zinc-600 dark:text-zinc-300 mb-1">Episodes</div>
              <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-12 gap-2">
                {(() => {
                  const meta = (series.seasonEpisodes || []).find((s) => s.season === season);
                  const count = meta?.episodes ?? 1;
                  return Array.from({ length: count }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      onClick={() => setEpisode(n)}
                      className={`px-2 py-1.5 text-sm rounded-md border transition-colors ${episode === n ? 'bg-zinc-900 text-white border-zinc-800' : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700'}`}
                    >
                      {n}
                    </button>
                  ));
                })()}
              </div>
            </div>
          </div>
        ) : null}

        {/* Video with gradient frame */}
        <div className="relative w-full overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-gradient-to-br from-zinc-900 to-black p-[2px] aspect-video">
          <div className="relative w-full h-full rounded-[10px] overflow-hidden bg-black">
            {season != null && (
              <Video
                videoId={series.id}
                type="tv"
                season={season}
                episode={episode}
                provider={provider}
                coverImage={series.backdrop || series.poster}
                title={series.title}
              />
            )}
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
