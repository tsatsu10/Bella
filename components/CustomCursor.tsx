"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { setPointerState } from "@/lib/pointer";

/**
 * Small dot cursor on desktop only. Hidden on touch devices and when reduced motion.
 * Also feeds pointer position into a shared store for hero background interaction.
 */
export function CustomCursor() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [visible, setVisible] = useState(false);
  const [isPointer, setIsPointer] = useState(false);

  useEffect(() => {
    const isTouch =
      typeof window !== "undefined" &&
      ("ontouchstart" in window || navigator.maxTouchPoints > 0);
    if (isTouch) return;

    const handleMove = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;
      setPos({ x, y });

      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;
      const ndcX = (x / w) * 2 - 1;
      const ndcY = -((y / h) * 2 - 1);
      setPointerState({ x, y, ndcX, ndcY });
      if (!visible) {
        setVisible(true);
        document.documentElement.classList.add("custom-cursor-active");
      }
    };
    const handleLeave = () => {
      setVisible(false);
      document.documentElement.classList.remove("custom-cursor-active");
    };
    const handleOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      setIsPointer(
        window.getComputedStyle(target).cursor === "pointer" ||
          target.closest("a, button") != null
      );
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseleave", handleLeave);
    window.addEventListener("mouseover", handleOver);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseleave", handleLeave);
      window.removeEventListener("mouseover", handleOver);
      document.documentElement.classList.remove("custom-cursor-active");
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 w-0 h-0 z-[10000] pointer-events-none"
      initial={false}
      animate={{
        x: pos.x,
        y: pos.y,
        scale: isPointer ? 1.8 : 1,
      }}
      transition={{ type: "spring", damping: 28, stiffness: 350 }}
    >
      <span
        className={`block w-2 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cream/40 ${
          isPointer ? "bg-cream/20" : "bg-transparent"
        }`}
      />
    </motion.div>
  );
}
