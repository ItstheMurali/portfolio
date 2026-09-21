/* ------------------------------------------------------------------ */
/* Default content — the single source of truth used as fallback when */
/* Supabase is unreachable or a table is empty. Every string that      */
/* appears on the portfolio lives here (or in the DB overriding it).   */
/* ------------------------------------------------------------------ */

export interface Identity {
  name: string;
  title: string;
  tagline: string;
  thesis: string;
  progression: string;
  status: string;
  email: string;
  linkedin: string;
  resume_url: string;
  open_for: string[];
  whisper: string;
}

export interface StatCounter {
  id?: string;
  value: string;
  label: string;
  visible?: boolean;
  sort_order?: number;
}

export interface CaseStudy {
  id?: string;
  slug: string;
  title: string;
  domain: string;
  problem: string;
  insight: string;
  result: string;
  impact: string;
  diagram: string;
  /** "work" is employment history; "sample" documents a portfolio demo piece.
      Only "work" appears in the homepage architecture section. */
  kind?: "work" | "sample";
  /** Employer or context, shown on the card so provenance is never ambiguous. */
  org?: string;
  /** Period, e.g. "Dec 2025 – Present". */
  period?: string;
  /** Tools and standards actually used, shown as a row on the card. */
  stack?: string[];
  featured?: boolean;
  full_description?: string;
  decisions?: string;
  lessons?: string;
  visible?: boolean;
  sort_order?: number;
}

export interface Tool {
  id?: string;
  name: string;
  stack: string[];
  description: string;
  details?: string;
  impact: string;
  visual: string;
  /** When a tool also has a case study, link to it rather than retelling it. */
  case_slug?: string;
  visible?: boolean;
  sort_order?: number;
}

export interface Film {
  id?: string;
  title: string;
  genre: string;
  description: string;
  lesson: string;
  youtube_url: string;
  tools: string[];
  visible?: boolean;
  sort_order?: number;
}

export interface WorkSample {
  title: string;
  url: string;
}

export interface WorkCategory {
  id?: string;
  name: string;
  description: string;
  details?: string;
  impact?: string;
  samples: WorkSample[];
  /** Heading above the sample list. Defaults to "Live public samples". */
  samples_label?: string;
  /** Slug of a case study to link to at the end of the section. */
  case_slug?: string;
  visible?: boolean;
  sort_order?: number;
}

/** URL-safe anchor for a category, used as the bookmark on /work. */
export function workSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export const defaultIdentity: Identity = {
  name: "MURALI KRISHNA KOLIPAKA",
  title: "Senior Technical Writer | Information Architect | AI Builder",
  tagline: "Complexity has always existed. Clarity is a choice.",
  thesis: "I don't organize information. I design how understanding moves.",
  progression:
    "Technical Writer → Information Architect → AI Builder → Storyteller",
  status:
    "Open for opportunities and collaborations in AI and Technical Writing",
  email: "muralikrishna0293@gmail.com",
  linkedin: "https://linkedin.com/in/murali-krishna66",
  resume_url: "/murali-krishna-resume.pdf",
  open_for: [
    "Senior Technical Writer roles",
    "Information Architecture projects",
    "AI documentation tool collaboration",
    "Filmmaking and creative projects",
  ],
  whisper: "Technical Writer. Information Architect. AI Builder. Filmmaker.",
};

export const defaultScaleStats: StatCounter[] = [
  { value: "250+", label: "Countries documented." },
  { value: "99.64%", label: "Quality score." },
  { value: "5", label: "Tools built. Without being asked." },
];

