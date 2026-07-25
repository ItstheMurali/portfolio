"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { Reveal, ScrambleNumber } from "@/components/shared";
import { impactDashboard } from "@/lib/defaultContent";

/* Impact Dashboard — no heading. The numbers speak. */

function QualityRing() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [pct, setPct] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / 1800);
      const eased = 1 - Math.pow(1 - t, 3);
      setPct(eased * impactDashboard.quality.value);
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView]);

  const r = 84;
  const circ = 2 * Math.PI * r;

  return (
    <div ref={ref} className="flex flex-col items-center">
      <div className="relative h-52 w-52">
        <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90">
          <circle cx="100" cy="100" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
          <circle
            cx="100"
            cy="100"
            r={r}
            fill="none"
            stroke="var(--pen)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={circ * (1 - pct / 100)}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-syne text-3xl font-bold text-human">
            {pct.toFixed(2)}%
          </span>
        </div>
      </div>
      <span className="label mt-4 font-mono text-[11px] text-human/60">
        {impactDashboard.quality.label}
      </span>
      <span className="mt-1 font-fraunces text-xs italic text-human/40">
        {impactDashboard.quality.sub}
      </span>
    </div>
  );
}

function StatColumn({
  title,
  items,
}: {
  title: string;
  items: { value: string; label: string }[];
}) {
  return (
    <div>
      <span className="label font-mono text-[10px] text-pen/60">{title}</span>
      <ul className="mt-5 space-y-4">
        {items.map((item, i) => (
          <li key={i} className="flex items-baseline gap-3">
            <span className="min-w-[3.5rem] font-syne text-lg font-bold text-human">
              <ScrambleNumber value={item.value} delay={i * 0.25} />
            </span>
            <span className="font-fraunces text-sm text-human/55">
              {item.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ImpactDashboard() {
  return (
    <section
      id="impact"
      className="px-6 py-[120px] md:px-10"
      style={{ background: "rgba(4,3,3,0.55)" }}
    >
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 md:grid-cols-3">
        <Reveal>
          <StatColumn title="Scale" items={impactDashboard.scale} />
        </Reveal>
        <Reveal delay={0.2} className="flex justify-center">
          <QualityRing />
        </Reveal>
        <Reveal delay={0.35}>
          <StatColumn title="Speed" items={impactDashboard.speed} />
        </Reveal>
      </div>
    </section>
  );
}
