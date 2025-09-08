import React, { useMemo } from 'react';

export default function FiltersBar({
  filters,
  onChange,
  options = {},
}) {
  const genres = useMemo(() => Array.from(new Set(options.genres || [])).sort(), [options.genres]);
  const languages = useMemo(() => Array.from(new Set(options.languages || [])).sort(), [options.languages]);
  const countries = useMemo(() => Array.from(new Set(options.countries || [])).sort(), [options.countries]);

  const years = useMemo(() => {
    const now = new Date().getFullYear();
    const range = [];
    for (let y = now; y >= now - 60; y--) range.push(String(y));
    return range;
  }, []);

  const ratings = ['9', '8', '7', '6', '5', '0'];

  return (
    <div className="flex flex-wrap gap-2">
      <select
        value={filters.genre || ''}
        onChange={(e) => onChange({ ...filters, genre: e.target.value })}
        className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm outline-none hover:border-zinc-300 focus:border-zinc-400 dark:bg-zinc-900 dark:border-zinc-800 dark:focus:border-zinc-700"
      >
        <option value="">Genre (Any)</option>
        {genres.map((g) => (
          <option key={g} value={g}>{g}</option>
        ))}
      </select>

      <select
        value={filters.year || ''}
        onChange={(e) => onChange({ ...filters, year: e.target.value })}
        className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm outline-none hover:border-zinc-300 focus:border-zinc-400 dark:bg-zinc-900 dark:border-zinc-800 dark:focus:border-zinc-700"
      >
        <option value="">Year (Any)</option>
        {years.map((y) => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>

      <select
        value={filters.rating || ''}
        onChange={(e) => onChange({ ...filters, rating: e.target.value })}
        className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm outline-none hover:border-zinc-300 focus:border-zinc-400 dark:bg-zinc-900 dark:border-zinc-800 dark:focus:border-zinc-700"
      >
        <option value="">Rating (Any)</option>
        {ratings.map((r) => (
          <option key={r} value={r}>{Number(r) >= 1 ? `${r}+` : '0+'}</option>
        ))}
      </select>

      <select
        value={filters.language || ''}
        onChange={(e) => onChange({ ...filters, language: e.target.value })}
        className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm outline-none hover:border-zinc-300 focus:border-zinc-400 dark:bg-zinc-900 dark:border-zinc-800 dark:focus:border-zinc-700"
      >
        <option value="">Language (Any)</option>
        {languages.map((l) => (
          <option key={l} value={l}>{l}</option>
        ))}
      </select>

      <select
        value={filters.country || ''}
        onChange={(e) => onChange({ ...filters, country: e.target.value })}
        className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm outline-none hover:border-zinc-300 focus:border-zinc-400 dark:bg-zinc-900 dark:border-zinc-800 dark:focus:border-zinc-700"
      >
        <option value="">Country (Any)</option>
        {countries.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      {(filters.genre || filters.year || filters.rating || filters.language || filters.country) && (
        <button
          type="button"
          onClick={() => onChange({ genre: '', year: '', rating: '', language: '', country: '' })}
          className="rounded-xl px-3 py-2 text-sm border border-zinc-200 hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-800/50"
        >
          Clear
        </button>
      )}
    </div>
  );
}
