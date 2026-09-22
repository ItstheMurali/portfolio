import type { Metadata } from "next";
import Link from "next/link";
import SubPageShell from "@/components/SubPageShell";
import { sampleSets } from "@/lib/samples";

export const metadata: Metadata = {
  title: "Documentation samples · Murali Krishna Kolipaka",
  description:
    "Complete documentation samples: spec-first API reference, tutorial-first API docs, release notes with a migration path, a knowledge base suite, a structured-authoring technical manual, and an automated prose governance system.",
};

export default function SamplesIndexPage() {
  return (
    <SubPageShell>
      <main className="mx-auto max-w-3xl px-6 pb-16 pt-16 md:px-10 md:pt-24">
        <p className="label font-mono text-[11px] text-pen">The Samples</p>
        <h1 className="mt-3 font-syne text-heading-1 font-bold leading-snug text-human">
          Six complete pieces. Not excerpts.
        </h1>
        <p className="mt-6 font-fraunces text-[16px] leading-[1.8] text-human/75">
          Each of these is a finished system rather than a page pulled out of
          one: the reference and the ruleset that governs it, the release note
          and the migration guide it points to, the help article and the three
          others it is structurally bound to. Documentation is judged as a
          system, so it is shown as one.
        </p>

        <ul className="mt-16 space-y-5">
          {sampleSets.map((set) => (
            <li key={set.slug}>
              <Link
                href={`/samples/${set.slug}`}
                className="card-hover group block rounded-lg px-6 py-6"
              >
                <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-pen/60">
                  {set.kicker}
                </p>
                <h2 className="mt-2 font-syne text-xl font-bold text-human">
                  {set.title}
                </h2>
                <p className="mt-3 font-fraunces text-sm leading-[1.75] text-human/65">
                  {set.teaser}
                </p>
                <p className="mt-4 font-mono text-[11px] text-human/35">
                  {set.docs.length > 0
                    ? `${set.docs.length} document${set.docs.length === 1 ? "" : "s"}`
                    : `${set.files?.length ?? 0} source files`}
                  {set.standards.length > 0 && `  ·  ${set.standards[0]}`}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </SubPageShell>
  );
}
