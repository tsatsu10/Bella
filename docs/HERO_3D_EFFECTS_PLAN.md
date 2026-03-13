# Plan: AstroDither-Style 3D Effects in Hero Section

## Reference: AstroDither

[AstroDither](https://astrodither.robertborghesi.is/) is a Three.js / WebGPU experiment by Robert Borghesi. Relevant techniques:

- **Custom dithering** on the 3D model and in post
- **Fluid simulation** (single-pass, custom)
- **TSL (Three.js Shading Language)** for WebGPU shaders
- **Post-processing**: dither + displacement, **selective bloom** (no masks), **chromatic aberration**
- Optional **audio reactivity** (hold/click for speed)

For a birthday hero we don’t need the full experiment; we can pick a subset and adapt it to your existing hero (image + typography + scroll).

---

## Current Hero (Summary)

- **File**: `components/sections/HeroSection.tsx`
- **Stack**: Next.js Image (full-bleed), Framer Motion (parallax: opacity, scale, y), CSS overlays (vignette, scrim), editorial typography (“Belicia”), vertical decorative text, scroll cue.
- **Dependencies**: `three`, `@react-three/fiber`, `@react-three/drei` are already installed and transpiled in `next.config.ts`; no Canvas is used in the app yet.

---

## Integration Options

| Option | Description | Effort | Risk |
|--------|-------------|--------|------|
| **A. Background layer** | 3D/WebGL canvas *behind* the hero image (or replacing it). Hero image can be a texture on a plane or stay as DOM; text stays on top. | Medium–High | Medium (performance, WebGPU support) |
| **B. Overlay only** | Keep hero image as-is; add a semi-transparent 3D layer (particles, noise, dither) in front or in a “window.” | Medium | Lower |
| **C. Post on image** | No 3D scene; run a shader pass (dither + chromatic aberration) on the hero image in a small Canvas/OffscreenCanvas and display result. | Lower | Low |

**Recommendation:** Start with **A (background layer)** so the hero keeps one clear “photo + type” read while the 3D adds atmosphere. Use **B** if you want to limit scope; use **C** if you want the look with minimal 3D.

---

## Technical Approach (Option A — Background 3D Layer)

### 1. Structure

- Add a **full-viewport R3F Canvas** inside the hero section, **behind** the existing content (z-index below image and text).
- Canvas is **client-only** (already true: `HeroSection` is `"use client"`). Consider **dynamic import** of the Canvas so Three.js loads only when the hero is in view or on interaction (reduces initial JS).

### 2. What to Implement (in order of impact vs effort)

1. **Background “fluid” or particle field**  
   - Simple: particle system (points/lines) with gentle motion (no full fluid sim).  
   - Advanced: single-pass fluid in TSL (like AstroDither) — only if you need that exact look.

2. **Dithering**  
   - Apply to the 3D scene output (or to a fullscreen quad) in a **post pass** (e.g. custom pass or `@react-three/postprocessing` with a dither pass).  
   - Keeps the “signal lost / digital chaos” feel without touching the hero image directly.

3. **Chromatic aberration**  
   - Post-processing pass (small RGB offset).  
   - Works well with your existing dark/gold palette.

4. **Selective bloom**  
   - Optional: bloom on bright parts of the 3D layer only, so the DOM hero text stays sharp.

5. **Audio reactivity (optional)**  
   - If you add a “hold for speed” or background audio in hero, drive a uniform (e.g. time scale or intensity) from `AudioProvider` or analyser. Skip for v1 if you want to ship faster.

### 3. Stack Choices

- **Renderer**: Prefer **WebGL2** for broad support; use WebGPU only if you’re ready to maintain a fallback (e.g. `forceWebGL` in Three when WebGPU is missing).
- **R3F**: Use `@react-three/fiber` for the hero Canvas and `@react-three/drei` for helpers (e.g. `AdaptiveDpr`, `AdaptiveEvents`, `useTexture` if the hero image is used as a texture).
- **Post**: Either custom TSL post (max control, more work) or **postprocessing** (e.g. `postprocessing` npm package or `@react-three/postprocessing`) for bloom + chromatic aberration + a custom dither pass.
- **TSL**: Use only if you go WebGPU or use Three’s TSL-based materials; otherwise stick to classic GLSL in `ShaderMaterial` / `RawShaderMaterial` for WebGL2.

### 4. Files to Create / Modify

| Action | File / area |
|--------|-------------|
| **Create** | `components/hero/HeroCanvas.tsx` — R3F Canvas, scene, camera, background 3D content. |
| **Create** | `components/hero/HeroScene.tsx` (or inline) — scene contents: e.g. particle field / fluid quad. |
| **Create** | `components/hero/shaders/` or `lib/shaders/` — fragment/vertex for dither, aberration, fluid (if custom). |
| **Create** | Optional: `components/hero/HeroPost.tsx` — post-processing stack (dither, bloom, chromatic aberration). |
| **Modify** | `components/sections/HeroSection.tsx` — add Canvas container (absolute, inset-0, z below image), keep existing Image + overlays + copy + scroll cue. |
| **Modify** | `app/HomeView.tsx` — no change if HeroSection owns the Canvas; or wrap in `Suspense` if you lazy-load the Canvas. |

### 5. HeroSection Layout (Concept)

```tsx
<section id="hero" className="relative min-h-screen ...">
  {/* 1. 3D background — new */}
  <div className="absolute inset-0 z-0">
    <HeroCanvas />  {/* or lazy <Suspense><HeroCanvas /></Suspense> */}
  </div>

  {/* 2. Existing image + overlays — same as now, z-0 or z-10 */}
  <motion.div className="absolute inset-0 z-0" ...>
    <Image ... />
    <div className="absolute inset-0" style={{ ...vignette }} />
  </motion.div>

  {/* 3. Typography, scroll cue — unchanged, higher z */}
  ...
</section>
```

If the 3D is **behind** the image, you may want the image to have some transparency (e.g. `opacity: 0.85`) or a blend mode so the 3D shows through slightly; otherwise the 3D is only visible at the edges or when the image hasn’t loaded.

---

## Performance and Accessibility

- **Reduced motion**: Respect `prefers-reduced-motion: reduce` — when set, **don’t mount** the 3D Canvas (or mount a static frame only). You already read this in `HeroSection`; pass it to `HeroCanvas` and gate rendering.
- **Fallback**: If WebGL context fails, hide the Canvas and keep the existing hero image and text.
- **Framerate**: Use R3F’s `frameloop="demand"` and trigger frames on scroll/scroll-end or use `AdaptiveDpr` so mobile doesn’t burn battery.
- **Lazy load**: Dynamic-import the Canvas (and Three/R3F) so the hero still paints with the image first; 3D appears when the chunk loads.

---

## Phased Implementation

1. **Phase 1 — Canvas in hero**  
   Add `HeroCanvas` with a simple fullscreen quad or gradient so the pipeline (R3F in Next, z-order, no hydration issues) is validated.

2. **Phase 2 — Atmosphere**  
   Add particles or a simple “fluid” background (no TSL if you’re on WebGL2). Tune colors to match your palette (cream, gold, dark).

3. **Phase 3 — Post**  
   Add dither + chromatic aberration (and optionally bloom) in a post pass. Prefer a small, reusable pass so you can reuse dither/aberration elsewhere if needed.

4. **Phase 4 (optional)**  
   Audio-driven intensity or “hold for speed” in hero; or switch to WebGPU/TSL for a closer AstroDither replica.

---

## Summary

- **Goal**: Add an AstroDither-inspired 3D layer (dither, fluid/particles, chromatic aberration, optional bloom) to the hero **without** replacing the current editorial look (image + “Belicia” + scroll).
- **Approach**: New R3F Canvas as a background layer in `HeroSection`; optional dynamic import and `prefers-reduced-motion` gate; post-processing for dither + aberration (+ optional bloom).
- **Files**: New `HeroCanvas`, scene/shaders (and optional post component); modify only `HeroSection` (and optionally `HomeView` for Suspense).

If you tell me which option (A, B, or C) and which phase you want to implement first, I can outline concrete component APIs and shader steps next (e.g. exact props for `HeroCanvas`, and a minimal dither + chromatic aberration snippet).
