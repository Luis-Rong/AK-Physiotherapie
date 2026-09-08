import { Node, mergeAttributes } from "@tiptap/core";
import { BAUSTEINE } from "./types";

/** Fester Baustein: atomarer Block, nur einfügen/löschen (ADR 0009). */
export const BausteinNode = Node.create({
  name: "baustein",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,
  addAttributes() {
    return { kind: { default: "ampel" } };
  },
  parseHTML() {
    return [{ tag: "div[data-baustein]", getAttrs: (el) => ({ kind: (el as HTMLElement).getAttribute("data-baustein") }) }];
  },
  renderHTML({ node, HTMLAttributes }) {
    const meta = BAUSTEINE.find((b) => b.kind === node.attrs.kind);
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-baustein": node.attrs.kind, class: "tiptap-baustein" }),
      ["span", { class: "tiptap-baustein-label" }, `Baustein: ${meta?.label ?? node.attrs.kind}`],
      ["span", { class: "tiptap-baustein-desc" }, meta?.description ?? ""],
    ];
  },
});

/** Callout-Block: Zusammenfassung, Hinweis oder Info. */
export const CalloutNode = Node.create({
  name: "callout",
  group: "block",
  content: "paragraph+",
  defining: true,
  addAttributes() {
    return { tone: { default: "info" } };
  },
  parseHTML() {
    return [{ tag: "aside[data-callout]", getAttrs: (el) => ({ tone: (el as HTMLElement).getAttribute("data-callout") }) }];
  },
  renderHTML({ node, HTMLAttributes }) {
    return ["aside", mergeAttributes(HTMLAttributes, { "data-callout": node.attrs.tone, class: `tiptap-callout tiptap-callout-${node.attrs.tone}` }), 0];
  },
});
