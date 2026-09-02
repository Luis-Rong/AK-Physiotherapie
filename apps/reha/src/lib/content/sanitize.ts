import type { Doc, Mark, Node } from "./types";
import { BAUSTEINE } from "./types";

/**
 * Whitelist-Bereinigung des Editor-JSON vor dem Speichern: nur bekannte Knoten,
 * Marken und Attribute. Bilder nur aus der eigenen Asset-Route, Links nur intern.
 */
const KINDS = new Set(BAUSTEINE.map((b) => b.kind));
const MARKS = new Set(["bold", "italic", "underline", "strike", "code", "link"]);

function cleanMarks(marks: unknown): Mark[] | undefined {
  if (!Array.isArray(marks)) return undefined;
  const out: Mark[] = [];
  for (const m of marks) {
    if (!m || typeof m !== "object" || !MARKS.has((m as Mark).type)) continue;
    const mark = m as Mark;
    if (mark.type === "link") {
      const href = String((mark.attrs as { href?: string } | undefined)?.href ?? "");
      if (!href.startsWith("/")) continue;
      out.push({ type: "link", attrs: { href } });
    } else out.push({ type: mark.type });
  }
  return out.length ? out : undefined;
}

function cleanNode(raw: unknown, depth = 0): Node | null {
  if (!raw || typeof raw !== "object" || depth > 40) return null;
  const n = raw as { type?: string; text?: string; marks?: unknown; attrs?: Record<string, unknown>; content?: unknown[] };
  const kids = () => (Array.isArray(n.content) ? n.content.map((c) => cleanNode(c, depth + 1)).filter((x): x is Node => !!x) : []);
  switch (n.type) {
    case "text":
      return typeof n.text === "string" && n.text.length ? { type: "text", text: n.text, marks: cleanMarks(n.marks) } : null;
    case "paragraph":
      return { type: "paragraph", content: kids() };
    case "heading": {
      const level = Number(n.attrs?.level);
      return { type: "heading", attrs: { level: level >= 2 && level <= 4 ? level : 2 }, content: kids() };
    }
    case "bulletList":
    case "listItem":
    case "blockquote":
    case "table":
    case "tableRow":
      return { type: n.type, content: kids() } as Node;
    case "orderedList":
      return { type: "orderedList", attrs: { start: Number(n.attrs?.start) || 1 }, content: kids() };
    case "tableHeader":
    case "tableCell": {
      const colspan = Number(n.attrs?.colspan) || 1;
      const rowspan = Number(n.attrs?.rowspan) || 1;
      return { type: n.type, attrs: { colspan, rowspan }, content: kids() } as Node;
    }
    case "horizontalRule":
    case "hardBreak":
      return { type: n.type } as Node;
    case "image": {
      const src = String(n.attrs?.src ?? "");
      if (!/^\/api\/assets\/[0-9a-f-]{36}$/.test(src)) return null;
      return { type: "image", attrs: { src, alt: typeof n.attrs?.alt === "string" ? n.attrs.alt.slice(0, 200) : "" } };
    }
    case "baustein": {
      const kind = String(n.attrs?.kind ?? "");
      return KINDS.has(kind as never) ? { type: "baustein", attrs: { kind: kind as never } } : null;
    }
    case "callout": {
      const tone = String(n.attrs?.tone ?? "info");
      return { type: "callout", attrs: { tone: tone === "summary" || tone === "warning" ? tone : "info" }, content: kids() };
    }
    default:
      return null;
  }
}

export function sanitizeDoc(raw: unknown): Doc | null {
  if (!raw || typeof raw !== "object" || (raw as { type?: string }).type !== "doc") return null;
  const content = (Array.isArray((raw as { content?: unknown[] }).content) ? (raw as { content: unknown[] }).content : [])
    .map((c) => cleanNode(c, 1))
    .filter((x): x is Node => !!x);
  return { type: "doc", content: content.length ? content : [{ type: "paragraph", content: [] }] };
}
