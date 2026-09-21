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
  diagram: "architecture" | "flow" | "pipeline";
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
  {
    slug: "billing-2",
    title: "Billing 2.0",
    domain: "Global Payments",
    problem:
      "250+ country selectors. Each with unique payment rules, legal requirements, and user expectations.",
    insight:
      "The differences are smaller than they appear. The shared infrastructure is larger than anyone had mapped.",
    result:
      "A unified architecture serving global complexity without multiplying maintenance burden.",
    impact: "250+ countries. One coherent system.",
    diagram: "architecture",
    featured: true,
    full_description:
      "Google's billing surface serves advertisers in more than 250 countries and territories. Each market carries its own payment methods, legal requirements, tax rules, and user expectations, and the documentation had grown the same way the markets had: one selector at a time, each treated as its own problem.\n\nThe work began with an audit of what actually differed between markets. The finding that shaped everything: the differences were smaller than they appeared, and the shared infrastructure was far larger than anyone had mapped. Most markets shared 80% of their structure; the remaining 20% followed a small number of repeating patterns.\n\nThe resulting architecture defines one canonical content structure with market-level variation expressed as controlled overrides, not forks. Writers author once; markets inherit; exceptions are explicit and auditable. The maintenance burden stopped multiplying with each new market.",
    decisions:
      "Map the shared structure before documenting any single market, so the architecture reflects reality rather than history.\n\nExpress market differences as explicit overrides on a canonical source, never as full copies, so a fix lands everywhere at once.\n\nMake exceptions auditable: every market deviation is listed, owned, and justified, which turned tribal knowledge into structure.",
    lessons:
      "Global complexity is usually local complexity repeated with variations. Find the repetition first and the problem shrinks by an order of magnitude.",
  },
  {
    slug: "wika-docs-as-code",
    title: "WIKA Docs-as-Code Migration",
    domain: "Documentation Infrastructure",
    problem:
      "A documentation system that moved slower than the product it described.",
    insight:
      "Documentation debt compounds like technical debt. The interest is developer frustration and user confusion.",
    result:
      "Git + Markdown + Markdownlint + CSpell pipeline. 40% faster deployment.",
    impact: "40% faster deployment.",
    diagram: "pipeline",
    featured: true,
    full_description:
      "WIKA's documentation lived in an XML workflow built for a slower era: author in XML, export manually, produce PDFs, and wait weeks for content to reach users. The product shipped faster than its documentation could describe it.\n\nThe migration replaced that entire chain with a docs-as-code pipeline: Markdown source files versioned in Git, Markdownlint enforcing structural consistency, CSpell catching terminology drift, and CI/CD publishing on merge. Documentation changes gained everything code changes already had: review history, rollback, branch-based collaboration, and automated quality gates.\n\nDeployment time dropped 40%. More importantly, the documentation stopped being a separate system with separate habits; it became part of the same engineering rhythm as the product it describes.",
    decisions:
      "Choose Markdown over a lighter XML profile, because the authoring friction of XML was the root cause, not a formatting detail.\n\nPut lint and spell gates in CI rather than in editorial review, so quality enforcement scales without adding reviewers.\n\nMigrate incrementally by content area, proving the pipeline on live content before committing the whole corpus.",
    lessons:
      "Documentation debt compounds like technical debt. The interest is developer frustration and user confusion, and the repayment plan is infrastructure, not heroics.",
  },
  {
    slug: "project-setu",
    title: "Project Setu",
    domain: "Localization Architecture",
    problem:
      "Localization that translates words but not meaning. Regional languages across diverse markets.",
    insight:
      "Information architecture for regional audiences is not a translation problem. It is a user empathy problem.",
    result:
      "A localization framework accounting for cultural context, not just linguistic equivalence.",
    impact: "High-scale international expansion enabled.",
    diagram: "flow",
    featured: false,
    full_description:
      "Translation moves words between languages. Localization moves meaning between cultures. Project Setu (setu: bridge) addressed the gap between the two for Indian regional language audiences at Google scale.\n\nThe starting observation: a technically accurate Hindi or Telugu translation of an English help article can still fail its reader, because the source article assumes payment methods, account patterns, and digital habits that do not match the market. The words arrive; the understanding does not.\n\nThe framework treats regional content as an architecture problem. Source content is structured so that culturally variable elements (examples, payment flows, references) are separated from universal elements, letting regional versions substitute meaning rather than just vocabulary. The result is content that reads as if it were written for the reader, because structurally, it was.",
    decisions:
      "Treat localization as user empathy work first and linguistic work second, and structure content so both can be done well.\n\nSeparate culturally variable content blocks from universal ones at the architecture level, so regional adaptation is systematic rather than heroic.\n\nValidate with regional readers, not just regional translators; the test is understanding, not accuracy.",
    lessons:
      "Information architecture for regional audiences is not a translation problem. It is a user empathy problem, and empathy scales only when it is built into the structure.",
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
      "Bi-directional sync engine between Google Sheets and Buganizer. Managed the entire team intake operation autonomously during lead absences with zero pipeline disruptions. Built independently. Not in the job description.",
    impact: "10-person manual triage workflow → zero human overhead",
    visual: "sync",
    details:
      "Team intake ran through two systems that did not talk to each other: work arrived in Buganizer, planning lived in Google Sheets, and a rotating human kept them in sync by hand. When leads were absent, the sync degraded and the pipeline with it.\n\nCulvert is a bi-directional sync engine between the two. New Buganizer issues appear in the sheet with their metadata; sheet-side triage decisions flow back as Buganizer updates. During lead absences it ran the entire intake operation autonomously with zero pipeline disruptions. It was built independently, on the observation that the job needed doing, not on a ticket asking for it.",
  },
  {
    name: "Markdown-to-XML Pipeline",
    stack: ["Custom Scripting", "CMS Integration"],
    description:
      "Custom pipeline converting Markdown source files to enterprise XML for CMS ingestion. Eliminated the manual reformatting step that was slowing every content deployment.",
    impact: "20% reduction in project turnaround time",
    visual: "transform",
    details:
      "The CMS ingested enterprise XML; the writers were fastest in Markdown. The gap between the two was bridged manually, one reformatting pass per deployment, on every single content update.\n\nThis pipeline converts Markdown source files into the CMS's XML schema automatically: headings, lists, tables, cross-references, and metadata all mapped by rule rather than by hand. The manual reformatting step vanished from every deployment, cutting project turnaround by 20% and removing an entire category of formatting defects at the same time.",
  },
];

