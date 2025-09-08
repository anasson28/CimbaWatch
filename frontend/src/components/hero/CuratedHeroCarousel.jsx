import React, { useEffect, useMemo, useRef, useState } from 'react';
import HeroSection from './HeroSection';
import { fetchMovie, fetchSeries } from '../../api';
import { CURATED_HERO } from '../../config/curatedHero';

export default function CuratedHeroCarousel({ ids = CURATED_HERO, intervalMs = 7000, onPlay }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        const entries = Array.isArray(ids) ? ids : [];
        if (entries.length === 0) {
          if (mounted) { setItems([]); setLoading(false); }
          return;
        }
        const results = await Promise.all(entries.map(async (entry) => {
          const id = typeof entry === 'number' ? entry : entry?.id;
          const type = typeof entry === 'object' ? entry?.type : undefined; // 'movie' | 'series'
          if (!id) return null;
          try {
            if (type === 'series') {
              return await fetchSeries(id);
            } else if (type === 'movie') {
              return await fetchMovie(id);
            } else {
              // Unknown: try movie then series
              try {
                return await fetchMovie(id);
              } catch (e) {
                return await fetchSeries(id);
              }
            }
          } catch (e) {
            return null;
          }
        }));
        const filtered = results.filter(Boolean);
        if (mounted) setItems(filtered);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [ids]);

  useEffect(() => {
    if (!items.length) return;
    if (!intervalMs || intervalMs < 2000) return; // basic guard
    timerRef.current && clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % items.length);
    }, intervalMs);
    return () => { timerRef.current && clearInterval(timerRef.current); };
  }, [items, intervalMs]);

  if (loading && items.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-3xl h-[26rem] flex items-center justify-center border border-zinc-200 dark:border-zinc-800">
        <div className="text-zinc-500 dark:text-zinc-400 text-sm">Loading featured…</div>
      </div>
    );
  }

  if (items.length === 0) return null;

  const current = items[index];

  return (
    <div className="relative">
      <HeroSection featured={current} onPlay={onPlay} />
      {/* Controls */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-between p-2">
        <button
          type="button"
          onClick={() => setIndex((i) => (i - 1 + items.length) % items.length)}
          className="pointer-events-auto inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60"
          aria-label="Previous"
        >
          ‹
        </button>
        <button
          type="button"
          onClick={() => setIndex((i) => (i + 1) % items.length)}
          className="pointer-events-auto inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60"
          aria-label="Next"
        >
          ›
        </button>
      </div>
      {/* Dots */}
      <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-1.5">
        {items.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIndex(i)}
            className={`h-1.5 rounded-full transition-all ${i === index ? 'w-6 bg-white' : 'w-2 bg-white/50'}`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
