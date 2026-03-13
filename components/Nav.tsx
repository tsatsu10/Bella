"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const links = [
  { href: "#moments", label: "Moments" },
  { href: "#video", label: "Video" },
  { href: "#message", label: "Message" },
  { href: "#song", label: "Song" },
  { href: "#closing", label: "End" },
];

function useActiveSection(): string {
  const [active, setActive] = useState("#hero");
  useEffect(() => {
    const sections = ["#hero", "#moments", "#video", "#message", "#song", "#closing"];
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const id = e.target.getAttribute("id");
          if (id) setActive(`#${id}`);
          break;
        }
      },
      { rootMargin: "-35% 0px -35% 0px", threshold: 0 }
    );
    sections.forEach((hash) => {
      const el = document.getElementById(hash.slice(1));
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);
  return active;
}

export function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const activeSection = useActiveSection();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-[background-color,border-color,box-shadow] duration-500 ease-out ${
          scrolled
            ? "bg-[var(--background)]/90 backdrop-blur-xl border-b border-[var(--border-subtle)] shadow-[0_1px_0_0_rgba(212,175,55,0.06)]"
            : "bg-transparent border-b border-white/[0.04]"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-16">
          <nav
            className="flex items-center justify-between h-[4.75rem] md:h-[5.25rem]"
            aria-label="Main"
          >
            <a
              href="#hero"
              className="nav-transition font-display text-[1.35rem] md:text-[1.6rem] font-light text-cream tracking-[0.22em] cursor-pointer focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] rounded-sm py-2 -my-2 hover:text-cream"
            >
              <span className="text-accent font-normal">B</span>elicia
            </a>
            <ul className="hidden md:flex items-center gap-0" role="list">
              {links.map(({ href, label }) => {
                const isActive = activeSection === href;
                return (
                  <li key={href}>
                    <a
                      href={href}
                      className={`nav-transition group relative block px-7 py-4 text-[0.625rem] uppercase tracking-[0.32em] font-medium cursor-pointer focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] rounded-sm ${
                        isActive ? "text-cream" : "text-cream/50 hover:text-cream/85"
                      }`}
                    >
                      <span className="relative inline-block">
                        {label}
                        <span
                          className={`nav-underline-transition absolute left-0 bottom-0 h-px bg-accent origin-left ${
                            isActive ? "w-full scale-x-100" : "w-full scale-x-0 group-hover:scale-x-100"
                          }`}
                          aria-hidden
                        />
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>
            <button
              type="button"
              className="md:hidden min-w-[44px] min-h-[44px] p-3 -mr-3 flex items-center justify-center text-cream/60 hover:text-cream cursor-pointer nav-transition focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] rounded-sm"
              onClick={() => setOpen((o) => !o)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
            >
              <svg
                className="w-5 h-5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.25}
                viewBox="0 0 24 24"
                aria-hidden
              >
                {open ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </nav>
        </div>
      </header>

      {/* Mobile: full-screen overlay — premium dark with subtle gradient */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-40 md:hidden bg-[var(--background)] [background-image:radial-gradient(ellipse_80%_60%_at_50%_40%,rgba(212,175,55,0.03)_0%,transparent_60%)]"
            aria-hidden
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-50 flex flex-col justify-center px-8 md:hidden"
          >
            <nav
              className="flex flex-col items-center gap-0"
              aria-label="Mobile navigation"
            >
              <a
                href="#hero"
                className="nav-transition font-display text-[1.75rem] font-light text-cream tracking-[0.18em] py-4 cursor-pointer focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] rounded-sm hover:text-accent"
                onClick={() => setOpen(false)}
              >
                <span className="text-accent font-normal">B</span>elicia
              </a>
              <span
                className="block w-12 h-px bg-gradient-to-r from-transparent via-cream/20 to-transparent my-6"
                aria-hidden
              />
              {links.map(({ href, label }, i) => {
                const isActive = activeSection === href;
                return (
                  <motion.a
                    key={href}
                    href={href}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{
                      delay: 0.03 + i * 0.04,
                      duration: 0.35,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className={`nav-transition font-display text-lg font-light tracking-[0.24em] uppercase min-h-[52px] flex items-center justify-center py-4 w-full text-center cursor-pointer focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] rounded-sm ${
                      isActive ? "text-cream" : "text-cream/55 hover:text-cream/90"
                    }`}
                    onClick={() => setOpen(false)}
                  >
                    {label}
                  </motion.a>
                );
              })}
            </nav>
            <button
              type="button"
              className="absolute top-6 right-6 min-w-[44px] min-h-[44px] p-2 flex items-center justify-center text-cream/45 hover:text-cream cursor-pointer nav-transition focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] rounded-sm"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
            >
              <svg
                className="w-6 h-6 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.25}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
