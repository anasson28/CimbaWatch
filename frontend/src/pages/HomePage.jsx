import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HeroSection, HorizontalRow } from '../components';
import { useRecommended } from '../hooks/useRecommended';
import { useCollection } from '../hooks/useCollection';

export default function HomePage({ featured, items, loading, activeTab, setActiveTab, onPlay }) {
  const navigate = useNavigate();
  const rec = useRecommended({ sort: 'trending', limit: 20 });
  const topMovies = useCollection({ type: 'movie', sort: 'top_rated', limit: 20 });
  const topSeries = useCollection({ type: 'series', sort: 'top_rated', limit: 20 });
  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
      <section className="pt-6">
        <HeroSection featured={featured} onPlay={() => featured && onPlay?.(featured)} />
      </section>

      <HorizontalRow
        title="Recommended for you"
        items={rec.items}
        loading={rec.loading}
        onPlay={onPlay}
        onSeeAll={() => navigate('/trending')}
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
