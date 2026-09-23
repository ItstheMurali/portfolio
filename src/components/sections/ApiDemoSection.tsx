"use client";

import { useState } from "react";
import Link from "next/link";
import { Reveal, SectionShell, SectionHeading } from "@/components/shared";

/* Section 6 — one event, three registers.

   This used to demo a third invented API with a bespoke `{ error: { ... } }`
   envelope and a 400 for a validation failure. Both contradicted the Ledger
   sample, which rejects that envelope in favour of RFC 9457 and uses 422.
   It now runs on an operation that exists in the published specification, so
   the homepage, the spec, the error reference and the help centre all agree. */

const requestText = `POST /v1/payments
Authorization: Bearer sk_live_...
Idempotency-Key: 8f14e45f-ea1b-4c2d-9a35-7b1d6e0c3a92
Content-Type: application/json

{
  "invoice_id": "inv_7TgH2ReQvA",
  "amount": { "amount": 5520000, "currency": "INR" },
  "payment_method_id": "pm_4KdN8xWs1B"
}`;

const responseText = `HTTP/1.1 201 Created
Location: /v1/payments/pay_3MvB9kLd7Q

{
  "id": "pay_3MvB9kLd7Q",
  "object": "payment",
  "status": "failed",
  "invoice_id": "inv_7TgH2ReQvA",
  "amount": { "amount": 5520000, "currency": "INR" },
  "amount_refunded": { "amount": 0, "currency": "INR" },
  "amount_refund_pending": { "amount": 0, "currency": "INR" },
  "failure_code": "do_not_honor",
  "failure_message": "Issuer declined without a stated reason.",
  "created_at": "2026-09-01T14:32:07Z"
}`;

