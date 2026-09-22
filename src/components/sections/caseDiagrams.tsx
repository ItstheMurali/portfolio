"use client";

import { motion } from "framer-motion";

/* One diagram per case study, each drawing that case's actual mechanism.
   A shared template repeated nine times would say only that nine cards
   exist; these are meant to be readable as the thing they describe. */

const PEN = "#E8D5A3";
const CLARITY = "#D8D2C4";
const HUMAN = "#F5F0E8";
const CHAOS = "#55524C";
const WARN = "#FF6B6B";

const VIEW = "0 0 400 210";

/* role="img" plus an accessible name is the correct pattern for an SVG that
   carries meaning. Without it a screen reader walks the shape tree and reads
   nothing useful, which is the defect the Docs.AltText rule in the prose
   governance sample exists to prevent. */
const svgProps = (label: string) => ({
  viewBox: VIEW,
  className: "h-full w-full",
  preserveAspectRatio: "xMidYMid meet" as const,
  role: "img",
  "aria-label": label,
});

const reveal = (delay: number) => ({
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: { once: true },
  transition: { duration: 0.6, delay },
});

const draw = (delay: number, duration = 0.8) => ({
  initial: { pathLength: 0, opacity: 0 },
  whileInView: { pathLength: 1, opacity: 1 },
  viewport: { once: true },
  transition: { duration, delay },
});

function Node({
  x,
  y,
  w = 84,
  h = 30,
  label,
  stroke = CLARITY,
  delay = 0,
  dashed = false,
  size = 9,
}: {
  x: number;
  y: number;
  w?: number;
  h?: number;
  label: string;
  stroke?: string;
  delay?: number;
  dashed?: boolean;
  size?: number;
}) {
  return (
    <motion.g {...reveal(delay)}>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={4}
        fill="none"
        stroke={stroke}
        strokeWidth="1"
        strokeDasharray={dashed ? "3 3" : undefined}
        opacity={0.85}
      />
      <text
        x={x + w / 2}
        y={y + h / 2 + 3.5}
        textAnchor="middle"
        fill={stroke}
        fontSize={size}
        fontFamily="monospace"
      >
        {label}
      </text>
    </motion.g>
  );
}

function Cap({
  x,
  y,
  text,
  fill = PEN,
  delay = 0,
  anchor = "middle",
  size = 8,
}: {
  x: number;
  y: number;
  text: string;
  fill?: string;
  delay?: number;
  anchor?: "start" | "middle" | "end";
  size?: number;
}) {
  return (
    <motion.text
      {...reveal(delay)}
      x={x}
      y={y}
      textAnchor={anchor}
      fill={fill}
      fontSize={size}
      fontFamily="monospace"
      letterSpacing="0.05em"
    >
      {text}
    </motion.text>
  );
}

/* 1. Workload automation API: one spec, many surfaces, defects at the seams. */
export function DiagramApiSurface() {
  const surfaces = [
    { y: 30, label: "REST · 40+" },
    { y: 74, label: "Python SDK" },
    { y: 118, label: "SAP webhooks" },
    { y: 162, label: "Docker" },
  ];
  return (
    <svg {...svgProps("One OpenAPI specification feeding four surfaces: REST endpoints, a Python SDK, SAP webhooks and Docker integrations. The two integration surfaces are marked as the seams where configuration defects fell 40 percent.")}>
      <Cap x={16} y={16} text="SOURCE OF TRUTH" anchor="start" delay={0.1} />
      <Node x={14} y={88} w={96} h={40} label="openapi.yaml" stroke={PEN} delay={0.2} size={10} />
      {surfaces.map((s, i) => (
        <g key={s.label}>
          <motion.path
            {...draw(0.4 + i * 0.12, 0.6)}
            d={`M110 108 C 160 108, 170 ${s.y + 15}, 236 ${s.y + 15}`}
            stroke={i >= 2 ? PEN : CHAOS}
            strokeWidth="1"
            fill="none"
            opacity={i >= 2 ? 0.9 : 0.5}
          />
          <Node
            x={236}
            y={s.y}
            w={106}
            label={s.label}
            stroke={i >= 2 ? PEN : CLARITY}
            delay={0.5 + i * 0.12}
          />
        </g>
      ))}
      <motion.g {...reveal(1.1)}>
        <rect x={232} y={112} width={114} height={84} rx={5} fill="none" stroke={PEN} strokeWidth="1" strokeDasharray="4 3" opacity={0.55} />
        <text x={289} y={206} textAnchor="middle" fill={PEN} fontSize="8" fontFamily="monospace">
          the seams: −40% defects
        </text>
      </motion.g>
    </svg>
  );
}

