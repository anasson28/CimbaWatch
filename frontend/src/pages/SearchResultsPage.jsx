import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MovieGrid, SearchBar } from '../components';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import FiltersBar from '../components/ui/FiltersBar';
import { http } from '../api/http';

export default function SearchResultsPage({ onPlay }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = (searchParams.get('q') || '').trim();

  const [input, setInput] = useState(initialQuery);
  const [query, setQuery] = useState(initialQuery);
  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState({ genre: '', year: '', rating: '', language: '', country: '' });
  const [autoLoadMore, setAutoLoadMore] = useState(() => {
    try {
      const v = localStorage.getItem('auto_load_more_search');
      return v ? JSON.parse(v) : true;
    } catch { return true; }
  });
  useEffect(() => {
    localStorage.setItem('auto_load_more_search', JSON.stringify(autoLoadMore));
  }, [autoLoadMore]);
  const sentinelRef = useInfiniteScroll({
    loading,
    hasMore,
    onLoadMore: () => setPage((p) => p + 1),
    rootMargin: '600px'
  });

  // Sync state when URL search params change (e.g., using navbar Go on /search)
  useEffect(() => {
    const qParam = (searchParams.get('q') || '').trim();
    setInput(qParam);
    setQuery(qParam);
    const nextFilters = {
      genre: searchParams.get('genre') || '',
      year: searchParams.get('year') || '',
      rating: searchParams.get('rating') || '',
      language: searchParams.get('language') || '',
      country: searchParams.get('country') || '',
    };
    setFilters((prev) => {
      const same = ['genre','year','rating','language','country'].every((k) => String(prev[k] || '') === String(nextFilters[k] || ''));
      return same ? prev : nextFilters;
    });
  }, [searchParams]);

  useEffect(() => {
    // Reset when query changes
    setItems([]);
    setPage(1);
    setHasMore(true);
  }, [query]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const isSearch = query.trim() !== '';
        const params = isSearch ? { search: query, page } : { sort: 'trending', page };
        const [moviesRes, seriesRes] = await Promise.all([
          http.get('/api/movies', { params }),
          http.get('/api/series', { params }),
        ]);
        const mv = moviesRes.data?.results ?? [];
        const tv = seriesRes.data?.results ?? [];
        const merged = [...mv, ...tv];
        if (!mounted) return;
        setItems((prev) => page === 1 ? merged : [...prev, ...merged]);
        setHasMore(merged.length > 0);
      } catch (e) {
        if (!mounted) return;
        if (page === 1) setItems([]);
        setHasMore(false);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [query, page]);

  const applySearch = () => {
    const q = input.trim();
    setQuery(q);
  };

  // Keep URL in sync with query and filters
  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (filters.genre) params.set('genre', filters.genre);
    if (filters.year) params.set('year', filters.year);
    if (filters.rating) params.set('rating', filters.rating);
    if (filters.language) params.set('language', filters.language);
    if (filters.country) params.set('country', filters.country);
    setSearchParams(params);
  }, [query, filters, setSearchParams]);

  // Compute filter options from loaded items
  const filterOptions = useMemo(() => {
    const languages = new Set();
    const countries = new Set();
    const genres = new Set();
    for (const it of items) {
      if (it?.language) languages.add(String(it.language).toLowerCase());
      (it?.countries || []).forEach((c) => countries.add(String(c).toUpperCase()));
      (it?.genres || []).forEach((g) => genres.add(String(g)));
    }
    return {
      languages: Array.from(languages),
      countries: Array.from(countries),
      genres: Array.from(genres),
    };
  }, [items]);

  // Apply filters client-side
  const filteredItems = useMemo(() => {
    const { genre, year, rating, language, country } = filters;
    const langNorm = (language || '').toLowerCase();
    const countryNorm = (country || '').toUpperCase();
    const minRating = rating ? Number(rating) : null;
    return items.filter((it) => {
      if (genre && !(it.genres || []).includes(genre)) return false;
      if (year && String(it.year || '') !== String(year)) return false;
      if (minRating != null && Number(it.rating || 0) < minRating) return false;
      if (langNorm && String(it.language || '').toLowerCase() !== langNorm) return false;
      if (countryNorm && !((it.countries || []).map((c) => String(c).toUpperCase()).includes(countryNorm))) return false;
      return true;
    });
  }, [items, filters]);

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
      <header className="pt-6 mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Search results</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {query ? `Showing matches for "${query}"` : 'Trending movies and series'}
            </p>
          </div>
          <div className="flex w-full sm:w-auto items-center gap-3">
            <SearchBar value={input} onChange={setInput} onSubmit={applySearch} />
            <div className="flex items-center gap-2 text-xs">
              <input id="auto-load-search" type="checkbox" checked={autoLoadMore} onChange={(e) => setAutoLoadMore(e.target.checked)} className="h-4 w-4" />
              <label htmlFor="auto-load-search" className="text-zinc-600 dark:text-zinc-400">Auto-load more</label>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <FiltersBar filters={filters} onChange={setFilters} options={filterOptions} />
        </div>
      </header>

      <MovieGrid items={filteredItems} loading={loading && page === 1} onPlay={onPlay} />

      {/* Infinite scroll sentinel */}
      {autoLoadMore && <div ref={sentinelRef} className="h-10" />}

      <div className="mt-4 flex items-center justify-center">
        <button
          type="button"
          onClick={() => setPage((p) => p + 1)}
          disabled={!hasMore || loading}
          className={`px-4 py-2 rounded-xl text-sm border ${(!hasMore || loading) ? 'text-zinc-400 border-zinc-200 dark:border-zinc-800 cursor-not-allowed' : 'text-zinc-700 dark:text-zinc-200 border-zinc-200 hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-800/50'}`}
        >
          {loading ? 'Loading…' : hasMore ? 'Load more' : 'No more results'}
        </button>
      </div>
    </main>
  );
}
