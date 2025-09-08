import { useState } from 'react';

export function usePlayer() {
  const [state, setState] = useState({ open: false, videoId: null, src: null, title: '', kind: 'movie', poster: null, backdrop: null });

  const playItem = (item) => {
    // Prefer clean API in Player component; don't prefetch here
    const kind = item?.type === 'series' ? 'series' : 'movie';
    setState({
      open: true,
      videoId: item.id,
      src: null,
      title: item.title,
      kind,
      poster: item.poster || null,
      backdrop: item.backdrop || null,
    });
  };

  const close = () => setState({ open: false, videoId: null, src: null, title: '', kind: 'movie', poster: null, backdrop: null });

  return { ...state, playItem, close };
}