/* 2. Culvert: the human transcription step removed from between two systems. */
export function DiagramSyncLoop() {
  return (
    <svg {...svgProps("Buganizer and Google Sheets exchanging issues and triage decisions directly, with the former by-hand step struck through. Annotated: a 25-plus person team across the US and Manila, and 2 hours per day reclaimed across 60-plus writers.")}>
      <Node x={16} y={80} w={110} h={44} label="Buganizer" stroke={CLARITY} delay={0.1} size={10} />
      <Node x={274} y={80} w={110} h={44} label="Sheets" stroke={CLARITY} delay={0.2} size={10} />

      {/* the removed manual step */}
      <motion.g {...reveal(0.35)}>
        <rect x={166} y={22} width={68} height={26} rx={4} fill="none" stroke={CHAOS} strokeWidth="1" strokeDasharray="3 3" />
        <text x={200} y={39} textAnchor="middle" fill={CHAOS} fontSize="8" fontFamily="monospace">
          by hand
        </text>
        <motion.line
          {...draw(0.8, 0.5)}
          x1={170} y1={46} x2={230} y2={24}
          stroke={WARN} strokeWidth="1.2" opacity={0.75}
        />
      </motion.g>

      <motion.path {...draw(0.5, 0.7)} d="M126 94 L274 94" stroke={PEN} strokeWidth="1.2" fill="none" />
      <motion.path {...draw(0.7, 0.7)} d="M274 112 L126 112" stroke={PEN} strokeWidth="1.2" fill="none" />
      <Cap x={200} y={88} text="issues →" delay={0.9} />
      <Cap x={200} y={126} text="← triage" delay={1.0} />

      <Cap x={200} y={166} text="25+ person team · US + Manila" fill={CLARITY} delay={1.15} />
      <Cap x={200} y={184} text="2 hrs/day reclaimed × 60+ writers" fill={PEN} delay={1.3} />
    </svg>
  );
}

/* 3. Country selectors: 250+ surfaces, one measured portfolio view. */
export function DiagramSelectorFan() {
  const cols = 14;
  const rows = 4;
  return (
    <svg {...svgProps("A grid of small squares standing for 250-plus country selectors, converging on a single portfolio content strategy. Annotated: research, then strategy, then a 99.64 percent quality score.")}>
      <Cap x={16} y={18} text="250+ SELECTORS" anchor="start" delay={0.1} />
      {Array.from({ length: rows * cols }).map((_, i) => {
        const c = i % cols;
        const r = Math.floor(i / cols);
        return (
          <motion.rect
            key={i}
            {...reveal(0.15 + i * 0.006)}
            x={16 + c * 20}
            y={30 + r * 16}
            width={14}
            height={10}
            rx={1.5}
            fill="none"
            stroke={CHAOS}
            strokeWidth="0.8"
          />
        );
      })}
      <motion.path
        {...draw(0.9, 0.8)}
        d="M200 102 L200 126"
        stroke={PEN}
        strokeWidth="1"
        fill="none"
      />
      <Node x={110} y={128} w={180} h={34} label="portfolio content strategy" stroke={PEN} delay={1.05} size={9} />
      <Cap x={200} y={186} text="research → strategy → 99.64%" fill={CLARITY} delay={1.3} />
    </svg>
  );
}

