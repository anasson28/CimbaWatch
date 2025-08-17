import React from 'react';
import { Play, Star } from 'lucide-react';

export default function MovieCard({ item, onPlay }) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onPlay?.();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onPlay?.()}
      onKeyDown={handleKeyDown}
      title={item?.title}
      className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm outline-none transition hover:shadow-md focus:ring-2 focus:ring-zinc-300 dark:bg-zinc-900 dark:border-zinc-800 dark:focus:ring-zinc-700 cursor-pointer"
      data-testid="movie-card"
    >
      <div className="relative aspect-[2/3] overflow-hidden">
        <img
          src={item.poster}
          alt={`Poster of ${item.title}`}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963f?q=80&w=600&auto=format&fit=crop';
          }}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
        {/* Overlay gradient on hover for readability */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        {/* Type badge */}
        {item?.type && (
          <span className="absolute left-2 top-2 rounded-md bg-black/70 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white">
            {item.type}
          </span>
        )}
        {/* Play button */}
        <button
          type="button"
          aria-label={`Play ${item.title}`}
          onClick={(e) => { e.stopPropagation(); onPlay?.(); }}
          className="absolute inset-x-2 bottom-2 inline-flex items-center gap-2 rounded-xl bg-black/75 text-white px-3 py-2 text-xs opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
        >
          <Play className="h-4 w-4"/> Play
        </button>
      </div>
      <div className="p-3">
        <div className="truncate font-medium" title={item.title}>{item.title}</div>
        <div className="mt-1 flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
          <span>{item.year}</span>
          <span className="inline-flex items-center gap-1" aria-label={`Rating ${item.rating}`}>
            <Star className="h-3 w-3"/> {item.rating}
          </span>
        </div>
      </div>
    </div>
  );
}