export const defaultCases: CaseStudy[] = [
  /* ---------- employment history ---------- */
  {
    slug: "workload-automation-api",
    title: "Cloud Workload Automation API Ecosystem",
    domain: "API Documentation",
    org: "Google Operations Center",
    period: "May 2026 – Present",
    stack: [
      "REST APIs",
      "OpenAPI",
      "Swagger",
      "Python SDK",
      "SAP Webhooks",
      "Docker",
      "Docs-as-Code",
    ],
    problem:
      "40+ REST endpoints and a Python SDK to document in a four-week sprint, with third-party integrations nobody had written down.",
    insight:
      "The defects were not in our endpoints. They were in the seams where SAP webhooks and Docker integrations met them, which is exactly where the documentation stopped.",
    result:
      "A complete reference set delivered inside the sprint, with third-party pipeline configuration defects down 40%.",
    impact: "40+ endpoints · Python SDK · 40% fewer integration defects.",
    diagram: "api-surface",
    kind: "work",
    featured: true,
    full_description:
      "Cloud workload automation is integration-shaped work. The product's own endpoints are the easy part; the difficulty is that customers reach them through SAP webhooks, through containerised environments, and through a Python SDK, and each of those seams has its own failure modes. The documentation had to cover 40+ REST endpoints and the SDK inside a four-week sprint, against a surface that engineering was still extending.\n\nThe approach was spec-first and Docs-as-Code throughout. The OpenAPI description, maintained in Swagger, became the source the reference was generated from, so the published documentation could not drift from the contract as endpoints landed. That decision is what made a four-week sprint survivable: new endpoints arrived as spec changes rather than as writing tasks.\n\nThe measurable win came from the seams rather than the endpoints. Working directly with engineers on the SAP webhook and Docker integration paths surfaced configuration steps that existed only in people's heads, and documenting those cut third-party pipeline configuration defects by 40%. A defect prevented at configuration time never becomes a support ticket, and never becomes a customer deciding the product is hard.\n\nAI-assisted prompting carried the mechanical load: parsing raw code and translating schema parameters into prose, which is precisely the work that consumes a sprint and rewards no judgement. Every generated line was verified against the source before it shipped, which is the part that makes the acceleration safe rather than reckless. The data integrity target was 100%, and it was held.",
    decisions:
      "Generate the reference from the OpenAPI description rather than maintaining prose alongside it. In a sprint where endpoints were still landing, hand-maintained reference would have been wrong before it was published.\n\nDocument the integration seams before the endpoints. The endpoints were self-similar and largely inferable; the SAP and Docker configuration paths were neither, and that is where the defect rate actually lived.\n\nUse AI-assisted prompting for schema parameter translation and raw code parsing, and verify every line against source. The acceleration is real, and it is only defensible with the verification step attached; generated documentation that nobody checked is a plausible-looking wrong citation at scale.",
    lessons:
      "Integration documentation is where API documentation actually earns its keep. A developer can usually infer a well-named endpoint. Nobody can infer which environment variable a containerised deployment needs, or what a SAP webhook sends on retry. The 40% defect reduction came from the pages that were least interesting to write, which is a useful thing to know about where to spend a sprint.",
  },
  {
    slug: "culvert",
    title: "Culvert",
    domain: "Workflow Automation",
    org: "Google Operations Center",
    period: "Dec 2025 – Present",
    stack: [
      "JavaScript",
      "Google Apps Script",
      "Buganizer API",
      "Google Sheets",
    ],
    problem:
      "Bug triage for 60+ writers ran by hand between two systems that did not talk to each other.",
    insight:
      "The bottleneck was not the triage decisions. It was the transcription between Buganizer and Sheets, which was pure overhead and never wrong in an interesting way.",
    result:
      "A bi-directional sync engine that removed the manual step entirely, built and then deployed across a 25+ person team spanning the US and Manila.",
    impact: "2 hours reclaimed daily, per person, across 60+ writers.",
    diagram: "sync-loop",
    kind: "work",
    featured: true,
    full_description:
      "Work arrived in Buganizer. Planning and allocation lived in Google Sheets. Between them sat a person, every day, copying state from one into the other so that allocation could happen, then copying decisions back so the tracker stayed true. It was reliable only as long as that person was available, and it consumed time from people hired to write.\n\nCulvert is a bi-directional sync engine written in JavaScript and Google Apps Script against the Buganizer API. New issues appear in the sheet with their metadata; allocation decisions made in the sheet flow back as Buganizer updates. The transcription step is gone rather than optimised, which is the difference between a faster manual process and no manual process.\n\nThe engineering was the smaller half. Rolling this out meant directing a 25+ member cross-cultural matrix team across the US and Manila, which is a different problem: two time zones with a handful of overlapping hours, different escalation habits, and a workflow people had personal systems around. The deployment had to earn trust from writers who were being asked to stop doing something they had always done by hand.\n\nThe outcome is 2 hours reclaimed daily per person across 60+ global writers, and 100% pipeline operational continuity, including through periods when the people who used to run the sync by hand were unavailable. The second number matters more than the first: the process no longer has a single point of failure who can take leave.",
    decisions:
      "Make the sync bi-directional rather than one-way. A one-way feed would have been half the work and would have left the reconciliation problem exactly where it was, just pointing the other direction.\n\nBuild it before it was asked for. The job needed doing and no ticket existed for it, which is a reason to build carefully rather than a reason to wait.\n\nRoll it out through the matrix team rather than switching it on. A tool that removes a habit needs the people who hold that habit to trust it first, and across two continents that is a scheduling and communication problem before it is a technical one.",
    lessons:
      "The reclaimed time is the number people quote, and the continuity is the number that mattered. Two hours a day across sixty writers is a real figure, but the operation surviving intact when the humans who used to run it were absent is the structural change. Automation that only saves time is an optimisation; automation that removes a single point of failure is infrastructure.",
  },
  {
    slug: "country-selectors",
    title: "Country selector content strategy",
    domain: "Information Architecture",
    org: "Google Operations Center",
    period: "Oct 2024 – Present",
    stack: ["HTML", "CSS", "GitLab", "Markdown", "XML", "MadCap Flare"],
    problem:
      "250+ country selectors, each treated as its own content problem, with no portfolio-level view of what differed and why.",
    insight:
      "Readability at this scale is a research question before it is a writing question. You cannot improve what you have not measured across the whole portfolio.",
    result:
      "Targeted user research and a portfolio-level content strategy spanning every selector, held to a 99.64% quality score.",
    impact: "250+ selectors · 99.64% quality score · 300+ assets governed in GitLab.",
    diagram: "selector-fan",
    kind: "work",
    featured: true,
    full_description:
      "Google's billing and payments surface reaches advertisers through 250+ country selectors, each carrying its own payment methods, regulatory constraints, and reader expectations. The content had grown the way the markets had: one selector at a time. There was no portfolio-level view of what genuinely differed between them and what merely looked different.\n\nThe work started with research rather than writing. Designing targeted user studies across the selector portfolio produced something the per-selector view could not: evidence about where readers actually failed, and which differences between markets were substantive rather than historical accident. That evidence is what a content strategy can be built on; without it, strategy is preference with a deck attached.\n\nExecution ran through 300+ documentation assets built in HTML and CSS and governed through GitLab version control, which put documentation changes under the same review, history, and rollback that engineering already had. The quality score across that output is 99.64%, sustained at the publishing velocity the surface requires.\n\nThe number that is easy to misread is the 99.64%. It is not a measure of careful proofreading. At this volume it is a measure of whether the system catches defects, because no individual writer's attention scales to 250 markets and 300 assets.",
    decisions:
      "Do user research before content strategy. A strategy that is not grounded in where readers actually fail is a reorganisation, and reorganisations cost more than they return.\n\nGovern the assets in GitLab rather than in a CMS-native workflow. Version control gives documentation the review history and rollback that the publishing cadence requires, and it makes a defect traceable to the change that introduced it.\n\nTreat portfolio-level consistency as the unit of quality rather than per-article polish. At 250+ selectors, a reader's experience is shaped by whether the markets agree with each other, not by whether any single page is well turned.",
    lessons:
      "Scale changes what quality means. On one article, quality is judgement. Across 250 selectors and 300 assets, quality is whether the system makes the wrong thing hard to publish. The score held because the process caught things, not because anyone was reading more carefully than they had before.",
  },
  {
    slug: "xml-to-markdown",
    title: "Legacy XML to Markdown migration",
    domain: "Docs-as-Code",
    org: "Docs-as-Code workflow architect",
    period: "Nov 2025 – Jan 2026",
    stack: ["Git", "Markdown", "Markdownlint", "CSpell", "XML", "MadCap Flare"],
    problem:
      "150+ legacy XML manuals in a publishing chain slower than the products they described.",
    insight:
      "Formatting defects were not a discipline problem. They were an inevitability of a workflow with no automated gate, and no amount of reviewer attention was going to fix that.",
    result:
      "A cloud-native Docs-as-Code pipeline with Markdownlint and CSpell in CI, eliminating 100% of formatting defects across 5,000+ pages.",
    impact: "5,000+ pages · 40% faster deployment · 15+ hours saved weekly.",
    diagram: "migration-gate",
    kind: "work",
    featured: true,
    full_description:
      "150+ legacy manuals lived in an XML workflow built for a slower publishing era: author in XML, export by hand, produce output, and wait. The products moved faster than their documentation could describe them, and every deployment carried a tail of formatting defects that reviewers caught inconsistently because catching them was tedious and endless.\n\nThe migration moved the whole corpus into a Markdown source in Git, with Markdownlint and CSpell running as automated validation. That combination changed the nature of the defect class rather than reducing it: a formatting error can no longer reach a published page, because the gate runs before the merge and does not get tired. Across 5,000+ pages the elimination was total.\n\nThe delivery gains followed from the same change. Update deployment accelerated by 40%, saving 15+ hours weekly and removing friction for 4 cross-functional teams who had previously queued behind a manual export step. Documentation changes gained the review history, branch-based collaboration, and rollback that code changes already had.\n\nMigrating 150+ manuals is mostly a structural mapping problem: XML carries semantics that Markdown does not express natively, and the mapping has to be decided once and applied consistently rather than negotiated per document.",
    decisions:
      "Put validation in CI rather than in editorial review. Reviewer attention is the scarcest resource in a documentation team and the worst possible place to spend it on whitespace.\n\nMap the XML semantics once, up front, rather than per manual. A mapping negotiated document by document produces 150 slightly different conventions and an unmaintainable corpus.\n\nMigrate by content area rather than all at once, proving the pipeline on live content before committing the full 5,000 pages to it.",
    lessons:
      "Eliminating a defect class outright is a different achievement from reducing it, and the difference is whether a human has to stay vigilant. Markdownlint does not have a bad week. Once the gate existed, the 40% deployment gain and the 15 hours weekly were consequences rather than separate projects.",
  },
  {
    slug: "aerospace-single-sourcing",
    title: "Aerospace single-sourcing architecture",
    domain: "Structured Authoring",
    org: "Cyient",
    period: "Dec 2020 – Apr 2023",
    stack: [
      "DITA",
      "Arbortext Editor",
      "XSLT",
      "S1000D",
      "iSpec 2200",
      "ASD-STE100",
      "R4i CSDB",
      "Teamcenter PLM",
    ],
    problem:
      "400+ legacy and revision manuals moving monthly through Teamcenter PLM, with source content scattered across uncoordinated XML files.",
    insight:
      "The publishing bottleneck was downstream of a content problem: the same information existed in several places, so every revision multiplied.",
    result:
      "Single-sourcing architectures in DITA and Arbortext, with scattered XML consolidated into an R4i CSDB repository.",
    impact: "98% quality compliance · 20% faster turnaround · 400+ manuals monthly.",
    diagram: "single-source",
    kind: "work",
    featured: false,
    full_description:
      "Aerospace maintenance documentation is writing where ambiguity has a failure mode measured in grounded aircraft. At Cyient I directed the publishing lifecycle of 400+ legacy and revision manuals monthly through Teamcenter PLM, working to S1000D, iSpec 2200, and ASD-STE100 Simplified Technical English, where vocabulary and sentence structure are constrained by specification rather than by preference.\n\nThe throughput problem looked like a publishing bottleneck and was actually a content architecture problem. The same procedure existed in several manuals as several copies, so a single engineering change became a revision task repeated across every copy, each of which could drift. Consolidating scattered XML into an R4i CSDB repository and building single-sourcing architectures in DITA and Arbortext Editor meant a procedure was authored once and referenced everywhere it appeared. Project turnaround dropped 20%.\n\nThe compliance rating across that output was 98%, against formal validation rather than internal review. In this domain compliance is not a quality proxy; it is the deliverable, and a module that fails validation does not ship regardless of how well it reads.\n\nASD-STE100 is the part that changed how I write everything since. A controlled vocabulary with a specified sentence structure removes the option of writing around a difficult sentence. You have to actually resolve the ambiguity, because the approved words will not let you hide it.",
    decisions:
      "Treat the publishing bottleneck as a content duplication problem rather than a throughput problem. Optimising the publishing of duplicated content would have made the wrong thing faster.\n\nConsolidate into a CSDB before building the single-sourcing architecture. Reuse across scattered files is a promise the repository cannot keep.\n\nHold to formal validation rather than internal review as the quality gate, because in a regulated domain the only compliance rating that means anything is the one a specification produced.",
    lessons:
      "Writing under ASD-STE100 teaches something no style guide does: when the approved vocabulary will not let you phrase your way around an ambiguity, you discover how often you were doing exactly that. I carry the habit into software documentation, where nothing enforces it and readers need it just as much.",
  },
  /* ---------- portfolio demonstration pieces ---------- */
  {
    slug: "ledger-api",
    title: "Ledger API",
    domain: "Spec-First API Documentation",
    kind: "sample",
    problem:
      "API reference that documents the happy path and leaves every failure state to inference.",
    insight:
      "The parts developers need most at 2am are the parts documentation habitually omits: what broke, why, and whether it is safe to retry.",
    result:
      "A spec-first billing API documentation system with a governance ruleset that fails the build rather than filing a warning nobody reads.",
    impact: "11 operations · 19 schemas · 25 governance rules · zero drift by construction.",
    diagram: "governance-gate",
    featured: false,
    full_description:
      "Most published API reference is generated from a specification that nobody governs. The happy path is documented, the 200 response has an example, and everything that can go wrong is left for the integrator to discover in production. The Ledger API is a complete working system built to demonstrate the opposite standard: a billing and invoicing API covering invoices, payments, and refunds, documented spec-first, with every failure state named and every design decision recorded.\n\nThe specification is the source of truth. OpenAPI 3.1.1 holds 11 operations, 19 schemas, and 3 webhooks; the published reference, the error taxonomy, and the SDK method names are all derived from it, so the document and the docs cannot drift apart. What makes it enforceable rather than aspirational is redocly.yaml: 25 governance rules, 16 built-in and 9 written for this domain, that run in CI and fail the build. Every rule encodes a defect that has cost a real integration real money somewhere. A float on a money field is blocked at the spec. An operation that does not document its 401, 429, and 500 cannot merge.\n\nThe rules were tested the way tests should be tested: four defects were deliberately injected into a copy of the spec, including a float amount, an undocumented 401, and a non-camelCase operationId. All four were caught. A ruleset that passes silently is worse than no ruleset, because it looks like diligence.\n\nThe error reference is written to one constraint: one cause and one fix per entry. A page that lists six possible causes has moved the diagnosis back onto the reader. It opens with the three things an integrator must internalise before anything else, including the most consequential sentence in the document: a 5xx on a write means unknown, not failed, and retrying with a new idempotency key is how duplicate charges are created.\n\nThe design decisions are recorded in a separate document, 11 of them, each naming the alternative that was rejected and the cost of the choice that won. A decision record that lists only the winner is a press release.",
    decisions:
      "A declined payment returns 201, not 402. An HTTP status describes the fate of the request, not the fate of the business operation. Routing declines through 4xx sends them to a generic error handler that cannot tell a declined card from a wrong API key, and into retry middleware that issuers read as an abuse signal.\n\nMoney is an integer in the currency minor unit, inside a Money object that binds amount to currency. Floats drift invisibly on one invoice and materially across a month of reconciliation. Binding the pair in one object stops an amount from travelling without its currency, and the schema documents the zero-decimal and three-decimal currencies explicitly, because minor unit does not mean divide by 100.\n\nA resource owned by another account returns 404, not 403. The literally truthful 403 confirms the identifier is real, which turns a permission check into an enumeration oracle. The ambiguity is deliberate, and it is documented as deliberate, because undocumented defensive behaviour is a support cost while documented defensive behaviour is a feature.\n\nIdempotency conflicts split into two 409 codes rather than one. In-progress means retry shortly; key-reused means stop and fix your code. Collapsing them forces every integrator to guess, and the common guess turns a caller bug into a retry storm.\n\nWebhook verification is documented as four numbered rules rather than one sentence about HMAC. Each of the four omissions, hashing a re-serialized body, comparing in non-constant time, skipping the timestamp tolerance, and not deduplicating on event id, is a live vulnerability or outage. Documentation that describes a mechanism but not its failure modes has transferred information without transferring safety.",
    lessons:
      "The first draft of this specification cited the rate-limit response fields as RFC 9773. No such RFC exists; the number was asserted from memory and never checked. It was caught by verifying every normative reference against its source before publication, and the citation was corrected to the Internet-Draft it actually comes from. The mistake is recorded in the decision log rather than quietly fixed, because a plausible-looking wrong citation is the most dangerous class of documentation defect: it survives review precisely because it looks like diligence.",
  },
  {
    slug: "sift-api",
    kind: "sample",
    title: "Sift API",
    domain: "Documenting Probabilistic Systems",
    problem:
      "An API that returns confidence scores instead of answers, documented as though it returned answers.",
    insight:
      "When a system can be confidently wrong, the documentation's job is not to explain the output. It is to stop the reader building on an assumption of correctness.",
    result:
      "Tutorial-first documentation that shows a wrong answer in step 3, before the reader has written anything that depends on the right one.",
    impact: "Three documents, three registers: teaching, reasoning, contract.",
    diagram: "confidence-route",
    featured: false,
    full_description:
      "Extraction APIs return a value and a number between 0 and 1. Most documentation for them explains the number in a short note near the end, after the reader has already been taught to treat the value as the answer. By then the integration has been designed around the happy path, and the confidence score is a field somebody handles later.\n\nThis set inverts that order. The quickstart sends two documents: a clean invoice that works, and a photographed receipt that comes back with the total misread and status still set to succeeded. The wrong answer is step 3 of the tutorial, not an appendix, because the reader has to meet it while they are still deciding how to build.\n\nThe second document does the work the usual confidence-score table cannot. A table of thresholds tells a reader what a number means; it does not tell them what to do. The explanation replaces the question \"how confident is the model\" with \"what does this field cost when it is wrong\", which is the question that actually produces a routing decision, and it ends with a per-field threshold table an operations team can argue with.",
    decisions:
      "Show the failure inside the tutorial rather than in a note. An honest quickstart is slower to read and produces integrations that survive contact with real documents.\n\nGive confidence a definition that can be checked: across a batch of fields scoring 0.80, about 80% are correct. A vague definition invites the reader to substitute their own, and the one they substitute is always more optimistic.\n\nSeparate the three failures that look identical in the response body: a bad document, a wrong extraction, and a wrong request. They arrive as the same low number and they need completely different responses, and a team that cannot tell them apart never improves.",
    lessons:
      "Documentation for a probabilistic system has an obligation that documentation for a deterministic one does not: it has to spend the reader's trust carefully. Show the limits early, in the tutorial, while the reader is still deciding how much to rely on the thing. Withholding that until the reference is not neutrality, it is a choice that lands on whoever is paging through at 2am wondering why a total was wrong.",
  },
  {
    slug: "payments-kb",
    kind: "sample",
    title: "Payments knowledge base",
    domain: "Help Centre Architecture",
    problem:
      "One painful problem, four different questions, and a help centre that answered only the easiest of them.",
    insight:
      "Nobody arrives at a help centre through its front door. Every article is a landing page for someone who is already frustrated.",
    result:
      "Four structurally bound articles covering orientation, task, reference, and explanation, each written for a different moment in the same bad afternoon.",
    impact: "Same facts as the API error reference, written in the other register.",
    diagram: "diataxis-quad",
    featured: false,
    full_description:
      "A declined payment generates four distinct questions, and they are not answered well by one article. What do I do now. What does this specific message mean. Why does this keep happening. Where do I even start. Collapsing them into a single page serves the first question adequately and the other three badly.\n\nThe suite separates them along the Diátaxis lines: a hub for orientation, a task article for the person who needs to act, a reference for the person who needs to decode a message, and an explanation for the person whose real problem is a habit rather than a card. Each is complete on its own, because each is somebody's entry point, and each names the one thing to do next.\n\nThe hub was the hardest to get right. A help-centre landing page written as an introduction assumes a reader who started at the top, and almost nobody did. So it opens with a triage table rather than a welcome: pick the thing that is happening to you. The conceptual material that would normally open the page sits below the triage, where it helps the reader who wants it without delaying the one who does not.",
    decisions:
      "Write the hub as a signpost rather than an introduction, because a reader who arrived from a search result and a reader who arrived from the navigation need opposite things, and the search reader is almost all of them.\n\nGive the retry article a job: prevent a behaviour. It leads with the consequence, that repeated attempts make the next one more likely to fail, because the mechanism is only persuasive after the reader knows why it matters to them.\n\nState the same decline reasons here and in the developer error reference, and say so in both. One set of facts, two registers. The explicit cross-link is what stops the two from drifting into two different accounts of the same system.",
    lessons:
      "The strongest help article is often the one that exists to stop the reader doing something, and it is the hardest to write, because it has to argue rather than instruct. Nobody arrives wanting to be told their instinct is wrong. Leading with the consequence to them rather than with the mechanism is the difference between an article that changes behaviour and one that is skimmed and ignored.",
  },
  {
    slug: "orchestrator-manual",
    kind: "sample",
    title: "Orchestrator manual",
    domain: "Structured Authoring",
    problem:
      "Software installation documentation with none of the discipline that safety-critical documentation takes for granted.",
    insight:
      "What transfers from aerospace is not the schema. It is the habit of writing rules down so a reviewer can check compliance instead of forming an opinion.",
    result:
      "A modular manual with a defined advisory hierarchy, eight stated writing rules, and verification built into every task.",
    impact: "Every task ends with a check and a stated expected result.",
    diagram: "advisory-stack",
    featured: false,
    full_description:
      "Aerospace documentation standards carry a discipline most software manuals never adopt: a formal advisory hierarchy with written definitions, controlled vocabulary, one action per step, and a verification step that tells the reader whether the procedure worked. None of that requires the S1000D schema. All of it requires deciding the rules in advance and then holding to them.\n\nThis manual states its rules in the front matter and then obeys them. Eight writing rules, listed so a reviewer can check compliance rather than debate taste. Three advisory levels, each with a definition. Modules that are complete on their own, because a reader who arrives from a search result has not read what came before.\n\nThe part that required the most care was the advisory hierarchy. The aerospace convention reserves WARNING for risk of injury or death, and that definition does not transfer honestly to a server installation. Rather than quietly redefining it and hoping nobody noticed, the manual redefines the levels for this domain and states that it has done so. What is preserved is the property that matters: a WARNING never appears for something merely inconvenient, because a hierarchy whose top level is used loosely teaches readers to skip it.",
    decisions:
      "Adopt the discipline of S1000D without claiming the standard. Saying \"informed by\" where the schema is not used is the difference between a credible claim and one that collapses on the first specific question.\n\nPlace every advisory before the step it applies to. An advisory read after the action is a post-mortem, and revision C moved them throughout the manual rather than only where the problem was noticed.\n\nEnd every task with verification and a stated expected result. A procedure the reader cannot confirm is a procedure whose failures surface later, in a different module, as a symptom nobody can trace back.\n\nOrganise troubleshooting by symptom and order the causes by support case volume, not by severity. The reader has an observation, not a diagnosis, and the first cause listed should be the answer more often than the rest combined.",
    lessons:
      "Stating your rules is a commitment that makes the work checkable, which is exactly why most documentation avoids it. The moment the front matter says no numbered step contains two actions, every step becomes auditable against that claim, including by a reader who disagrees. That exposure is the point. Rules written down can be enforced, inherited by the next writer, and argued with; rules held as taste leave with the person holding them.",
  },
  {
    slug: "docs-governance",
    kind: "sample",
    title: "Prose governance system",
    domain: "Documentation Infrastructure",
    problem:
      "Editorial quality that depended on one reviewer's attention, and degraded the moment that attention was elsewhere.",
    insight:
      "The hard part of a linting system is not the rules you write. It is the restraint about the rules you do not.",
    result:
      "A Vale ruleset and CI pipeline where every rule names the defect it prevents, and the rejected rules are documented alongside.",
    impact: "3 rules removed, 6 added, on a quarterly review that is actually run.",
    diagram: "rule-filter",
    featured: false,
    full_description:
      "Editorial review does not scale. One editor applying good judgement one document at a time is a bottleneck and a single point of failure, and the quality drops the week they are on leave. Encoding the judgements that can be encoded frees that attention for the ones that cannot.\n\nThe admission criterion for this ruleset is a single sentence: a proposed rule must complete \"without this, a reader will…\". A rule that cannot is a preference, and preferences do not belong in a build gate. Every rule carries its defect in the failure message, so a writer who trips one reads the reason rather than only the correction, and learns the standard instead of learning to satisfy the tool.\n\nSeverity is treated as a real signal rather than a strength of feeling. Errors block the merge and are reserved for defects that mislead a reader; warnings report and do not block. There is no third level, because a tier nobody reads trains writers to skim the output, which is how the blocking lines get skimmed too.",
    decisions:
      "Require every rule to name its defect, and reject the ones that cannot. This kills more proposed rules than any other filter, which is the point.\n\nReject passive-voice linting outright. Passive voice is frequently correct in technical writing, and a rule with a high false-positive rate teaches writers to ignore the output, including the parts worth reading.\n\nAnnotate the pull request diff with file and line rather than reporting a count. A CI failure a writer cannot locate is a CI failure they will route around.\n\nReview suppressions quarterly. A cluster of \"vale off\" comments around one rule means the rule has false positives, and the fix is the rule, not the suppressions.",
    lessons:
      "A governance system that is never evaluated only accumulates rules. This one tracks failures per rule, suppression clusters, and time to merge on documentation changes, and it has lost three rules to that review. Removing a rule that is not earning its place is the maintenance, not an admission that the original design was wrong. The instinct to keep adding is what turns a useful gate into an obstacle writers learn to work around.",
  },
];

