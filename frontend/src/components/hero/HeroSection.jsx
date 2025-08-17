import React from 'react';
import { motion } from 'framer-motion';
import { Play, ChevronRight, Star } from 'lucide-react';
import Button from '../ui/Button';

export default function HeroSection({ featured, onPlay }) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-200 via-zinc-100 to-white dark:from-zinc-900 dark:via-zinc-950 dark:to-black">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="p-6 sm:p-10">
          <motion.h1 layout className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight">
            Watch the latest & greatest.
          </motion.h1>
          <p className="mt-3 text-zinc-600 dark:text-zinc-300 max-w-prose">
            Fresh picks, trending titles, and binge-worthy series—stream instantly in HD. No sign-up required.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <Button onClick={onPlay} className="gap-2 rounded-2xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
              <Play className="h-4 w-4"/> Play Featured
            </Button>
            <a href="#" className="inline-flex items-center gap-1 rounded-2xl border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800">
              Explore Catalog <ChevronRight className="h-4 w-4"/>
            </a>
          </div>
          {featured ? (
            <div className="mt-6 flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-300">
              <span className="inline-flex items-center gap-1"><Star className="h-4 w-4"/> {featured.rating}</span>
              <span>• {featured.year}</span>
              <span>• {featured.genres?.slice(0,3).join(', ')}</span>
            </div>
          ) : (
            <div className="mt-6 h-6 w-48 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          )}
        </div>
        <div className="relative aspect-video md:aspect-auto md:h-full">
          <div className="absolute inset-0 p-3 sm:p-6">
            {featured ? (
              <motion.img
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                src={featured.backdrop}
                alt={featured.title}
                className="h-full w-full rounded-2xl object-cover"
              />
            ) : (
              <div className="h-full w-full rounded-2xl bg-zinc-200 dark:bg-zinc-800 animate-pulse"/>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
