import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import Player from './Player';

export default function PlayerDrawer({ open, onClose, src, title }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/60" onClick={onClose} />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            className="absolute inset-x-0 bottom-0 max-h-[90vh] overflow-hidden rounded-t-3xl bg-white shadow-2xl dark:bg-zinc-950"
          >
            <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
              <div className="font-semibold line-clamp-1 pr-4">{title || 'Now Playing'}</div>
              <button onClick={onClose} className="text-sm rounded-xl border px-3 py-1.5 dark:border-zinc-700">Close</button>
            </div>
            <div className="p-4">
              {!src ? (
                <div className="flex items-center gap-2 text-zinc-500"><Loader2 className="h-4 w-4 animate-spin"/> Loading stream…</div>
              ) : (
                <Player src={src} />
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
