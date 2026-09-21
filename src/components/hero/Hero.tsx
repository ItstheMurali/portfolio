"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import HeroPortrait from "./HeroPortrait";
import type { Identity } from "@/lib/defaultContent";
import {
  hasSeenIntro,
  markIntroSeen,
  useIsomorphicLayoutEffect,
} from "@/lib/intro";

/*
  Scene 0 — The Storm to Clarity.
  Phase 1 (0–4s): storm only. No name. No title.
  Phase 2 (4s+): the pen light traces the name; as it completes,
  the clarity wave fires and the storm settles. Taglines follow.

  A viewer returning from a sub-page in the same tab has already watched
  this, so the hero opens already settled rather than making them wait again.
*/

const STORM_MS = 4000;
const TRACE_MS = 3200;

export default function Hero({ identity }: { identity: Identity }) {
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<"storm" | "trace" | "settled">("storm");
  const [penProgress, setPenProgress] = useState(0);
  const [checked, setChecked] = useState(false);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const returningRef = useRef(false);

  // Before paint: a returning viewer never sees a frame of the storm.
  useIsomorphicLayoutEffect(() => {
    returningRef.current = hasSeenIntro();
    if (returningRef.current) {
      setPhase("settled");
      setPenProgress(1);
    }
    setChecked(true);
  }, []);

  useEffect(() => {
    if (!checked) return;

    if (returningRef.current) {
      // Already settled. Let the nav and the ambient storm know immediately.
      window.dispatchEvent(new CustomEvent("hero:complete"));
      return;
    }

    if (reduced) {
      // Reduced motion: skip straight to the settled state with fades only.
      setPhase("settled");
      setPenProgress(1);
      markIntroSeen();
      window.dispatchEvent(new CustomEvent("hero:wave"));
      window.dispatchEvent(new CustomEvent("hero:complete"));
      return;
    }

    const t1 = window.setTimeout(() => setPhase("trace"), STORM_MS);
    return () => window.clearTimeout(t1);
  }, [reduced, checked]);

  // Pen trace: progress 0→1 across the name width.
  useEffect(() => {
    if (phase !== "trace") return;
    let raf = 0;
    let done = false;
    const start = performance.now();

    const settle = () => {
      if (done) return;
      done = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(guard);
      setPenProgress(1);
      setPhase("settled");
      markIntroSeen();
      window.dispatchEvent(new CustomEvent("hero:wave"));
      window.dispatchEvent(new CustomEvent("hero:complete"));
    };

    const step = (now: number) => {
      const p = Math.min(1, (now - start) / TRACE_MS);
      // THE SETTLE easing feel: fast approach, slow settle
      const eased = 1 - Math.pow(1 - p, 3);
      setPenProgress(eased);
      if (p < 1) raf = requestAnimationFrame(step);
      else settle();
    };

    /* A backgrounded or non-compositing tab starves requestAnimationFrame,
       which would leave the name half-traced and the site behind a loader
       forever. The timer is the floor: the trace completes either way. */
    const guard = window.setTimeout(settle, TRACE_MS + 1500);

    raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(guard);
    };
  }, [phase]);

  const showName = phase !== "storm";
  const settled = phase === "settled";

  // pen wobble — handwriting quality
  const penY = Math.sin(penProgress * Math.PI * 6) * 10;

  return (
    <section
      id="storm"
      className="relative flex h-[100svh] w-full items-center justify-center overflow-hidden"
    >
      <HeroPortrait settled={settled} />

      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        {/* the name, revealed by the pen */}
        <div className="relative">
          {showName && (
            <h1
              ref={nameRef}
              className="font-syne text-display-m font-bold tracking-[0.04em] text-human md:text-display"
              style={{
                clipPath: `inset(0 ${(1 - penProgress) * 100}% 0 0)`,
                textShadow: settled
                  ? "0 0 40px rgba(232,213,163,0.25)"
                  : "0 0 24px rgba(232,213,163,0.45)",
                transition: "text-shadow 1.2s var(--ease-settle)",
              }}
            >
              {identity.name}
            </h1>
          )}

          {/* pen light at the reveal frontier */}
          {phase === "trace" && (
            <div
              className="pointer-events-none absolute top-1/2"
              style={{
                left: `${penProgress * 100}%`,
                transform: `translate(-50%, calc(-50% + ${penY}px))`,
              }}
              aria-hidden="true"
            >
              <div
                className="h-2.5 w-2.5 rounded-full"
                style={{
                  background: "var(--pen)",
                  boxShadow:
                    "0 0 12px 4px rgba(232,213,163,0.9), 0 0 48px 16px rgba(232,213,163,0.35)",
                }}
              />
            </div>
          )}
        </div>

        {/* the pen point during the storm — a single warm ember waiting */}
        {phase === "storm" && !reduced && (
          <motion.div
            className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.9, 0.6, 0.9] }}
            transition={{ duration: 3, delay: 2.2 }}
            style={{
              background: "var(--pen)",
              boxShadow: "0 0 16px 6px rgba(232,213,163,0.7)",
            }}
            aria-hidden="true"
          />
        )}

        {/* taglines — appear after the wave */}
        <div className="mt-10 flex min-h-[8rem] flex-col items-center gap-5">
          {settled && (
            <>
              <motion.p
                className="max-w-xl font-fraunces text-base italic text-human/90 md:text-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.6 }}
              >
                {identity.tagline}
              </motion.p>
              <motion.p
                className="label font-mono text-[11px] text-clarity/70 md:text-xs"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 1.4 }}
              >
                {identity.progression}
              </motion.p>
            </>
          )}
        </div>
      </div>

      {/* scroll indicator */}
      {settled && (
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 2.2 }}
          aria-hidden="true"
        >
          <div className="scroll-indicator h-12 w-px bg-pen/70" />
        </motion.div>
      )}
    </section>
  );
}
