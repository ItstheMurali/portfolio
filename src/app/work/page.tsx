import type { Metadata } from "next";
import Link from "next/link";
import SubPageShell from "@/components/SubPageShell";
import { getCopy, getWorkCategories } from "@/lib/content";
import { workSlug } from "@/lib/defaultContent";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Work Samples · Murali Krishna Kolipaka",
  description:
    "Detailed work samples across API documentation, user documentation, release notes, knowledge bases, technical manuals, information architecture, and Docs-as-Code.",
};

/* One long-form page holding every work category as a bookmarked section.
   Cards on the portfolio link to /work#<slug>.

   The heading comes from the copy table, the same source the homepage
   section reads, so the line cannot drift between the two surfaces. */

export default async function WorkPage() {
  const [categories, copy] = await Promise.all([
    getWorkCategories(),
    getCopy(),
  ]);

  return (
    <SubPageShell>
      <main className="mx-auto max-w-3xl px-6 pb-16 pt-16 md:px-10 md:pt-24">
        <p className="label font-mono text-[11px] text-pen">The Work</p>
        <h1 className="mt-3 font-syne text-heading-1 font-bold leading-snug text-human">
          {copy.workHeading}
        </h1>
        <p className="mt-5 font-fraunces text-[15px] leading-[1.8] text-human/70">
          Each category below links to a complete sample rather than an excerpt.
          They are collected in one place on the{" "}
          <Link
            href="/samples"
            className="text-pen underline decoration-pen/35 underline-offset-4 transition-colors hover:decoration-pen"
          >
            samples index
          </Link>
          .
        </p>

        {/* bookmark index */}
        <nav
          className="mt-10 flex flex-wrap gap-x-6 gap-y-2"
          aria-label="Work categories"
        >
          {categories.map((cat) => (
            <a
              key={cat.name}
              href={`#${workSlug(cat.name)}`}
              className="font-mono text-xs text-human/50 underline-offset-4 transition-colors hover:text-pen hover:underline"
            >
              {cat.name}
            </a>
          ))}
        </nav>

        <div className="mt-20 space-y-24">
          {categories.map((cat) => (
            <section
              key={cat.name}
              id={workSlug(cat.name)}
              className="scroll-mt-24"
            >
              <h2 className="font-syne text-2xl font-bold text-human">
                {cat.name}
              </h2>
              <p className="mt-3 font-fraunces text-sm italic leading-[1.7] text-human/55">
                {cat.description}
              </p>

              {cat.details && (
                <div className="mt-6 space-y-5">
                  {cat.details.split("\n\n").map((para, i) => (
                    <p
                      key={i}
                      className="font-fraunces text-[15px] leading-[1.8] text-human/80"
                    >
                      {para}
                    </p>
                  ))}
                </div>
              )}

              {cat.impact && (
                <div className="mt-7 border-l-2 border-pen/50 pl-4">
                  <span className="label font-mono text-[10px] text-pen/70">
                    Impact
                  </span>
                  <p className="mt-1 font-mono text-sm text-clarity">
                    {cat.impact}
                  </p>
                </div>
              )}

              {cat.samples.length > 0 && (
                <div className="mt-8">
                  <span className="label font-mono text-[10px] text-human/40">
                    {cat.samples_label ?? "Live public samples"}
                  </span>
                  <ul className="mt-3 space-y-2">
                    {cat.samples.map((s) => {
                      const internal = s.url.startsWith("/");
                      const className =
                        "group flex items-center gap-2 rounded-md border border-white/5 px-4 py-3 font-fraunces text-sm text-human/80 transition-colors hover:border-pen/40 hover:text-human";
                      return (
                        <li key={s.url}>
                          {internal ? (
                            <Link href={s.url} className={className}>
                              <span className="flex-1">{s.title}</span>
                              <span className="text-pen/60 group-hover:text-pen">
                                →
                              </span>
                            </Link>
                          ) : (
                            <a
                              href={s.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={className}
                            >
                              <span className="flex-1">{s.title}</span>
                              <span className="text-pen/60 group-hover:text-pen">
                                ↗
                              </span>
                            </a>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {cat.case_slug && (
                <Link
                  href={`/case/${cat.case_slug}`}
                  className="mt-8 inline-block font-mono text-xs text-pen/70 underline-offset-4 transition-colors hover:text-pen hover:underline"
                >
                  Read how it was written →
                </Link>
              )}

              <div className="mt-16 h-px w-full bg-white/5" aria-hidden="true" />
            </section>
          ))}
        </div>
      </main>
    </SubPageShell>
  );
}