export const defaultTools: Tool[] = [
  {
    name: "HTML Content Extractor",
    stack: ["JavaScript", "DOM Parsing", "Apps Script"],
    description:
      "Reads live Google Support article HTML via browser inspect. Extracts all structured text and populates a Google Doc automatically, eliminating manual copy-paste entirely from the content update workflow.",
    impact: "Manual copy-paste eliminated from content update workflow",
    visual: "extract",
    details:
      "Content updates used to begin with a writer opening a live support article, selecting text section by section, and pasting it into a working document, losing structure along the way and introducing copy errors under deadline pressure.\n\nThe extractor reads the article's live HTML directly, walks the DOM to preserve heading hierarchy, lists, and links, and writes a clean structured copy into a Google Doc ready for editing. What was a 20-minute error-prone chore per article became a few seconds of automation, and the working copy is now guaranteed to match the live source.",
  },
  {
    name: "Edit Doc Reviewer",
    stack: ["Google Apps Script", "Docs Add-on", "Sidebar UI"],
    description:
      'A Google Docs sidebar extension that scans documents against editorial style guidelines in real time. Flags violations such as \"see\", \"look\", and context-dependent phrases, and suggests alternatives inline. Encodes professional editorial judgment into a tool that scales without the editor.',
    impact: "Professional editorial judgment scaled without the editor present",
    visual: "review",
    details:
      "Editorial review does not scale: one editor's judgment, applied one document at a time. This tool encodes that judgment into a Google Docs sidebar that reviews as you write.\n\nIt scans the document against editorial style guidelines in real time, flagging vague directional words, context-dependent phrasing, and style-guide violations, and suggests concrete alternatives inline. The writer sees the correction while the sentence is still warm, which teaches the guideline instead of just enforcing it. The editor's standards are now present in every document, whether the editor is or not.",
  },
  {
    name: "Country Selector Content Crawler",
    stack: ["Python", "Web Crawling", "Apps Script"],
    description:
      "Python script that crawls through country selector articles systematically, extracts structured content from each, and delivers it directly into an edit-ready Google Doc. Eliminated an entire manual content-gathering phase.",
    impact: "Full content extraction automated. Zero manual gathering",
    visual: "crawl",
    details:
      "Country selector work meant gathering content from hundreds of market-specific article variants before any writing could begin: a full manual phase of opening, reading, and copying, multiplied by every market in scope.\n\nThe crawler walks the country selector systematically, requests each market's article, extracts the structured content, and assembles everything into a single edit-ready Google Doc organized by market. The gathering phase disappeared from the schedule entirely, and the coverage is exhaustive by construction: the script cannot skip a market the way a tired human can.",
  },
  {
    name: "Culvert",
    stack: ["Apps Script", "JavaScript", "Buganizer API", "Google Sheets"],
    description:
      "Bi-directional sync engine between Google Sheets and Buganizer, deployed across a 25+ member team spanning the US and Manila. Built independently, on the observation that the job needed doing rather than on a ticket asking for it.",
    impact: "2 hours reclaimed daily per writer, across 60+ writers",
    visual: "sync",
    case_slug: "culvert",
    details:
      "Work arrived in Buganizer, allocation lived in Google Sheets, and a person kept them in sync by hand every day. Culvert is a bi-directional sync engine between the two, written in JavaScript and Google Apps Script against the Buganizer API, which removed the transcription step rather than speeding it up.",
  },
  {
    name: "XML-to-Markdown Migration Pipeline",
    stack: ["Git", "Markdown", "Markdownlint", "CSpell", "XML"],
    description:
      "A Docs-as-Code pipeline that moved 150+ legacy XML manuals into Markdown under Git, with automated lint and spell gates that a formatting defect cannot pass.",
    impact: "0 formatting defects across 5,000+ pages · 40% faster deployment",
    visual: "transform",
    case_slug: "xml-to-markdown",
    details:
      "150+ legacy manuals moved from an XML workflow into Markdown in a Git repository, with Markdownlint and CSpell running as automated gates before merge. The gate changed the nature of the defect class rather than reducing it: a formatting error can no longer reach a published page.",
  },
];

