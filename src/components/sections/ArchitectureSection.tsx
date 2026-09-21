"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Reveal, SectionShell, SectionHeading } from "@/components/shared";
import { caseDiagrams } from "@/components/sections/caseDiagrams";
import type { CaseStudy } from "@/lib/defaultContent";

/* Section 3 — The Architecture. Employment case studies, each with its own
   diagram drawing that project's actual mechanism, sides alternating so the
   column reads as a sequence. "View all" reveals the rest. */

function DiagramArchitecture() {
  /* chaotic tangle → clean hierarchy */
  return (
    <svg viewBox="0 0 400 240" className="h-full w-full" aria-hidden="true">
      {/* chaos side */}
      <g stroke="#55524C" strokeWidth="1" opacity="0.5">
        <motion.path
          d="M30 40 C90 120, 20 160, 80 200 M50 30 C10 90, 110 140, 40 210 M70 50 C130 70, 30 190, 100 180"
          fill="none"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, ease: [0.23, 1, 0.32, 1] }}
        />
      </g>
      {/* transformation arrow */}
      <motion.path
        d="M150 120 H 220"
        stroke="#E8D5A3"
        strokeWidth="1.5"
        fill="none"
        markerEnd="url(#arrowPen)"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 1.2 }}
      />
      <defs>
        <marker id="arrowPen" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6" fill="none" stroke="#E8D5A3" strokeWidth="1" />
        </marker>
      </defs>
      {/* clean hierarchy side */}
      <g>
        <motion.g
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 1.8 }}
        >
          <circle cx="310" cy="50" r="7" fill="#D8D2C4" />
          {[
            [260, 120],
            [310, 120],
            [360, 120],
          ].map(([x, y], i) => (
            <g key={i}>
              <line x1="310" y1="57" x2={x} y2={y - 7} stroke="#D8D2C4" strokeWidth="1" opacity="0.6" />
              <circle cx={x} cy={y} r="5" fill="#D8D2C4" opacity="0.85" />
              <line x1={x} y1={y + 5} x2={x - 15} y2={y + 60} stroke="#D8D2C4" strokeWidth="0.8" opacity="0.4" />
              <line x1={x} y1={y + 5} x2={x + 15} y2={y + 60} stroke="#D8D2C4" strokeWidth="0.8" opacity="0.4" />
              <circle cx={x - 15} cy={y + 65} r="3.5" fill="#D8D2C4" opacity="0.6" />
              <circle cx={x + 15} cy={y + 65} r="3.5" fill="#D8D2C4" opacity="0.6" />
            </g>
          ))}
        </motion.g>
      </g>
    </svg>
  );
}

function DiagramFlow() {
  /* English source branching to regional languages with transform nodes */
  const branches = [
    { y: 60, label: "हिन्दी" },
    { y: 120, label: "తెలుగు" },
    { y: 180, label: "தமிழ்" },
  ];
  return (
    <svg viewBox="0 0 400 240" className="h-full w-full" aria-hidden="true">
      <motion.circle
        cx="60"
        cy="120"
        r="9"
        fill="#E8D5A3"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      />
      <text x="60" y="150" textAnchor="middle" fill="#F5F0E8" fontSize="10" opacity="0.6">
        EN source
      </text>
      {branches.map((b, i) => (
        <g key={i}>
          <motion.path
            d={`M70 120 C 160 120, 160 ${b.y}, 240 ${b.y}`}
            fill="none"
            stroke="#D8D2C4"
            strokeWidth="1.2"
            opacity="0.7"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, delay: 0.4 + i * 0.3 }}
          />
          {/* cultural transformation node */}
          <motion.rect
            x="234"
            y={b.y - 7}
            width="14"
            height="14"
            rx="3"
            fill="none"
            stroke="#E8D5A3"
            strokeWidth="1.2"
            initial={{ opacity: 0, rotate: 0 }}
            whileInView={{ opacity: 1, rotate: 45 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 1.4 + i * 0.3 }}
            style={{ transformOrigin: `241px ${b.y}px` }}
          />
          <motion.line
            x1="252"
            y1={b.y}
            x2="320"
            y2={b.y}
            stroke="#D8D2C4"
            strokeWidth="1.2"
            opacity="0.7"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 1.8 + i * 0.3 }}
          />
          <motion.text
            x="336"
            y={b.y + 4}
            fill="#D8D2C4"
            fontSize="13"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 0.9 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 2.1 + i * 0.3 }}
          >
            {b.label}
          </motion.text>
        </g>
      ))}
    </svg>
  );
}

