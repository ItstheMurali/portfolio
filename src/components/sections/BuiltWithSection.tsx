"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Reveal, SectionShell, SectionHeading } from "@/components/shared";
import { builtWith, sectionCopy } from "@/lib/defaultContent";

/* Section 7 — Built With Intention. Tech cards; Supabase card easter egg. */

function TechCard({
  tech,
}: {
  tech: { name: string; why: string; what: string };
}) {
  const [open, setOpen] = useState(false);
  const [egg, setEgg] = useState(false);
  const isSupabase = tech.name.startsWith("Supabase (");

  return (
    <button
      onClick={() => {
        setOpen(!open);
        if (isSupabase) {
          setEgg(true);
          setTimeout(() => setEgg(false), 2600);
        }
      }}
      className="card-hover w-full rounded-lg p-6 text-left"
      style={{ background: "rgba(255,255,255,0.015)" }}
    >
      <div className="flex items-center justify-between gap-2">
        <h4 className="font-syne text-sm font-bold text-human">{tech.name}</h4>
        <span className="text-xs text-pen/50">{open ? "−" : "+"}</span>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="mt-3 font-fraunces text-xs leading-[1.7] text-human/60">
              <span className="label font-mono text-[9px] text-pen/60">
                Why this ·{" "}
              </span>
              {tech.why}
            </p>
            <p className="mt-2 font-fraunces text-xs leading-[1.7] text-human/60">
              <span className="label font-mono text-[9px] text-clarity/60">
                What it does here ·{" "}
              </span>
              {tech.what}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
      {/* easter egg: database rows populating */}
      <AnimatePresence>
        {egg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-3 space-y-1 font-mono text-[9px] text-clarity/70"
          >
            {["insert into tools ...", "insert into cases ...", "insert into films ...", "commit;"].map(
              (row, i) => (
                <motion.div
                  key={row}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.35 }}
                >
                  ▸ {row}
                </motion.div>
              )
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}

export default function BuiltWithSection() {
  const groups = [
    { label: "Frontend", items: builtWith.frontend },
    { label: "Backend", items: builtWith.backend },
    { label: "Infrastructure", items: builtWith.infrastructure },
  ];

  return (
    <SectionShell id="built" bg="rgba(4,3,3,0.55)">
      <SectionHeading>{sectionCopy.builtWithHeading}</SectionHeading>
      <Reveal>
        <p className="mb-14 max-w-2xl font-fraunces text-sm leading-[1.7] text-human/60">
          {sectionCopy.builtWithIntro}
        </p>
      </Reveal>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        {groups.map((group, gi) => (
          <Reveal key={group.label} delay={gi * 0.15}>
            <span className="label font-mono text-[10px] text-pen/70">
              {group.label}
            </span>
            <div className="mt-4 space-y-3">
              {group.items.map((tech) => (
                <TechCard key={tech.name} tech={tech} />
              ))}
            </div>
          </Reveal>
        ))}
      </div>
    </SectionShell>
  );
}
