import React from 'react';
import { motion } from 'framer-motion';
import MovieCard from './MovieCard';
import SkeletonCard from '../ui/SkeletonCard';

export default function MovieGrid({ items = [], loading = false, onPlay }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (!items?.length) {
    return (
      <div className="text-center py-16 text-zinc-500 dark:text-zinc-400">No results.</div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {items.map(item => (
        <motion.div key={`${item.type}-${item.id}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <MovieCard item={item} onPlay={() => onPlay?.(item)} />
        </motion.div>
      ))}
    </div>
  );
}
