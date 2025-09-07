import {useEffect, useMemo, useRef, useState} from "react";
import Hls from "hls.js";

export default function MultiServerPlayer({ type="movie", id, season, episode, usePuppeteer = false }) {
  const [servers, setServers] = useState([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const videoRef = useRef(null);
  const [showAd, setShowAd] = useState(false); // your optional overlay ad

  useEffect(() => {
    async function loadServers() {
      const q = new URLSearchParams();
      if (season) q.set("season", season);
      if (episode) q.set("episode", episode);
      if (usePuppeteer) q.set("puppeteer", "1");

      const res = await fetch(`/api/sources/${type}/${id}?${q.toString()}`);
      const data = await res.json();
      setServers(data.servers || []);
      setActiveIdx(0);
    }
    loadServers();
  }, [type, id, season, episode, usePuppeteer]);

  const activeServer = useMemo(() => servers[activeIdx], [servers, activeIdx]);

  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl || !activeServer) return;

    // Clear old <track> tags
    Array.from(videoEl.querySelectorAll("track")).forEach(t => t.remove());

    if (activeServer.subtitles && activeServer.subtitles.length) {
      activeServer.subtitles.forEach(sub => {
        const track = document.createElement("track");
        track.kind = "subtitles";
        track.label = sub.label || sub.lang || "Subtitles";
        track.srclang = sub.lang || "en";
        track.src = sub.url;
        videoEl.appendChild(track);
      });
    }

    // Load by type
    if (activeServer.type === "hls") {
      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(activeServer.url);
        hls.attachMedia(videoEl);
        return () => hls.destroy();
      } else if (videoEl.canPlayType("application/vnd.apple.mpegurl")) {
        videoEl.src = activeServer.url;
      } else {
        console.warn("HLS not supported by this browser");
      }
    } else if (activeServer.type === "mp4") {
      videoEl.src = activeServer.url;
    }

    // iframes (legal embeds you have permission for)
    // We handle below with a separate render path.

  }, [activeServer]);

  if (!activeServer) {
    return <div className="p-4 text-sm text-gray-400">Loading sources…</div>;
  }

  const ServerButtons = () => (
    <div className="flex flex-wrap gap-2 my-3">
      {servers.map((s, i) => (
        <button
          key={`${s.name}-${i}`}
          onClick={() => setActiveIdx(i)}
          className={`px-3 py-2 rounded-md text-sm border 
            ${i === activeIdx ? "bg-black text-white" : "bg-white text-black"}`}
          title={s.type.toUpperCase()}
        >
          {s.name}
        </button>
      ))}
      {/* Toggle your own ad overlay (example) */}
      <button
        onClick={() => setShowAd(v => !v)}
        className="px-3 py-2 rounded-md text-sm border bg-yellow-400"
      >
        {showAd ? "Hide Ad" : "Show Ad"}
      </button>
    </div>
  );

  // If the active server is iframe, render iframe instead of <video>
  if (activeServer.type === "iframe") {
    return (
      <div>
        <ServerButtons />
        <div className="relative w-full aspect-video">
          <iframe
            src={activeServer.url}
            className="w-full h-full rounded-lg"
            allowFullScreen
            frameBorder="0"
            sandbox="allow-same-origin allow-scripts allow-forms allow-downloads"
            allow="autoplay; encrypted-media; picture-in-picture"
            referrerPolicy="no-referrer"
            loading="lazy"
            title={activeServer.name}
          />
          {showAd && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
              <img src="/ads/your-ad.png" alt="Ad" className="max-h-40" />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Default <video> path (HLS/MP4)
  return (
    <div>
      <ServerButtons />
      <div className="relative w-full">
        <video
          ref={videoRef}
          controls
          playsInline
          className="w-full rounded-lg bg-black aspect-video"
        />
        {showAd && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <img src="/ads/your-ad.png" alt="Ad" className="max-h-40" />
          </div>
        )}
      </div>
    </div>
  );
}
