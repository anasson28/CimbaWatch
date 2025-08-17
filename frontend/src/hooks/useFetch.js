import { useEffect, useState } from 'react';
import { fetchCollection, fetchFeatured } from '../api';

export function useFetch({ activeTab, query }) {
  const [featured, setFeatured] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load featured once
  useEffect(() => {
    let mounted = true;
    fetchFeatured().then((data) => { if (mounted) setFeatured(data); });
    return () => { mounted = false; };
  }, []);

  // Load collections on dependency change
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    const type = activeTab === 'series' ? 'series' : 'movie';
    const sort = activeTab === 'trending' ? 'trending' : 'popular';
    fetchCollection({ type, sort, search: query })
      .then((data) => { if (mounted) setItems(data); })
      .catch(() => { if (mounted) setItems([]); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [activeTab, query]);

  return { featured, items, loading };
}
