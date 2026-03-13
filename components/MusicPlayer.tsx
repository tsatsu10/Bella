"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import {
  toggle,
  playTrack,
  subscribe,
  getPlaylist,
  getAudioElement,
  getVolume,
  setVolume,
  seek,
  nextTrack,
  prevTrack,
} from "@/lib/audio";

const WAVEFORM_BARS = 48;

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * Deck-style music player: deck panel (turntable + waveform + transport), volume, progress, playlist.
 * Respects prefers-reduced-motion. Real waveform via Web Audio API when available.
 */
export function MusicPlayer() {
  const [state, setState] = useState<{
    playing: boolean;
    currentIndex: number;
    currentTime: number;
    duration: number;
    error?: boolean;
  }>({
    playing: false,
    currentIndex: 0,
    currentTime: 0,
    duration: 0,
  });
  const [volume, setVolumeState] = useState(0.7);
  const [waveformHeights, setWaveformHeights] = useState<number[]>(Array(WAVEFORM_BARS).fill(8));
  const [reduceMotion, setReduceMotion] = useState(false);
  const [playlistReady, setPlaylistReady] = useState(false);
  const tracks = getPlaylist();
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setPlaylistReady(true), 400);
    return () => clearTimeout(t);
  }, []);
  const analyserRef = useRef<{ ctx: AudioContext; analyser: AnalyserNode; data: Uint8Array<ArrayBuffer> } | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const unsub = subscribe(setState);
    return () => unsub();
  }, []);

  useEffect(() => {
    setVolumeState(getVolume());
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const handler = () => setReduceMotion(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Real waveform: wire Web Audio when playing and element is available
  useEffect(() => {
    if (!state.playing) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      setWaveformHeights(Array(WAVEFORM_BARS).fill(8));
      return;
    }
    const el = getAudioElement();
    if (!el) return;
    try {
      let node = analyserRef.current;
      if (!node) {
        const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        const source = ctx.createMediaElementSource(el);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.7;
        source.connect(analyser);
        analyser.connect(ctx.destination);
        const binCount = analyser.frequencyBinCount;
        node = { ctx, analyser, data: new Uint8Array<ArrayBuffer>(new ArrayBuffer(binCount)) };
        analyserRef.current = node;
      }
      const { analyser, data } = node;
      const step = Math.floor(data.length / WAVEFORM_BARS);
      const update = () => {
        analyser.getByteFrequencyData(data);
        const next = Array.from({ length: WAVEFORM_BARS }, (_, i) => {
          const idx = Math.min(i * step, data.length - 1);
          const v = data[idx] ?? 0;
          return Math.max(6, 8 + (v / 255) * 24);
        });
        setWaveformHeights(next);
        rafRef.current = requestAnimationFrame(update);
      };
      rafRef.current = requestAnimationFrame(update);
      return () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
      };
    } catch {
      setWaveformHeights(Array(WAVEFORM_BARS).fill(8));
    }
  }, [state.playing]);

  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!progressRef.current || state.duration <= 0) return;
      const rect = progressRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      seek(x * state.duration);
    },
    [state.duration]
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === "Space") {
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const progress = state.duration > 0 ? state.currentTime / state.duration : 0;
  const useRealWaveform = state.playing && !reduceMotion;

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 max-w-5xl mx-auto w-full min-w-0 px-0 sm:px-0">
      <motion.div
        className="flex-1 min-w-0 rounded-2xl border border-white/[0.08] overflow-hidden relative"
        animate={
          reduceMotion || !state.playing
            ? {}
            : {
                boxShadow: [
                  "0 25px 80px -30px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03)",
                  "0 25px 80px -30px rgba(0,0,0,0.5), 0 0 40px -8px rgba(212,175,55,0.12)",
                  "0 25px 80px -30px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03)",
                ],
              }
        }
        transition={{ duration: 2, repeat: state.playing ? Infinity : 0, ease: "easeInOut" }}
        style={{
          background: "linear-gradient(180deg, #0d0d0d 0%, #0a0a0a 50%, #080808 100%)",
        }}
      >
        <div className="p-4 sm:p-6 md:p-8 relative">
          {state.error && (
            <div
              className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-amber-200/90 text-xs sm:text-sm"
              role="alert"
            >
              <strong className="font-medium">Track couldn’t be loaded.</strong>{" "}
              Add your song as <code className="bg-black/20 px-1 rounded">public/media/song.mp3</code> or add files to{" "}
              <code className="bg-black/20 px-1 rounded">public/media/playlist/</code>.
            </div>
          )}
          {/* Waveform strip — real (Web Audio) when playing, else animated placeholder; pulses when playing */}
          <motion.div
            className="flex items-center justify-center gap-0.5 h-10 sm:h-12 mb-4 sm:mb-6 rounded-lg bg-black/40 border border-white/[0.06] overflow-hidden min-w-0"
            animate={
              reduceMotion || !state.playing
                ? {}
                : {
                    borderColor: ["rgba(255,255,255,0.06)", "rgba(212,175,55,0.2)", "rgba(255,255,255,0.06)"],
                    boxShadow: [
                      "0 0 0 0 rgba(212,175,55,0)",
                      "0 0 12px 0 rgba(212,175,55,0.08)",
                      "0 0 0 0 rgba(212,175,55,0)",
                    ],
                  }
            }
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            {useRealWaveform
              ? waveformHeights.map((h, i) => (
                  <span
                    key={i}
                    className="w-1 rounded-full bg-cream/20 min-h-[4px] transition-all duration-75"
                    style={{ height: h }}
                  />
                ))
              : Array.from({ length: WAVEFORM_BARS }).map((_, i) => (
                  <motion.span
                    key={i}
                    className="w-1 rounded-full bg-cream/20 min-h-[4px]"
                    animate={
                      reduceMotion
                        ? {}
                        : { height: state.playing ? [8, 20, 12, 18, 8] : 8 }
                    }
                    transition={{
                      duration: 0.6,
                      repeat: state.playing ? Infinity : 0,
                      delay: i * 0.02,
                      ease: "easeInOut",
                    }}
                    style={{ height: reduceMotion ? 8 : undefined }}
                  />
                ))}
          </motion.div>

          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 md:gap-8">
            <motion.button
              type="button"
              onClick={toggle}
              className="relative flex-shrink-0 w-36 h-36 sm:w-44 sm:h-44 md:w-52 md:h-52 rounded-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-cream/50 focus-visible:ring-offset-4 focus-visible:ring-offset-[#0a0a0a]"
              aria-label={state.playing ? "Pause" : "Play"}
              animate={
                reduceMotion || !state.playing
                  ? {}
                  : {
                      scale: [1, 1.03, 1],
                      boxShadow: [
                        "0 0 0 0 rgba(212, 175, 55, 0)",
                        "0 0 32px 4px rgba(212, 175, 55, 0.15)",
                        "0 0 0 0 rgba(212, 175, 55, 0)",
                      ],
                    }
              }
              transition={{
                duration: 1.2,
                repeat: state.playing ? Infinity : 0,
                ease: "easeInOut",
              }}
            >
              {/* Vinyl disc */}
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-[#1a1a1a] bg-[#0c0c0c] shadow-[inset_0_0_50px_rgba(0,0,0,0.8),0_16px_48px_-12px_rgba(0,0,0,0.6)]"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 50% 50%, transparent 0%, transparent 38%, #0c0c0c 38.5%, #0c0c0c 100%)",
                }}
                animate={
                  reduceMotion ? {} : { rotate: state.playing ? 360 : 0 }
                }
                transition={{
                  rotate: {
                    duration: 3,
                    repeat: state.playing ? Infinity : 0,
                    ease: "linear",
                  },
                }}
              />
              {/* Center label: Belicia — glows and beats when playing */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <motion.div
                  className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full flex flex-col items-center justify-center overflow-hidden border-2 border-cream/20"
                  style={{
                    background: "radial-gradient(circle at 50% 50%, #141414 0%, #0a0a0a 70%, #080808 100%)",
                    boxShadow: "inset 0 0 20px rgba(0,0,0,0.6), 0 0 0 1px rgba(212,175,55,0.1)",
                  }}
                  animate={
                    reduceMotion || !state.playing
                      ? {}
                      : {
                          boxShadow: [
                            "inset 0 0 20px rgba(0,0,0,0.6), 0 0 0 1px rgba(212,175,55,0.1)",
                            "inset 0 0 24px rgba(212,175,55,0.08), 0 0 0 1px rgba(212,175,55,0.25)",
                            "inset 0 0 20px rgba(0,0,0,0.6), 0 0 0 1px rgba(212,175,55,0.1)",
                          ],
                        }
                  }
                  transition={{ duration: 1.2, repeat: state.playing ? Infinity : 0, ease: "easeInOut" }}
                >
                  <motion.span
                    className="font-display font-light text-cream tracking-tight leading-none text-[10px] sm:text-xs md:text-sm"
                    animate={
                      reduceMotion || !state.playing
                        ? {}
                        : {
                            opacity: [0.92, 1, 0.92],
                            textShadow: [
                              "0 0 10px rgba(212, 175, 55, 0.25)",
                              "0 0 20px rgba(212, 175, 55, 0.5)",
                              "0 0 10px rgba(212, 175, 55, 0.25)",
                            ],
                          }
                    }
                    transition={{
                      duration: 1,
                      repeat: state.playing ? Infinity : 0,
                      ease: "easeInOut",
                    }}
                  >
                    <span className="text-accent">B</span>elicia
                  </motion.span>
                  <span className="text-[8px] sm:text-[9px] md:text-[10px] text-cream/50 font-body tracking-widest uppercase mt-0.5">For you</span>
                  <div className="mt-1 sm:mt-1.5 flex items-center justify-center">
                    {state.playing ? (
                      <span className="flex gap-0.5">
                        <motion.span
                          className="w-0.5 sm:w-1 h-2 sm:h-3 bg-cream/80 rounded-full"
                          animate={reduceMotion ? {} : { height: [8, 14, 8], opacity: [0.8, 1, 0.8] }}
                          transition={{ duration: 0.4, repeat: Infinity, ease: "easeInOut", delay: 0 }}
                        />
                        <motion.span
                          className="w-0.5 sm:w-1 h-2.5 sm:h-3.5 bg-cream/80 rounded-full"
                          animate={reduceMotion ? {} : { height: [10, 16, 10], opacity: [0.8, 1, 0.8] }}
                          transition={{ duration: 0.4, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
                        />
                        <motion.span
                          className="w-0.5 sm:w-1 h-2 sm:h-3 bg-cream/80 rounded-full"
                          animate={reduceMotion ? {} : { height: [8, 14, 8], opacity: [0.8, 1, 0.8] }}
                          transition={{ duration: 0.4, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                        />
                      </span>
                    ) : (
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-cream/70 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7L8 5z" />
                      </svg>
                    )}
                  </div>
                </motion.div>
              </div>
            </motion.button>

            <div className="flex-1 flex flex-col items-center sm:items-start gap-4 min-w-0">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={prevTrack}
                  className="w-11 h-11 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 hover:border-cream/20 flex items-center justify-center text-cream/80 hover:text-cream transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-cream/40"
                  aria-label="Previous track"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 6h2v12H6V6zm3.5 6l8.5 6V6l-8.5 6z" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={toggle}
                  className="w-12 h-12 rounded-full border border-cream/20 bg-cream/10 hover:bg-cream/15 flex items-center justify-center text-cream cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-cream/40 lg:hidden"
                  aria-label={state.playing ? "Pause" : "Play"}
                >
                  {state.playing ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7L8 5z" />
                    </svg>
                  )}
                </button>
                <button
                  type="button"
                  onClick={nextTrack}
                  className="w-11 h-11 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 hover:border-cream/20 flex items-center justify-center text-cream/80 hover:text-cream transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-cream/40"
                  aria-label="Next track"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                  </svg>
                </button>
              </div>
              <p className="text-cream/90 text-sm font-medium tracking-wide truncate w-full text-center sm:text-left" title={tracks[state.currentIndex]?.label}>
                {tracks[state.currentIndex]?.label ?? "—"}
              </p>
              {/* Volume */}
              <div className="flex items-center gap-2 w-full max-w-[140px]">
                <svg className="w-4 h-4 text-cream/50 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                </svg>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={volume}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    setVolume(v);
                    setVolumeState(v);
                  }}
                  className="flex-1 h-1.5 rounded-full appearance-none bg-white/10 accent-cream/70 cursor-pointer"
                  aria-label="Volume"
                />
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div
              ref={progressRef}
              role="slider"
              aria-label="Seek"
              aria-valuemin={0}
              aria-valuemax={state.duration}
              aria-valuenow={state.currentTime}
              tabIndex={0}
              onClick={handleProgressClick}
              onKeyDown={(e) => {
                if (e.key === "ArrowLeft") {
                  e.preventDefault();
                  seek(Math.max(0, state.currentTime - 5));
                }
                if (e.key === "ArrowRight") {
                  e.preventDefault();
                  seek(Math.min(state.duration, state.currentTime + 5));
                }
              }}
              className="h-3 sm:h-2 rounded-full bg-white/10 cursor-pointer group hover:h-2.5 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-cream/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a] touch-manipulation"
            >
              <motion.div
                className="h-full rounded-full bg-cream/50 group-hover:bg-cream/70 transition-colors"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-[11px] text-cream/50 tracking-wide tabular-nums">
              <span>{formatTime(state.currentTime)}</span>
              <span>{formatTime(state.duration)}</span>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="w-full lg:w-72 flex-shrink-0 min-w-0 rounded-2xl border border-white/[0.08] overflow-hidden" style={{ background: "linear-gradient(180deg, #0c0c0c 0%, #0a0a0a 100%)" }}>
        <div className="p-4 border-b border-white/[0.06]">
          <p className="text-cream/50 text-[11px] tracking-[0.25em] uppercase">Playlist</p>
        </div>
        {!playlistReady ? (
          <ul className="max-h-56 sm:max-h-80 overflow-y-auto p-2 space-y-1" aria-label="Playlist loading">
            {[1, 2, 3].map((i) => (
              <li key={i} className="h-12 rounded-xl bg-white/5 animate-pulse" aria-hidden />
            ))}
          </ul>
        ) : (
        <ul className="max-h-56 sm:max-h-80 overflow-y-auto p-2" role="listbox" aria-label="Playlist">
          {tracks.map((track, i) => (
            <li key={track.src + i}>
              <button
                type="button"
                onClick={() => playTrack(i)}
                className={`w-full text-left px-3 py-3 sm:py-2.5 min-h-[48px] flex items-center rounded-xl border transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-cream/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a] ${
                  state.currentIndex === i
                    ? "bg-cream/10 border-cream/20 text-cream"
                    : "border-transparent text-cream/60 hover:bg-white/5 hover:text-cream/80 hover:border-white/10"
                }`}
                role="option"
                aria-selected={state.currentIndex === i}
              >
                <span className="flex items-center gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full border border-current/30 flex items-center justify-center text-[10px] font-medium">
                    {state.currentIndex === i && state.playing ? (
                      <span className="flex gap-0.5">
                        <span className="w-0.5 h-1.5 bg-current rounded-full animate-pulse" />
                        <span className="w-0.5 h-2 bg-current rounded-full animate-pulse" style={{ animationDelay: "100ms" }} />
                        <span className="w-0.5 h-1.5 bg-current rounded-full animate-pulse" style={{ animationDelay: "200ms" }} />
                      </span>
                    ) : (
                      i + 1
                    )}
                  </span>
                  <span className="text-sm tracking-wide truncate">{track.label}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
        )}
      </div>
    </div>
  );
}
