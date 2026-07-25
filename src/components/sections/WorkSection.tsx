"use client";

import Link from "next/link";
import { Reveal, SectionShell, SectionHeading } from "@/components/shared";
import { workSlug, type WorkCategory } from "@/lib/defaultContent";

/* Section 2 — The Work. Each card links to its bookmarked section
   on the /work samples page. */
export default function WorkSection({
  categories,
  heading,
}: {
  categories: WorkCategory[];
  heading: string;
}) {
  return (
    <SectionShell id="work">
      <SectionHeading>{heading}</SectionHeading>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat, i) => (
          <Reveal key={cat.name} delay={Math.min(i * 0.08, 0.4)}>
            <Link
              href={`/work#${workSlug(cat.name)}`}
              className="card-hover group flex h-full w-full flex-col rounded-lg p-8 text-left"
              style={{ background: "rgba(255,255,255,0.015)" }}
            >
              <h3 className="font-syne text-lg font-bold text-human">
                {cat.name}
              </h3>
              <p className="mt-3 flex-1 font-fraunces text-sm leading-[1.7] text-human/60">
                {cat.description}
              </p>
              {cat.impact && (
                <p className="mt-4 font-mono text-xs text-clarity/80">
                  {cat.impact}
                </p>
              )}
              <span className="label mt-6 font-mono text-[11px] text-pen/80 transition-colors group-hover:text-pen">
                View Samples →
              </span>
            </Link>
          </Reveal>
        ))}
      </div>
    </SectionShell>
  );
}
