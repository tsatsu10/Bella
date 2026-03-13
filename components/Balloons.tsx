"use client";

import { useState, useEffect } from "react";

const BALLOONS = [
  { id: 1, left: "8%", size: 32, color: "#faf8f5", delay: 0, duration: 38 },
  { id: 2, left: "22%", size: 24, color: "#d4af37", delay: 4, duration: 42 },
  { id: 3, left: "45%", size: 28, color: "rgba(250,248,245,0.9)", delay: 2, duration: 40 },
  { id: 4, left: "68%", size: 26, color: "rgba(212,175,55,0.75)", delay: 6, duration: 36 },
  { id: 5, left: "85%", size: 30, color: "#faf8f5", delay: 1, duration: 44 },
  { id: 6, left: "15%", size: 20, color: "#d4af37", delay: 8, duration: 39 },
  { id: 7, left: "78%", size: 22, color: "rgba(250,248,245,0.85)", delay: 3, duration: 41 },
  { id: 8, left: "55%", size: 26, color: "#d4af37", delay: 5, duration: 37 },
];

function BalloonSvg({
  size,
  color,
  className,
}: {
  size: number;
  color: string;
  className?: string;
}) {
  const r = size / 2;
  return (
    <svg
      width={size}
      height={size * 1.35}
      viewBox="0 0 40 54"
      fill="none"
      className={className}
      aria-hidden
    >
      <ellipse cx="20" cy="24" rx="18" ry="22" fill={color} />
      <path
        d="M20 46 L16 54 L20 50 L24 54 Z"
        fill={color}
        style={{ opacity: 0.7 }}
      />
      <ellipse cx="20" cy="24" rx="18" ry="22" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
    </svg>
  );
}

export function Balloons() {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const handler = () => setReduceMotion(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[8] overflow-hidden"
      data-print-hide
      aria-hidden
    >
      {BALLOONS.map((b) => (
        <div
          key={b.id}
          className="absolute bottom-0 will-change-transform [@media(max-width:640px)]:scale-75"
          style={{
            left: b.left,
            bottom: "-10%",
            animation: reduceMotion
              ? "none"
              : `float-up ${b.duration}s ease-in-out ${b.delay}s infinite`,
          }}
        >
          <BalloonSvg size={b.size} color={b.color} />
        </div>
      ))}
    </div>
  );
}
