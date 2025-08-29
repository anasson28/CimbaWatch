import React from 'react';

export default function CastCard({ person }) {
  return (
    <div className="group text-center">
      <div className="relative mb-3">
        <img
          src={person.image}
          alt={person.name}
          className="w-full h-48 object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <h4 className="font-semibold text-white">{person.name}</h4>
      <p className="text-zinc-400 text-sm">{person.character}</p>
    </div>
  );
}
