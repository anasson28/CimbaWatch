import React, { useEffect, useMemo, useState } from 'react';
import { MovieGrid, SearchBar } from '../components';
import FiltersBar from '../components/ui/FiltersBar';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import { useCollection } from '../hooks/useCollection';

export default function SeriesPage({ onPlay }) {
  const [sort, setSort] = useState('popular');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [maxPage, setMaxPage] = useState(1);

  const { items, loading } = useCollection({ type: 'series', sort, search, limit: 0, page });
  // aggregated list for infinite scroll
  const [list, setList] = useState([]);
  useEffect(() => {
    setList((prev) => (page === 1 ? items : [...prev, ...items]));
  }, [items, page]);

  // Auto-load more toggle
  const [autoLoadMore, setAutoLoadMore] = useState(() => {
    try {
      const v = localStorage.getItem('auto_load_more_series');
      return v ? JSON.parse(v) : true;
    } catch { return true; }
  });
  useEffect(() => {
    localStorage.setItem('auto_load_more_series', JSON.stringify(autoLoadMore));
  }, [autoLoadMore]);

  const applySearch = () => setSearch(searchInput.trim());
  const [filters, setFilters] = useState({ genre: '', year: '', rating: '', language: '', country: '' });
  
  // Reset paging when filters change
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    setMaxPage(1);
  }, [sort, search]);

  // Detect last page (no items returned)
  useEffect(() => {
    if (!loading && page > 1 && items.length === 0) {
      setHasMore(false);
      setMaxPage((p) => Math.max(p, page - 1));
      setPage((p) => Math.max(1, p - 1));
    }
  }, [loading, items, page]);

  // Infinite scroll sentinel
  const sentinelRef = useInfiniteScroll({
    loading,
    hasMore,
    onLoadMore: () => setPage((p) => p + 1),
    rootMargin: '600px',
  });

  // Compute filter options from aggregated items
  const filterOptions = useMemo(() => {
    const languages = new Set();
    const countries = new Set();
    const genres = new Set();
    for (const it of list) {
      if (it?.language) languages.add(String(it.language).toLowerCase());
      (it?.countries || []).forEach((c) => countries.add(String(c).toUpperCase()));
      (it?.genres || []).forEach((g) => genres.add(String(g)));
    }
    return {
      languages: Array.from(languages),
      countries: Array.from(countries),
      genres: Array.from(genres),
    };
  }, [list]);

  // Apply filters client-side
  const filteredItems = useMemo(() => {
    const { genre, year, rating, language, country } = filters;
    const langNorm = (language || '').toLowerCase();
    const countryNorm = (country || '').toUpperCase();
    const minRating = rating ? Number(rating) : null;
    return list.filter((it) => {
      if (genre && !(it.genres || []).includes(genre)) return false;
      if (year && String(it.year || '') !== String(year)) return false;
      if (minRating != null && Number(it.rating || 0) < minRating) return false;
      if (langNorm && String(it.language || '').toLowerCase() !== langNorm) return false;
      if (countryNorm && !((it.countries || []).map((c) => String(c).toUpperCase()).includes(countryNorm))) return false;
      return true;
    });
  }, [list, filters]);

  const pagesToShow = useMemo(() => {
    const windowSize = 5;
    if (!hasMore) {
      const total = Math.max(1, maxPage);
      if (total <= windowSize) return Array.from({ length: total }, (_, i) => i + 1);
      const start = Math.max(1, Math.min(page - 2, total - (windowSize - 1)));
      return Array.from({ length: windowSize }, (_, i) => start + i);
    }
    if (page <= 3) return [1, 2, 3, 4, 5];
    return [page - 2, page - 1, page, page + 1, page + 2];
  }, [page, hasMore, maxPage]);

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
      <header className="pt-6 mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">All Series</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Browse our full catalog and filter by search or sort.</p>
          </div>
          <div className="flex w-full sm:w-auto items-center gap-3">
            <SearchBar value={searchInput} onChange={setSearchInput} onSubmit={applySearch} scope="series" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm outline-none hover:border-zinc-300 focus:border-zinc-400 dark:bg-zinc-900 dark:border-zinc-800 dark:focus:border-zinc-700"
            >
              <option value="popular">Popular</option>
              <option value="trending">Trending</option>
              <option value="top_rated">Top Rated</option>
            </select>
          </div>
        </div>
        <div className="mt-4">
          <FiltersBar filters={filters} onChange={setFilters} options={filterOptions} />
        </div>
      </header>

      <MovieGrid items={filteredItems} loading={loading && page === 1} onPlay={onPlay} />

      {/* Infinite scroll sentinel */}
      {autoLoadMore && <div ref={sentinelRef} className="h-10" />}

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
