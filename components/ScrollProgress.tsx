"use client";

import { useEffect, useState } from "react";
import { motion, useScroll } from "framer-motion";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const handler = () => setReduceMotion(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  if (reduceMotion) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-40 h-[2px] bg-cream/30 origin-left"
      style={{ scaleX: scrollYProgress }}
      aria-hidden
    />
  );
}
