"use client";

import { Reveal, ScrambleNumber } from "@/components/shared";
import type { StatCounter } from "@/lib/defaultContent";

/* Section 1 — The Scale. Three numbers. One line each. Then silence. */
export default function ScaleSection({ stats }: { stats: StatCounter[] }) {
  return (
    <section
      id="scale"
      className="relative px-6 pb-[120px] pt-[120px] md:px-10"
      
    >
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-12 md:gap-16">
        {stats.map((stat, i) => (
          <Reveal key={i} delay={i * 0.35} className="text-center">
            <div className="font-syne text-[20vw] font-bold leading-none text-human md:text-[9rem]">
              <ScrambleNumber value={stat.value} delay={i * 0.4} />
            </div>
            <p className="mt-4 font-fraunces text-sm text-human/60 md:text-base">
              {stat.label}
            </p>
          </Reveal>
        ))}
      </div>
      {/* breathing space below the last number — enforced */}
      <div className="h-[120px]" aria-hidden="true" />
    </section>
  );
}
