/**
 * Global audio API for the birthday site — avoids React context so SSR/build works.
 * Supports playlist, progress, seek, volume (persisted), and next/prev for a deck-style music UI.
 */

const VOLUME_KEY = "belle-volume";

export type Track = { src: string; label: string };

export type AudioState = {
  playing: boolean;
  currentIndex: number;
  currentTime: number;
  duration: number;
  /** True when the current track failed to load (e.g. 404). */
  error: boolean;
};

type Listener = (state: AudioState) => void;

let audioEl: HTMLAudioElement | null = null;
let playlist: Track[] = [];
let currentIndex = 0;
let playing = false;
let currentTime = 0;
let duration = 0;
let loadError = false;
let lastLoadedSrc: string | null = null;
const listeners = new Set<Listener>();

function loadVolume(): number {
  if (typeof window === "undefined") return 0.7;
  try {
    const v = parseFloat(localStorage.getItem(VOLUME_KEY) ?? "0.7");
    return Number.isFinite(v) ? Math.max(0, Math.min(1, v)) : 0.7;
  } catch {
    return 0.7;
  }
}

function getState(): AudioState {
  return { playing, currentIndex, currentTime, duration, error: loadError };
}

function notify() {
  const state = getState();
  listeners.forEach((fn) => fn(state));
}

function setTrackSource() {
  loadError = false;
  const track = playlist[currentIndex];
  if (audioEl && track) {
    lastLoadedSrc = track.src;
    audioEl.src = track.src;
    audioEl.load();
  }
}

export function setPlaylist(tracks: Track[]) {
  playlist = tracks.length ? tracks : [];
  currentIndex = 0;
  currentTime = 0;
  duration = 0;
  playing = false;
  setTrackSource();
  notify();
}

export function getPlaylist(): Track[] {
  return [...playlist];
}

export function getCurrentIndex(): number {
  return currentIndex;
}

export function getAudioElement(): HTMLAudioElement | null {
  return audioEl;
}

export function getVolume(): number {
  return audioEl ? audioEl.volume : loadVolume();
}

export function setVolume(value: number) {
  const v = Math.max(0, Math.min(1, value));
  if (audioEl) audioEl.volume = v;
  try {
    localStorage.setItem(VOLUME_KEY, String(v));
  } catch {
    /* ignore */
  }
}

export function registerAudio(el: HTMLAudioElement, initialPlaylist: Track[]) {
  audioEl = el;
  lastLoadedSrc = null;
  el.volume = loadVolume();
  playlist = initialPlaylist.length ? initialPlaylist : [];
  currentIndex = 0;
  if (playlist[0]) {
    lastLoadedSrc = playlist[0].src;
    el.src = playlist[0].src;
    el.load();
  }
  el.addEventListener("play", () => {
    playing = true;
    notify();
  });
  el.addEventListener("pause", () => {
    playing = false;
    notify();
  });
  el.addEventListener("ended", () => {
    playing = false;
    if (playlist.length > 1) {
      const next = (currentIndex + 1) % playlist.length;
      currentIndex = next;
      currentTime = 0;
      setTrackSource();
      el.play().catch(() => {});
      playing = true;
    }
    notify();
  });
  el.addEventListener("timeupdate", () => {
    currentTime = el.currentTime;
    notify();
  });
  el.addEventListener("durationchange", () => {
    duration = Number.isFinite(el.duration) ? el.duration : 0;
    notify();
  });
  el.addEventListener("loadedmetadata", () => {
    loadError = false;
    duration = Number.isFinite(el.duration) ? el.duration : 0;
    notify();
  });
  el.addEventListener("error", () => {
    playing = false;
    loadError = true;
    if (playlist.length > 1) {
      const next = (currentIndex + 1) % playlist.length;
      currentIndex = next;
      currentTime = 0;
      setTrackSource();
      el.play().catch(() => {});
    }
    notify();
  });
}

export function unregisterAudio() {
  audioEl = null;
  playlist = [];
  currentIndex = 0;
  playing = false;
  currentTime = 0;
  duration = 0;
  loadError = false;
  lastLoadedSrc = null;
  listeners.clear();
}

export function play() {
  if (!audioEl || !playlist[currentIndex]) return;
  const track = playlist[currentIndex];
  if (lastLoadedSrc !== track.src || loadError) {
    loadError = false;
    lastLoadedSrc = track.src;
    audioEl.src = track.src;
    audioEl.load();
  }
  audioEl.play().catch(() => {});
}

export function pause() {
  audioEl?.pause();
}

export function toggle() {
  if (playing) pause();
  else play();
}

export function seek(seconds: number) {
  if (!audioEl) return;
  const t = Math.max(0, Math.min(seconds, duration || 0));
  audioEl.currentTime = t;
  currentTime = t;
  notify();
}

export function playTrack(index: number) {
  if (index < 0 || index >= playlist.length) return;
  currentIndex = index;
  currentTime = 0;
  setTrackSource();
  audioEl?.play().catch(() => {});
  notify();
}

export function nextTrack() {
  if (playlist.length === 0) return;
  const next = (currentIndex + 1) % playlist.length;
  playTrack(next);
}

export function prevTrack() {
  if (playlist.length === 0) return;
  if (currentTime > 2) {
    seek(0);
    notify();
    return;
  }
  const prev = currentIndex - 1 < 0 ? playlist.length - 1 : currentIndex - 1;
  playTrack(prev);
}

export function getPlaying() {
  return playing;
}

export function getCurrentTime() {
  return currentTime;
}

export function getDuration() {
  return duration;
}

export function subscribe(fn: Listener): () => void {
  listeners.add(fn);
  fn(getState());
  return () => {
    listeners.delete(fn);
  };
}
