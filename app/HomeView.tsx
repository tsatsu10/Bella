"use client";

import { HeroSection } from "@/components/sections/HeroSection";
import { MomentsSection } from "@/components/sections/MomentsSection";
import { VideoSection } from "@/components/sections/VideoSection";
import { MessageSection } from "@/components/sections/MessageSection";
import { SongSection } from "@/components/sections/SongSection";
import { ClosingSection } from "@/components/sections/ClosingSection";
import { Nav } from "@/components/Nav";
import { SmoothScroll } from "@/components/SmoothScroll";
import { ScrollProgress } from "@/components/ScrollProgress";
import { AudioProvider } from "@/components/AudioProvider";
import { NowPlaying } from "@/components/NowPlaying";
import { CustomCursor } from "@/components/CustomCursor";
import { SkipToSong } from "@/components/SkipToSong";
import { Balloons } from "@/components/Balloons";
import { Fireworks } from "@/components/Fireworks";

export function HomeView() {
  return (
    <AudioProvider>
      <div className="grain relative">
        <Balloons />
        <Fireworks />
        <a
          href="#main-content"
          className="fixed left-4 top-4 z-[110] -translate-y-[200%] rounded bg-cream px-4 py-2 text-background text-sm font-medium shadow-lg transition-transform cursor-pointer focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-cream/50 max-w-[calc(100vw-2rem)] min-h-[44px] flex items-center justify-center safe-top"
        >
          Skip to main content
        </a>
        <CustomCursor />
        <SkipToSong />
        <SmoothScroll>
          <ScrollProgress />
          <Nav />
          <NowPlaying />
          <main id="main-content" tabIndex={-1}>
          <HeroSection />
          <MomentsSection />
          <VideoSection />
          <MessageSection />
          <SongSection />
          <ClosingSection />
          </main>
        </SmoothScroll>
      </div>
    </AudioProvider>
  );
}
