"use client";

import { useEffect, useRef } from "react";
import { playlist as defaultPlaylist } from "@/content/media";
import { registerAudio, unregisterAudio, play, setPlaylist } from "@/lib/audio";

/**
 * Renders the global audio element. Playlist is loaded from the API (folder public/media/playlist/);
 * if that folder is empty or the API fails, the default playlist from content/media is used.
 */
export function AudioProvider({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Register immediately with default so play() works before fetch completes
    registerAudio(el, defaultPlaylist);
    el.play().catch(() => {});

    const onInteraction = () => {
      play();
      document.removeEventListener("click", onInteraction);
      document.removeEventListener("touchstart", onInteraction);
    };
    document.addEventListener("click", onInteraction, { once: true });
    document.addEventListener("touchstart", onInteraction, { once: true });

    // Fetch folder-based playlist and replace if we get any tracks
    fetch("/api/playlist")
      .then((res) => res.json())
      .then((data: { tracks: { src: string; label: string }[] }) => {
        if (Array.isArray(data.tracks) && data.tracks.length > 0) {
          setPlaylist(data.tracks);
        }
      })
      .catch(() => {});

    return () => unregisterAudio();
  }, []);

  return (
    <>
      <audio ref={ref} preload="auto" />
      {children}
    </>
  );
}
