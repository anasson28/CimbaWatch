import React from 'react';

export default function PlayPulseButton() {
  return (
    <div className="relative h-20 w-20">
      {/* Soft pulsing rings */}
      <span className="absolute inset-0 rounded-full bg-indigo-500/30 animate-ping" />
      <span className="absolute inset-0 rounded-full bg-fuchsia-500/20 animate-ping [animation-delay:300ms]" />

      {/* Play button */}
      <button
        type="button"
        className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 to-fuchsia-500 text-white shadow-lg shadow-indigo-500/20 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-indigo-400/50"
      >
        <svg viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" width="26" className="drop-shadow">
          <path d="M424.4 214.7L72.4 6.6C43.8-10.3 0 6.1 0 47.9V464c0 37.5 40.7 60.1 72.4 41.3l352-208c31.4-18.5 31.5-64.1 0-82.6z" fill="currentColor" />
        </svg>
      </button>
    </div>
  );
}
