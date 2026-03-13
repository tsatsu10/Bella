"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const PARTICLE_COUNT = 14;
const COLORS = ["#faf8f5", "#d4af37", "rgba(250,248,245,0.9)", "rgba(212,175,55,0.85)"];
const PARTICLE_SIZE = 4;
const BURST_DURATION_MS = 1600;

function getParticles() {
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => {
    const angle = (i / PARTICLE_COUNT) * Math.PI * 2 + Math.random() * 0.5;
    const distance = 80 + Math.random() * 60;
    return {
      id: i,
      angle,
      distance,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      tx: Math.cos(angle) * distance,
      ty: Math.sin(angle) * distance,
    };
  });
}

function Burst({
  id,
  x,
  y,
  onComplete,
}: {
  id: number;
  x: number;
  y: number;
  onComplete: (id: number) => void;
}) {
  const particles = getParticles();

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)" }}
    >
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: PARTICLE_SIZE,
            height: PARTICLE_SIZE,
            left: 0,
            top: 0,
            backgroundColor: p.color,
            boxShadow: `0 0 6px ${p.color}`,
          }}
          initial={{ scale: 0, opacity: 0.9, x: 0, y: 0 }}
          animate={{
            scale: [0, 1.2, 0.8],
            opacity: [0.9, 0.6, 0],
            x: p.tx,
            y: p.ty,
          }}
          transition={{
            duration: 1.4,
            ease: "easeOut",
          }}
          onAnimationComplete={p.id === 0 ? () => onComplete(id) : undefined}
        />
      ))}
    </motion.div>
  );
}

export function Fireworks() {
  const [bursts, setBursts] = useState<{ id: number; x: number; y: number }[]>([]);
  const [reduceMotion, setReduceMotion] = useState(false);
  const idRef = useRef(0);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const handler = () => setReduceMotion(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const addBurst = useCallback(() => {
    if (reduceMotion) return;
    const x = 15 + Math.random() * 70;
    const y = 12 + Math.random() * 25;
    const id = idRef.current++;
    setBursts((prev) => [...prev, { id, x, y }]);
  }, [reduceMotion]);

  const removeBurst = useCallback((id: number) => {
    setBursts((prev) => prev.filter((b) => b.id !== id));
  }, []);

  useEffect(() => {
    if (reduceMotion) return;
    addBurst();
    const t1 = setTimeout(addBurst, 600);
    const t2 = setTimeout(addBurst, 1200);
    const t3 = setTimeout(addBurst, 2000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [reduceMotion]);

  useEffect(() => {
    if (reduceMotion) return;
    const interval = setInterval(addBurst, 9000);
    return () => clearInterval(interval);
  }, [addBurst, reduceMotion]);

  if (reduceMotion) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[7] overflow-hidden"
      data-print-hide
      aria-hidden
    >
      <AnimatePresence>
        {bursts.map((b) => (
          <Burst
            key={b.id}
            id={b.id}
            x={b.x}
            y={b.y}
            onComplete={removeBurst}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