export const defaultFilms: Film[] = [
  {
    title: "FREAKOUT",
    genre: "One Night Thriller",
    description:
      "A road. A murder. A friendship under pressure. A twist that was always there.",
    lesson:
      "The ending must be inevitable in retrospect. Design backward from the destination.",
    youtube_url: "https://youtu.be/2DrCs8Suj5E?si=ubKotnj5xw-mRjEc",
    tools: ["Premiere Pro", "After Effects", "DaVinci Resolve"],
  },
  {
    title: "RANGDE",
    genre: "Self Discovery",
    description:
      "Three friends. The frustration of being young and unformed. The warmth that arrives after the storm.",
    lesson:
      "Emotional architecture is the hardest structure to design. And the most important.",
    youtube_url: "https://youtu.be/4eXsoiERoTU?si=n_C_pvzdShfJWWXR",
    tools: ["Premiere Pro", "DaVinci Resolve", "After Effects"],
  },
];

export const defaultWorkCategories: WorkCategory[] = [
  {
    name: "API Documentation",
    description:
      "Developer-facing API guides, endpoint documentation, authentication schemas, error state documentation. Designed to reduce support queries and accelerate integration.",
    details:
      "An API reference is a contract. Every endpoint, every error code, every field is a promise a developer will build against at 2am with no one to ask. I write that contract spec-first: the OpenAPI description is the source of truth, the published reference is generated from it, and the two cannot drift.\n\nOn the Cloud Workload Automation API ecosystem I documented 40+ REST endpoints and the Python SDK guides through a Docs-as-Code pipeline, delivering a complete reference set inside a four-week sprint. The measurable win came from the integration seams rather than the endpoints: documenting the SAP webhook and Docker integration paths alongside engineers cut third-party pipeline configuration defects by 40%.\n\nThe two pieces below are demonstrations built for this portfolio, not client work. They exist because API documentation is best judged on a complete system you can open: the specification, the ruleset that governs it, the error taxonomy, and the decisions recorded with the alternatives that were rejected.",
    impact:
      "40+ REST endpoints · Python SDK · 40% fewer integration defects (Cloud Workload Automation)",
    samples_label: "Two demonstration pieces",
    case_slug: "workload-automation-api",
    samples: [
      {
        title:
          "Ledger API · spec-first reference, governed by a 25-rule CI ruleset",
        url: "/samples/ledger-api",
      },
      {
        title:
          "Sift API · tutorial-first docs for a system that is sometimes wrong",
        url: "/samples/sift-api",
      },
    ],
  },
  {
    name: "User Documentation",
    description:
      "User guides, help center articles, onboarding flows. Written for real humans trying to accomplish real goals.",
    details:
      "Help center writing is judged in seconds: the reader arrives frustrated, scans, and either solves their problem or leaves. I write user documentation for that reality. Task-first structure, plain language, and every instruction verified against the live product.\n\nAt Google Operations Center I wrote and maintained Google Ads Help Center articles used by advertisers in every market Google serves, covering payments, refunds, account linking, and promotional offers. These are public articles read by millions; the samples below are live.",
    samples: [
      {
        title: "Request a refund",
        url: "https://support.google.com/google-ads/answer/1703646",
      },
      {
        title:
          "Link your manager account to a Payments profile on monthly invoicing",
        url: "https://support.google.com/google-ads/answer/12769613",
      },
      {
        title: "Update your payment methods and settings",
        url: "https://support.google.com/google-ads/answer/9282593",
      },
      {
        title: "How to redeem your Google Ads promotional offer",
        url: "https://support.google.com/google-ads/answer/16324294",
      },
    ],
  },
  {
    name: "Release Notes",
    description:
      "Communicating product changes clearly to technical and non-technical audiences simultaneously.",
    details:
      "Release notes have two readers with opposite needs: the engineer who wants exact technical change detail, and the customer who wants to know what changed for them. I write release notes that serve both in one document: a plain-language summary of what changed and why it matters, followed by precise technical detail for those who need it.\n\nAcross enterprise projects at Cyient and Accenture I owned recurring release communication, turning sprint output and change logs into notes that support teams, product managers, and customers could all act on without translation.\n\nThe sample below is three consecutive releases of the Ledger API, including one breaking change with a full migration path: who is affected, how to confirm exposure from your own data, how to migrate, and how to verify the fix before pinning to it.",
    samples_label: "The sample",
    samples: [
      {
        title:
          "Ledger API release notes · a breaking change, with the migration guide",
        url: "/samples/ledger-releases",
      },
    ],
  },
  {
    name: "Knowledge Base",
    description:
      "Centralized documentation repositories, self-service content systems, reducing redundant support queries.",
    details:
      "A knowledge base fails quietly: the answer exists but nobody can find it, so they ask a person instead. I design knowledge bases around findability. Consistent article patterns, titles that match how people actually search, and a structure that surfaces the most-needed answers first.\n\nAt Accenture I engineered a centralized documentation repository for knowledge that had previously lived in email threads and individual drives, raising content quality by 30% and opening cross-team visibility that had not existed before. On the same engagement, synthesizing fragmented PRDs and source data into 60+ core articles cut support tickets by 46%.",
    impact:
      "46% fewer support tickets · 30% content quality gain · 33% better deliverable compliance",
    samples_label: "The sample suite",
    case_slug: "payments-kb",
    samples: [
      {
        title:
          "Payments knowledge base · four linked articles, four different questions",
        url: "/samples/payments-kb",
      },
    ],
  },
  {
    name: "Technical Manuals",
    description:
      "S1000D, iSpec 2200 and ASD-STE100 aerospace documentation. Where an ambiguous sentence has a failure mode measured in grounded aircraft.",
    details:
      "Aerospace maintenance documentation is writing where ambiguity has a failure mode measured in grounded aircraft. At Cyient I directed the publishing lifecycle of 400+ legacy and revision manuals monthly through Teamcenter PLM, working to S1000D, iSpec 2200 and ASD-STE100 Simplified Technical English, where vocabulary and sentence structure are constrained by specification rather than by preference.\n\nI built single-sourcing architectures in DITA and Arbortext Editor and consolidated scattered XML into an R4i CSDB repository, cutting project turnaround by 20%. The output held a 98% quality compliance rating against formal validation, which in this domain is the deliverable rather than a proxy for it.\n\nThe sample below carries that discipline into software: a defined advisory hierarchy, one action per step, and verification built into every task.",
    impact: "98% compliance rate",
    samples_label: "The sample",
    case_slug: "orchestrator-manual",
    samples: [
      {
        title:
          "Orchestrator manual · advisory hierarchy, stated writing rules, verified tasks",
        url: "/samples/orchestrator-manual",
      },
    ],
  },
  {
    name: "Information Architecture",
    description:
      "The structure beneath the document. Content hierarchies, navigation systems, localization frameworks.",
    details:
      "Before a single sentence is written, someone has to decide what exists, what it is called, and how a reader moves between the pieces. That is information architecture, and it is the layer of the work I care about most.\n\nAt Google Operations Center I design targeted user research and portfolio-level content strategy across 250+ country selectors, which is an architecture problem before it is a writing one: what genuinely differs between markets, what only looks different, and what the evidence says about where readers actually fail. At Cyient the same instinct took the form of single-sourcing, where one authored module is referenced into many manuals rather than copied into them.\n\nOne lesson runs through both: structure decisions travel further than sentence decisions, and they are much harder to reverse.",
    impact:
      "250+ country selectors · 300+ assets governed in GitLab · 99.64% quality score",
    samples: [],
  },
  {
    name: "Docs-as-Code",
    description:
      "Documentation that lives where code lives. Git workflows, CI/CD pipelines, Markdown-first systems.",
    details:
      "When documentation lives in a separate system from the product, it decays at the speed of that separation. Docs-as-code closes the gap: documentation written in Markdown, versioned in Git, validated in CI, and deployed like software.\n\nI architected the migration of 150+ legacy XML manuals into a cloud-native Docs-as-Code pipeline, with Markdownlint and CSpell running as automated gates in a Git repository. That eliminated 100% of formatting defects across 5,000+ pages, accelerated deployment by 40%, and saved 15+ hours weekly across 4 cross-functional teams. A lint gate does not have a bad week, which is the whole argument for putting quality enforcement in CI rather than in reviewer attention.\n\nThe sample below goes further: a prose linting system where every rule names the defect it prevents, and where the rules that were considered and deliberately rejected are documented alongside the ones that shipped.",
    impact:
      "150+ manuals migrated · 5,000+ pages · 0 formatting defects · 40% faster deployment",
    samples_label: "The sample",
    case_slug: "docs-governance",
    samples: [
      {
        title:
          "Prose governance · a Vale ruleset where every rule names its defect",
        url: "/samples/docs-governance",
      },
    ],
  },
];

