"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Reveal, SectionShell } from "@/components/shared";
import type { Film } from "@/lib/defaultContent";

/* Section 8 — The Dimension. Warmer background. Fade-only entrances.
   THE SILENCE RULE: after both heading lines fade in, 1500ms of complete
   stillness before the film cards appear. */

export default function FilmsSection({
  films,
  lineA,
  lineB,
  closing,
}: {
  films: Film[];
  lineA: string;
  lineB: string;
  closing: string;
}) {
  const headRef = useRef<HTMLDivElement>(null);
  const inView = useInView(headRef, { once: true, margin: "-100px" });
  const [showCards, setShowCards] = useState(false);

  useEffect(() => {
    if (!inView) return;
    // lineA (1.2s) + lineB delay/duration (~2.6s total) + 1500ms stillness
    const t = setTimeout(() => setShowCards(true), 4100);
    return () => clearTimeout(t);
  }, [inView]);

  return (
    <SectionShell id="films" bg="rgba(13,10,8,0.6)">
      <div className="relative">
        <div ref={headRef} className="mx-auto max-w-2xl text-center">
          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 1.2 }}
            className="font-fraunces text-xl italic leading-relaxed text-human md:text-2xl"
          >
            {lineA}
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 1.2, delay: 1.4 }}
            className="mt-6 font-fraunces text-xl italic leading-relaxed text-pen md:text-2xl"
          >
            {lineB}
          </motion.p>
        </div>

        {/* the stillness lives here — no animation until showCards */}
        <div className="h-14" aria-hidden="true" />

        {/* Columns follow the film count so the row stays centered. A fixed
            three-column grid holding two films leaves a gap on the right and
            reads as a missing card rather than as a deliberate pair. */}
        <div
          className={`mx-auto grid min-h-[300px] grid-cols-1 gap-6 ${
            films.length === 1
              ? "max-w-sm"
              : films.length === 2
                ? "max-w-3xl sm:grid-cols-2"
                : "sm:grid-cols-2 lg:grid-cols-3"
          }`}
        >
          {showCards &&
            films.map((film, i) => (
              <motion.a
                key={film.title}
                href={film.youtube_url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: i * 0.25 }}
                className="card-hover group flex flex-col rounded-lg p-8 md:aspect-[2/3]"
                style={{ background: "rgba(255,255,255,0.015)" }}
              >
                <span className="label font-mono text-[10px] text-pen/70">
                  {film.genre}
                </span>
                <h3 className="mt-2 font-syne text-2xl font-bold text-human">
                  {film.title}
                </h3>
                <p className="mt-4 flex-1 font-fraunces text-sm leading-[1.7] text-human/60">
                  {film.description}
                </p>
                <p className="mt-4 font-fraunces text-xs italic leading-[1.7] text-clarity/80">
                  “{film.lesson}”
                </p>
                <div className="mt-5 flex flex-wrap gap-1.5">
                  {film.tools.map((t) => (
                    <span
                      key={t}
                      className="font-mono text-[9px] text-human/40"
                    >
                      {t} ·
                    </span>
                  ))}
                </div>
                <span className="label mt-5 font-mono text-[11px] text-pen/80 group-hover:text-pen">
                  Watch on YouTube ↗
                </span>
              </motion.a>
            ))}
        </div>

        <div className="h-20" aria-hidden="true" />
        <Reveal fadeOnly className="text-center">
          <p className="font-fraunces text-lg italic text-human/80">{closing}</p>
        </Reveal>
      </div>
    </SectionShell>
  );
}
