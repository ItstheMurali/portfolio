/* ------------------------------------------------------------------ */
/* The documentation sample library.                                    */
/*                                                                      */
/* Each set is a complete piece of work, not an excerpt. The `craft`    */
/* lines are the reason the sample is in the portfolio: they name the   */
/* specific decision a reader should look for, so the work can be       */
/* assessed in ninety seconds by someone who is skimming.               */
/* ------------------------------------------------------------------ */

export type DocKind =
  | "Tutorial"
  | "How-to"
  | "Reference"
  | "Explanation"
  | "Changelog"
  | "Configuration"
  | "Overview";

export interface SampleDoc {
  slug: string;
  title: string;
  kind: DocKind;
  blurb: string;
  /** Rendered as a syntax-highlighted source file rather than prose. */
  asSource?: boolean;
}

export interface SampleSet {
  slug: string;
  title: string;
  kicker: string;
  /** One or two sentences: what this is and who it is for. */
  summary: string;
  /** The specific craft decisions worth looking at. */
  craft: string[];
  standards: string[];
  docs: SampleDoc[];
  /** Slug of the case study explaining how it was written. */
  caseSlug?: string;
  /** External artifacts served from /public rather than rendered. */
  files?: { title: string; url: string }[];
}

export const sampleSets: SampleSet[] = [
  {
    slug: "ledger-api",
    title: "Ledger API",
    kicker: "Spec-first API reference · billing",
    summary:
      "A complete billing API documentation system: invoices, payments, and refunds, specified in OpenAPI 3.1.1 and governed by a ruleset that fails the build. Reference-first, written for an integrator who is moving money and cannot afford an ambiguity.",
    craft: [
      "Every operation documents its 401, 429, and 500, enforced by a lint rule rather than by reviewer diligence.",
      "The error reference gives one cause and one fix per entry, because a page listing six possible causes has handed the diagnosis back to the reader.",
      "Eleven design decisions are recorded with the alternative that was rejected and the cost of the choice that won.",
      "A wrong RFC citation found during verification is recorded in the decision log rather than quietly corrected.",
    ],
    standards: ["OpenAPI 3.1.1", "RFC 9457", "RFC 9110", "RFC 6901"],
    caseSlug: "ledger-api",
    files: [
      {
        title: "Interactive reference (generated)",
        url: "/samples/ledger-api/reference.html",
      },
      { title: "openapi.yaml", url: "/samples/ledger-api/openapi.yaml" },
      { title: "redocly.yaml", url: "/samples/ledger-api/redocly.yaml" },
      { title: "errors.md", url: "/samples/ledger-api/errors.md" },
      {
        title: "DESIGN-DECISIONS.md",
        url: "/samples/ledger-api/design-decisions.md",
      },
      { title: "README.md", url: "/samples/ledger-api/readme.md" },
      { title: "package.json", url: "/samples/ledger-api/package.json" },
    ],
    docs: [],
  },
  {
    slug: "sift-api",
    title: "Sift API",
    kicker: "Tutorial-first API docs · document extraction",
    summary:
      "Documentation for an extraction API that returns confidence scores instead of certainties. Where the Ledger API is reference-first for a reader who knows what they want, this is tutorial-first for a reader who does not yet know what the system can and cannot promise.",
    craft: [
      "Documents a probabilistic API honestly: the quickstart shows a wrong answer in its second example, before the reader has built anything on the assumption of correctness.",
      "Replaces the usual confidence-score table with a decision procedure, because a number the reader cannot act on is decoration.",
      "Separates the three failure classes that look identical in the response body: the document was bad, the extraction was wrong, and the request was wrong.",
      "The reference excerpt is deliberately narrow, to show the register shift from teaching voice to contract voice within one product.",
    ],
    standards: ["Diátaxis", "OpenAPI 3.1", "RFC 9457"],
    caseSlug: "sift-api",
    docs: [
      {
        slug: "quickstart",
        title: "Extract your first document",
        kind: "Tutorial",
        blurb:
          "Zero to a parsed invoice in about five minutes, including the part where the answer is wrong.",
      },
      {
        slug: "trusting-the-output",
        title: "Deciding what to trust",
        kind: "Explanation",
        blurb:
          "What a confidence score is, what it is not, and how to turn one into a routing decision your finance team will accept.",
      },
      {
        slug: "reference-extract",
        title: "POST /v1/extractions",
        kind: "Reference",
        blurb:
          "The contract voice: parameters, response schema, and every failure state the endpoint can produce.",
      },
    ],
  },
  {
    slug: "ledger-releases",
    title: "Ledger API release notes",
    kicker: "Release communication · versioning and migration",
    summary:
      "Three consecutive releases of the Ledger API, including one breaking change with a full migration path. Written to the versioning policy the API specification itself publishes, so the notes and the contract agree.",
    craft: [
      "Keep a Changelog structure with dated releases, matching the Ledger-Version header the API actually ships.",
      "The breaking change leads with who is affected and how to test the fix, not with what the engineering team built.",
      "States what is deliberately not changing and why, which is the question every upgrade planning meeting asks second.",
      "Corrects an error shipped in the previous release in public, with the window during which the wrong behaviour was live.",
    ],
    standards: ["Keep a Changelog 1.1.0", "SemVer 2.0.0", "Dated releases"],
    docs: [
      {
        slug: "changelog",
        title: "Changelog",
        kind: "Changelog",
        blurb:
          "Three releases: an additive one, a deprecation, and a breaking change to refund totals.",
      },
      {
        slug: "migration-2026-09-01",
        title: "Migrating to 2026-09-01",
        kind: "How-to",
        blurb:
          "The breaking change in full: who is affected, how to detect exposure, how to migrate, and how to verify.",
      },
    ],
  },
  {
    slug: "payments-kb",
    title: "Payments knowledge base",
    kicker: "Help centre suite · four linked articles",
    summary:
      "A four-article knowledge base covering one painful problem from four angles: orientation, task, reference, and explanation. Written for the merchant whose payment just failed, using the same underlying facts the Ledger API states to engineers.",
    craft: [
      "The hub is built for arrival from search rather than from the top, because almost nobody reaches a help centre through its front door.",
      "The same decline reasons appear here and in the Ledger error reference, in two registers: one for a person whose card was refused, one for the service that has to branch on it.",
      "The retry article exists to stop a specific harmful behaviour, so it leads with the consequence rather than the mechanism.",
      "Every article names the one thing to do next, because a help article that ends without an action has returned the problem unopened.",
    ],
    standards: ["Diátaxis", "Task-first structure", "Plain language"],
    caseSlug: "payments-kb",
    docs: [
      {
        slug: "overview",
        title: "Payments: start here",
        kind: "Overview",
        blurb:
          "The orientation page, written for someone who arrived from a search result and is already frustrated.",
      },
      {
        slug: "fix-a-declined-payment",
        title: "Fix a declined payment",
        kind: "How-to",
        blurb:
          "The task article: what to do now, in order, with the decision points named.",
      },
      {
        slug: "decline-reasons",
        title: "Decline reasons, explained",
        kind: "Reference",
        blurb:
          "Every reason a payment is refused, what it means in plain language, and whether trying again can help.",
      },
      {
        slug: "why-retrying-fails",
        title: "Why retrying a declined card usually fails",
        kind: "Explanation",
        blurb:
          "The article that exists to prevent a behaviour: repeated retries make future payments more likely to fail, not less.",
      },
    ],
  },
  {
    slug: "orchestrator-manual",
    title: "Orchestrator installation and maintenance manual",
    kicker: "Technical manual · structured authoring",
    summary:
      "An on-premises installation and maintenance manual written with aerospace documentation discipline: controlled vocabulary, a formal warning hierarchy, one action per step, and verification built into every task. The structured-authoring habits of S1000D and iSpec 2200, applied to software.",
    craft: [
      "A formal WARNING / CAUTION / NOTE hierarchy with a stated definition for each, placed before the step rather than after it, because a warning read afterwards is a post-mortem.",
      "One action per numbered step, present tense, no ambiguous pronouns, following ASD-STE100 writing rules that are listed explicitly so a reviewer can check compliance.",
      "Every task ends with a verification step and a stated expected result, so the reader knows whether it worked without asking.",
      "A troubleshooting section built as a symptom-to-cause decision path rather than an alphabetical list of error messages.",
    ],
    standards: ["ASD-STE100", "S1000D (informed)", "iSpec 2200 (informed)"],
    caseSlug: "orchestrator-manual",
    docs: [
      {
        slug: "about-this-manual",
        title: "About this manual",
        kind: "Overview",
        blurb:
          "Scope, audience, the warning hierarchy, and the writing rules this manual holds itself to.",
      },
      {
        slug: "install-the-control-plane",
        title: "Task 3.2: Install the control plane",
        kind: "How-to",
        blurb:
          "A full task module: prerequisites, warnings, numbered steps, verification, and what to do if verification fails.",
      },
      {
        slug: "troubleshooting",
        title: "Troubleshooting",
        kind: "Reference",
        blurb:
          "Symptom-first fault isolation: observation, probable cause, corrective action, and the escalation boundary.",
      },
    ],
  },
  {
    slug: "docs-governance",
    title: "Prose governance system",
    kicker: "Docs-as-code · automated editorial review",
    summary:
      "A Vale ruleset and CI pipeline that enforces editorial standards on prose the way a linter enforces them on code. Every rule names the defect it prevents, and a closing section names the rules that were deliberately not written.",
    craft: [
      "Each rule carries the defect it prevents, so a writer who trips it learns the standard instead of just satisfying the tool.",
      "Severity is used as a real signal: errors block the merge, warnings do not, and the split is defended rather than assumed.",
      "The pipeline reports on the pull request with file and line, because a CI failure a writer cannot locate is a CI failure they will route around.",
      "A section on rules deliberately not automated, because over-linting prose teaches writers to fight the tool rather than to write well.",
    ],
    standards: ["Vale", "GitHub Actions", "Google developer documentation style"],
    caseSlug: "docs-governance",
    docs: [
      {
        slug: "the-rules-and-why",
        title: "The ruleset, and the defect each rule prevents",
        kind: "Explanation",
        blurb:
          "Every rule justified by the failure it stops, plus the rules that were considered and rejected.",
      },
      {
        slug: "vale-config",
        title: "vale.ini and the custom styles",
        kind: "Configuration",
        blurb: "The enforceable half: configuration and rule definitions.",
        asSource: true,
      },
      {
        slug: "ci-workflow",
        title: "docs-quality.yml",
        kind: "Configuration",
        blurb:
          "The GitHub Actions workflow that runs the ruleset and annotates the pull request.",
        asSource: true,
      },
    ],
  },
];

export function getSampleSet(slug: string): SampleSet | undefined {
  return sampleSets.find((s) => s.slug === slug);
}

export function getSampleDoc(setSlug: string, docSlug: string) {
  const set = getSampleSet(setSlug);
  if (!set) return null;
  const doc = set.docs.find((d) => d.slug === docSlug);
  if (!doc) return null;
  return { set, doc };
}
