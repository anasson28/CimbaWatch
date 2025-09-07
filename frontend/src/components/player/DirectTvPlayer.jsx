import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

export default function DirectTvPlayer({ videoId, season, episode }) {
  const videoRef = useRef(null);
  const [streamUrl, setStreamUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let aborted = false;
    async function load() {
      try {
        setLoading(true);
        setError('');
        setStreamUrl('');
        const params = new URLSearchParams();
        if (season != null) params.set('season', season);
        if (episode != null) params.set('episode', episode);
        const res = await fetch(`/api/stream/tv/${videoId}?${params.toString()}`);
        const data = await res.json();
        if (aborted) return;
        if (!res.ok || !data?.stream_url) {
          throw new Error(data?.error || 'Failed to resolve stream');
        }
        setStreamUrl(data.stream_url);
      } catch (e) {
        if (!aborted) setError(e?.message || 'Failed to resolve stream');
      } finally {
        if (!aborted) setLoading(false);
      }
    }
    if (videoId) load();
    return () => { aborted = true; };
  }, [videoId, season, episode]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !streamUrl) return;

    if (el.canPlayType('application/vnd.apple.mpegurl')) {
      el.src = streamUrl;
      return;
    }

    if (Hls.isSupported()) {
      const hls = new Hls({ maxBufferLength: 30 });
      hls.loadSource(streamUrl);
      hls.attachMedia(el);
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data?.fatal) {
          setError('Playback error');
        }
      });
      return () => hls.destroy();
    }
  }, [streamUrl]);

  if (loading) {
    return (
      <div className="w-full h-full grid place-items-center text-zinc-400 text-sm">
        Resolving stream…
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full grid place-items-center text-red-500 text-sm">
        {error}
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      className="w-full h-full bg-black"
      controls
      playsInline
      crossOrigin="anonymous"
    />
  );
}