export const marqueeSkills = [
  "Technical Writing",
  "Information Architecture",
  "API Documentation",
  "Docs-as-Code",
  "DITA/XML",
  "S1000D",
  "iSpec 2200",
  "ASD-STE100",
  "Google Style Guide",
  "Markdown",
  "Git",
  "JavaScript",
  "Python",
  "Apps Script",
  "Three.js",
  "React",
  "Next.js",
  "Framer Motion",
  "Adobe Premiere Pro",
  "After Effects",
  "DaVinci Resolve",
  "Filmmaking",
  "Motion Graphics",
  "Supabase",
  "MadCap Flare",
  "Arbortext",
  "Oxygen XML",
  "JIRA",
  "Buganizer",
];

export const stormFragments = [
  "GET /v1/payments/refund/{transaction_id}",
  '<topic id="maint-7732" type="task">',
  "SAP webhook retry: signature mismatch",
  "TODO: localize for IN-HI before Q3 launch",
  "Mariner 1: documentation hyphen omission, 1962",
  "S1000D: DMC-BIKE-A-00-00A-040A-A",
  "git commit -m fix: country selector logic",
  "401 Unauthorized: token expired",
  "PRD v0.3: section 4.2 incomplete",
  "P1: docker env var undocumented",
  "409 Conflict: resource version mismatch",
  "release notes: draft pending review",
];

