import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeroSection, HorizontalRow } from '../components';
import CuratedHeroCarousel from '../components/hero/CuratedHeroCarousel';
import { CURATED_HERO } from '../config/curatedHero';
import { useRecommended } from '../hooks/useRecommended';
import { useCollection } from '../hooks/useCollection';

export default function HomePage({ featured, items, loading, activeTab, setActiveTab, onPlay }) {
  const navigate = useNavigate();
  const rec = useRecommended({ sort: 'trending', limit: 20 });
  const topMovies = useCollection({ type: 'movie', sort: 'top_rated', limit: 20 });
  const topSeries = useCollection({ type: 'series', sort: 'top_rated', limit: 20 });
  const trendMovies = useCollection({ type: 'movie', sort: 'trending', limit: 0, page: 1 });
  const trendSeries = useCollection({ type: 'series', sort: 'trending', limit: 0, page: 1 });
  const curatedIds = useMemo(() => {
    try {
      const raw = JSON.parse(localStorage.getItem('curated_hero_ids') || '[]');
      if (Array.isArray(raw) && raw.length > 0) return raw;
    } catch (e) {}
    return CURATED_HERO;
  }, []);
  const hasCurated = Array.isArray(curatedIds) && curatedIds.length > 0;
  const intervalMs = useMemo(() => {
    const n = Number(localStorage.getItem('curated_hero_interval'));
    return Number.isFinite(n) && n >= 2000 ? n : 7000;
  }, []);
  const mergedTrending = useMemo(() => [
    ...(trendMovies.items || []),
    ...(trendSeries.items || [])
  ], [trendMovies.items, trendSeries.items]);
  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
      <section className="pt-6">
        {hasCurated ? (
          <CuratedHeroCarousel ids={curatedIds} intervalMs={intervalMs} onPlay={(item) => item && onPlay?.(item)} />
        ) : (
          <HeroSection featured={featured} onPlay={() => featured && onPlay?.(featured)} />
        )}
      </section>

      <HorizontalRow
        title="Recommended for you"
        items={rec.items}
        loading={rec.loading}
        onPlay={onPlay}
        onSeeAll={() => navigate('/trending')}
      />

      {/* Curated genre sections based on trending movies & series */}
      <HorizontalRow
        title="Action"
        items={mergedTrending.filter((it) => (it.genres || []).some((g) => ['Action'].includes(g))).slice(0, 20)}
        loading={trendMovies.loading || trendSeries.loading}
        onPlay={onPlay}
        onSeeAll={() => navigate(`/search?genre=${encodeURIComponent('Action')}`)}
      />

      <HorizontalRow
        title="Drama"
        items={mergedTrending.filter((it) => (it.genres || []).some((g) => ['Drama'].includes(g))).slice(0, 20)}
        loading={trendMovies.loading || trendSeries.loading}
        onPlay={onPlay}
        onSeeAll={() => navigate(`/search?genre=${encodeURIComponent('Drama')}`)}
      />

      <HorizontalRow
        title="Comedy"
        items={mergedTrending.filter((it) => (it.genres || []).some((g) => ['Comedy'].includes(g))).slice(0, 20)}
        loading={trendMovies.loading || trendSeries.loading}
        onPlay={onPlay}
        onSeeAll={() => navigate(`/search?genre=${encodeURIComponent('Comedy')}`)}
      />

      <HorizontalRow
        title="Horror / Thriller"
        items={mergedTrending.filter((it) => (it.genres || []).some((g) => ['Horror', 'Thriller'].includes(g))).slice(0, 20)}
        loading={trendMovies.loading || trendSeries.loading}
        onPlay={onPlay}
        onSeeAll={() => navigate(`/search?genre=${encodeURIComponent('Horror')}`)}
      />

      <HorizontalRow
        title="Sci-Fi / Fantasy"
        items={mergedTrending.filter((it) => (it.genres || []).some((g) => ['Science Fiction', 'Sci-Fi', 'Fantasy'].includes(g))).slice(0, 20)}
        loading={trendMovies.loading || trendSeries.loading}
        onPlay={onPlay}
        onSeeAll={() => navigate(`/search?genre=${encodeURIComponent('Science Fiction')}`)}
      />

      <HorizontalRow
        title="Adventure"
        items={mergedTrending.filter((it) => (it.genres || []).some((g) => ['Adventure'].includes(g))).slice(0, 20)}
        loading={trendMovies.loading || trendSeries.loading}
        onPlay={onPlay}
        onSeeAll={() => navigate(`/search?genre=${encodeURIComponent('Adventure')}`)}
      />

      <HorizontalRow
        title="Animation / Family"
        items={mergedTrending.filter((it) => (it.genres || []).some((g) => ['Animation', 'Family'].includes(g))).slice(0, 20)}
        loading={trendMovies.loading || trendSeries.loading}
        onPlay={onPlay}
        onSeeAll={() => navigate(`/search?genre=${encodeURIComponent('Animation')}`)}
      />

      <HorizontalRow
        title="Mystery / Crime"
        items={mergedTrending.filter((it) => (it.genres || []).some((g) => ['Mystery', 'Crime'].includes(g))).slice(0, 20)}
        loading={trendMovies.loading || trendSeries.loading}
        onPlay={onPlay}
        onSeeAll={() => navigate(`/search?genre=${encodeURIComponent('Mystery')}`)}
      />

      <HorizontalRow
        title="Top Movies"
        items={topMovies.items}
        loading={topMovies.loading}
        onPlay={onPlay}
        onSeeAll={() => navigate('/movies')}
      />

      <HorizontalRow
        title="Top TV Shows"
        items={topSeries.items}
        loading={topSeries.loading}
        onPlay={onPlay}
        onSeeAll={() => navigate('/series')}
      />
    </main>
  );
}
