"use client";

import { useState } from "react";
import { Reveal, SectionShell } from "@/components/shared";
import type { Identity } from "@/lib/defaultContent";

/* Section 9 — The Invitation. Direct contact, no form. */

export default function ContactSection({
  identity,
  question,
  invite,
  note,
}: {
  identity: Identity;
  question: string;
  invite: string;
  note: string;
}) {
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(identity.email);
      setCopied(true);
      if ("vibrate" in navigator) navigator.vibrate?.(10);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = `mailto:${identity.email}`;
    }
  };

  return (
    <SectionShell id="contact">
      <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
        <Reveal>
          <h2 className="font-fraunces text-[22px] italic leading-relaxed text-human md:text-3xl">
            {question}
          </h2>
        </Reveal>
        <Reveal delay={0.5}>
          <p className="mt-5 font-fraunces text-base text-human/60">{invite}</p>
        </Reveal>

        <div className="h-12" aria-hidden="true" />

        <Reveal delay={0.2} className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={copyEmail}
            className="card-hover flex h-14 items-center justify-center gap-2 rounded-md px-8 font-mono text-sm text-human"
          >
            {copied ? (
              <span className="text-clarity">Copied ✓</span>
            ) : (
              identity.email
            )}
          </button>
          <a
            href={identity.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="card-hover flex h-14 items-center justify-center rounded-md px-8 font-mono text-sm text-human"
          >
            LinkedIn ↗
          </a>
          <a
            href={identity.resume_url}
            download
            className="flex h-14 items-center justify-center rounded-md border border-pen/60 bg-pen/10 px-8 font-mono text-sm text-pen transition-colors hover:bg-pen/20"
          >
            Download Resume →
          </a>
        </Reveal>

        <Reveal delay={0.4}>
          <p className="mt-8 font-fraunces text-xs italic text-human/45">
            {note}
          </p>
        </Reveal>

        <Reveal delay={0.5}>
          <div className="mt-10">
            <span className="label font-mono text-[10px] text-human/40">
              Open for
            </span>
            <ul className="mt-3 space-y-1.5">
              {identity.open_for.map((o) => (
                <li key={o} className="font-fraunces text-sm text-human/65">
                  {o}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <div className="h-16" aria-hidden="true" />
        <p className="font-mono text-[12px] text-human/50 opacity-50">
          {identity.whisper}
        </p>
      </div>
    </SectionShell>
  );
}
