import React from 'react';
import { motion } from 'framer-motion';
import { Play, ChevronRight, Star, Download } from 'lucide-react';
import Button from '../ui/Button';
import { useNavigate } from 'react-router-dom';

export default function HeroSection({ featured, onPlay, image, disableBackdrop = false }) {
  const navigate = useNavigate();
  const targetPath = featured ? (featured.type === 'series' ? `/series/${featured.id}` : `/movie/${featured.id}`) : null;
  return (
    <div className="relative overflow-hidden rounded-3xl">
      {/* Backdrop */}
      <div className="absolute inset-0">
        {(image ?? featured?.backdrop) && !disableBackdrop ? (
          <motion.img
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            src={image ?? featured?.backdrop}
            alt={featured?.title ?? 'Backdrop'}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-zinc-200 via-zinc-100 to-white dark:from-zinc-900 dark:via-zinc-950 dark:to-black" />
        )}
        {/* Cinematic overlays */}
        <div className="absolute inset-0 bg-gradient-to-tr from-black/70 via-black/30 to-transparent" />
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-indigo-500/25 blur-3xl" />
        <div className="pointer-events-none absolute left-1/4 -bottom-20 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative p-6 sm:p-10 min-h-[26rem] flex items-end">
        {/* Left: Text & CTAs */}
        <div className="max-w-2xl text-white drop-shadow">
          <div className="flex flex-wrap gap-2 text-xs">
            {(featured?.genres ?? ['Action', 'Adventure']).slice(0, 3).map((g) => (
              <span
                key={g}
                className="rounded-full border border-white/20 bg-white/10 px-3 py-1 backdrop-blur"
              >
                {g}
              </span>
            ))}
          </div>

          <motion.h1
            layout
            className="mt-3 text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight tracking-tight"
          >
            {featured?.title ?? 'Watch the latest & greatest'}
          </motion.h1>
          <p className="mt-3 max-w-prose text-zinc-200">
            {featured?.overview ??
              'Fresh picks, trending titles, and binge-worthy series—stream instantly in HD.'}
          </p>

          <div className="mt-6 flex items-center gap-3">
            <Button
              onClick={() => targetPath && navigate(targetPath)}
              className="gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-indigo-400/50"
            >
              <Play className="h-4 w-4" /> Play
            </Button>
            <Button
              onClick={() => targetPath && navigate(targetPath)}
              className="gap-2 rounded-2xl border border-white/20 bg-white/10 text-white backdrop-blur hover:bg-white/20"
            >
              <Download className="h-4 w-4" /> Download
            </Button>
            <button
              type="button"
              onClick={() => targetPath && navigate(targetPath)}
              className="inline-flex items-center gap-1 rounded-2xl px-3 py-2 text-sm text-white/90 hover:text-white"
            >
              More <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-6 flex items-center gap-3 text-sm text-zinc-100/90">
            {featured?.rating && (
              <span className="inline-flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400/40" /> {featured.rating}
              </span>
            )}
            {featured?.year && <span>• {featured.year}</span>}
            {(featured?.genres ?? ['Action', 'Adventure']).length > 0 && (
              <span>
                • {(featured?.genres ?? ['Action', 'Adventure']).slice(0, 3).join(', ')}
              </span>
            )}
          </div>
        </div>

        
      </div>
    </div>
  );
}

