import React, { useState } from 'react';
import { motion } from 'framer-motion';
import PlayPulseButton from '../ui/playbt';

export default function Video({ videoId, type = "movie", season, episode, provider = 'vidapi', slug, coverImage, title }) {
  // Coerce unsupported providers per type
  // - Anime is supported only via 'vidapi' and '2embed'
  // - 123embed is movies-only (fallback to vidapi for others)
  const providerToUse = (() => {
    if (type === 'anime' && (provider === 'embed_su' || provider === '123embed' || provider === 'vidplus' || provider === 'autoembed')) return 'vidapi';
    if (type === 'tv' && provider === '123embed') return 'vidapi';
    return provider;
  })();

  const [unlocked, setUnlocked] = useState(false);
  const [imgError, setImgError] = useState(false);

  const params = new URLSearchParams();
  if (providerToUse) params.set('provider', providerToUse);
  if (type === 'tv' && season != null && episode != null) {
    params.set('s', season);
    params.set('e', episode);
  }
  if (type === 'anime' && episode != null) {
    params.set('e', episode);
  }
  const qs = params.toString();
  let src;
  if (type === 'movie') {
    src = `/proxy/embed/movie/${videoId}${qs ? `?${qs}` : ''}`;
  } else if (type === 'tv') {
    src = `/proxy/embed/tv/${videoId}${qs ? `?${qs}` : ''}`;
  } else if (type === 'anime') {
    const animeSlug = slug || videoId;
    src = `/proxy/embed/anime/${animeSlug}${qs ? `?${qs}` : ''}`;
  } else {
    src = '';
  }

  return (
    <div className="relative w-full h-full">
      {!unlocked && (
        <button
          type="button"
          onClick={() => setUnlocked(true)}
          className="group absolute inset-0 w-full h-full"
          aria-label="Play video"
        >
          {/* Cover image */}
          {coverImage && !imgError ? (
            <motion.img
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              src={coverImage}
              alt={title || 'Cover'}
              className="absolute inset-0 w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-zinc-900 via-zinc-800 to-black" />
          )}
          {/* Gradients */}
          <div className="absolute inset-0 bg-black/40" />
          <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-indigo-500/25 blur-3xl" />
          <div className="pointer-events-none absolute left-1/4 -bottom-14 h-56 w-56 rounded-full bg-fuchsia-500/20 blur-3xl" />
          {/* Ad label */}
          <div className="absolute top-2 left-2 text-[10px] px-2 py-1 rounded-md bg-black/50 text-white/80 tracking-wide">Advertisement</div>
          {/* Center play button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <PlayPulseButton />
          </div>
          {/* Title footer */}
          {title && (
            <div className="absolute bottom-0 left-0 right-0 p-4 text-left">
              <div className="text-white text-sm font-medium drop-shadow">{title}</div>
              <div className="text-white/70 text-xs">Click to play</div>
            </div>
          )}
        </button>
      )}

      {unlocked && (
        <iframe
          src={src}
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
          width="100%"
          height="100%"
          frameBorder="0"
          allowFullScreen
          title="Video player"
        ></iframe>
      )}
    </div>
  );
}
