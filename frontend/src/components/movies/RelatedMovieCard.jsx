import React from 'react';
import { Play, Star } from 'lucide-react';

export default function RelatedMovieCard({ movie, onPlay }) {
  return (
    <div className="group cursor-pointer" onClick={() => onPlay?.(movie)}>
      <div className="relative mb-3">
        <img
          src={movie.poster}
          alt={movie.title}
          className="w-full h-80 object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={(e) => { e.stopPropagation(); onPlay?.(movie); }}
            className="w-full bg-white/20 backdrop-blur-md rounded-lg py-2 text-white font-semibold hover:bg-white/30 transition-colors"
          >
            <Play className="h-4 w-4 inline mr-2" />
            Play
          </button>
        </div>
      </div>
      <h4 className="font-semibold text-white group-hover:text-indigo-400 transition-colors">
        {movie.title}
      </h4>
      <div className="flex items-center gap-1 mt-1">
        <Star className="h-4 w-4 text-yellow-400 fill-current" />
        <span className="text-zinc-400 text-sm">{movie.rating}</span>
      </div>
    </div>
  );
}
