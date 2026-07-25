"use client";

import { useEffect, useState } from "react";

/*
  Loading experience — zero flash of unstyled content.
  Tracks real load progress: fonts + first paint readiness.
*/

export default function Loader({ onDone }: { onDone?: () => void }) {
  const [progress, setProgress] = useState(0);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
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
  }, [onDone]);

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
