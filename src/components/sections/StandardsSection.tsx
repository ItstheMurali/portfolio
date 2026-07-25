"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { Reveal, SectionShell } from "@/components/shared";
import { standards } from "@/lib/defaultContent";

/* Section 5 — The Standards.
   "Some are fatal." flashes #FF6B6B for 1500ms, then settles to cream. */

export default function StandardsSection() {
  const ref = useRef<HTMLHeadingElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [fatalColor, setFatalColor] = useState("#FF6B6B");

  useEffect(() => {
    if (!inView) return;
    const t = setTimeout(() => setFatalColor("#F5F0E8"), 1500);
    return () => clearTimeout(t);
  }, [inView]);

  const columns = [
    {
      key: "aerospace",
      label: "Aerospace",
      ...standards.aerospace,
    },
    {
      key: "finance",
      label: "Global Finance",
      ...standards.finance,
    },
  ];

  return (
    <SectionShell id="standards">
      <Reveal>
        <h2 className="font-syne text-heading-2 font-bold leading-snug text-human">
          {standards.headingA}
          <br />
          <span
            ref={ref}
            style={{ color: fatalColor, transition: "color 800ms var(--ease-settle)" }}
          >
            {standards.headingB}
          </span>
        </h2>
      </Reveal>

      <div className="mt-14 grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-14">
        {columns.map((col, i) => (
          <Reveal key={col.key} delay={0.2 + i * 0.2}>
            <div
              className={`h-full ${i === 0 ? "md:border-r md:border-white/5 md:pr-14" : ""} ${
                i === 1 ? "border-t border-white/5 pt-10 md:border-t-0 md:pt-0" : ""
              }`}
            >
              <span className="label font-mono text-[10px] text-pen/70">
                {col.label}
              </span>
              <h3 className="mt-3 font-syne text-xl font-bold text-human">
                {col.orgs}
              </h3>
              <p className="mt-2 font-mono text-xs text-clarity/80">{col.specs}</p>
              <p className="mt-5 font-fraunces text-sm italic leading-[1.7] text-human/65">
                “{col.line}”
              </p>
              <p className="mt-6 font-syne text-3xl font-bold text-human">
                {col.metric}
                <span className="ml-3 font-mono text-xs font-normal text-human/50">
                  {col.metricLabel}
                </span>
              </p>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="h-16" aria-hidden="true" />
      <Reveal className="text-center">
        <p className="font-fraunces text-lg italic text-human/80">
          {standards.closing}
        </p>
      </Reveal>
    </SectionShell>
  );
}
