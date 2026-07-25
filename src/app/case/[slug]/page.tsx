import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SubPageShell from "@/components/SubPageShell";
import { getCases } from "@/lib/content";

export const revalidate = 0;

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cases = await getCases();
  const cs = cases.find((c) => c.slug === params.slug);
  return {
    title: cs
      ? `${cs.title} · Case Study · Murali Krishna Kolipaka`
      : "Case Study · Murali Krishna Kolipaka",
    description: cs?.problem ?? "Case study",
  };
}

function Paragraphs({ text }: { text?: string }) {
  if (!text) return null;
  return (
    <div className="space-y-5">
      {text.split("\n\n").map((para, i) => (
        <p
          key={i}
          className="font-fraunces text-[15px] leading-[1.8] text-human/80"
        >
          {para}
        </p>
      ))}
    </div>
  );
}

export default async function CasePage({ params }: Props) {
  const cases = await getCases();
  const cs = cases.find((c) => c.slug === params.slug);
  if (!cs) notFound();

  return (
    <SubPageShell>
      <main className="mx-auto max-w-3xl px-6 pb-16 pt-16 md:px-10 md:pt-24">
        <p className="label font-mono text-[11px] text-pen">{cs.domain}</p>
        <h1 className="mt-3 font-syne text-heading-1 font-bold leading-snug text-human">
          {cs.title}
        </h1>
        <p className="mt-6 font-mono text-sm text-clarity">{cs.impact}</p>

        {/* problem / insight / result */}
        <dl className="mt-14 space-y-8 border-l-2 border-white/10 pl-6">
          {(
            [
              ["Problem", cs.problem],
              ["Insight", cs.insight],
              ["Result", cs.result],
            ] as const
          ).map(([k, v]) => (
            <div key={k}>
              <dt className="label font-mono text-[10px] text-pen/70">{k}</dt>
              <dd className="mt-1.5 font-fraunces text-[15px] leading-[1.8] text-human/80">
                {v}
              </dd>
            </div>
          ))}
        </dl>

        {cs.full_description && (
          <section className="mt-16">
            <h2 className="label mb-5 font-mono text-[11px] text-human/40">
              The full story
            </h2>
            <Paragraphs text={cs.full_description} />
          </section>
        )}

        {cs.decisions && (
          <section className="mt-16">
            <h2 className="label mb-5 font-mono text-[11px] text-human/40">
              Key decisions
            </h2>
            <ul className="space-y-4">
              {cs.decisions.split("\n\n").map((d, i) => (
                <li key={i} className="flex gap-3">
                  <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-pen/70" />
                  <span className="font-fraunces text-[15px] leading-[1.8] text-human/80">
                    {d}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {cs.lessons && (
          <section className="mt-16 border-l-2 border-pen/50 pl-6">
            <h2 className="label mb-3 font-mono text-[11px] text-pen/70">
              What it taught me
            </h2>
            <p className="font-fraunces text-[15px] italic leading-[1.8] text-human/85">
              {cs.lessons}
            </p>
          </section>
        )}
      </main>
    </SubPageShell>
  );
}
