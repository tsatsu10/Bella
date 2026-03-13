"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { MusicPlayer } from "@/components/MusicPlayer";
import { sectionLabels } from "@/content/copy";
import { SectionHeader } from "@/components/SectionHeader";

export function SongSection() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const [reduceMotion, setReduceMotion] = useState(false);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "start 0.25"],
  });
  const sectionOpacity = useTransform(scrollYProgress, [0, 0.35, 0.7], [0, 0.6, 1]);
  const sectionY = useTransform(scrollYProgress, [0, 0.5], [36, 0]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const handler = () => setReduceMotion(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <section id="song" ref={ref} className="py-24 sm:py-32 md:py-44 px-4 sm:px-6 md:px-12 bg-[#080808] relative overflow-hidden">
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{
          background:
            "linear-gradient(to right, transparent 0%, rgba(212,175,55,0.25) 30%, rgba(212,175,55,0.25) 70%, transparent 100%)",
        }}
        aria-hidden
      />
      <motion.div
        className="relative"
        style={
          reduceMotion
            ? {}
            : {
                opacity: sectionOpacity,
                y: sectionY,
              }
        }
      >
      <SectionHeader
        label={sectionLabels.song.label}
        title={sectionLabels.song.title}
      />
      <motion.p
        className="text-cream/40 text-xs text-center mb-12"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {sectionLabels.song.helper}
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="w-full min-w-0"
      >
        <MusicPlayer />
      </motion.div>
      </motion.div>
    </section>
  );
}