function DiagramPipeline() {
  /* XML → manual → PDF → weeks   ⇒   MD → Git → CI/CD → live → hours */
  const oldSteps = ["XML", "manual export", "PDF", "weeks"];
  const newSteps = ["Markdown", "Git", "CI/CD", "live", "hours"];
  return (
    <svg viewBox="0 0 400 240" className="h-full w-full" aria-hidden="true">
      {/* old pipeline — struck through */}
      {oldSteps.map((s, i) => (
        <motion.g
          key={s}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.45 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: i * 0.2 }}
        >
          <rect x={20 + i * 95} y="50" width="80" height="28" rx="4" fill="none" stroke="#55524C" />
          <text x={60 + i * 95} y="68" textAnchor="middle" fill="#55524C" fontSize="10">
            {s}
          </text>
          {i < oldSteps.length - 1 && (
            <text x={104 + i * 95} y="68" fill="#55524C" fontSize="10">→</text>
          )}
        </motion.g>
      ))}
      <motion.line
        x1="15"
        y1="64"
        x2="390"
        y2="64"
        stroke="#FF6B6B"
        strokeWidth="1"
        opacity="0.55"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 1.1 }}
      />
      {/* new pipeline */}
      {newSteps.map((s, i) => (
        <motion.g
          key={s}
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 1.4 + i * 0.25 }}
        >
          <rect x={12 + i * 78} y="150" width="66" height="28" rx="4" fill="none" stroke="#D8D2C4" />
          <text x={45 + i * 78} y="168" textAnchor="middle" fill="#D8D2C4" fontSize="10">
            {s}
          </text>
          {i < newSteps.length - 1 && (
            <text x={80 + i * 78} y="168" fill="#E8D5A3" fontSize="10">→</text>
          )}
        </motion.g>
      ))}
    </svg>
  );
}

/* Legacy generic diagrams, kept as the fallback for a case study added
   through the admin panel before it has a diagram of its own. */
const diagrams: Record<string, () => JSX.Element> = {
  architecture: DiagramArchitecture,
  flow: DiagramFlow,
  pipeline: DiagramPipeline,
};

function CaseCard({ cs, index }: { cs: CaseStudy; index: number }) {
  const Diagram =
    caseDiagrams[cs.diagram] ?? diagrams[cs.diagram] ?? DiagramArchitecture;
  /* Alternating sides so a column of cards reads as a sequence rather than
     as the same card repeated with different words in it. */
  const flipped = index % 2 === 1;

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
      <Reveal className={flipped ? "order-1 lg:order-2" : "order-1"}>
        <div
          className="h-[240px] w-full overflow-hidden rounded-lg border border-white/5 p-4 lg:h-[320px]"
          style={{ background: "rgba(255,255,255,0.015)" }}
        >
          <Diagram />
        </div>
      </Reveal>
      <Reveal delay={0.3} className={flipped ? "order-2 lg:order-1" : "order-2"}>
        <span className="label font-mono text-[10px] text-pen">{cs.domain}</span>
        <h3 className="mt-2 font-syne text-2xl font-bold text-human">{cs.title}</h3>

        {(cs.org || cs.period) && (
          <p className="mt-2 font-mono text-[11px] text-human/45">
            {[cs.org, cs.period].filter(Boolean).join("  ·  ")}
          </p>
        )}

        <dl className="mt-6 space-y-5">
          {(
            [
              ["Problem", cs.problem],
              ["Insight", cs.insight],
              ["Result", cs.result],
            ] as const
          ).map(([k, v]) => (
            <div key={k}>
              <dt className="label font-mono text-[10px] text-human/40">{k}</dt>
              <dd className="mt-1 font-fraunces text-sm leading-[1.7] text-human/75">
                {v}
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-6 font-mono text-sm text-clarity">{cs.impact}</p>

        {cs.stack && cs.stack.length > 0 && (
          <p className="mt-4 font-mono text-[10px] leading-relaxed text-human/35">
            {cs.stack.join("  ·  ")}
          </p>
        )}

        <Link
          href={`/case/${cs.slug}`}
          className="label mt-7 inline-block font-mono text-[11px] text-pen/80 transition-colors hover:text-pen"
        >
          Read the full case study →
        </Link>
      </Reveal>
    </div>
  );
}

export default function ArchitectureSection({
  cases,
  heading,
}: {
  cases: CaseStudy[];
  heading: string;
}) {
  const [showAll, setShowAll] = useState(false);
  /* Employment history only. The demonstration pieces have their own case
     studies, reached from the sample they belong to, so they are not mixed
     in here where a reader would reasonably read them as client work. */
  const work = cases.filter((c) => (c.kind ?? "work") === "work");
  const featured = work.filter((c) => c.featured !== false);
  const extra = work.filter((c) => c.featured === false);
  const visible = showAll ? [...featured, ...extra] : featured;

  return (
    <SectionShell id="architecture">
      <div className="relative">
        <SectionHeading>{heading}</SectionHeading>

        <div className="flex flex-col gap-20">
          {visible.map((cs, i) => (
            <CaseCard key={cs.slug} cs={cs} index={i} />
          ))}
        </div>

        {!showAll && extra.length > 0 && (
          <Reveal className="mt-16 text-center">
            <button
              onClick={() => setShowAll(true)}
              className="label font-mono text-xs text-pen/70 transition-colors hover:text-pen"
            >
              View all case studies →
            </button>
          </Reveal>
        )}
      </div>
    </SectionShell>
  );
}
