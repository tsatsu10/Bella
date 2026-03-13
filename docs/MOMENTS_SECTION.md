# Moments Section — Reverse Engineering

This document describes how the **Moments** section works: data flow, layout, components, and behavior.

---

## 1. Overview

The Moments section is a **photo gallery** with:

- **Editorial grid**: One lead image (wide strip), then pairs and grid cells; every photo is used.
- **Per-card motion**: Parallax, Ken Burns (slow zoom/pan), hover effects.
- **Section-level motion**: Whole section has scroll-linked parallax, scale, and opacity.
- **Lightbox**: Full-screen viewer with prev/next, keyboard, focus trap.
- **Data**: Photos come from `GET /api/moments`; fallback from `content/media.ts` (and API fallback list when folders are empty).

---

## 2. Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  DATA SOURCES                                                    │
├─────────────────────────────────────────────────────────────────┤
│  1. GET /api/moments                                             │
│     • Reads public/media/moments/ (images only: jpg, png, etc.)   │
│     • If empty → reads public/media/photos/                      │
│     • If both empty → returns FALLBACK_PHOTOS (15 hardcoded URLs)│
│     • Returns { photos: { src, alt? }[] }                        │
│                                                                  │
│  2. content/media.ts — defaultPhotos                             │
│     • photos[] with 15 entries (src: /media/photos/photo_1_...)    │
│     • Used as initial state and when API returns empty or fails  │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│  MomentsSection (client component)                               │
│  • useState(photos) = defaultPhotos                              │
│  • useEffect: fetch /api/moments                                 │
│    - If data.photos.length > 0  → setPhotos(data.photos)          │
│    - Else                        → setPhotos(defaultPhotos)     │
│    - On catch                    → setPhotos(defaultPhotos)     │
│  • photosLoading: true until fetch finally()                     │
└─────────────────────────────────────────────────────────────────┘
```

**Hero** also uses moments data: `HeroSection` fetches `/api/moments` and sets the hero image to `data.photos[0].src` when available; otherwise it uses `heroImageSrc` from `content/media.ts`.

---

## 3. Layout Algorithm: `buildLayout(count)`

The grid uses **every photo** in a fixed editorial pattern. No masonry; each slot has a defined aspect ratio and span.

| Slot (idx) | Photo index | Grid class | Aspect ratio |
|------------|-------------|------------|--------------|
| 0 | 0 | `col-span-full` | 21/9 (mobile), 3/1 (md+) — lead strip |
| 1 | 1 | `md:col-span-1` | 4/5 |
| 2 | 2 | `md:col-span-1` | 4/5 |
| 3 | 3 | — | 3/4 |
| 4 | 4 | — | 3/4 |
| 5 | 5 | — | 3/4 |
| 6 | 6 | `md:col-span-2` | 2/1 — wide |
| 7+ | 7, 8, … | — | 3/4 |

- **Grid**: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` with `gap-4 sm:gap-5 md:gap-7`.
- **Layout array**: `buildLayout(photos.length)` returns `{ i, className }[]` so each DOM cell maps to `photos[i]` and gets the right Tailwind classes.

---

## 4. Component Structure

```
MomentsSection (motion.section)
├── Section header
│   ├── "For Belicia" (small label)
│   ├── "Moments" (h2)
│   └── Accent line (span)
│
├── Content (one of three)
│   ├── Loading: 6 skeleton placeholders (same grid)
│   ├── Empty: message + code blocks (moments/ or photos/)
│   └── Grid: motion.div (stagger parent)
│       └── For each layout item: motion.div (className = layout class)
│           └── MomentCard(photo, index, layoutIndex, …)
│
├── Gradient bridge (absolute bottom) → next section
│
└── Lightbox (AnimatePresence)
    └── When lightboxIndex !== null: modal with close, prev, image, next, counter
```

---

## 5. MomentCard (per photo)

**Responsibilities**: One clickable card with image, parallax, Ken Burns, hover overlay.

- **Click**: Invisible `button` (absolute inset, z-10) calls `onOpen()` and `onFocusCapture()` so parent can set `lightboxIndex` and store focus for return.
- **Layers** (stacked, all absolute inset):
  1. Border + shadow (stronger on hover).
  2. Gradient overlay (bottom, visible on hover).
  3. Caption (photo.alt or "Moment N", visible on hover).
  4. **Image**: Next.js `Image` with `fill`, `quality={95}`, `sizes` from parent (lead vs wide vs normal). Wrapped in a `motion.div` for Ken Burns.

**Motion (Framer Motion, disabled when `reduceMotion`)**:

