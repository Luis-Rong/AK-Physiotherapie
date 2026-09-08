/**
 * Kleine Hilfen, um Inhalte lesbar als Code zu schreiben (Seed aus dem PDF).
 * Ergebnis ist reguläres Tiptap-JSON (siehe types.ts).
 */
import type { BausteinKind, Doc, Node } from "./types";

type Inline = string | Node;

function inline(parts: Inline[]): Node[] {
  return parts.map((p) => (typeof p === "string" ? { type: "text", text: p } : p));
}

export const b = (text: string): Node => ({ type: "text", text, marks: [{ type: "bold" }] });
export const i = (text: string): Node => ({ type: "text", text, marks: [{ type: "italic" }] });

export const h2 = (text: string): Node => ({ type: "heading", attrs: { level: 2 }, content: [{ type: "text", text }] });
export const h3 = (text: string): Node => ({ type: "heading", attrs: { level: 3 }, content: [{ type: "text", text }] });
export const p = (...parts: Inline[]): Node => ({ type: "paragraph", content: inline(parts) });
export const ul = (...items: (Inline | Inline[])[]): Node => ({
  type: "bulletList",
  content: items.map((it) => ({ type: "listItem", content: [{ type: "paragraph", content: inline(Array.isArray(it) ? it : [it]) }] })),
});
export const ol = (...items: (Inline | Inline[])[]): Node => ({
  type: "orderedList",
  content: items.map((it) => ({ type: "listItem", content: [{ type: "paragraph", content: inline(Array.isArray(it) ? it : [it]) }] })),
});
export const table = (header: string[], rows: string[][]): Node => ({
  type: "table",
  content: [
    { type: "tableRow", content: header.map((h) => ({ type: "tableHeader", content: [{ type: "paragraph", content: [{ type: "text", text: h }] }] })) },
    ...rows.map((r) => ({ type: "tableRow" as const, content: r.map((c) => ({ type: "tableCell" as const, content: [{ type: "paragraph" as const, content: c ? [{ type: "text" as const, text: c }] : [] }] })) })),
  ],
});
export const summary = (...parts: Inline[]): Node => ({ type: "callout", attrs: { tone: "summary" }, content: [{ type: "paragraph", content: inline(parts) }] });
export const info = (...parts: Inline[]): Node => ({ type: "callout", attrs: { tone: "info" }, content: [{ type: "paragraph", content: inline(parts) }] });
export const warning = (...parts: Inline[]): Node => ({ type: "callout", attrs: { tone: "warning" }, content: [{ type: "paragraph", content: inline(parts) }] });
export const baustein = (kind: BausteinKind): Node => ({ type: "baustein", attrs: { kind } });
export const doc = (...content: Node[]): Doc => ({ type: "doc", content });
