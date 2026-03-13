"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { sinceDate } from "@/content/media";

export function ClosingSection() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const [reduceMotion, setReduceMotion] = useState(false);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "start 0.3"],
  });
  const sectionOpacity = useTransform(scrollYProgress, [0, 0.4, 0.75], [0, 0.65, 1]);
  const sectionY = useTransform(scrollYProgress, [0, 0.5], [28, 0]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const handler = () => setReduceMotion(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <section
      id="closing"
      ref={ref}
      className="py-24 sm:py-36 md:py-48 px-4 sm:px-6 md:px-12 border-t border-white/[0.06] bg-[#080808] relative overflow-hidden"
    >
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
      <motion.p
        className="font-display text-xl sm:text-2xl md:text-4xl lg:text-5xl text-center text-cream font-light tracking-tight max-w-2xl mx-auto leading-snug px-2"
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <span className="text-accent">B</span>elicia, this for you and only you
      </motion.p>
      {sinceDate && (
        <motion.p
          className="text-center text-cream/50 text-sm md:text-base mt-4 font-body"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Since {sinceDate}
        </motion.p>
      )}
      </motion.div>
    </section>
  );
}
