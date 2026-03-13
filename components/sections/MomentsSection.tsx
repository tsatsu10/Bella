"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SectionHeader } from "@/components/SectionHeader";
import { sectionLabels } from "@/content/copy";
import { MOMENTS_FALLBACK_PHOTOS } from "@/content/media";

type Photo = { src: string; alt?: string };

// Simple art-show variants: different aspect ratios / spans / subtle tilts
const ART_VARIANTS: { frame: string; tilt: string }[] = [
  { frame: "aspect-[4/5] md:row-span-2", tilt: "md:-rotate-1" },
  { frame: "aspect-square", tilt: "md:rotate-1" },
  { frame: "aspect-[3/4]", tilt: "md:-rotate-2" },
  { frame: "aspect-[4/5] md:col-span-2", tilt: "md:rotate-1" },
  { frame: "aspect-[3/4]", tilt: "md:-rotate-1" },
  { frame: "aspect-square", tilt: "md:rotate-2" },
];

function getArtVariant(index: number) {
  return ART_VARIANTS[index % ART_VARIANTS.length];
}

export function MomentsSection() {
  const [photos, setPhotos] = useState<Photo[]>(() => MOMENTS_FALLBACK_PHOTOS);
  const [loading, setLoading] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Load photos from /api/moments, keep fallback if API fails or returns empty
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch("/api/moments", { cache: "no-store" })
      .then((res) => {
        if (!res.ok) return { photos: [] as Photo[] };
        return res.json() as Promise<{ photos?: Photo[] }>;
      })
      .then((data) => {
        if (cancelled) return;
        if (Array.isArray(data.photos) && data.photos.length > 0) {
          setPhotos(data.photos);
        }
      })
      .catch(() => {
        // keep fallback photos
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const current = lightboxIndex !== null ? photos[lightboxIndex] : null;

  return (
    <section
      id="moments"
      className="bg-[#080808] py-16 sm:py-24 md:py-32 px-4 sm:px-6 md:px-10"
    >
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{
          background:
            "linear-gradient(to right, transparent 0%, rgba(212,175,55,0.25) 30%, rgba(212,175,55,0.25) 70%, transparent 100%)",
        }}
        aria-hidden
      />
      <SectionHeader
        label={sectionLabels.moments.label}
        title={sectionLabels.moments.title}
      />

      <div className="max-w-6xl mx-auto">
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[3/4] rounded-xl bg-white/5 border border-white/10 animate-pulse"
                aria-hidden
              />
            ))}
          </div>
        )}

        {!loading && photos.length === 0 && (
          <p className="text-center text-cream/40 text-sm font-body px-4">
            Moments for Belicia will appear here.
          </p>
        )}

        {!loading && photos.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 auto-rows-[minmax(140px,1fr)] gap-4 sm:gap-6">
            {photos.map((photo, index) => {
              const variant = getArtVariant(index);
              return (
                <motion.button
                  key={photo.src + index}
                  type="button"
                  className={`group relative overflow-hidden rounded-xl border border-white/10 bg-[#0a0a0a] shadow-[0_20px_40px_-18px_rgba(0,0,0,0.8)] transition-transform duration-500 ${variant.frame} ${variant.tilt} hover:rotate-0 hover:-translate-y-1.5`}
                  onClick={() => openLightbox(index)}
                  aria-label={photo.alt ?? `View moment ${index + 1}`}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.src || "/media/photos/photo_1_2026-03-13_01-03-42.jpg"}
                    alt={photo.alt ?? `Moment ${index + 1}`}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                    decoding="async"
                  />
                  <div
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    aria-hidden
                  />
                  {photo.alt && (
                    <span className="pointer-events-none absolute bottom-3 left-3 right-3 text-cream text-xs sm:text-sm font-display font-light tracking-wide opacity-0 group-hover:opacity-100 transition-opacity duration-300 line-clamp-2">
                      {photo.alt}
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox with simple fade/scale */}
      <AnimatePresence>
        {current && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 sm:p-8"
            role="dialog"
            aria-modal="true"
            aria-label="Moment image"
            onClick={closeLightbox}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                closeLightbox();
              }}
              className="absolute top-4 right-4 sm:top-8 sm:right-8 w-10 h-10 rounded-full flex items-center justify-center text-cream/80 hover:text-cream focus:outline-none focus-visible:ring-2 focus-visible:ring-cream/60"
              aria-label="Close"
            >
              <span className="text-2xl leading-none">×</span>
            </button>
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-4xl max-h-[80vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={current.src}
                alt={current.alt ?? "Moment"}
                className="w-full h-full object-contain"
              />
              {current.alt && (
                <p className="mt-4 text-center text-cream/80 text-sm sm:text-base">
                  {current.alt}
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

