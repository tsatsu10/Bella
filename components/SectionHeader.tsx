"use client";

import { motion } from "framer-motion";

type SectionHeaderProps = {
  label: string;
  title: React.ReactNode;
  align?: "center" | "left";
  animate?: boolean;
};

const easing: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function SectionHeader({ label, title, align = "center", animate = true }: SectionHeaderProps) {
  const baseAlign = align === "center" ? "text-center mx-auto" : "text-left";

  if (!animate) {
    return (
      <div className={`max-w-7xl mx-auto mb-10 sm:mb-14 md:mb-20 ${baseAlign}`}>
        <p className="text-cream/50 text-[11px] tracking-[0.35em] uppercase mb-3 font-body">
          {label}
        </p>
        <h2 className="font-display text-4xl md:text-6xl lg:text-7xl text-cream mb-4 tracking-tight font-light">
          {title}
        </h2>
        <span className="block w-12 h-px bg-accent/60 mx-auto" aria-hidden />
      </div>
    );
  }

  return (
    <div className={`max-w-7xl mx-auto mb-10 sm:mb-14 md:mb-20 ${baseAlign}`}>
      <motion.p
        className="text-cream/50 text-[11px] tracking-[0.35em] uppercase mb-3 font-body"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5 }}
      >
        {label}
      </motion.p>
      <motion.h2
        className="font-display text-4xl md:text-6xl lg:text-7xl text-cream mb-4 tracking-tight font-light"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, delay: 0.1, ease: easing }}
      >
        {title}
      </motion.h2>
      <motion.span
        className="block w-12 h-px bg-accent/60 mx-auto"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, delay: 0.3, ease: easing }}
        style={{ transformOrigin: "center" }}
        aria-hidden
      />
    </div>
  );
}

