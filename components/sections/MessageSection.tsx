"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { messageLines, sinceDate } from "@/content/media";
import { sectionLabels } from "@/content/copy";
import { SectionHeader } from "@/components/SectionHeader";

const lineVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.18, ease: [0.22, 1, 0.36, 1] },
  }),
};

export function MessageSection() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.18 });
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
    <section
      id="message"
      ref={ref}
      className="py-24 sm:py-32 md:py-48 px-4 sm:px-6 md:px-12 bg-[#0c0c0c] relative overflow-hidden"
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
      <SectionHeader
        label={sectionLabels.message.label}
        title={
          <>
            For <span className="text-accent">B</span>elicia
          </>
        }
      />

      {/* Letter-style card: editorial whitespace, minimal luxury */}
      <motion.div
        className="relative max-w-2xl mx-auto px-6 sm:px-10 md:px-20"
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        {/* Background vignette */}
        <div
          className="pointer-events-none absolute inset-0 -z-10 rounded-[32px]"
          style={{
            background:
              "radial-gradient(circle at 50% 0%, rgba(212,175,55,0.16) 0%, transparent 55%), radial-gradient(circle at 50% 100%, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.95) 60%)",
          }}
          aria-hidden
        />
        <div className="border border-white/[0.07] rounded-sm bg-[#0a0a0a]/90 backdrop-blur-sm py-14 sm:py-20 md:py-28 px-0 sm:px-6 md:px-10 shadow-[0_32px_64px_-24px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.03)]">
          <p className="font-body text-xs tracking-[0.32em] uppercase text-cream/45 mb-8">
            A note from my heart
          </p>
          <div className="space-y-10 md:space-y-12 text-left">
            {messageLines.map((line, i) => {
              const isKey =
                line.includes("you mean the world to me") ||
                line.includes("The world is better because you're in it.");
              return (
                <motion.p
                  key={i}
                  custom={i}
                  variants={lineVariants}
                  className={
                    isKey
                      ? "font-display text-2xl md:text-[1.6rem] lg:text-[1.8rem] text-cream leading-[1.7] font-light tracking-tight"
                      : "font-display text-xl md:text-2xl lg:text-3xl text-cream/92 leading-[1.65] font-light tracking-tight"
                  }
                >
                  {line}
                </motion.p>
              );
            })}
            {sinceDate && (
              <motion.p
                custom={messageLines.length}
                variants={lineVariants}
                className="font-display text-lg md:text-xl text-cream/60 font-light tracking-tight pt-4"
              >
                Since {sinceDate}
              </motion.p>
            )}
            <motion.p
              custom={messageLines.length + 1}
              variants={lineVariants}
              className="pt-6 text-right font-body text-xs sm:text-sm text-cream/65 italic"
            >
              With all my love.
            </motion.p>
          </div>
        </div>
      </motion.div>
      </motion.div>
    </section>
  );
}