/* 4. XML to Markdown: a gate that a formatting defect cannot pass. */
export function DiagramMigrationGate() {
  return (
    <svg {...svgProps("150-plus XML manuals passing into a lint and spell-check gate in CI. One defect is turned back at the gate; the rest publish. Annotated: 5,000-plus pages with zero formatting defects.")}>
      <Cap x={16} y={20} text="150+ XML MANUALS" anchor="start" delay={0.1} />
      {[0, 1, 2, 3].map((i) => (
        <motion.rect
          key={i}
          {...reveal(0.15 + i * 0.08)}
          x={16 + i * 16}
          y={32}
          width={12}
          height={16}
          rx={1.5}
          fill="none"
          stroke={CHAOS}
          strokeWidth="0.9"
        />
      ))}

      <motion.path {...draw(0.4, 0.7)} d="M92 60 L168 92" stroke={CHAOS} strokeWidth="1" fill="none" />

      <Node x={144} y={82} w={112} h={34} label="lint + cspell" stroke={PEN} delay={0.6} size={9} />
      <Cap x={200} y={132} text="CI GATE" delay={0.75} />

      {/* blocked defect */}
      <motion.g {...reveal(0.95)}>
        <motion.path {...draw(1.0, 0.5)} d="M168 100 L128 148" stroke={WARN} strokeWidth="1" fill="none" opacity={0.8} />
        <text x={116} y={162} textAnchor="middle" fill={WARN} fontSize="8" fontFamily="monospace">
          defect
        </text>
        <motion.line {...draw(1.2, 0.35)} x1={104} y1={152} x2={128} y2={152} stroke={WARN} strokeWidth="1.2" />
      </motion.g>

      {/* clean output */}
      <motion.path {...draw(1.1, 0.7)} d="M256 99 L306 99" stroke={PEN} strokeWidth="1.2" fill="none" />
      <Node x={300} y={84} w={84} h={30} label="published" stroke={PEN} delay={1.3} />
      <Cap x={200} y={192} text="5,000+ pages · 0 formatting defects" fill={CLARITY} delay={1.45} />
    </svg>
  );
}

/* 5. Aerospace: authored once, referenced into many manuals. */
export function DiagramSingleSource() {
  const targets = [34, 76, 118, 160];
  return (
    <svg {...svgProps("One DITA source topic referenced into four separate manuals. Annotated: 400-plus manuals a month at 98 percent compliance, written to ASD-STE100.")}>
      <Cap x={16} y={20} text="ONE SOURCE MODULE" anchor="start" delay={0.1} />
      <Node x={16} y={84} w={104} h={40} label="DITA topic" stroke={PEN} delay={0.2} size={10} />
      {targets.map((y, i) => (
        <g key={y}>
          <motion.path
            {...draw(0.45 + i * 0.1, 0.6)}
            d={`M120 104 C 176 104, 186 ${y + 13}, 250 ${y + 13}`}
            stroke={CLARITY}
            strokeWidth="0.9"
            fill="none"
            opacity={0.65}
          />
          <Node x={250} y={y} w={96} h={26} label={`manual ${i + 1}`} stroke={CLARITY} delay={0.6 + i * 0.1} size={8} />
        </g>
      ))}
      <Cap x={298} y={198} text="400+ / month · 98% compliance" fill={PEN} delay={1.2} />
      <Cap x={68} y={140} text="ASD-STE100" fill={CHAOS} delay={1.0} />
    </svg>
  );
}

