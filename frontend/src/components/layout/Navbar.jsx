import React from 'react';
import { Film, Flame, Tv2, Moon, SunMedium } from 'lucide-react';
import SearchBar from '../ui/SearchBar';

export default function Navbar({ dark, setDark, query, setQuery, onSearch }) {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-3">
      <a href="#" className="flex items-center gap-2 font-bold tracking-tight text-xl">
        <Film className="h-6 w-6" /> StreamTox
      </a>
      <nav className="hidden md:flex items-center gap-4 ml-6 text-sm text-zinc-600 dark:text-zinc-300">
        <a href="#" className="hover:text-zinc-900 dark:hover:text-white flex items-center gap-1"><Flame className="h-4 w-4"/>Trending</a>
        <a href="#" className="hover:text-zinc-900 dark:hover:text-white flex items-center gap-1"><Film className="h-4 w-4"/>Movies</a>
        <a href="#" className="hover:text-zinc-900 dark:hover:text-white flex items-center gap-1"><Tv2 className="h-4 w-4"/>Series</a>
      </nav>
      <div className="ml-auto flex-1 md:flex-none" />
      <SearchBar value={query} onChange={setQuery} onSubmit={onSearch} />
      <button
        onClick={() => setDark(!dark)}
        className="ml-3 inline-flex items-center justify-center rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm hover:bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-800 dark:hover:bg-zinc-800"
        aria-label="Toggle theme"
      >
        {dark ? <SunMedium className="h-4 w-4"/> : <Moon className="h-4 w-4"/>}
      </button>
    </div>
  );
}
