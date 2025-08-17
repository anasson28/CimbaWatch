import React from 'react';
import Navbar from './Navbar';

export default function Header({ dark, setDark, query, setQuery, onSearch }) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200/60 bg-white/70 backdrop-blur dark:border-zinc-800/60 dark:bg-zinc-900/60">
      <Navbar dark={dark} setDark={setDark} query={query} setQuery={setQuery} onSearch={onSearch} />
    </header>
  );
}
