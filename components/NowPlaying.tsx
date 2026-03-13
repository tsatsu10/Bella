"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toggle, subscribe, getPlaylist } from "@/lib/audio";

export function NowPlaying() {
  const [playing, setPlaying] = useState(false);
  const [label, setLabel] = useState("");

  useEffect(() => {
    const unsub = subscribe((state) => {
      setPlaying(state.playing);
      const list = getPlaylist();
      const idx = state.currentIndex;
      setLabel(list[idx]?.label ?? "");
    });
    return () => unsub();
  }, []);

  if (!playing) return null;

  return (
    <motion.div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-label={`Now playing: ${label}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="fixed left-3 right-3 sm:left-1/2 sm:right-auto sm:max-w-[calc(100vw-2rem)] sm:-translate-x-1/2 bottom-5 sm:bottom-6 z-50 flex items-center gap-2 sm:gap-3 px-3 py-2.5 sm:px-5 sm:py-3 rounded-full bg-cream/10 border border-cream/20 backdrop-blur-md mb-[env(safe-area-inset-bottom,0)] min-h-[48px]"
    >
      <span className="flex gap-0.5 sm:gap-1 flex-shrink-0">
        <span className="w-0.5 sm:w-1 h-2.5 sm:h-3 bg-cream/80 rounded-full animate-pulse" style={{ animationDelay: "0ms" }} />
        <span className="w-0.5 sm:w-1 h-3 sm:h-4 bg-cream/80 rounded-full animate-pulse" style={{ animationDelay: "150ms" }} />
        <span className="w-0.5 sm:w-1 h-2.5 sm:h-3 bg-cream/80 rounded-full animate-pulse" style={{ animationDelay: "300ms" }} />
      </span>
      <span className="text-cream/90 text-[11px] sm:text-xs tracking-wide truncate min-w-0 flex-1">
        {label}
      </span>
      <button
        type="button"
        onClick={toggle}
        className="min-w-[44px] min-h-[44px] flex-shrink-0 flex items-center justify-center text-cream/70 hover:text-cream text-[11px] sm:text-xs uppercase tracking-wider transition-colors cursor-pointer rounded-full -mr-1"
      >
        Pause
      </button>
    </motion.div>
  );
}
