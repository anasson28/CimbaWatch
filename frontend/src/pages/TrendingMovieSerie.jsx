import React, { useEffect, useMemo, useState } from 'react';
import { MovieGrid } from '../components';
import { useRecommended } from '../hooks/useRecommended';

export default function TrendingMovieSerie({ onPlay }) {
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [maxPage, setMaxPage] = useState(1);

  // Mixed trending items (movies + series), no filters
  const { items, loading } = useRecommended({ sort: 'trending', page });

  // Detect last page (no items returned)
  useEffect(() => {
    if (!loading && page > 1 && items.length === 0) {
      setHasMore(false);
      setMaxPage((p) => Math.max(p, page - 1));
      setPage((p) => Math.max(1, p - 1));
    }
  }, [loading, items, page]);

  const pagesToShow = useMemo(() => {
    const windowSize = 5;
    if (!hasMore) {
      const total = Math.max(1, maxPage);
      if (total <= windowSize) return Array.from({ length: total }, (_, i) => i + 1);
      const start = Math.max(1, Math.min(page - 2, total - (windowSize - 1)));
      return Array.from({ length: windowSize }, (_, i) => start + i);
    }
    // When we don't know the last page yet, show a sliding window around current
    if (page <= 3) return [1, 2, 3, 4, 5];
    return [page - 2, page - 1, page, page + 1, page + 2];
  }, [page, hasMore, maxPage]);

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
      <header className="pt-6 mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Trending Movies & Series</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Browse everything that’s trending right now.</p>
          </div>
        </div>
      </header>

      <MovieGrid items={items} loading={loading} onPlay={onPlay} />

      {/* Pagination */}
      <nav className="mt-8 flex items-center justify-center gap-2" aria-label="Pagination">
        <button
          type="button"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className={`px-3 py-1.5 rounded-lg text-sm border ${page === 1 ? 'text-zinc-400 border-zinc-200 dark:border-zinc-800 cursor-not-allowed' : 'text-zinc-700 dark:text-zinc-200 border-zinc-200 hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-800/50'}`}
        >
          Prev
        </button>
        {pagesToShow.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setPage(n)}
            className={`min-w-[2.25rem] px-3 py-1.5 rounded-lg text-sm border ${n === page ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 border-zinc-900 dark:border-white' : 'text-zinc-700 dark:text-zinc-200 border-zinc-200 hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-800/50'}`}
            aria-current={n === page ? 'page' : undefined}
          >
            {n}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setPage((p) => p + 1)}
          disabled={!hasMore && page >= maxPage}
          className={`px-3 py-1.5 rounded-lg text-sm border ${(!hasMore && page >= maxPage) ? 'text-zinc-400 border-zinc-200 dark:border-zinc-800 cursor-not-allowed' : 'text-zinc-700 dark:text-zinc-200 border-zinc-200 hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-800/50'}`}
        >
          Next
        </button>
      </nav>
    </main>
  );
}
