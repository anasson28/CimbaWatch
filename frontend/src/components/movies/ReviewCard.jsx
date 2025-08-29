import React from 'react';
import { Star } from 'lucide-react';

export default function ReviewCard({ review }) {
  return (
    <div className="bg-zinc-800/50 rounded-xl p-6 border border-zinc-700">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-fuchsia-500 rounded-full flex items-center justify-center text-white font-bold">
            {review.user[0]}
          </div>
          <div>
            <h4 className="font-semibold text-white">{review.user}</h4>
            <p className="text-zinc-400 text-sm">{review.date}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${
                i < review.rating
                  ? 'text-yellow-400 fill-current'
                  : 'text-zinc-600'
              }`}
            />
          ))}
          <span className="ml-2 text-yellow-400 font-semibold">
            {review.rating}/10
          </span>
        </div>
      </div>
      <p className="text-zinc-300">{review.comment}</p>
    </div>
  );
}
