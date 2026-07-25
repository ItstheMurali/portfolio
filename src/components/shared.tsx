"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

/* ---------- Reveal: THE REVEAL easing, fade + slight rise ---------- */
export function Reveal({
  children,
  delay = 0,
  className = "",
  fadeOnly = false,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  fadeOnly?: boolean;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: fadeOnly || reduced ? 0 : 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 1, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ---------- ScrambleNumber: digit scramble then snap ---------- */
const GLYPHS = "0123456789#%+";

export function ScrambleNumber({
  value,
  className = "",
  delay = 0,
}: {
  value: string;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [display, setDisplay] = useState(value.replace(/[0-9]/g, "0"));
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      setDisplay(value);
      return;
    }
    let raf = 0;
    const duration = 1100;
    let start: number | null = null;

    const step = (now: number) => {
      if (start === null) start = now + delay * 1000;
      const t = (now - start) / duration;
      if (t < 0) {
        raf = requestAnimationFrame(step);
        return;
      }
      if (t >= 1) {
        setDisplay(value);
        return;
      }
      const settled = Math.floor(t * value.length);
      let out = "";
      for (let i = 0; i < value.length; i++) {
        const ch = value[i];
        if (i < settled || !/[0-9]/.test(ch)) out += ch;
        else out += GLYPHS[Math.floor(Math.random() * 10)];
      }
      setDisplay(out);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, delay, reduced]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}

/* ---------- SectionShell: breathing space enforced ---------- */
export function SectionShell({
  id,
  children,
  className = "",
  bg = "transparent",
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
  bg?: string;
}) {
  return (
    <section
      id={id}
      className={`relative px-6 py-20 md:px-10 md:py-[120px] ${className}`}
      style={{ background: bg }}
    >
      <div className="mx-auto w-full max-w-6xl">{children}</div>
    </section>
  );
}

/* ---------- SectionHeading ---------- */
export function SectionHeading({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Reveal>
      <h2
        className={`mb-14 font-syne text-heading-2 font-bold leading-snug text-human ${className}`}
      >
        {children}
      </h2>
    </Reveal>
  );
}
