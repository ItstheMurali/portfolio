"use client";

import { useEffect, useRef, useState } from "react";

/*
  Hero portrait, seamlessly blended into the background.
  Edge-masked into the dark, fades in once the storm settles,
  fades out completely as the visitor scrolls past the hero.
*/

export default function HeroPortrait({ settled }: { settled: boolean }) {
  const [scrollFade, setScrollFade] = useState(1);
  const [failed, setFailed] = useState(false);
  const raf = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(() => {
        const vh = window.innerHeight;
        // fully gone by 45% of a viewport of scrolling
        setScrollFade(Math.max(0, 1 - window.scrollY / (vh * 0.45)));
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  if (failed) return null;

  return (
    <div
      className="pointer-events-none absolute inset-y-0 right-0 hidden w-[46%] items-center justify-end md:flex"
      style={{
        opacity: (settled ? 0.9 : 0) * scrollFade,
        transition: "opacity 1.6s var(--ease-settle)",
      }}
      aria-hidden="true"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/photo/portrait.jpg"
        alt=""
        onError={() => setFailed(true)}
        className="h-[86%] w-auto object-contain"
        style={{
          WebkitMaskImage:
            "radial-gradient(ellipse 62% 55% at 50% 42%, black 48%, transparent 76%)",
          maskImage:
            "radial-gradient(ellipse 62% 55% at 50% 42%, black 48%, transparent 76%)",
          filter: "brightness(0.92) contrast(1.02) sepia(0.06)",
        }}
      />
    </div>
  );
}
