"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { heroImageSrc } from "@/content/media";
import { cn } from "@/lib/utils";
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text";
import { DotPattern } from "@/components/ui/dot-pattern";

const HeroCanvas = dynamic(
  () => import("@/components/hero/HeroCanvas").then((m) => m.HeroCanvas),
  { ssr: false }
);

const ease = [0.22, 1, 0.36, 1] as const;

export function HeroSection() {
  const [reduceMotion, setReduceMotion] = useState(false);
  const [heroSrc, setHeroSrc] = useState(heroImageSrc);
  const { scrollY } = useScroll();
  const contentOpacity = useTransform(scrollY, [0, 500], [1, 0.15]);
  const y = useTransform(scrollY, [0, 450], [0, 60]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const handler = () => setReduceMotion(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    fetch("/api/moments")
      .then((res) => res.json())
      .then((data: { photos: { src: string }[] }) => {
        if (Array.isArray(data.photos) && data.photos[0]?.src) setHeroSrc(data.photos[0].src);
      })
      .catch(() => {});
  }, []);

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col justify-center overflow-hidden"
    >
      {/* Background: gradient base + 3D Astro-style canvas + dot pattern overlay */}
      <div
        className="absolute inset-0 z-0 bg-gradient-to-b from-background via-surface to-background"
        aria-hidden
      />
      {!reduceMotion && (
        <div className="absolute inset-0 z-0" aria-hidden>
          <HeroCanvas />
        </div>
      )}
      <div className="absolute inset-0 z-10 pointer-events-none" aria-hidden>
        <DotPattern
          width={20}
          height={20}
          cx={1}
          cy={1}
          cr={0.5}
          glow={!reduceMotion}
          className={cn(
            "text-accent/15",
            "[mask-image:radial-gradient(ellipse_80%_70%_at_50%_50%,transparent_30%,black_100%)]"
          )}
        />
      </div>

      {/* Decorative vertical text columns removed by request */}

      {/* Main content: two-column layout — text left, hero image in card right */}
      <motion.div
        className="relative z-30 w-full max-w-[90rem] mx-auto px-6 sm:px-10 md:px-14 lg:px-20 py-20 md:py-24"
        style={
          reduceMotion
            ? {}
            : { y, opacity: contentOpacity }
        }
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, ease }}
      >
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-12 md:gap-16">
          {/* Left: editorial lockup with Magic UI animated gradient name */}
          <div className="relative md:max-w-[42rem] order-2 md:order-1">
            <motion.p
              className="font-body text-[9px] sm:text-[10px] tracking-[0.4em] uppercase text-cream/60 mb-4 md:mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease }}
            >
              Happy Birthday
            </motion.p>
            <motion.h1
              className="font-display font-light tracking-tight leading-[0.88] text-[clamp(3rem,12vw,10rem)] md:text-[clamp(3.5rem,10vw,9rem)]"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5, ease }}
              style={{ textShadow: "0 2px 32px rgba(0,0,0,0.2)" }}
              aria-label="Belicia"
            >
              <AnimatedGradientText
                speed={1.2}
                colorFrom="#d4af37"
                colorTo="#e8c547"
                reduceMotion={reduceMotion}
                className="text-cream"
              >
                Belicia
              </AnimatedGradientText>
            </motion.h1>
            <motion.span
              className="mt-5 md:mt-7 block w-20 h-px bg-accent/80"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.9, ease }}
              style={{ transformOrigin: "left" }}
              aria-hidden
            />
            <motion.p
              className="mt-7 font-body text-[11px] tracking-[0.22em] uppercase text-cream/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.2 }}
            >
              Scroll to explore
            </motion.p>
          </div>

          {/* Right: hero image in a floating card/frame (focal element, not full-bleed) */}
          <motion.div
            className="relative order-1 md:order-2 flex-shrink-0 w-full max-w-md md:max-w-[420px] mx-auto md:mx-0"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.5, ease }}
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-accent/35 bg-surface/80 aspect-[3/4] max-h-[70vh]">
              <Image
                src={heroSrc}
                alt="Belicia"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 420px"
                quality={90}
                placeholder="empty"
                className="object-cover object-center"
              />
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Gradient bridge into next section */}
      <div
        className="absolute bottom-0 left-0 right-0 h-40 md:h-48 pointer-events-none z-20"
        style={{
          background: "linear-gradient(to bottom, transparent 0%, rgba(8,8,8,0.4) 50%, #080808 100%)",
        }}
        aria-hidden
      />

      {/* Scroll cue */}
      <motion.a
        href="#moments"
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-4 text-cream/35 hover:text-cream/60 transition-colors duration-500 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-cream/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent rounded pb-[env(safe-area-inset-bottom)]"
        aria-label="Scroll to moments"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.5 }}
      >
        <motion.span
          className="block w-[1px] h-14 bg-gradient-to-b from-accent/45 via-accent/15 to-transparent"
          animate={
            reduceMotion
              ? {}
              : { opacity: [0.4, 1, 0.4], y: [0, -4, 0] }
          }
          transition={
            reduceMotion
              ? {}
              : { duration: 2.6, repeat: Infinity, repeatType: "reverse", ease }
          }
        />
        <span className="font-body text-[10px] tracking-[0.4em] uppercase">Scroll</span>
      </motion.a>
    </section>
  );
}
