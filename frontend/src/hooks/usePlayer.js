import { useState } from 'react';
import { getStreamUrl } from '../api';

export function usePlayer() {
  const [state, setState] = useState({ open: false, src: null, title: '' });

  const playItem = async (item) => {
    const src = await getStreamUrl(item.id, item.type);
    setState({ open: true, src, title: item.title });
  };

  const close = () => setState({ open: false, src: null, title: '' });

  return { ...state, playItem, close };
}
