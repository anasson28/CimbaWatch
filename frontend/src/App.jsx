import React, { useEffect, useState } from 'react';
import { Header, Footer, PlayerDrawer } from './components';
import HomePage from './pages/HomePage';
import MoviesPage from './pages/MoviesPage';
import SeriesPage from './pages/SeriesPage';
import MovieDetailPage from './pages/MovieDetailPage';
import SerieDetailPage from './pages/SerieDetailPage';
import TrendingMovieSerie from './pages/TrendingMovieSerie';
import SearchResultsPage from './pages/SearchResultsPage';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
  // Route-based navigation; no manual page switching

  const { featured, items, loading } = useFetch({ activeTab, query });
  const { open, videoId, title, kind, playItem, close } = usePlayer();

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <Router>
        <Header dark={dark} setDark={setDark} query={query} setQuery={setQuery} onSearch={() => { /* no-op; fetch runs via effects */ }} />
        <Routes>
          <Route
            path="/"
            element={(
              <HomePage
                featured={featured}
                items={items}
                loading={loading}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onPlay={playItem}
              />
            )}
          />
          <Route path="/movies" element={<MoviesPage onPlay={playItem} />} />
          <Route path="/series" element={<SeriesPage onPlay={playItem} />} />
          <Route path="/trending" element={<TrendingMovieSerie onPlay={playItem} />} />
          <Route path="/search" element={<SearchResultsPage onPlay={playItem} />} />
          <Route path="/movie/:slug" element={<MovieDetailPage onPlay={playItem} />} />
          <Route path="/series/:slug" element={<SerieDetailPage onPlay={playItem} />} />
        </Routes>
        <Footer />
      </Router>

      <PlayerDrawer
        open={open}
        onClose={close}
        videoId={videoId}
        title={title}
        type={kind === 'series' ? 'tv' : 'movie'}
      />
    </div>
  );
}
