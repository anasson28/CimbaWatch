import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from './Button';
import { http } from '../../api/http';
import { buildSlug } from '../../utils/slug';

export default function SearchBar({ value, onChange, onSubmit, scope = 'all' }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const rootRef = useRef(null);
  const inputRef = useRef(null);

  // Debounced search on value change
  useEffect(() => {
    if (!value || value.trim().length < 2) {
      setResults([]);
      setOpen(false);
      setLoading(false);
      setActiveIndex(-1);
      return;
    }
    setLoading(true);
    setOpen(true);
    setActiveIndex(-1);
    const handle = setTimeout(async () => {
      try {
        let items = [];
        if (scope === 'movies') {
          const moviesRes = await http.get('/api/movies', { params: { search: value.trim(), page: 1 } });
          items = (moviesRes.data?.results ?? []).slice(0, 10);
        } else if (scope === 'series') {
          const seriesRes = await http.get('/api/series', { params: { search: value.trim(), page: 1 } });
          items = (seriesRes.data?.results ?? []).slice(0, 10);
        } else {
          const [moviesRes, seriesRes] = await Promise.all([
            http.get('/api/movies', { params: { search: value.trim(), page: 1 } }),
            http.get('/api/series', { params: { search: value.trim(), page: 1 } }),
          ]);
          const movies = (moviesRes.data?.results ?? []).filter(Boolean);
          const series = (seriesRes.data?.results ?? []).filter(Boolean);

          // Prioritize items where title closely matches the query
          const q = value.trim().toLowerCase();
          const score = (t) => {
            const s = (t || '').toLowerCase();
            if (!q) return 0;
            if (s === q) return 100;
            if (s.startsWith(q)) return 80;
            if (s.includes(q)) return 50;
            return 0;
          };
          const sortByRelevance = (arr) => arr.slice().sort((a, b) => (score(b.title) - score(a.title)));
          const mSorted = sortByRelevance(movies);
          const sSorted = sortByRelevance(series);

          // Guarantee representation: take up to 5 from each, then interleave, then fill remainder
          const limit = 10;
          const mTop = mSorted.slice(0, 5);
          const sTop = sSorted.slice(0, 5);
          const merged = [];
          const maxLen = Math.max(mTop.length, sTop.length);
          const mTopScore = mTop[0] ? score(mTop[0].title) : -1;
          const sTopScore = sTop[0] ? score(sTop[0].title) : -1;
          const firstA = sTopScore >= mTopScore ? sTop : mTop;
          const firstB = sTopScore >= mTopScore ? mTop : sTop;
          for (let i = 0; i < maxLen && merged.length < limit; i++) {
            if (firstA[i]) merged.push(firstA[i]);
            if (firstB[i] && merged.length < limit) merged.push(firstB[i]);
          }
          // Fill remaining from whichever list still has items
          if (merged.length < limit) {
            const remaining = [...mSorted.slice(5), ...sSorted.slice(5)];
            for (const r of remaining) {
              if (merged.length >= limit) break;
              merged.push(r);
            }
          }
          items = merged.slice(0, limit);
        }
        setResults(items);
      } catch (err) {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(handle);
  }, [value, scope]);

  // Close on click outside
  useEffect(() => {
    const onDocClick = (e) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick, true);
    return () => document.removeEventListener('mousedown', onDocClick, true);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (activeIndex >= 0 && results[activeIndex]) {
      goToResult(results[activeIndex]);
      return;
    }
    onSubmit?.();
    setOpen(false);
  };

  const goToResult = (item) => {
    if (!item) return;
    const slug = buildSlug(item.title, item.id);
    if (item.type === 'series') navigate(`/series/${slug}`);
    else navigate(`/movie/${slug}`);
    setOpen(false);
  };

  const onKeyDown = (e) => {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && results[activeIndex]) {
        e.preventDefault();
        goToResult(results[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <form ref={rootRef} onSubmit={handleSubmit} className="relative w-full max-w-md">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        onFocus={() => { if (results.length > 0) setOpen(true); }}
        onKeyDown={onKeyDown}
        placeholder="Search movies, series..."
        className="w-full rounded-2xl border border-zinc-200 bg-white pl-9 pr-12 py-2 text-sm shadow-sm outline-none placeholder:text-zinc-400 hover:border-zinc-300 focus:border-zinc-400 dark:bg-zinc-900 dark:border-zinc-800 dark:focus:border-zinc-700"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls="search-suggestions"
      />
      <Button type="submit" className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-xl px-3 py-1.5 text-xs bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
        Go
      </Button>

      {open && (
        <div id="search-suggestions" className="absolute z-50 mt-2 w-full rounded-xl border border-zinc-200 bg-white shadow-lg dark:bg-zinc-900 dark:border-zinc-800 overflow-hidden">
          {loading && (
            <div className="flex items-center gap-2 px-3 py-3 text-sm text-zinc-500 dark:text-zinc-400">
              <Loader2 className="h-4 w-4 animate-spin" /> Searching…
            </div>
          )}
          {!loading && results.length === 0 && (
            <div className="px-3 py-3 text-sm text-zinc-500 dark:text-zinc-400">No results</div>
          )}
          {!loading && results.length > 0 && (
            <ul role="listbox" className="max-h-80 overflow-auto">
              {results.map((item, idx) => (
                <li
                  key={`${item.type}-${item.id}`}
                  role="option"
                  aria-selected={activeIndex === idx}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onMouseDown={(e) => { e.preventDefault(); }}
                  onClick={() => goToResult(item)}
                  className={`flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors ${activeIndex === idx ? 'bg-zinc-100 dark:bg-zinc-800' : ''}`}
                >
                  <img
                    src={item.poster}
                    alt="Poster"
                    className="h-10 w-7 rounded object-cover bg-zinc-200 dark:bg-zinc-800"
                    loading="lazy"
                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963f?q=80&w=120&auto=format&fit=crop'; }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="truncate text-sm font-medium">{item.title}</div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">{item.year} • {item.type}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </form>
  );
}
