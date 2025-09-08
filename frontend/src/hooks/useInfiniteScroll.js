import { useEffect, useRef } from 'react';

/**
 * Simple IntersectionObserver-based infinite scroll hook.
 * Usage:
 *   const sentinelRef = useInfiniteScroll({ loading, hasMore, onLoadMore, rootMargin: '300px' });
 *   return <div ref={sentinelRef} />
 */
export function useInfiniteScroll({ loading, hasMore, onLoadMore, root = null, rootMargin = '300px', threshold = 0.1 }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting && !loading && hasMore) {
          onLoadMore?.();
        }
      },
      { root, rootMargin, threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [loading, hasMore, onLoadMore, root, rootMargin, threshold]);

  return ref;
}
