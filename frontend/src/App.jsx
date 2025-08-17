import React, { useEffect, useState } from 'react';
import { Header, Footer, PlayerDrawer } from './components';
import HomePage from './pages/HomePage';
import { useFetch } from './hooks/useFetch';
import { usePlayer } from './hooks/usePlayer';
import './styles/globals.css';

function useDarkMode() {
  const [dark, setDark] = useState(() => {
    if (typeof window === 'undefined') return true;
    const saved = localStorage.getItem('theme-dark');
    return saved ? JSON.parse(saved) : true;
  });
  useEffect(() => {
    const root = window.document.documentElement;
    if (dark) root.classList.add('dark'); else root.classList.remove('dark');
    localStorage.setItem('theme-dark', JSON.stringify(dark));
  }, [dark]);
  return [dark, setDark];
}

export default function App() {
  const [dark, setDark] = useDarkMode();
  const [activeTab, setActiveTab] = useState('trending');
  const [query, setQuery] = useState('');

  const { featured, items, loading } = useFetch({ activeTab, query });
  const { open, src, title, playItem, close } = usePlayer();

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <Header dark={dark} setDark={setDark} query={query} setQuery={setQuery} onSearch={() => { /* no-op; fetch runs via effects */ }} />
      <HomePage
        featured={featured}
        items={items}
        loading={loading}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onPlay={playItem}
      />
      <Footer />
      <PlayerDrawer open={open} onClose={close} src={src} title={title} />
    </div>
  );
}