export const defaultFilms: Film[] = [
  {
    title: "FREAKOUT",
    genre: "One Night Thriller",
    description:
      "A college. A rage that needed a form. Raw choreography. Every frame of VFX: mine.",
    lesson: "Constraint is not the enemy of creativity. It is the mother of it.",
    youtube_url: "https://youtu.be/2DrCs8Suj5E?si=ubKotnj5xw-mRjEc",
    tools: ["Premiere Pro", "After Effects", "Photoshop"],
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
  {
    title: "ONE NIGHT",
    genre: "Murder Thriller",
    description:
      "A road. A murder. A friendship under pressure. A twist that was always there.",
    lesson:
      "The ending must be inevitable in retrospect. Design backward from the destination.",
    youtube_url: "https://youtube.com",
    tools: ["Premiere Pro", "After Effects", "CapCut", "DaVinci Resolve"],
  },
];

export const defaultWorkCategories: WorkCategory[] = [
  {
    name: "API Documentation",
    description:
      "Developer-facing API guides, endpoint documentation, authentication schemas, error state documentation. Designed to reduce support queries and accelerate integration.",
    details:
      "An API reference is a contract between the product and every developer who builds on it. My API documentation covers the full surface: endpoint references with parameters and response schemas, authentication and token lifecycle guides, and complete error-state documentation so developers can recover without opening a support ticket.\n\nAt Accenture I owned the WOPA API documentation, covering payment operation endpoints used across merchant billing workflows. At Cyient I wrote the KHEMEIA API developer guides, taking engineers from first key to production integration. In both cases the measure of success was the same: fewer questions asked, faster integrations shipped.",
    impact: "WOPA API documentation (Accenture) · KHEMEIA API developer guides (Cyient)",
    samples: [
      { title: "README", url: "#" },
      { title: "OpenAPI", url: "#" },
      { title: "Errors", url: "#" },
      { title: "Design decisions", url: "#" },
      { title: "Redocly", url: "#" },
      { title: "Reference", url: "#" },
      { title: "Package", url: "#" },
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
        url: "https://support.google.com/google-ads/answer/2375377",
      },
      {
        title:
          "Link your manager account to a Payments profile on monthly invoicing",
        url: "https://support.google.com/google-ads/answer/7635504",
      },
      {
        title: "Update your payment methods and settings",
        url: "https://support.google.com/google-ads/answer/2375433",
      },
      {
        title: "How to redeem your Google Ads promotional offer",
        url: "https://support.google.com/google-ads/answer/7624810",
      },
    ],
  },
  {
    name: "Release Notes",
    description:
      "Communicating product changes clearly to technical and non-technical audiences simultaneously.",
    details:
      "Release notes have two readers with opposite needs: the engineer who wants exact technical change detail, and the customer who wants to know what changed for them. I write release notes that serve both in one document: a plain-language summary of what changed and why it matters, followed by precise technical detail for those who need it.\n\nAcross enterprise projects at Cyient and Accenture I owned recurring release communication, turning sprint output and change logs into notes that support teams, product managers, and customers could all act on without translation.",
    samples: [],
  },
  {
    name: "Knowledge Base",
    description:
      "Centralized documentation repositories, self-service content systems, reducing redundant support queries.",
    details:
      "A knowledge base fails quietly: the answer exists but nobody can find it, so they ask a person instead. I design knowledge bases around findability. Consistent article patterns, titles that match how people actually search, and a structure that surfaces the most-needed answers first.\n\nAt Accenture I established a centralized documentation repository for project knowledge that had previously lived in email threads and individual drives. The measurable result: 30% fewer redundant queries reaching project managers, because the answer was now one search away.",
    impact:
      "Established centralized repository at Accenture: 30% reduction in redundant PM queries",
    samples: [],
  },
  {
    name: "Technical Manuals",
    description:
      "S1000D and iSpec 2200 compliant aerospace documentation for Airbus and Boeing. Where a documentation error grounds a fleet.",
    details:
      "Aerospace maintenance documentation is writing where ambiguity has a failure mode measured in grounded aircraft. At Cyient I produced S1000D and iSpec 2200 compliant maintenance documentation for Airbus and Boeing programs, working in ASD-STE100 Simplified Technical English, where vocabulary and sentence structure are controlled by specification.\n\nEvery data module passed formal compliance validation before release. Working at a 98% compliance rate in this environment taught me the discipline that carries through everything else I write: precision is not a style preference, it is the product.",
    impact: "98% compliance rate",
    samples: [],
  },
  {
    name: "Information Architecture",
    description:
      "The structure beneath the document. Content hierarchies, navigation systems, localization frameworks.",
    details:
      "Before a single sentence is written, someone has to decide what exists, what it is called, and how a reader moves between the pieces. That is information architecture, and it is the layer of the work I care about most.\n\nOn Billing 2.0 at Google Operations Center I worked on the content architecture serving 250+ country selectors, mapping the shared structure beneath what looked like 250 separate problems. On Project Setu I helped design the localization architecture for Indian regional languages, where the challenge is cultural context, not word-for-word translation. Both projects share one lesson: structure decisions travel further than sentence decisions.",
    impact:
      "Billing 2.0 (250+ countries) · Project Setu (regional language localization)",
    samples: [],
  },
  {
    name: "Docs-as-Code",
    description:
      "Documentation that lives where code lives. Git workflows, CI/CD pipelines, Markdown-first systems.",
    details:
      "When documentation lives in a separate system from the product, it decays at the speed of that separation. Docs-as-code closes the gap: documentation written in Markdown, versioned in Git, validated in CI, and deployed like software.\n\nFor WIKA I led the migration from an XML-based workflow (manual export, PDF, weeks of turnaround) to a Git + Markdown pipeline with Markdownlint and CSpell validation gates. Content deployment became 40% faster, and every change gained the review history, rollback safety, and automation that engineers already trust for code.",
    impact:
      "40% faster content deployment. WIKA migration from XML to Git + Markdown pipeline",
    samples: [],
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
  "Action required: billing discrepancy: 14 market regions",
  "TODO: localize for IN-HI before Q3 launch",
  "Mariner 1: documentation hyphen omission, 1962",
  "S1000D: DMC-BIKE-A-00-00A-040A-A",
  "git commit -m fix: country selector logic",
  "WOPA API: 401 Unauthorized: token expired",
  "PRD v0.3: section 4.2 incomplete",
  "P1 escalation: merchant billing failure",
  "409 Conflict: resource version mismatch",
  "release notes: draft pending review",
];

export const impactDashboard = {
  scale: [
    { value: "250+", label: "Countries documented" },
    { value: "400+", label: "Documents delivered" },
    { value: "15+", label: "Enterprise projects" },
    { value: "10+", label: "Products documented" },
    { value: "3", label: "Industries: Aerospace · SaaS · Consumer Tech" },
  ],
  quality: {
    value: 99.64,
    label: "Quality Score",
    sub: "Consistent across projects",
  },
  speed: [
    { value: "40%", label: "faster deployment (WIKA)" },
    { value: "30%", label: "fewer support queries (WOPA)" },
    { value: "20%", label: "faster turnaround (MD→XML)" },
    { value: "Zero", label: "pipeline disruptions (Culvert)" },
    { value: "33%", label: "improvement in deliverable standards" },
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
    orgs: "Airbus | Boeing",
    specs: "S1000D · iSpec 2200 · ASD-STE100",
    line: "Maintenance manuals where an ambiguous instruction can ground a fleet.",
    metric: "98%",
    metricLabel: "Compliance Rate",
  },
  finance: {
    orgs: "Google Payments",
    specs: "Google Style Guide",
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
