"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Reveal, SectionShell, SectionHeading } from "@/components/shared";
import { workSlug, type Tool } from "@/lib/defaultContent";

/* Section 4 — The Tools. Five cards, each with a small living visual. */

function ToolVisual({ type }: { type: string }) {
  switch (type) {
    case "extract":
      return (
        <div className="flex h-full items-center justify-between gap-3 px-4">
          <div className="h-16 w-1/3 rounded border border-chaos/40 p-1.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="mb-1 h-1.5 rounded-sm bg-chaos/50" />
            ))}
          </div>
          <motion.div
            className="h-px flex-1 origin-left bg-gradient-to-r from-chaos/40 to-clarity/70"
            animate={{ scaleX: [0, 1, 1, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="h-16 w-1/3 rounded border border-clarity/40 p-1.5">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="mb-1 h-1.5 rounded-sm bg-clarity/60"
                animate={{ opacity: [0.2, 1, 1, 0.2] }}
                transition={{ duration: 3, repeat: Infinity, delay: i * 0.3 }}
              />
            ))}
          </div>
        </div>
      );
    case "review":
      return (
        <div className="flex h-full items-center justify-center gap-2 px-4">
          <div className="w-2/3 space-y-1.5">
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="h-1.5 rounded-sm"
                animate={{
                  backgroundColor:
                    i === 1
                      ? ["#55524C80", "#FF6B6B99", "#D8D2C499"]
                      : ["#55524C80", "#55524C80"],
                }}
                transition={{ duration: 3, repeat: Infinity }}
                style={{ width: `${90 - i * 12}%` }}
              />
            ))}
          </div>
          <motion.div
            className="h-16 w-1/4 rounded border border-pen/40 bg-pen/5"
            animate={{ x: [24, 0], opacity: [0, 1] }}
            transition={{ duration: 1.4, repeat: Infinity, repeatType: "reverse", repeatDelay: 1 }}
          />
        </div>
      );
    case "crawl":
      return (
        <div className="relative flex h-full items-center justify-center">
          {[...Array(9)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-1.5 w-1.5 rounded-full bg-chaos/60"
              style={{
                left: `${18 + (i % 3) * 26}%`,
                top: `${22 + Math.floor(i / 3) * 26}%`,
              }}
              animate={{ backgroundColor: ["#55524C99", "#D8D2C4cc", "#55524C99"] }}
              transition={{ duration: 2.7, repeat: Infinity, delay: i * 0.3 }}
            />
          ))}
        </div>
      );
    case "sync":
      return (
        <div className="flex h-full items-center justify-between px-6">
          <div className="h-14 w-14 rounded border border-clarity/40" />
          <div className="relative h-px flex-1 mx-3 bg-white/10">
            <motion.div
              className="absolute top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-pen"
              animate={{ left: ["0%", "100%", "0%"] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
          <div className="h-14 w-14 rounded border border-pen/40" />
        </div>
      );
    default:
      return (
        <div className="flex h-full items-center justify-center gap-4 px-4 font-mono text-[10px]">
          <motion.span
            className="text-chaos"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 2.6, repeat: Infinity }}
          >
            ## heading
          </motion.span>
          <span className="text-pen">→</span>
          <motion.span
            className="text-clarity"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 2.6, repeat: Infinity }}
          >
            &lt;title&gt;heading&lt;/title&gt;
          </motion.span>
        </div>
      );
  }
}

export default function ToolsSection({
  tools,
  heading,
  closing,
}: {
  tools: Tool[];
  heading: string;
  closing: string;
}) {
  return (
    <SectionShell id="tools">
      <div className="relative">
        <SectionHeading>{heading}</SectionHeading>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool, i) => (
            <Reveal key={tool.name} delay={Math.min(i * 0.1, 0.4)}>
              <Link
                href={`/tools#${workSlug(tool.name)}`}
                className="card-hover group flex h-full flex-col rounded-lg p-8"
                style={{ background: "rgba(255,255,255,0.015)" }}
              >
                <div className="mb-5 h-[140px] overflow-hidden rounded-md border border-white/5 bg-black/20">
                  <ToolVisual type={tool.visual} />
                </div>
                <h3 className="font-syne text-lg font-bold text-human">
                  {tool.name}
                </h3>
                <p className="mt-3 font-mono text-[10px] text-pen/70">
                  {tool.stack.join(" · ")}
                </p>
                <p className="mt-4 flex-1 font-fraunces text-sm leading-[1.7] text-human/60">
                  {tool.description}
                </p>
                <p className="mt-5 font-mono text-xs text-clarity">
                  {tool.impact}
                </p>
                <span className="label mt-5 font-mono text-[11px] text-pen/80 transition-colors group-hover:text-pen">
                  View Details →
                </span>
              </Link>
            </Reveal>
          ))}
        </div>

        <div className="h-20" aria-hidden="true" />
        <Reveal className="text-center">
          <p className="mx-auto max-w-2xl font-syne text-xl font-bold leading-relaxed text-human md:text-2xl">
            {closing}
          </p>
        </Reveal>
      </div>
    </SectionShell>
  );
}
