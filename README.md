# Belle — Birthday Website

A one-page birthday site with an art-agency feel: hero image, scroll animations (Framer Motion), and sections for moments (photos), videos, a message, and a song with deck-style player.

## Stack

- **Next.js 15** (App Router), **TypeScript**, **Tailwind CSS**
- **Framer Motion** for animations
- **Lenis** for smooth scroll (when reduced motion is not preferred)

## Setup

```bash
npm install --legacy-peer-deps
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Media (folder-driven)

Content is loaded from folders when available; `content/media.ts` is used as fallback when APIs return empty.

- **Moments (photos)**: Add images to `public/media/moments/`. Supported: `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`. The first image is also used as the hero background when the moments API returns data.
- **Videos**: Add files to `public/media/videos/`. Supported: `.mp4`, `.webm`, `.mov`, `.m4v`.
- **Playlist**: Add audio files to `public/media/playlist/`. Supported: `.mp3`, `.m4a`, `.ogg`, `.wav`, `.aac`.

**Share image & PWA**: Add `public/media/og.jpg` (1200×630 recommended) for Open Graph / Twitter cards and PWA icon. The app uses `/media/og.jpg` in metadata and `public/manifest.json`.

## Build

```bash
npm run build
npm start
```

## Production (SEO, security, reliability)

- **Security headers** (middleware): `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`.
- **SEO**: Dynamic `robots.txt` and `sitemap.xml` when `NEXT_PUBLIC_SITE_URL` is set; canonical URL and JSON-LD `WebSite` in layout; theme-color and manifest for PWA.
- **Error handling**: Root `error.tsx` (try again + link home); styled 404 with safe-area and focus-visible.
- **Accessibility**: Global `:focus-visible` ring (accent); skip link; focus trap in lightbox; reduced-motion respected.

Set `NEXT_PUBLIC_SITE_URL` in production so Open Graph, canonical, and sitemap use the correct domain.

## Accessibility

- Respects `prefers-reduced-motion`: scroll-linked motion and Lenis are disabled when preferred; animations are shortened.
- Skip link (“Skip to main content”) visible on focus.
- Focus-visible styles and focus trap in Moments lightbox; focus is restored on close.