export const impactDashboard = {
  scale: [
    { value: "250+", label: "Country selectors" },
    { value: "5,000+", label: "Pages migrated to Docs-as-Code" },
    { value: "400+", label: "Manuals published monthly (Cyient)" },
    { value: "300+", label: "Documentation assets (GitLab)" },
    { value: "40+", label: "REST endpoints documented" },
    { value: "3", label: "Industries: Aerospace · SaaS · Consumer Tech" },
  ],
  quality: {
    value: 99.64,
    label: "Quality Score",
    sub: "Consistent across projects",
  },
  speed: [
    { value: "46%", label: "fewer support tickets (Accenture)" },
    { value: "40%", label: "faster deployment (XML → Markdown)" },
    { value: "40%", label: "fewer integration defects (workload API)" },
    { value: "20%", label: "faster turnaround (R4i CSDB)" },
    { value: "2 hrs", label: "reclaimed daily per writer (Culvert)" },
    { value: "33%", label: "better deliverable compliance" },
  ],
};

export const builtWith = {
  frontend: [
    {
      name: "Next.js 14",
      why: "App Router for server-side content and fast load.",
      what: "Serves every page of this portfolio with global CDN caching.",
    },
    {
      name: "React",
      why: "Component architecture matching information architecture.",
      what: "Every section is a composable, testable component.",
    },
    {
      name: "TypeScript",
      why: "Content types defined once, enforced everywhere.",
      what: "The CMS schema and UI share one type system.",
    },
    {
      name: "Tailwind CSS",
      why: "Design tokens, single source of truth.",
      what: "Seven colors, three fonts, enforced at the class level.",
    },
    {
      name: "Three.js",
      why: "The only honest way to render a storm.",
      what: "The storm particle system, pen light, and clarity wave.",
    },
    {
      name: "Framer Motion",
      why: "Declarative animation that respects reduced-motion.",
      what: "Scroll-triggered reveals and hover states.",
    },
    {
      name: "GSAP + ScrollTrigger",
      why: "Frame-accurate scroll choreography.",
      what: "Scroll-pinned case study diagrams.",
    },
    {
      name: "Lenis",
      why: "Cinematic smooth scroll physics.",
      what: "The buttery scroll feel across the entire site.",
    },
  ],
  backend: [
    {
      name: "Supabase (PostgreSQL)",
      why: "A real database, not a static JSON file.",
      what: "Every word on this site is a row that can change.",
    },
    {
      name: "Supabase Auth",
      why: "Authentication without building authentication.",
      what: "Protects the admin panel.",
    },
    {
      name: "Next.js API Routes",
      why: "Backend and frontend in one deployment.",
      what: "Content delivery to the portfolio.",
    },
  ],
  infrastructure: [
    {
      name: "Vercel",
      why: "Zero-config Next.js deployment, global CDN.",
      what: "Hosts this site at the edge.",
    },
    {
      name: "GitHub",
      why: "Version control, automatic deployments.",
      what: "Every change is a commit; every commit deploys.",
    },
    {
      name: "UptimeRobot",
      why: "Keeps the database awake on free tier.",
      what: "Pings the health endpoint so content never sleeps.",
    },
  ],
};

