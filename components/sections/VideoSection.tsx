"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { videos as defaultVideos } from "@/content/media";
import { sectionLabels } from "@/content/copy";
import { SectionHeader } from "@/components/SectionHeader";

type VideoItem = { src: string; poster?: string; label?: string };

const easing = [0.22, 1, 0.36, 1] as const;

export function VideoSection() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.12 });
  const [videos, setVideos] = useState<VideoItem[]>(defaultVideos);
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

  useEffect(() => {
    fetch("/api/videos")
      .then((res) => res.json())
      .then((data: { videos: VideoItem[] }) => {
        if (Array.isArray(data.videos) && data.videos.length > 0) setVideos(data.videos);
      })
      .catch(() => {});
  }, []);

  if (videos.length === 0) return null;

  return (
    <section id="video" ref={ref} className="py-24 sm:py-32 md:py-44 px-4 sm:px-6 md:px-12 bg-background relative overflow-hidden">
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
        label={sectionLabels.video.label}
        title={sectionLabels.video.title}
      />
      <motion.div
        className="max-w-5xl mx-auto space-y-16 md:space-y-24"
        initial={{ opacity: 0, y: 32 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, delay: 0.2, ease: easing }}
      >
        {videos.map((video, i) => (
          <div
            key={video.src}
            className="group overflow-hidden rounded-lg border border-white/[0.07] bg-black/30 hover:border-white/[0.1] transition-colors duration-500 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.4)]"
          >
            <video
              src={video.src}
              poster={video.poster}
              controls
              playsInline
              preload="metadata"
              className="w-full aspect-video object-contain"
              aria-label={video.label ?? `Video ${i + 1}`}
              title={video.label ?? undefined}
            >
              Your browser does not support the video tag.
            </video>
            {(video.label ?? video.src) && (
              <p className="text-cream/50 text-xs tracking-wide text-center py-4 px-6 border-t border-white/[0.06] rounded-b-lg">
                {video.label ?? video.src.split("/").pop()?.replace(/\.[^.]+$/, "") ?? ""}
              </p>
            )}
          </div>
        ))}
      </motion.div>
      </motion.div>
    </section>
  );
}
