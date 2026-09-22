import type { Metadata } from "next";
import SubPageShell from "@/components/SubPageShell";
import ApiDemoSection from "@/components/sections/ApiDemoSection";
import { getCopy } from "@/lib/content";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "API Documentation Experience · Murali Krishna Kolipaka",
  description:
    "How I approach API documentation: developer experience first, failure states documented, and a working interactive demo.",
};

const philosophy = [
  "Most API documentation is written from the inside out: here is what we built, here are its parameters. Developers read it from the outside in: here is what I am trying to do, show me the shortest safe path. My documentation is structured for the second reader.",
  "That means every endpoint answers four questions in order: what does this do, what do I send, what comes back, and what happens when it fails. The last question is the one most documentation skips, and it is the one that costs the most support tickets. A developer who can diagnose a 401 from the docs alone never opens a ticket at all.",
  "It also means the same fact frequently has to be written twice. A declined payment is one event. The developer branching on it needs a stable code and a retry rule; the merchant whose card was refused needs to know their money is safe and who to call. Writing one of those and handing it to the other is the most common failure in payments documentation, and it is usually the developer copy that leaks. Toggle the demo below to see the same decline in both registers.",
  "The operation shown is a real one from the Ledger API, a specification I published in full as a demonstration piece, so the request, the response and the error bodies match the spec and the error reference exactly. The standards behind it are the ones I applied documenting 40+ REST endpoints and the Python SDK for a cloud workload automation platform, where the SAP and Docker integration paths turned out to be where the defects lived.",
];

export default async function ApiExperiencePage() {
  const copy = await getCopy();

  return (
    <SubPageShell>
      <main className="mx-auto max-w-4xl px-6 pt-16 md:px-10 md:pt-24">
        <p className="label font-mono text-[11px] text-pen">
          The API Experience
        </p>
        <h1 className="mt-3 font-syne text-heading-1 font-bold leading-snug text-human">
          API documentation is a user experience problem.
        </h1>

        <div className="mt-10 max-w-3xl space-y-5">
          {philosophy.map((para, i) => (
            <p
              key={i}
              className="font-fraunces text-[15px] leading-[1.8] text-human/80"
            >
              {para}
            </p>
          ))}
        </div>
      </main>

      {/* the working interactive demo, same component as the portfolio */}
      <ApiDemoSection
        heading="One declined payment, written for two readers."
        closing={copy.apiClosing}
      />
    </SubPageShell>
  );
}
