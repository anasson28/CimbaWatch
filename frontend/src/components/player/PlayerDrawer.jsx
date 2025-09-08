import { useEffect, useRef } from 'react';
import Video from './Video';

export default function PlayerDrawer({
  open = false,
  onClose,
  videoId,
  type = 'movie',
  season,
  episode,
  title,
  poster,
  backdrop,
}) {
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) {
      onClose?.();
    }
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
      aria-modal="true"
      role="dialog"
    >
      <div className="relative w-full max-w-5xl mx-auto p-4">
        <button
          onClick={onClose}
          aria-label="Close player"
          className="absolute -top-2 -right-2 bg-white/10 hover:bg-white/20 text-white rounded-full w-10 h-10 flex items-center justify-center"
        >
          ✕
        </button>

        {title ? (
          <div className="mb-3 text-white text-sm opacity-80">
            {title}
          </div>
        ) : null}

        <div className="aspect-video w-full bg-black rounded-lg overflow-hidden">
          <Video
            videoId={videoId}
            type={type}
            season={season}
            episode={episode}
            coverImage={backdrop || poster}
            title={title}
          />
        </div>
      </div>
    </div>
  );
}
