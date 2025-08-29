import { useEffect, useState } from 'react';
import { fetchRecommended } from '../api';

export function useRecommended({ sort = 'trending', limit = 20, page = 1 } = {}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    fetchRecommended({ sort, limit, page })
      .then((res) => { if (mounted) setItems(res); })
      .catch((e) => { if (mounted) { setItems([]); setError(e); } })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [sort, limit, page]);

  return { items, loading, error };
}
