import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MovieGrid, SearchBar } from '../components';
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
    setSearchParams(q ? { q } : {});
  };

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
          </div>
        </div>
      </header>

      <MovieGrid items={items} loading={loading && page === 1} onPlay={onPlay} />

      <div className="mt-8 flex items-center justify-center">
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
