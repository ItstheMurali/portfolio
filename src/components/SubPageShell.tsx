"use client";

import Link from "next/link";
import SmoothScroll from "@/components/SmoothScroll";
import PenCursor from "@/components/PenCursor";
import StormCanvas from "@/components/hero/StormCanvas";

/*
  Shared shell for detail pages (/work, /tools, /case/[slug], /api-experience).
  Carries the full experience: pen cursor, ambient documentation fragments,
  film grain, vignette, Lenis smooth scroll, sticky back-navigation header.
*/

export default function SubPageShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SmoothScroll>
      <PenCursor />
      <div className="grain-overlay" aria-hidden="true" />
      <div className="vignette-overlay" aria-hidden="true" />

      {/* ambient documentation fragments, already settled, drifting quietly */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        aria-hidden="true"
      >
        <StormCanvas ambient />
      </div>

      <div className="relative z-[1] min-h-screen">
        <header
          className="sticky top-0 z-40 border-b border-white/5 px-6 py-4 md:px-10"
          style={{
            background: "rgba(11,10,9,0.88)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
          }}
        >
          <div className="mx-auto flex max-w-4xl items-center justify-between">
            <Link
              href="/"
              className="font-mono text-xs text-human/60 transition-colors hover:text-pen"
            >
              ← Back to Portfolio
            </Link>
            <Link
              href="/"
              className="font-syne text-sm font-bold tracking-widest text-pen"
              aria-label="Home"
            >
              MK
            </Link>
          </div>
        </header>

        {children}

        <div className="pb-24 pt-4 text-center">
          <Link
            href="/"
            className="font-mono text-xs text-pen/70 transition-colors hover:text-pen"
          >
            ← Back to Portfolio
          </Link>
        </div>
      </div>
    </SmoothScroll>
  );
}
