import React from 'react';
import { Search } from 'lucide-react';
import Button from './Button';

export default function SearchBar({ value, onChange, onSubmit }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-md">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
      <input
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder="Search movies, series..."
        className="w-full rounded-2xl border border-zinc-200 bg-white pl-9 pr-12 py-2 text-sm shadow-sm outline-none placeholder:text-zinc-400 hover:border-zinc-300 focus:border-zinc-400 dark:bg-zinc-900 dark:border-zinc-800 dark:focus:border-zinc-700"
      />
      <Button type="submit" className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-xl px-3 py-1.5 text-xs bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
        Go
      </Button>
    </form>
  );
}
