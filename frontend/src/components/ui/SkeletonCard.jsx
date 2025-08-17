import React from 'react';

export default function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:bg-zinc-900 dark:border-zinc-800">
      <div className="aspect-[2/3] animate-pulse bg-zinc-200 dark:bg-zinc-800" />
      <div className="p-3">
        <div className="h-4 w-3/4 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
      </div>
    </div>
  );
}
