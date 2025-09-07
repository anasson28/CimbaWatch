import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Film, Flame, Tv2, Moon, SunMedium } from 'lucide-react';
import SearchBar from '../ui/SearchBar';

export default function Navbar({ dark, setDark, query, setQuery, onSearch }) {
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location?.pathname || '/';
  const scope = pathname.startsWith('/series') ? 'series' : (pathname.startsWith('/movies') ? 'movies' : 'all');
  const handleSubmit = () => {
    const q = (query || '').trim();
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-3">
      <a href="/" className="group flex items-center gap-2 md:gap-3 font-semibold tracking-tight text-xl md:text-2xl">
        <span className="flex items-baseline gap-1">
          <span className="font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-2xl">CIMBA</span>
          <span className="font-light text-zinc-900 dark:text-zinc-100">watch</span>
        </span>
      </a>
      <nav className="hidden md:flex items-center gap-4 ml-6 text-sm text-zinc-600 dark:text-zinc-300">
        <a href="/trending" className="hover:text-zinc-900 dark:hover:text-white flex items-center gap-1"><Flame className="h-4 w-4"/>Trending</a>
        <a href="/movies" className="hover:text-zinc-900 dark:hover:text-white flex items-center gap-1"><Film className="h-4 w-4"/>Movies</a>
        <a href="/series" className="hover:text-zinc-900 dark:hover:text-white flex items-center gap-1"><Tv2 className="h-4 w-4"/>Series</a>
      </nav>
      <div className="ml-auto flex-1 md:flex-none" />
      <SearchBar value={query} onChange={setQuery} onSubmit={handleSubmit} scope={scope} />
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