/* 6. Ledger API: 25 rules standing between a change and the published docs. */
export function DiagramGovernanceGate() {
  const rules = ["401", "429", "500", "money", "casing"];
  return (
    <svg {...svgProps("A specification edit entering a panel of 25 CI rules covering 401, 429 and 500 responses, money types and naming case. Compliant edits merge; non-compliant edits are blocked and fail the build.")}>
      <Node x={14} y={86} w={80} h={34} label="spec edit" stroke={CLARITY} delay={0.1} />
      <motion.path {...draw(0.3, 0.5)} d="M94 103 L134 103" stroke={CLARITY} strokeWidth="1" fill="none" />

      <motion.rect
        {...reveal(0.45)}
        x={134}
        y={34}
        width={116}
        height={140}
        rx={5}
        fill="none"
        stroke={PEN}
        strokeWidth="1"
        opacity={0.75}
      />
      <Cap x={192} y={28} text="25 RULES · CI" delay={0.5} />
      {rules.map((r, i) => (
        <motion.g key={r} {...reveal(0.6 + i * 0.09)}>
          <rect x={146} y={46 + i * 25} width={92} height={18} rx={2} fill="none" stroke={CLARITY} strokeWidth="0.8" opacity={0.7} />
          <text x={192} y={58 + i * 25} textAnchor="middle" fill={CLARITY} fontSize="8" fontFamily="monospace">
            {r}
          </text>
        </motion.g>
      ))}

      <motion.path {...draw(1.15, 0.5)} d="M250 86 L300 70" stroke={PEN} strokeWidth="1.2" fill="none" />
      <Node x={300} y={56} w={84} h={28} label="merged" stroke={PEN} delay={1.3} />

      <motion.path {...draw(1.25, 0.5)} d="M250 124 L300 142" stroke={WARN} strokeWidth="1.2" fill="none" opacity={0.85} />
      <Node x={300} y={128} w={84} h={28} label="blocked" stroke={WARN} delay={1.4} />
      <Cap x={342} y={178} text="fails the build" fill={WARN} delay={1.55} />
    </svg>
  );
}

/* 7. Sift API: one confidence axis, three different actions. */
export function DiagramConfidenceRoute() {
  const bands = [
    { x: 16, w: 100, label: "reject", color: WARN, sub: "null / 0.0" },
    { x: 124, w: 132, label: "review", color: PEN, sub: "< threshold" },
    { x: 264, w: 120, label: "accept", color: CLARITY, sub: "≥ threshold" },
  ];
  return (
    <svg {...svgProps("A confidence axis split into three bands: reject for a null value, review below the field threshold, and accept at or above it. A separate marker notes that any field carrying alternatives goes to review whatever its score.")}>
      <Cap x={16} y={22} text="CONFIDENCE" anchor="start" delay={0.1} />
      <motion.line {...draw(0.2, 0.8)} x1={16} y1={40} x2={384} y2={40} stroke={CHAOS} strokeWidth="1" />
      {bands.map((b, i) => (
        <motion.g key={b.label} {...reveal(0.4 + i * 0.15)}>
          <rect x={b.x} y={56} width={b.w} height={46} rx={4} fill="none" stroke={b.color} strokeWidth="1" opacity={0.9} />
          <text x={b.x + b.w / 2} y={84} textAnchor="middle" fill={b.color} fontSize="11" fontFamily="monospace">
            {b.label}
          </text>
          <text x={b.x + b.w / 2} y={118} textAnchor="middle" fill={CHAOS} fontSize="8" fontFamily="monospace">
            {b.sub}
          </text>
        </motion.g>
      ))}
      <motion.g {...reveal(1.0)}>
        <rect x={124} y={140} width={132} height={26} rx={3} fill="none" stroke={PEN} strokeWidth="1" strokeDasharray="3 3" opacity={0.8} />
        <text x={190} y={157} textAnchor="middle" fill={PEN} fontSize="8" fontFamily="monospace">
          alternatives present
        </text>
      </motion.g>
      <Cap x={200} y={192} text="cost of being wrong sets the threshold" fill={CLARITY} delay={1.2} />
    </svg>
  );
}

