"use client";

import { notFound, useParams } from "next/navigation";
import CollectionEditor, {
  FieldDef,
} from "@/components/admin/CollectionEditor";
import SingleRowEditor from "@/components/admin/SingleRowEditor";

/* Config-driven admin sections. Adding a new admin page = adding config. */

interface CollectionConfig {
  kind: "collection";
  title: string;
  table: string;
  titleKey: string;
  fields: FieldDef[];
  newRow: Record<string, unknown>;
}
interface SingleConfig {
  kind: "single";
  title: string;
  table: string;
  fields: FieldDef[];
}
type Config = CollectionConfig | SingleConfig;

const configs: Record<string, Config> = {
  identity: {
    kind: "single",
    title: "Identity",
    table: "identity",
    fields: [
      { key: "name", label: "Full name", type: "text" },
      { key: "title", label: "Title", type: "text" },
      { key: "tagline", label: "Tagline", type: "textarea" },
      { key: "thesis", label: "Thesis", type: "textarea" },
      { key: "progression", label: "Progression line", type: "text" },
      { key: "status", label: "Status", type: "text" },
      { key: "email", label: "Email", type: "email" },
      { key: "linkedin", label: "LinkedIn URL", type: "url" },
      { key: "resume_url", label: "Resume URL", type: "url" },
      { key: "open_for", label: "Open for", type: "tags" },
      { key: "whisper", label: "Whisper line", type: "text" },
    ],
  },
  numbers: {
    kind: "collection",
    title: "Numbers",
    table: "counters",
    titleKey: "value",
    fields: [
      { key: "value", label: "Value (e.g. 250+)", type: "text" },
      { key: "label", label: "Label", type: "text" },
    ],
    newRow: { value: "0", label: "New counter" },
  },
  cases: {
    kind: "collection",
    title: "Case Studies",
    table: "cases",
    titleKey: "title",
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "slug", label: "Slug", type: "text" },
      { key: "domain", label: "Domain tag", type: "text" },
      {
        key: "kind",
        label: "Kind (work = employment history, sample = portfolio demo)",
        type: "select",
        options: ["work", "sample"],
      },
      { key: "org", label: "Organization / context", type: "text" },
      { key: "period", label: "Period (e.g. Dec 2025 – Present)", type: "text" },
      { key: "stack", label: "Tools and standards used", type: "tags" },
      { key: "problem", label: "Problem", type: "textarea" },
      { key: "insight", label: "Insight", type: "textarea" },
      { key: "result", label: "Result", type: "textarea" },
      { key: "impact", label: "Impact metric", type: "text" },
      {
        key: "full_description",
        label: "Full story (blank line = new paragraph, shown on /case page)",
        type: "textarea",
      },
      {
        key: "decisions",
        label: "Key decisions (blank line = new bullet)",
        type: "textarea",
      },
      { key: "lessons", label: "What it taught me", type: "textarea" },
      {
        key: "diagram",
        label: "Diagram type",
        type: "select",
        options: ["architecture", "flow", "pipeline"],
      },
    ],
    newRow: {
      title: "New case study",
      slug: `case-${Date.now()}`,
      diagram: "architecture",
    },
  },
  tools: {
    kind: "collection",
    title: "AI Tools",
    table: "tools",
    titleKey: "name",
    fields: [
      { key: "name", label: "Name", type: "text" },
      { key: "stack", label: "Stack tags", type: "tags" },
      { key: "description", label: "Description", type: "textarea" },
      {
        key: "details",
        label: "Detailed description (blank line = new paragraph, shown on /tools)",
        type: "textarea",
      },
      { key: "impact", label: "Impact", type: "text" },
      {
        key: "visual",
        label: "Visual type",
        type: "select",
        options: ["extract", "review", "crawl", "sync", "transform"],
      },
      { key: "demo_url", label: "Demo URL (optional)", type: "url" },
      {
        key: "case_slug",
        label: "Linked case study slug (optional, e.g. culvert)",
        type: "text",
      },
    ],
    newRow: { name: "New tool", stack: [], visual: "transform" },
  },
  films: {
    kind: "collection",
    title: "Films",
    table: "films",
    titleKey: "title",
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "genre", label: "Genre", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "lesson", label: "Lesson", type: "textarea" },
      { key: "youtube_url", label: "YouTube URL", type: "url" },
      { key: "tools", label: "Tools used", type: "tags" },
    ],
    newRow: { title: "New film", tools: [] },
  },
  work: {
    kind: "collection",
    title: "Work Categories",
    table: "work_categories",
    titleKey: "name",
    fields: [
      { key: "name", label: "Category name", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
      {
        key: "details",
        label: "Detailed description (blank line = new paragraph, shown on /work)",
        type: "textarea",
      },
      { key: "impact", label: "Impact line", type: "text" },
      {
        key: "samples_label",
        label: "Samples heading (blank = \"Live public samples\")",
        type: "text",
      },
      {
        key: "case_slug",
        label: "Linked case study slug (optional, e.g. ledger-api)",
        type: "text",
      },
    ],
    newRow: { name: "New category", samples: [] },
  },
  copy: {
    kind: "collection",
    title: "Copy · every prose line",
    table: "copy",
    titleKey: "key",
    fields: [
      { key: "key", label: "Key (e.g. workHeading)", type: "text" },
      { key: "section", label: "Section", type: "text" },
      { key: "value", label: "Text", type: "textarea" },
    ],
    newRow: { key: `line-${Date.now()}`, value: "" },
  },
  theme: {
    kind: "single",
    title: "Theme",
    table: "theme",
    fields: [
      { key: "bg", label: "Background primary", type: "text" },
      { key: "bg_darker", label: "Background darker", type: "text" },
      { key: "bg_warm", label: "Background warmer", type: "text" },
      { key: "chaos", label: "Chaos color", type: "text" },
      { key: "pen", label: "Pen color", type: "text" },
      { key: "clarity", label: "Clarity color", type: "text" },
      { key: "human", label: "Human color", type: "text" },
      { key: "motion_intensity", label: "Motion intensity (0.5–2)", type: "text" },
    ],
  },
  scenes: {
    kind: "collection",
    title: "Scenes · order & visibility",
    table: "scenes",
    titleKey: "label",
    fields: [
      { key: "key", label: "Section key", type: "text" },
      { key: "label", label: "Label", type: "text" },
    ],
    newRow: { key: `scene-${Date.now()}`, label: "New section" },
  },
};

export default function AdminSection() {
  const params = useParams<{ section: string }>();
  const config = configs[params.section];
  if (!config) notFound();

  return (
    <div>
      <h1 className="mb-8 font-syne text-xl font-bold text-white">
        {config.title}
      </h1>
      {config.kind === "single" ? (
        <SingleRowEditor table={config.table} fields={config.fields} />
      ) : (
        <CollectionEditor
          table={config.table}
          titleKey={config.titleKey}
          fields={config.fields}
          newRow={config.newRow}
        />
      )}
    </div>
  );
}
