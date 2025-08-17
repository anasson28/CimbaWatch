import React, { useEffect, useRef } from 'react';

export default function Player({ src }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (!src) return;
    const isHLS = src.endsWith('.m3u8');
    if (isHLS && typeof window !== 'undefined' && videoRef.current && !videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      import('hls.js').then(({ default: Hls }) => {
        if (Hls.isSupported()) {
          const hls = new Hls();
          hls.loadSource(src);
          hls.attachMedia(videoRef.current);
        }
      }).catch(() => {});
    }
  }, [src]);

  return (
    <div className="aspect-video w-full overflow-hidden rounded-2xl border border-zinc-200 bg-black dark:border-zinc-800">
      <video ref={videoRef} src={src} controls className="h-full w-full" preload="metadata" />
    </div>
  );
}
