import { useEffect, useRef } from "react";
import Hls from "hls.js";

export default function Video({ videoId, type = "movie", season, episode }) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);

  useEffect(() => {
    const controller = new AbortController();

    const pickUrl = (s) => s?.file || s?.url || s?.src || "";
    const pickType = (s) => (s?.type || "").toLowerCase();
    const isM3U8 = (u, t) => t === "hls" || t === "m3u8" || (typeof u === "string" && u.endsWith(".m3u8"));
    const isMP4 = (u, t) => t === "mp4" || (typeof u === "string" && u.endsWith(".mp4"));

    const clearTracks = (videoEl) => {
      const tracks = videoEl?.querySelectorAll('track');
      tracks?.forEach(t => t.remove());
    };

    const destroyHls = () => {
      if (hlsRef.current) {
        try { hlsRef.current.destroy(); } catch (_) { /* noop */ }
        hlsRef.current = null;
      }
    };

    async function loadStream() {
      try {
        const params = new URLSearchParams();
        params.append("type", type);
        if (season) params.append("season", season);
        if (episode) params.append("episode", episode);

        const res = await fetch(`/api/stream/${videoId}?${params.toString()}`, { signal: controller.signal });
        if (!res.ok) {
          console.error("Failed to fetch stream", res.status);
          return;
        }
        const data = await res.json();

        const sources = Array.isArray(data?.sources) ? data.sources : [];
        if (!sources.length) return;

        // Prefer HLS, then MP4
        let chosen = sources.find(s => isM3U8(pickUrl(s), pickType(s)))
          || sources.find(s => isMP4(pickUrl(s), pickType(s)))
          || sources[0];

        const url = pickUrl(chosen);
        if (!url) return;

        const videoEl = videoRef.current;
        if (!videoEl) return;

        // Reset previous state
        destroyHls();
        clearTracks(videoEl);

        if (Hls.isSupported() && isM3U8(url, pickType(chosen))) {
          const hls = new Hls();
          hlsRef.current = hls;
          hls.loadSource(url);
          hls.attachMedia(videoEl);
        } else {
          videoEl.src = url;
        }

        // Add subtitles
        const subs = Array.isArray(data?.subtitles) ? data.subtitles : [];
        subs.forEach((sub, idx) => {
          const track = document.createElement("track");
          track.kind = "subtitles";
          const label = sub?.lang || sub?.language || sub?.label || `sub-${idx+1}`;
          track.label = label;
          track.srclang = (sub?.lang || sub?.language || label || "").toString().slice(0, 5);
          track.src = sub?.url || sub?.file || "";
          if (track.src) videoEl.appendChild(track);
        });
      } catch (err) {
        if (err?.name !== 'AbortError') {
          console.error('Error loading stream', err);
        }
      }
    }

    loadStream();

    return () => {
      controller.abort();
      destroyHls();
    };
  }, [videoId, type, season, episode]);

  return (
    <video
      ref={videoRef}
      controls
      crossOrigin="anonymous"
      className="w-full rounded-lg shadow-lg"
    />
  );
}
