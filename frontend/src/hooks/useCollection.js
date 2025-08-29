import { useEffect, useState } from 'react';
import { fetchCollection } from '../api';

export function useCollection({ type = 'movie', sort = 'trending', search = '', limit = 20, page = 1 } = {}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    fetchCollection({ type, sort, search, page })
      .then((res) => { if (mounted) setItems(limit ? res.slice(0, limit) : res); })
      .catch((e) => { if (mounted) { setItems([]); setError(e); } })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [type, sort, search, limit, page]);

  return { items, loading, error };
}
