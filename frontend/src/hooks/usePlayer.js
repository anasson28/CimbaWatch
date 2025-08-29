import { useState } from 'react';

export function usePlayer() {
  const [state, setState] = useState({ open: false, videoId: null, src: null, title: '', kind: 'movie' });

  const playItem = (item) => {
    // Prefer clean API in Player component; don't prefetch here
    const kind = item?.type === 'series' ? 'series' : 'movie';
    setState({ open: true, videoId: item.id, src: null, title: item.title, kind });
  };

  const close = () => setState({ open: false, videoId: null, src: null, title: '', kind: 'movie' });

  return { ...state, playItem, close };
}
