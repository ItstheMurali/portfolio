"use client";

import { useEffect, useRef, useState } from "react";
import { hasSeenIntro, useIsomorphicLayoutEffect } from "@/lib/intro";

/*
  Loading experience — zero flash of unstyled content.
  Tracks real load progress: fonts + first paint readiness.

  Skipped entirely for a viewer who has already seen the opening in this tab.
*/

export default function Loader({ onDone }: { onDone?: () => void }) {
  const [progress, setProgress] = useState(0);
  const [hidden, setHidden] = useState(false);
  const [checked, setChecked] = useState(false);
  const skipRef = useRef(false);

  // Runs before paint, so a returning viewer never sees a loader frame.
  useIsomorphicLayoutEffect(() => {
    skipRef.current = hasSeenIntro();
    if (skipRef.current) {
      setHidden(true);
      onDone?.();
    }
    setChecked(true);
    // onDone is stable for the life of the page; re-running would replay.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!checked || skipRef.current) return;

    let mounted = true;
    let value = 0;

    const bump = (target: number) => {
      if (!mounted) return;
      value = Math.max(value, target);
      setProgress(value);
    };

    bump(15);
    document.fonts.ready.then(() => bump(70));

    if (document.readyState === "complete") {
      bump(90);
    } else {
      window.addEventListener("load", () => bump(90), { once: true });
    }

    // finish: brief pause then fade
    const finish = setInterval(() => {
      if (value >= 90) {
        clearInterval(finish);
        bump(100);
        setTimeout(() => {
          if (!mounted) return;
          setHidden(true);
          onDone?.();
        }, 300);
      }
    }, 120);

    return () => {
      mounted = false;
      clearInterval(finish);
    };
  }, [checked, onDone]);

  if (skipRef.current) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center transition-opacity duration-[400ms]"
      style={{
        background: "#0B0A09",
        opacity: hidden ? 0 : 1,
        pointerEvents: hidden ? "none" : "auto",
      }}
      aria-hidden={hidden}
    >
      <div className="loader-monogram font-syne text-4xl font-bold tracking-widest text-pen">
        MK
      </div>
      <div className="mt-6 h-px w-40 overflow-hidden bg-white/10">
        <div
          className="h-full bg-pen transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