- **Parallax**: `useScroll({ target: cardRef, offset: ["start end","end start"] })` → `scrollYProgress`.  
  `parallaxY = useTransform(scrollYProgress, [0, 0.5, 1], [12 - layoutIndex*2, 0, -12 + layoutIndex*2])` applied to card root so cards move at different speeds.
- **Ken Burns**: Same scroll progress → `kenBurnsScale` (1 → 1.06), `kenBurnsX` (0 → 2), `kenBurnsY` (0 → 1) on the image wrapper when `isInView` (useInView, once, 20%).
- **Hover**: CSS `group-hover:scale-105` on image; border and shadow transition 500ms.

**Image `sizes`** (chosen by parent):

- Lead (idx 0): `"100vw"`.
- Wide (col-span-2 or full): `"(max-width: 768px) 100vw, 66vw"`.
- Normal: `"(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"`.

---

## 6. Section-Level Motion

- **Scroll target**: `ref` on the section.
- **Offsets**: `["start end", "end start"]` so progress 0 = section top at viewport bottom, 1 = section bottom at viewport top.
- **Transforms** (on `motion.section`):
  - `sectionY`: [0, 0.15, 0.85, 1] → [24, 0, 0, -24] (vertical drift).
  - `sectionScale`: [0, 0.2] → [0.98, 1] (slight zoom in as section enters).
  - `sectionOpacity`: [0, 0.12] → [0.6, 1] (fade in).
- All disabled when `prefers-reduced-motion: reduce`.

---

## 7. Grid Reveal (stagger)

- Parent: `motion.div` with `initial="hidden"`, `animate={isInView ? "visible" : "hidden"}`.
- Variants: `visible` has `staggerChildren: 0.08`, `delayChildren: 0.15`.
- Each child `motion.div`:  
  `hidden`: opacity 0, y 56, blur(8px).  
  `visible`: opacity 1, y 0, blur(0), duration 0.85, easing.
- `isInView`: section ref, `once: true`, `amount: 0.06`.

---

## 8. Lightbox

- **Open**: User clicks a card → `previousFocusRef.current = document.activeElement`, `setLightboxIndex(i)`.
- **Close**: Close button or backdrop click → `setLightboxIndex(null)`, then `previousFocusRef.current?.focus()`.
- **Keyboard**: Global listener — Escape closes and restores focus; Left/Right call `goPrev()` / `goNext()` (wrap around).
- **Focus**: When lightbox opens, effect focuses `closeButtonRef`. Tab is trapped inside the modal (onKeyDown finds first/last focusable and prevents leaving).
- **Content**: One large `Image` (quality 95, object-contain), counter "index / total" and optional alt. Prev/Next buttons; all buttons have min 44px touch targets and safe-area where needed.
- **AnimatePresence**: Modal and inner image animate in/out; `key={lightboxIndex}` on image container so switching photo animates.

---

## 9. API: GET /api/moments (app/api/moments/route.ts)

1. Try `readdir(MOMENTS_DIR)`; filter to image extensions; if any files → `toPhotos(files, "/media/moments")`.
2. If none, try `readdir(PHOTOS_DIR)`; if any images → `toPhotos(files, "/media/photos")`.
3. If still none → `photos = FALLBACK_PHOTOS` (same 15 URLs as in content/media).
4. On any outer catch → return `{ photos: FALLBACK_PHOTOS }`.
5. Response: `{ photos }` with `Cache-Control: public, s-maxage=60, stale-while-revalidate=120`.
6. `toPhotos`: filter by extension, map to `{ src: urlPrefix/encodeURIComponent(name), alt: baseName }`, sort by alt.

---

## 10. File / URL Summary

| Role | Location |
|------|----------|
| Section component | `components/sections/MomentsSection.tsx` |
| API route | `app/api/moments/route.ts` |
| Default/fallback list | `content/media.ts` (photos) + FALLBACK_PHOTOS in API |
| Image files (optional) | `public/media/moments/` or `public/media/photos/` |
| Served URLs | `/media/moments/...` or `/media/photos/...` |

---

## 11. Dependencies

- **Framer Motion**: useScroll, useTransform, useInView, motion, AnimatePresence.
- **Next.js**: Image (from `next/image`).
- **Content**: `photos as defaultPhotos` from `@/content/media`.

---

## 12. Accessibility

- Cards: button with `aria-label` (View + alt or "moment N").
- Lightbox: `aria-modal="true"`, `role="dialog"`, `aria-label="Image gallery"`.
- Close/prev/next: `aria-label`; focus moved to close on open; focus restored on close; Tab trapped in modal.
- Reduced motion: section/card motion and Ken Burns disabled when `prefers-reduced-motion: reduce`.

This is the full reverse-engineered behavior of the Moments section.
