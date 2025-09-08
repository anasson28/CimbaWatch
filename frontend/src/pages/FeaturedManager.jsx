import React, { useEffect, useMemo, useState } from 'react';
import { fetchMovie, fetchSeries } from '../api';
import { Button } from '../components';

function normalizeEntries(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((e) => (typeof e === 'number' ? { id: e, type: 'auto' } : e))
    .filter((e) => e && typeof e.id === 'number');
}

export default function FeaturedManager() {
  const [entries, setEntries] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('curated_hero_ids') || '[]');
      return normalizeEntries(saved);
    } catch {
      return [];
    }
  });
  const [intervalMs, setIntervalMs] = useState(() => {
    const n = Number(localStorage.getItem('curated_hero_interval'));
    return Number.isFinite(n) && n >= 2000 ? n : 7000;
  });
  const [newId, setNewId] = useState('');
  const [newType, setNewType] = useState('auto'); // auto|movie|series
  const [loadingIds, setLoadingIds] = useState({});
  const [details, setDetails] = useState({}); // key: `${type}:${id}` => detail

  // Persist
  useEffect(() => {
    const payload = entries.map((e) => ({ id: e.id, type: e.type }));
    localStorage.setItem('curated_hero_ids', JSON.stringify(payload));
  }, [entries]);
  useEffect(() => {
    localStorage.setItem('curated_hero_interval', String(intervalMs));
  }, [intervalMs]);

  // Load previews
  useEffect(() => {
    let cancelled = false;
    async function load() {
      for (const e of entries) {
        const key = `${e.type || 'auto'}:${e.id}`;
        if (details[key] || loadingIds[key]) continue;
        setLoadingIds((m) => ({ ...m, [key]: true }));
        try {
          let item = null;
          if (e.type === 'movie') item = await fetchMovie(e.id);
          else if (e.type === 'series') item = await fetchSeries(e.id);
          else {
            try { item = await fetchMovie(e.id); }
            catch { item = await fetchSeries(e.id); }
          }
          if (!cancelled && item) setDetails((d) => ({ ...d, [key]: item }));
        } catch {
          // ignore
        } finally {
          if (!cancelled) setLoadingIds((m) => ({ ...m, [key]: false }));
        }
      }
    }
    load();
    return () => { cancelled = true; };
  }, [entries]);

  const addEntry = async () => {
    const idNum = Number(newId);
    if (!Number.isFinite(idNum) || idNum <= 0) return;
    setEntries((arr) => [...arr, { id: idNum, type: newType }]);
    setNewId('');
    setNewType('auto');
  };

  const removeAt = (idx) => setEntries((arr) => arr.filter((_, i) => i !== idx));
  const moveUp = (idx) => setEntries((arr) => {
    if (idx <= 0) return arr;
    const copy = arr.slice();
    [copy[idx - 1], copy[idx]] = [copy[idx], copy[idx - 1]];
    return copy;
  });
  const moveDown = (idx) => setEntries((arr) => {
    if (idx >= arr.length - 1) return arr;
    const copy = arr.slice();
    [copy[idx + 1], copy[idx]] = [copy[idx], copy[idx + 1]];
    return copy;
  });
  const updateType = (idx, type) => setEntries((arr) => arr.map((e, i) => i === idx ? { ...e, type } : e));

  return (
    <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pb-16">
      <header className="pt-6 mb-6">
        <h1 className="text-2xl font-bold">Featured Hero Manager</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Curate the carousel on the home hero. Add TMDB IDs for movies or TV.</p>
      </header>

      <section className="mb-6">
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-[1fr_auto_auto]">
          <input
            value={newId}
            onChange={(e) => setNewId(e.target.value)}
            placeholder="Enter TMDB ID (e.g., 118489)"
            className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm outline-none hover:border-zinc-300 focus:border-zinc-400 dark:bg-zinc-900 dark:border-zinc-800 dark:focus:border-zinc-700"
          />
          <select
            value={newType}
            onChange={(e) => setNewType(e.target.value)}
            className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm outline-none hover:border-zinc-300 focus:border-zinc-400 dark:bg-zinc-900 dark:border-zinc-800 dark:focus:border-zinc-700"
          >
            <option value="auto">Auto detect</option>
            <option value="movie">Movie</option>
            <option value="series">Series</option>
          </select>
          <button
            type="button"
            onClick={addEntry}
            className="rounded-xl px-3 py-2 text-sm bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
          >Add</button>
        </div>
      </section>

      <section className="mb-6">
        <div className="flex items-center gap-3">
          <label className="text-sm">Auto-rotate every</label>
          <input
            type="number"
            min={2000}
            step={500}
            value={intervalMs}
            onChange={(e) => setIntervalMs(Number(e.target.value))}
            className="w-28 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm outline-none hover:border-zinc-300 focus:border-zinc-400 dark:bg-zinc-900 dark:border-zinc-800 dark:focus:border-zinc-700"
          />
          <span className="text-sm text-zinc-500">ms</span>
        </div>
      </section>

      <section>
        <div className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
          <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
            <thead className="bg-zinc-50/50 dark:bg-zinc-900/50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Preview</th>
                <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Title</th>
                <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Year</th>
                <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Type</th>
                <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-zinc-600 dark:text-zinc-400">TMDB ID</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {entries.map((e, idx) => {
                const key = `${e.type || 'auto'}:${e.id}`;
                const meta = details[key];
                return (
                  <tr key={idx} className="bg-white dark:bg-zinc-950">
                    <td className="px-3 py-2">
                      {meta?.poster ? (
                        <img src={meta.poster} alt="Poster" className="h-14 w-10 object-cover rounded" />
                      ) : (
                        <div className="h-14 w-10 rounded bg-zinc-100 dark:bg-zinc-800" />
                      )}
                    </td>
                    <td className="px-3 py-2 text-sm">{meta?.title || '—'}</td>
                    <td className="px-3 py-2 text-sm">{meta?.year || '—'}</td>
                    <td className="px-3 py-2">
                      <select
                        value={e.type || 'auto'}
                        onChange={(ev) => updateType(idx, ev.target.value)}
                        className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs shadow-sm outline-none hover:border-zinc-300 focus:border-zinc-400 dark:bg-zinc-900 dark:border-zinc-800 dark:focus:border-zinc-700"
                      >
                        <option value="auto">Auto</option>
                        <option value="movie">Movie</option>
                        <option value="series">Series</option>
                      </select>
                    </td>
                    <td className="px-3 py-2 text-sm">{e.id}</td>
                    <td className="px-3 py-2 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button onClick={() => moveUp(idx)} className="px-2 py-1 rounded border text-xs">Up</button>
                        <button onClick={() => moveDown(idx)} className="px-2 py-1 rounded border text-xs">Down</button>
                        <button onClick={() => removeAt(idx)} className="px-2 py-1 rounded border text-xs text-red-600 border-red-300 dark:border-red-800">Remove</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {entries.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">No curated entries yet. Add one above.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
        Changes are saved automatically to localStorage. The carousel on the Home page will use this list.
      </div>
    </main>
  );
}