/* 8. Payments KB: four articles, four reader moments, one problem. */
export function DiagramDiataxisQuad() {
  const quads = [
    { x: 30, y: 34, label: "overview", sub: "orientation" },
    { x: 210, y: 34, label: "how-to", sub: "act now" },
    { x: 30, y: 112, label: "reference", sub: "decode" },
    { x: 210, y: 112, label: "explanation", sub: "stop a habit" },
  ];
  return (
    <svg {...svgProps("Four linked articles in a grid: overview for orientation, how-to for acting now, reference for decoding a message, and explanation for stopping a habit.")}>
      {quads.map((q, i) => (
        <motion.g key={q.label} {...reveal(0.15 + i * 0.13)}>
          <rect x={q.x} y={q.y} width={160} height={58} rx={4} fill="none" stroke={i === 3 ? PEN : CLARITY} strokeWidth="1" opacity={0.85} />
          <text x={q.x + 80} y={q.y + 26} textAnchor="middle" fill={i === 3 ? PEN : HUMAN} fontSize="11" fontFamily="monospace">
            {q.label}
          </text>
          <text x={q.x + 80} y={q.y + 44} textAnchor="middle" fill={CHAOS} fontSize="8" fontFamily="monospace">
            {q.sub}
          </text>
        </motion.g>
      ))}
      <motion.path {...draw(0.75, 0.5)} d="M190 63 L210 63" stroke={PEN} strokeWidth="1" fill="none" />
      <motion.path {...draw(0.85, 0.5)} d="M190 141 L210 141" stroke={PEN} strokeWidth="1" fill="none" />
      <motion.path {...draw(0.95, 0.5)} d="M110 92 L110 112" stroke={PEN} strokeWidth="1" fill="none" />
      <motion.path {...draw(1.05, 0.5)} d="M290 92 L290 112" stroke={PEN} strokeWidth="1" fill="none" />
      <Cap x={200} y={192} text="every article is someone's entry point" fill={CLARITY} delay={1.25} />
    </svg>
  );
}

/* 9. Prose governance: what the ruleset stops, and what it deliberately lets through. */
export function DiagramRuleFilter() {
  const passing = [
    { y: 44, label: "passive voice", kept: true },
    { y: 74, label: "long sentence", kept: true },
    { y: 104, label: "broken ref", kept: false },
    { y: 134, label: "no alt text", kept: false },
    { y: 164, label: "\"click here\"", kept: false },
  ];
  return (
    <svg {...svgProps("Five kinds of prose meeting a ruleset. Passive voice and long sentences pass through; broken references, missing alt text and vague link text are stopped at the line.")}>
      <Cap x={16} y={26} text="PROSE" anchor="start" delay={0.1} />
      <motion.line {...draw(0.25, 0.7)} x1={196} y1={30} x2={196} y2={186} stroke={PEN} strokeWidth="1.2" />
      <Cap x={196} y={22} text="RULESET" delay={0.35} />
      {passing.map((p, i) => (
        <g key={p.label}>
          <motion.path
            {...draw(0.45 + i * 0.11, 0.55)}
            d={p.kept ? `M16 ${p.y} L340 ${p.y}` : `M16 ${p.y} L190 ${p.y}`}
            stroke={p.kept ? CLARITY : WARN}
            strokeWidth="1"
            fill="none"
            opacity={p.kept ? 0.8 : 0.9}
          />
          <motion.text
            {...reveal(0.6 + i * 0.11)}
            x={p.kept ? 348 : 182}
            y={p.y + 3}
            textAnchor={p.kept ? "start" : "end"}
            fill={p.kept ? CLARITY : WARN}
            fontSize="8"
            fontFamily="monospace"
          >
            {p.kept ? "passes" : p.label}
          </motion.text>
          {p.kept && (
            <motion.text {...reveal(0.6 + i * 0.11)} x={16} y={p.y - 6} fill={CHAOS} fontSize="7.5" fontFamily="monospace">
              {p.label}
            </motion.text>
          )}
        </g>
      ))}
      <Cap x={200} y={202} text="errors block · warnings do not · 3 rules removed" fill={PEN} delay={1.3} size={7.5} />
    </svg>
  );
}

export const caseDiagrams: Record<string, () => JSX.Element> = {
  "api-surface": DiagramApiSurface,
  "sync-loop": DiagramSyncLoop,
  "selector-fan": DiagramSelectorFan,
  "migration-gate": DiagramMigrationGate,
  "single-source": DiagramSingleSource,
  "governance-gate": DiagramGovernanceGate,
  "confidence-route": DiagramConfidenceRoute,
  "diataxis-quad": DiagramDiataxisQuad,
  "rule-filter": DiagramRuleFilter,
};
