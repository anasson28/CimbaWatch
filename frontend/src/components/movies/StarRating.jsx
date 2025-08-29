import React from 'react';
import { Star } from 'lucide-react';

export default function StarRating({ rating, onRate, interactive = false, size = 'md' }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => interactive && onRate?.(star)}
          className={`${interactive ? 'group cursor-pointer' : 'cursor-default'}`}
          disabled={!interactive}
        >
          <Star
            className={`${sizeClasses[size]} transition-colors ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : interactive
                ? 'text-zinc-500 group-hover:text-yellow-400'
                : 'text-zinc-600'
            }`}
          />
        </button>
      ))}
    </div>
  );
}