/* RFC 9457 application/problem+json, matching errors.md field for field. */
const errors = {
  "401": {
    label: "invalid_api_key",
    json: `{
  "type": "https://docs.ledgerapi.dev/errors/invalid_api_key",
  "title": "Invalid API key",
  "status": 401,
  "code": "invalid_api_key",
  "detail": "The provided key is not valid for this environment.",
  "request_id": "req_8Kd2PqL4vN"
}`,
    human:
      "Almost always a test key sent to the live host, or the reverse. Check the key prefix against the host before anything else; the mismatch is deliberately a loud failure on the first call instead of a quiet one at settlement.",
  },
  "409": {
    label: "idempotency_key_reused",
    json: `{
  "type": "https://docs.ledgerapi.dev/errors/idempotency_key_reused",
  "title": "Idempotency key reused",
  "status": 409,
  "code": "idempotency_key_reused",
  "detail": "This key was first used with a different request body.",
  "request_id": "req_8Kd2PqL4vN"
}`,
    human:
      "A caller bug, not a transient fault. The key is being generated once per session or per day instead of once per logical operation. Retrying returns the same conflict, so the fix is in the key generation.",
  },
  "422": {
    label: "validation_failed",
    json: `{
  "type": "https://docs.ledgerapi.dev/errors/validation_failed",
  "title": "Validation failed",
  "status": 422,
  "code": "validation_failed",
  "detail": "One or more fields are invalid.",
  "request_id": "req_8Kd2PqL4vN",
  "errors": [
    {
      "field": "/amount/currency",
      "code": "unsupported_currency",
      "detail": "XYZ is not a supported ISO 4217 currency."
    }
  ]
}`,
    human:
      "Every invalid field is reported, not just the first, so a form can be corrected in one pass. The field path is a JSON Pointer into the request body you sent.",
  },
};

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
          <p className="mx-auto mb-10 max-w-2xl text-center font-fraunces text-[15px] leading-[1.8] text-human/60">
            One declined payment, written twice. The same event reaches a
            developer and a merchant, and they need opposite things from it.
          </p>
        </Reveal>

        <Reveal>
          <div
            className="overflow-hidden rounded-xl border border-white/10"
            style={{ background: "var(--bg-darker)" }}
          >
            {/* toggle */}
            <div
              className="flex border-b border-white/10"
              role="tablist"
              aria-label="Audience"
            >
              {(
                [
                  ["technical", "Developer"],
                  ["human", "Merchant"],
                ] as const
              ).map(([v, label]) => (
                <button
                  key={v}
                  role="tab"
                  aria-selected={view === v}
                  onClick={() => setView(v)}
                  className={`label flex-1 py-4 font-mono text-[11px] transition-colors md:flex-none md:px-8 ${
                    view === v
                      ? "bg-pen/10 text-pen"
                      : "text-human/50 hover:text-human"
                  }`}
                >
                  {label.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="p-6 md:p-10">
              <div className="mb-6 flex flex-wrap items-baseline gap-3">
                <span className="font-mono text-xs font-bold text-clarity">
                  POST
                </span>
                <code className="font-mono text-sm text-human">
                  /v1/payments
                </code>
                <span className="font-mono text-[10px] text-human/35">
                  Ledger API · 2026-09-01
                </span>
              </div>

              {view === "technical" ? (
                <>
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <div className="min-w-0">
                      <span className="label font-mono text-[10px] text-human/40">
                        Request
                      </span>
                      <pre className="mt-2 overflow-x-auto rounded-md bg-black/40 p-5 font-mono text-xs leading-relaxed text-human/80">
                        {requestText}
                      </pre>
                    </div>
                    <div className="min-w-0">
                      <span className="label font-mono text-[10px] text-human/40">
                        Response · 201
                      </span>
                      <pre className="mt-2 overflow-x-auto rounded-md bg-black/40 p-5 font-mono text-xs leading-relaxed text-clarity/90">
                        {responseText}
                      </pre>
                    </div>
                  </div>
                  <p className="mt-5 max-w-3xl font-fraunces text-sm leading-[1.75] text-human/65">
                    <strong className="text-human">
                      The card was declined and this is a 201.
                    </strong>{" "}
                    An HTTP status describes what happened to the request, not
                    what happened commercially. Routing a decline through a 4xx
                    sends it to a handler that cannot tell a refused card from a
                    wrong API key, and into retry middleware that issuers read
                    as abuse. Branch on{" "}
                    <code className="font-mono text-xs text-clarity">
                      status
                    </code>
                    , never on the status code.
                  </p>
                </>
              ) : (
                <div className="max-w-2xl space-y-5 font-fraunces text-sm leading-[1.75] text-human/75">
                  <p>
                    <strong className="text-human">Your payment was declined.</strong>{" "}
                    No money has left your account, and the invoice is still open
                    and still payable.
                  </p>
                  <p>
                    <strong className="text-human">What it means.</strong> Your
                    bank refused and did not say why. The silence is deliberate
                    and it is not ours: card networks withhold the reason from
                    merchants by design.
                  </p>
                  <p>
                    <strong className="text-human">What to do.</strong> Call the
                    number on the back of your card and ask whether there is a
                    block or a fraud hold. Most of these are a hold triggered by
                    an unfamiliar merchant, and your bank can release it while
                    you are on the phone. Do not keep retrying: repeated attempts
                    make the next one more likely to be refused.
                  </p>
                  <p className="text-human/50">
                    Same event, same underlying fact. Note what is not here:{" "}
                    <code className="font-mono text-xs text-clarity">
                      failure_message
                    </code>
                    , the string in the response above, is written in English
                    for your support staff and its wording is not part of the
                    contract. Showing it to the payer is the most common way
                    this goes wrong. Branch on{" "}
                    <code className="font-mono text-xs text-clarity">
                      failure_code
                    </code>{" "}
                    and map it to your own localized copy.
                  </p>
                </div>
              )}

              {/* error states, in the format the specification actually uses */}
              <div className="mt-10">
                <span className="label font-mono text-[10px] text-human/40">
                  Error states · RFC 9457 problem+json
                </span>
                <div className="mt-3 flex flex-wrap gap-6">
                  {(Object.keys(errors) as (keyof typeof errors)[]).map(
                    (code) => (
                      <button
                        key={code}
                        onClick={() =>
                          setErrorCode(errorCode === code ? null : code)
                        }
                        aria-expanded={errorCode === code}
                        className={`font-mono text-sm underline-offset-4 transition-colors ${
                          errorCode === code
                            ? "text-warn underline decoration-warn/60"
                            : "text-human/60 hover:text-human"
                        }`}
                      >
                        {code}{" "}
                        <span className="text-[11px] opacity-60">
                          {errors[code].label}
                        </span>
                      </button>
                    )
                  )}
                </div>
                {errorCode && (
                  <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <pre className="min-w-0 overflow-x-auto rounded-md bg-black/40 p-5 font-mono text-xs leading-relaxed text-warn/80">
                      {errors[errorCode].json}
                    </pre>
                    <p className="min-w-0 rounded-md border border-white/5 p-5 font-fraunces text-sm leading-[1.7] text-human/70">
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
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {detailHref && (
              <Link
                href={detailHref}
                className="label font-mono text-[11px] text-pen/80 transition-colors hover:text-pen"
              >
                How I approach API documentation →
              </Link>
            )}
            <Link
              href="/samples/ledger-api"
              className="label font-mono text-[11px] text-pen/80 transition-colors hover:text-pen"
            >
              The specification this comes from →
            </Link>
            <Link
              href="/samples/payments-kb/decline-reasons"
              className="label font-mono text-[11px] text-pen/80 transition-colors hover:text-pen"
            >
              The same facts for merchants →
            </Link>
          </div>
        </Reveal>
      </SectionShell>
    </div>
  );
}
