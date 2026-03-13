"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface SmoothScrollProps {
  children: ReactNode;
}

type LenisInstance = {
  raf: (time: number) => void;
  destroy: () => void;
  scrollTo: (target: string | HTMLElement | number, options?: { offset?: number }) => void;
};

/**
 * Wraps the page. When reduced motion is not preferred, initializes Lenis for smooth scroll.
 * Anchor links (href="#id") are intercepted and use lenis.scrollTo() for smooth in-page navigation.
 * Native smooth scroll is also set in globals.css as fallback when Lenis is not used.
 */
export function SmoothScroll({ children }: SmoothScrollProps) {
  const rafRef = useRef<number>(0);
  const lenisRef = useRef<LenisInstance | null>(null);

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('a[href^="#"]') as HTMLAnchorElement | null;
      if (!anchor?.hash || anchor.hash === "#") return;
      const id = anchor.hash.slice(1);
      const el = document.getElementById(id);
      if (el && lenisRef.current) {
        e.preventDefault();
        lenisRef.current.scrollTo(el, { offset: 0 });
      }
    };

    let lenis: LenisInstance | null = null;
    const init = async () => {
      const Lenis = (await import("lenis")).default;
      lenis = new Lenis({
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      }) as LenisInstance;
      lenisRef.current = lenis;
      const raf = (time: number) => {
        lenisRef.current?.raf(time);
        rafRef.current = requestAnimationFrame(raf);
      };
      rafRef.current = requestAnimationFrame(raf);
      document.addEventListener("click", handleClick, { capture: true });
    };
    init();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      document.removeEventListener("click", handleClick, { capture: true });
      lenisRef.current?.destroy();
      lenisRef.current = null;
    };
  }, []);

  return <>{children}</>;
}
