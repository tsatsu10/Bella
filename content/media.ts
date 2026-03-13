/**
 * Media config for the birthday site.
 *
 * FALLBACKS: The app prefers folder-driven content when available:
 * - Moments: GET /api/moments uses public/media/moments/. The `photos` array below is used only when the API returns no images.
 * - Playlist: GET /api/playlist uses public/media/playlist/. The `playlist` array below is used only when the API returns no tracks.
 * - Videos: GET /api/videos uses public/media/videos/. The `videos` array below is used only when the API returns no videos.
 *
 * Hero image: Uses first image from moments API when available, else `heroImageSrc` below.
 * OG/share image: Prefer public/media/og.jpg for social cards; see layout.tsx and README.
 */

/** Photos in public/media/photos/ — used when API returns empty or as fallback. Kept in sync with that folder. */
const PHOTOS_BASENAMES = [
  "photo_1_2026-03-13_01-03-42.jpg",
  "photo_2_2026-03-13_01-03-42.jpg",
  "photo_3_2026-03-13_01-03-42.jpg",
  "photo_4_2026-03-13_01-03-42.jpg",
  "photo_5_2026-03-13_01-03-42.jpg",
  "photo_6_2026-03-13_01-03-42.jpg",
  "photo_7_2026-03-13_01-03-42.jpg",
  "photo_8_2026-03-13_01-03-42.jpg",
  "photo_9_2026-03-13_01-03-42.jpg",
  "photo_10_2026-03-13_01-03-42.jpg",
  "photo_11_2026-03-13_01-03-42.jpg",
  "photo_12_2026-03-13_01-03-42.jpg",
  "photo_13_2026-03-13_01-03-42.jpg",
  "photo_14_2026-03-13_01-03-42.jpg",
  "photo_15_2026-03-13_01-03-42.jpg",
];

export const MOMENTS_FALLBACK_PHOTOS: { src: string; alt?: string }[] = PHOTOS_BASENAMES.map((name) => {
  const base = name.replace(/\.[^.]+$/, "").replace(/_/g, " ");
  return { src: `/media/photos/${name}`, alt: base };
});

/** Default photos for Moments (and hero). API prefers public/media/moments then public/media/photos; this is fallback. */
export const photos: { src: string; alt?: string }[] = [...MOMENTS_FALLBACK_PHOTOS];

export const videos: { src: string; poster?: string; label?: string }[] = [
  { src: "/media/videos/17A25531-7B0B-4F61-85A4-E153B6EFF126.MP4" },
  { src: "/media/videos/39F339DD-68CE-4349-83FE-3744727455F6.MP4" },
  { src: "/media/videos/IMG_0022.MOV" },
  { src: "/media/videos/IMG_0023.MOV" },
  { src: "/media/videos/IMG_0024.MOV" },
];

/** Hero: first photo as full-bleed hero background (or override with a dedicated hero image path) */
export const heroImageSrc = photos[0]?.src ?? "/media/photos/photo_1_2026-03-13_01-03-42.jpg";

/** Default song path — file must exist at public/media/song.mp3, or use public/media/playlist/ and the API will list tracks. */
export const songSrc = "/media/song.mp3";
export const songLabel = "Can I Call You Rose — Thee Sacred Souls";

/** Playlist for the music player (disc + sidebar). Add more tracks here to extend the list. */
export const playlist: { src: string; label: string }[] = [
  { src: songSrc, label: songLabel },
];

export const messageLines = [
  "Beautiful soul, you deserve love and favour, every blessing this life has to offer. Today we celebrate you — all that you are, the warmth you bring, the light, the heart.",
  "It's all going to get better, trust in the Lord; His plans for you are greater than you know. This new year of your life is an open door — more joy, more peace, more than before.",
  "Your family loves you — deeply, truly. Your friends love you — they're grateful for you daily. And from me, hear this and hold it close: you mean the world to me — more than most.",
  "So step into this birthday with hope in your heart, knowing the best chapters are yet to start. Happiness is chasing you, favour is near — this is your season, welcome your year.",
  "Happy Birthday, beautiful soul. The world is better because you're in it.",
];

/** Optional: show “Since YYYY” or “From YYYY” in the message or closing. Set to undefined to hide. */
export const sinceDate: string | undefined = undefined;
