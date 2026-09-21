import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SubPageShell from "@/components/SubPageShell";
import { getSampleSet, sampleSets } from "@/lib/samples";

type Params = { set: string };

export function generateStaticParams(): Params[] {
  return sampleSets.map((s) => ({ set: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const set = getSampleSet(params.set);
  if (!set) return { title: "Not found" };
  return {
    title: `${set.title} · Documentation sample · Murali Krishna Kolipaka`,
    description: set.summary,
  };
}

export default function SampleSetPage({ params }: { params: Params }) {
  const set = getSampleSet(params.set);
  if (!set) notFound();

  return (
    <SubPageShell>
      <main className="mx-auto max-w-3xl px-6 pb-16 pt-12 md:px-10 md:pt-16">
        <nav className="font-mono text-[11px] text-human/40">
          <Link href="/samples" className="transition-colors hover:text-pen">
            Samples
          </Link>
        </nav>

        <p className="label mt-8 font-mono text-[11px] text-pen">{set.kicker}</p>
        <h1 className="mt-3 font-syne text-heading-1 font-bold leading-snug text-human">
          {set.title}
        </h1>
        <p className="mt-6 font-fraunces text-[16px] leading-[1.8] text-human/80">
          {set.summary}
        </p>

        {/* the craft points: what a skimming reader should look for */}
        <section className="mt-12">
          <span className="label font-mono text-[10px] text-human/40">
            What to look at
          </span>
          <ul className="mt-4 space-y-4">
            {set.craft.map((point, i) => (
              <li key={i} className="flex gap-3">
                <span
                  className="mt-[10px] h-1 w-1 shrink-0 rounded-full bg-pen/60"
                  aria-hidden="true"
                />
                <span className="font-fraunces text-[15px] leading-[1.75] text-human/75">
                  {point}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {set.standards.length > 0 && (
          <p className="mt-10 font-mono text-[11px] leading-relaxed text-human/40">
            {set.standards.join("  ·  ")}
          </p>
        )}

        {set.docs.length > 0 && (
          <section className="mt-16">
            <span className="label font-mono text-[10px] text-human/40">
              {set.docs.length === 1 ? "The document" : "The documents"}
            </span>
            <ul className="mt-4 space-y-3">
              {set.docs.map((doc) => (
                <li key={doc.slug}>
                  <Link
                    href={`/samples/${set.slug}/${doc.slug}`}
                    className="card-hover group block rounded-lg px-5 py-4"
                  >
                    <div className="flex items-baseline justify-between gap-4">
                      <h2 className="font-syne text-base font-bold text-human">
                        {doc.title}
                      </h2>
                      <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.08em] text-pen/60">
                        {doc.kind}
                      </span>
                    </div>
                    <p className="mt-2 font-fraunces text-sm leading-[1.7] text-human/60">
                      {doc.blurb}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {set.files && set.files.length > 0 && (
          <section className="mt-14">
            <span className="label font-mono text-[10px] text-human/40">
              Source files
            </span>
            <ul className="mt-4 space-y-2">
              {set.files.map((f) => (
                <li key={f.url}>
                  <a
                    href={f.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 rounded-md border border-white/5 px-4 py-3 font-fraunces text-sm text-human/80 transition-colors hover:border-pen/40 hover:text-human"
                  >
                    <span className="flex-1">{f.title}</span>
                    <span className="text-pen/60 group-hover:text-pen">↗</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        {set.caseSlug && (
          <Link
            href={`/case/${set.caseSlug}`}
            className="mt-14 inline-block font-mono text-xs text-pen/70 underline-offset-4 transition-colors hover:text-pen hover:underline"
          >
            Read how it was written →
          </Link>
        )}
      </main>
    </SubPageShell>
  );
}
