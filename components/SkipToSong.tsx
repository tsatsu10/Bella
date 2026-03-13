"use client";

import { useState, useEffect } from "react";
import { play } from "@/lib/audio";

/**
 * Floating button: scroll to #song and optionally start playback. Shown when user has scrolled past hero.
 */
export function SkipToSong() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const hero = document.getElementById("hero");
      if (!hero) return;
      const rect = hero.getBoundingClientRect();
      setVisible(rect.bottom < 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <a
      href="#song"
      onClick={() => play()}
      className="fixed bottom-24 right-4 sm:right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-cream/10 border border-cream/20 backdrop-blur-md text-cream/90 text-sm tracking-wide hover:bg-cream/15 hover:border-cream/30 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-cream/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background min-h-[44px] mb-[env(safe-area-inset-bottom,0)]"
      aria-label="Jump to song and play"
    >
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path d="M8 5v14l11-7L8 5z" />
      </svg>
      Song
    </a>
  );
}
