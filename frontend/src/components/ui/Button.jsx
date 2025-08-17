import React from 'react';

export default function Button({ className = '', children, ...props }) {
  return (
    <button
      {...props}
      className={
        'inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm shadow-sm transition ' +
        className
      }
    >
      {children}
    </button>
  );
}