export const standards = {
  headingA: "Some documentation errors are inconvenient.",
  headingB: "Some are fatal.",
  closing: "Precision is not a preference. It is the product.",
  aerospace: {
    orgs: "Aerospace | Cyient",
    specs: "S1000D · iSpec 2200 · ASD-STE100 · DITA",
    line: "Maintenance manuals where an ambiguous instruction can ground a fleet.",
    metric: "98%",
    metricLabel: "Compliance Rate",
  },
  finance: {
    orgs: "Google Operations Center",
    specs: "Docs-as-Code · GitLab",
    line: "Where a missing localization note can fail a merchant in a market they depend on.",
    metric: "99.64%",
    metricLabel: "Quality Score",
  },
};

export const sectionCopy = {
  workHeading: "Every document is a decision. Here are some of mine.",
  architectureHeading:
    "I don't organize information. I design how understanding moves.",
  toolsHeading:
    "I found inefficiencies in my own workflow. So I built tools to eliminate them.",
  toolsClosing:
    "These tools came from real problems in my own work.",
  apiHeading:
    "API documentation is a user experience problem. Most people treat it as a formatting problem.",
  apiClosing:
    "When documentation is right, developers don't need to ask questions.",
  builtWithHeading: "Built With Intention",
  builtWithIntro:
    "This portfolio is not a template. It is a production application. Every design decision has a reason. Every technical decision has a reason. Here are both.",
  filmsLineA:
    "Before I understood information architecture, I understood storytelling.",
  filmsLineB: "It turns out they are the same discipline.",
  filmsClosing: "Complexity is not the enemy. Unclear thinking is.",
  contactQuestion: "What complexity are you sitting with right now?",
  contactInvite: "Let's talk about transforming it.",
  contactNote: "I respond to everyone who reaches out thoughtfully.",
};
