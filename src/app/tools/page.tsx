import type { Metadata } from "next";
import SubPageShell from "@/components/SubPageShell";
import { getTools } from "@/lib/content";
import { workSlug } from "@/lib/defaultContent";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Tools I Built · Murali Krishna Kolipaka",
  description:
    "Five automation tools built to eliminate documentation workflow inefficiencies: content extraction, editorial review, crawling, intake sync, and format pipelines.",
};

/* One long-form page holding every tool as a bookmarked section.
   Tool cards on the portfolio link to /tools#<slug>. */

export default async function ToolsPage() {
  const tools = await getTools();

  return (
    <SubPageShell>
      <main className="mx-auto max-w-3xl px-6 pb-16 pt-16 md:px-10 md:pt-24">
        <p className="label font-mono text-[11px] text-pen">The Tools</p>
        <h1 className="mt-3 font-syne text-heading-1 font-bold leading-snug text-human">
          I found inefficiencies in my own workflow. So I built tools to
          eliminate them.
        </h1>

        {/* bookmark index */}
        <nav
          className="mt-10 flex flex-wrap gap-x-6 gap-y-2"
          aria-label="Tools"
        >
          {tools.map((tool) => (
            <a
              key={tool.name}
              href={`#${workSlug(tool.name)}`}
              className="font-mono text-xs text-human/50 underline-offset-4 transition-colors hover:text-pen hover:underline"
            >
              {tool.name}
            </a>
          ))}
        </nav>

        <div className="mt-20 space-y-24">
          {tools.map((tool) => (
            <section
              key={tool.name}
              id={workSlug(tool.name)}
              className="scroll-mt-24"
            >
              <h2 className="font-syne text-2xl font-bold text-human">
                {tool.name}
              </h2>
              <p className="mt-2 font-mono text-[11px] text-pen/70">
                {tool.stack.join(" · ")}
              </p>
              <p className="mt-4 font-fraunces text-sm italic leading-[1.7] text-human/55">
                {tool.description}
              </p>

              {tool.details && (
                <div className="mt-6 space-y-5">
                  {tool.details.split("\n\n").map((para, i) => (
                    <p
                      key={i}
                      className="font-fraunces text-[15px] leading-[1.8] text-human/80"
                    >
                      {para}
                    </p>
                  ))}
                </div>
              )}

              <div className="mt-7 border-l-2 border-pen/50 pl-4">
                <span className="label font-mono text-[10px] text-pen/70">
                  Impact
                </span>
                <p className="mt-1 font-mono text-sm text-clarity">
                  {tool.impact}
                </p>
              </div>

              <div className="mt-16 h-px w-full bg-white/5" aria-hidden="true" />
            </section>
          ))}
        </div>

        <p className="mt-20 text-center font-syne text-lg font-bold text-human">
          None of these were in my job description. All of them were in my job.
        </p>
      </main>
    </SubPageShell>
  );
}
