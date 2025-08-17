import React from 'react';
import { Flame, Film, Tv2 } from 'lucide-react';

export default function MovieTabs({ active, onChange }) {
  const tabs = [
    { key: 'trending', label: 'Trending', icon: <Flame className="h-4 w-4"/> },
    { key: 'movies', label: 'Movies', icon: <Film className="h-4 w-4"/> },
    { key: 'series', label: 'Series', icon: <Tv2 className="h-4 w-4"/> },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto">
      {tabs.map(t => (
        <button
          key={t.key}
          onClick={() => onChange?.(t.key)}
          className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm shadow-sm transition ${active===t.key ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-900 dark:border-white' : 'bg-white border-zinc-200 hover:bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-800 dark:hover:bg-zinc-800'}`}
        >
          {t.icon} {t.label}
        </button>
      ))}
    </div>
  );
}
