"use client";

import { useState } from "react";
import Link from "next/link";
import { Reveal, SectionShell, SectionHeading } from "@/components/shared";

/* Section 6 — The API Demo. Technical/Human toggle, three error pills. */

const errors = {
  "400": {
    json: `{
  "error": {
    "code": "invalid_request",
    "message": "Field 'source_format' is required.",
    "param": "source_format"
  }
}`,
    human:
      "The request body is missing a required field. Add source_format ('markdown' | 'html' | 'dita') and retry.",
  },
  "401": {
    json: `{
  "error": {
    "code": "unauthorized",
    "message": "API key is missing or expired."
  }
}`,
    human:
      "Your API key is missing or expired. Pass a valid key in the Authorization header: Bearer sk_live_...",
  },
  "500": {
    json: `{
  "error": {
    "code": "internal_error",
    "message": "Transformation engine unavailable.",
    "retry_after": 30
  }
}`,
    human:
      "Something failed on our side, not yours. Retry after 30 seconds; the request is safe to repeat.",
  },
};

const requestJson = `POST /v1/documents/transform
Authorization: Bearer sk_live_...
Content-Type: application/json

{
  "source_format": "markdown",
  "target_format": "dita",
  "content": "# Getting started...",
  "options": {
    "validate": true,
    "locale": "en-US"
  }
}`;

const successJson = `HTTP/1.1 200 OK

{
  "id": "tf_8Kd93hAq",
  "status": "complete",
  "target_format": "dita",
  "output_url": "https://api.example.com/v1/documents/tf_8Kd93hAq/output",
  "warnings": []
}`;

export default function ApiDemoSection({
  heading,
  closing,
  detailHref,
}: {
  heading: string;
  closing: string;
  detailHref?: string;
}) {
  const [view, setView] = useState<"technical" | "human">("technical");
  const [errorCode, setErrorCode] = useState<keyof typeof errors | null>(null);

  return (
    <div style={{ paddingTop: 100, paddingBottom: 100 }}>
      <SectionShell id="api">
        <SectionHeading>{heading}</SectionHeading>

        <Reveal>
          <div
            className="overflow-hidden rounded-xl border border-white/10"
            style={{ background: "var(--bg-darker)" }}
          >
            {/* toggle */}
            <div className="flex border-b border-white/10">
              {(["technical", "human"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`label flex-1 py-4 font-mono text-[11px] transition-colors md:flex-none md:px-8 ${
                    view === v
                      ? "bg-pen/10 text-pen"
                      : "text-human/50 hover:text-human"
                  }`}
                >
                  {v.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="p-6 md:p-10">
              <div className="mb-6 flex items-baseline gap-3">
                <span className="font-mono text-xs font-bold text-clarity">
                  POST
                </span>
                <code className="font-mono text-sm text-human">
                  /v1/documents/transform
                </code>
              </div>

              {view === "technical" ? (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <div>
                    <span className="label font-mono text-[10px] text-human/40">
                      Request
                    </span>
                    <pre className="mt-2 overflow-x-auto rounded-md bg-black/40 p-5 font-mono text-xs leading-relaxed text-human/80">
                      {requestJson}
                    </pre>
                  </div>
                  <div>
                    <span className="label font-mono text-[10px] text-human/40">
                      Response · 200
                    </span>
                    <pre className="mt-2 overflow-x-auto rounded-md bg-black/40 p-5 font-mono text-xs leading-relaxed text-clarity/90">
                      {successJson}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="max-w-2xl space-y-5 font-fraunces text-sm leading-[1.7] text-human/75">
                  <p>
                    <strong className="text-human">What this does:</strong>{" "}
                    Converts a document from one format to another (Markdown to
                    DITA, HTML to Markdown) while preserving structure,
                    headings, and links.
                  </p>
                  <p>
                    <strong className="text-human">When to use it:</strong> When
                    your content lives in one system and needs to be published in
                    another. One call replaces a manual reformatting workflow.
                  </p>
                  <p>
                    <strong className="text-human">What you need:</strong> An API
                    key, the source content, and the two format names. Set{" "}
                    <code className="font-mono text-xs text-clarity">
                      validate: true
                    </code>{" "}
                    to catch structural issues before they reach production.
                  </p>
                </div>
              )}

              {/* error pills — three, considered */}
              <div className="mt-10">
                <span className="label font-mono text-[10px] text-human/40">
                  Error states: documented, not hidden
                </span>
                <div className="mt-3 flex flex-wrap gap-6">
                  {(Object.keys(errors) as (keyof typeof errors)[]).map((code) => (
                    <button
                      key={code}
                      onClick={() =>
                        setErrorCode(errorCode === code ? null : code)
                      }
                      className={`font-mono text-sm underline-offset-4 transition-colors ${
                        errorCode === code
                          ? "text-warn underline decoration-warn/60"
                          : "text-human/60 hover:text-human"
                      }`}
                    >
                      {code}
                    </button>
                  ))}
                </div>
                {errorCode && (
                  <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <pre className="overflow-x-auto rounded-md bg-black/40 p-5 font-mono text-xs leading-relaxed text-warn/80">
                      {errors[errorCode].json}
                    </pre>
                    <p className="rounded-md border border-white/5 p-5 font-fraunces text-sm leading-[1.7] text-human/70">
                      {errors[errorCode].human}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Reveal>

        <div className="h-16" aria-hidden="true" />
        <Reveal className="text-center">
          <p className="font-fraunces text-lg italic text-human/80">{closing}</p>
          {detailHref && (
            <Link
              href={detailHref}
              className="label mt-6 inline-block font-mono text-[11px] text-pen/80 transition-colors hover:text-pen"
            >
              Explore the full API experience →
            </Link>
          )}
        </Reveal>
      </SectionShell>
    </div>
  );
}
