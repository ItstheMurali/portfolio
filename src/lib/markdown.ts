import { readFile } from "node:fs/promises";
import path from "node:path";
import { marked } from "marked";

/* Server-side Markdown rendering for the documentation samples.

   The source files are authored in this repo, never user-supplied, so the
   output is trusted by construction and no sanitizer sits in the path.
   Heading IDs are added after parsing rather than through a custom renderer,
   because the renderer signature has changed across marked majors and the
   samples rely on in-page cross-references that must not break on upgrade. */

const SAMPLE_ROOT = path.join(process.cwd(), "src", "content", "samples");

export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/&[a-z]+;/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Inject stable ids into h2/h3 so cross-references between articles resolve. */
function addHeadingIds(html: string): string {
  const seen = new Map<string, number>();
  return html.replace(
    /<h([23])>([\s\S]*?)<\/h\1>/g,
    (_match, level: string, inner: string) => {
      const base = slugifyHeading(inner) || "section";
      const count = seen.get(base) ?? 0;
      seen.set(base, count + 1);
      const id = count === 0 ? base : `${base}-${count + 1}`;
      return `<h${level} id="${id}">${inner}</h${level}>`;
    }
  );
}

export interface RenderedDoc {
  html: string;
  /** h2 headings, for the in-page contents rail. */
  outline: { id: string; text: string }[];
}

export async function renderSampleDoc(
  setSlug: string,
  docSlug: string
): Promise<RenderedDoc | null> {
  const file = path.join(SAMPLE_ROOT, setSlug, `${docSlug}.md`);
  let source: string;
  try {
    source = await readFile(file, "utf8");
  } catch {
    return null;
  }

  const raw = await marked.parse(source, { gfm: true, breaks: false });
  const html = addHeadingIds(raw);

  const outline: { id: string; text: string }[] = [];
  const headingRe = /<h2 id="([^"]+)">([\s\S]*?)<\/h2>/g;
  let m: RegExpExecArray | null;
  while ((m = headingRe.exec(html)) !== null) {
    outline.push({
      id: m[1],
      text: m[2].replace(/<[^>]+>/g, "").trim(),
    });
  }

  return { html, outline };
}
