import React from 'react';
import { HeroSection, MovieTabs, MovieGrid } from '../components';

export default function HomePage({ featured, items, loading, activeTab, setActiveTab, onPlay }) {
  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
      <section className="pt-6">
        <HeroSection featured={featured} onPlay={() => featured && onPlay?.(featured)} />
      </section>

      <section className="mt-10">
        <MovieTabs active={activeTab} onChange={setActiveTab} />
      </section>

      <section className="mt-6">
        <MovieGrid items={items} loading={loading} onPlay={onPlay} />
      </section>
    </main>
  );
}
