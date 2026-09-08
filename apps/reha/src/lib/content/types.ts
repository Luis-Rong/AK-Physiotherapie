/**
 * Inhaltsformat des Wissensbereichs: ProseMirror/Tiptap-JSON mit einem eigenen
 * Knotentyp `baustein` für feste, nicht editierbare Komponenten (ADR 0009).
 */
export type BausteinKind = "ampel" | "krs" | "heilungskurve" | "phasen" | "muskelverlust" | "atem" | "ruheumsatz";

export const BAUSTEINE: { kind: BausteinKind; label: string; description: string }[] = [
  { kind: "ampel", label: "Schmerzampel", description: "Grün/Gelb/Rot nach NPRS mit Erklärtext" },
  { kind: "krs", label: "KRS-Treppe", description: "Die 9 Stufen mit Serien, Wiederholungen und Pausen" },
  { kind: "heilungskurve", label: "Heilungskurve", description: "Gewebebelastbarkeit über die drei Wundheilungsphasen" },
  { kind: "phasen", label: "Phasen-Karten", description: "Unterstützende Maßnahmen je Wundheilungsphase" },
  { kind: "muskelverlust", label: "Muskelverlust", description: "Balken: Muskelverlust bei Inaktivität" },
  { kind: "atem", label: "Atem-Timer", description: "4-7-8 und Box Breathing mit Anleitung" },
  { kind: "ruheumsatz", label: "Ruheumsatz-Rechner", description: "Mifflin-St-Jeor, rechnet nur im Browser (ADR 0010)" },
];

export type Mark = { type: "bold" | "italic" | "underline" | "strike" | "code" | "link"; attrs?: Record<string, unknown> };

export type Node =
  | { type: "doc"; content?: Node[] }
  | { type: "paragraph"; attrs?: Record<string, unknown>; content?: Node[] }
  | { type: "heading"; attrs: { level: number }; content?: Node[] }
  | { type: "text"; text: string; marks?: Mark[] }
  | { type: "bulletList"; content?: Node[] }
  | { type: "orderedList"; attrs?: { start?: number }; content?: Node[] }
  | { type: "listItem"; content?: Node[] }
  | { type: "blockquote"; content?: Node[] }
  | { type: "horizontalRule" }
  | { type: "hardBreak" }
  | { type: "table"; content?: Node[] }
  | { type: "tableRow"; content?: Node[] }
  | { type: "tableHeader"; attrs?: Record<string, unknown>; content?: Node[] }
  | { type: "tableCell"; attrs?: Record<string, unknown>; content?: Node[] }
  | { type: "image"; attrs: { src: string; alt?: string; title?: string } }
  | { type: "baustein"; attrs: { kind: BausteinKind } }
  | { type: "callout"; attrs?: { tone?: "info" | "summary" | "warning" }; content?: Node[] };

export type Doc = { type: "doc"; content: Node[] };

/** Reintext eines Dokuments für Vorschau und Suche. */
export function plainText(node: Node | undefined): string {
  if (!node) return "";
  if (node.type === "text") return node.text;
  if ("content" in node && node.content) return node.content.map(plainText).join(node.type === "paragraph" || node.type === "heading" ? " " : "");
  return "";
}
