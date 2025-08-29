import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MovieCard from './MovieCard';

export default function HorizontalRow({ title = 'Recommended for you', items = [], loading = false, onPlay, onSeeAll }) {
  const scrollerRef = useRef(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const updateArrows = () => {
    const el = scrollerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanLeft(scrollLeft > 0);
    setCanRight(scrollLeft + clientWidth < scrollWidth - 1);
  };

  useEffect(() => {
    updateArrows();
    const el = scrollerRef.current;
    if (!el) return;
    const onScroll = () => updateArrows();
    el.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      el.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [items.length]);

  const scrollByAmount = (dir = 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = Math.max(200, Math.floor(el.clientWidth * 0.9));
    el.scrollBy({ left: dir * amount, behavior: 'smooth' });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      scrollByAmount(-1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      scrollByAmount(1);
    }
  };

  return (
    <section className="mt-10" tabIndex={0} onKeyDown={handleKeyDown}>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        {onSeeAll && (
          <button
            type="button"
            className="text-sm text-indigo-500 hover:underline"
            onClick={onSeeAll}
          >
            See all
          </button>
        )}
      </div>

      <div className="relative">
        {/* Left control */}
        <button
          type="button"
          aria-label="Scroll left"
          onClick={() => scrollByAmount(-1)}
          title="Previous"
          className={`absolute left-1 top-1/2 -translate-y-1/2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/80 to-fuchsia-500/80 text-white backdrop-blur-md shadow-lg transition-transform duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/40 border border-white/20 ${canLeft ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {/* Right control */}
        <button
          type="button"
          aria-label="Scroll right"
          onClick={() => scrollByAmount(1)}
          title="Next"
          className={`absolute right-1 top-1/2 -translate-y-1/2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/80 to-fuchsia-500/80 text-white backdrop-blur-md shadow-lg transition-transform duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/40 border border-white/20 ${canRight ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        <div ref={scrollerRef} className="overflow-x-auto overflow-y-hidden scroll-smooth no-scrollbar">
          <div className="flex gap-4 pr-6 snap-x snap-mandatory">
            {loading && (
              <div className="py-6 text-sm text-zinc-500">Loading…</div>
            )}
            {!loading && items.map((it) => (
              <div key={`${it.type}-${it.id}`} className="w-[180px] flex-none snap-start">
                <MovieCard item={it} onPlay={() => onPlay?.(it)} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
