import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SubPageShell from "@/components/SubPageShell";
import { renderSampleDoc } from "@/lib/markdown";
import { getSampleDoc, sampleSets } from "@/lib/samples";

type Params = { set: string; doc: string };

export function generateStaticParams(): Params[] {
  return sampleSets.flatMap((set) =>
    set.docs.map((doc) => ({ set: set.slug, doc: doc.slug }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const found = getSampleDoc(params.set, params.doc);
  if (!found) return { title: "Not found" };
  return {
    title: `${found.doc.title} · ${found.set.title} · Murali Krishna Kolipaka`,
    description: found.doc.blurb,
  };
}

export default async function SampleDocPage({ params }: { params: Params }) {
  const found = getSampleDoc(params.set, params.doc);
  if (!found) notFound();
  const { set, doc } = found;

  const rendered = await renderSampleDoc(set.slug, doc.slug);
  if (!rendered) notFound();

  const index = set.docs.findIndex((d) => d.slug === doc.slug);
  const prev = index > 0 ? set.docs[index - 1] : null;
  const next = index < set.docs.length - 1 ? set.docs[index + 1] : null;

  return (
    <SubPageShell>
      <main className="mx-auto max-w-6xl px-6 pb-16 pt-12 md:px-10 md:pt-16">
        <nav className="font-mono text-[11px] text-human/40">
          <Link href="/samples" className="transition-colors hover:text-pen">
            Samples
          </Link>
          <span className="px-2 text-human/25">/</span>
          <Link
            href={`/samples/${set.slug}`}
            className="transition-colors hover:text-pen"
          >
            {set.title}
          </Link>
        </nav>

        <div className="mt-8 lg:flex lg:gap-14">
          {/* contents rail */}
          {rendered.outline.length > 1 && (
            <aside className="mb-12 lg:order-2 lg:mb-0 lg:w-56 lg:shrink-0">
              <div className="lg:sticky lg:top-28">
                <span className="label font-mono text-[10px] text-human/35">
                  On this page
                </span>
                <ul className="mt-3 space-y-2 border-l border-white/8 pl-4">
                  {rendered.outline.map((h) => (
                    <li key={h.id}>
                      <a
                        href={`#${h.id}`}
                        className="block font-mono text-[11px] leading-relaxed text-human/45 transition-colors hover:text-pen"
                      >
                        {h.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          )}

          <article className="min-w-0 flex-1 lg:order-1">
            <span className="label font-mono text-[10px] text-pen/70">
              {doc.kind}
            </span>
            <h1 className="mt-3 font-syne text-3xl font-bold leading-tight text-human md:text-4xl">
              {doc.title}
            </h1>
            <p className="mt-4 font-fraunces text-[15px] italic leading-[1.7] text-human/55">
              {doc.blurb}
            </p>

            <div
              className={`mt-12 ${doc.asSource ? "prose-doc prose-source" : "prose-doc"}`}
              dangerouslySetInnerHTML={{ __html: rendered.html }}
            />

            {(prev || next) && (
              <nav className="mt-20 flex flex-col gap-3 border-t border-white/8 pt-8 sm:flex-row sm:justify-between">
                {prev ? (
                  <Link
                    href={`/samples/${set.slug}/${prev.slug}`}
                    className="font-mono text-xs text-human/50 transition-colors hover:text-pen"
                  >
                    ← {prev.title}
                  </Link>
                ) : (
                  <span />
                )}
                {next && (
                  <Link
                    href={`/samples/${set.slug}/${next.slug}`}
                    className="font-mono text-xs text-human/50 transition-colors hover:text-pen sm:text-right"
                  >
                    {next.title} →
                  </Link>
                )}
              </nav>
            )}
          </article>
        </div>
      </main>
    </SubPageShell>
  );
}
