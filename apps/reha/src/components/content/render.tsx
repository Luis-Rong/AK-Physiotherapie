import type { Mark, Node } from "@/lib/content/types";
import { Baustein } from "@/components/bausteine/baustein";

/**
 * Serverseitiger Renderer für Tiptap-JSON. Bewusst ohne dangerouslySetInnerHTML:
 * Nur bekannte Knoten werden gerendert, unbekannte werden ausgelassen.
 * Bilder kommen ausschließlich aus der eigenen Asset-Route (ADR 0003).
 */
function withMarks(text: string, marks: Mark[] | undefined, key: number): React.ReactNode {
  let el: React.ReactNode = text;
  for (const m of marks ?? []) {
    if (m.type === "bold") el = <strong key={key}>{el}</strong>;
    else if (m.type === "italic") el = <em key={key}>{el}</em>;
    else if (m.type === "underline") el = <u key={key}>{el}</u>;
    else if (m.type === "strike") el = <s key={key}>{el}</s>;
    else if (m.type === "code") el = <code key={key} className="rounded bg-sand px-1 text-[0.9em]">{el}</code>;
    else if (m.type === "link") {
      const href = String(m.attrs?.href ?? "");
      // nur interne Links, keine externen Ziele (ADR 0003)
      if (href.startsWith("/")) el = <a key={key} href={href} className="text-bark underline">{el}</a>;
    }
  }
  return el;
}

function Children({ nodes }: { nodes?: Node[] }) {
  return <>{nodes?.map((n, i) => <RenderNode key={i} node={n} index={i} />)}</>;
}

function RenderNode({ node, index }: { node: Node; index: number }): React.ReactNode {
  switch (node.type) {
    case "doc":
      return <Children nodes={node.content} />;
    case "text":
      return withMarks(node.text, node.marks, index);
    case "paragraph":
      return <p className="my-3 leading-relaxed text-ink-soft"><Children nodes={node.content} /></p>;
    case "heading": {
      const level = Math.min(Math.max(node.attrs.level, 2), 4);
      const cls = level === 2 ? "mt-8 text-xl font-semibold text-ink" : level === 3 ? "mt-6 text-lg font-semibold text-ink" : "mt-4 text-base font-semibold text-ink";
      const Tag = `h${level}` as "h2" | "h3" | "h4";
      return <Tag className={cls}><Children nodes={node.content} /></Tag>;
    }
    case "bulletList":
      return <ul className="my-3 list-disc space-y-1 pl-6 text-ink-soft"><Children nodes={node.content} /></ul>;
    case "orderedList":
      return <ol className="my-3 list-decimal space-y-1 pl-6 text-ink-soft" start={node.attrs?.start}><Children nodes={node.content} /></ol>;
    case "listItem":
      return <li className="[&>p]:my-0.5"><Children nodes={node.content} /></li>;
    case "blockquote":
      return <blockquote className="my-4 border-l-4 border-clay/40 pl-4 italic text-ink-soft"><Children nodes={node.content} /></blockquote>;
    case "horizontalRule":
      return <hr className="my-6 border-line" />;
    case "hardBreak":
      return <br />;
    case "table":
      return (
        <div className="my-4 overflow-x-auto rounded-[var(--radius-md)] border border-line">
          <table className="w-full text-sm"><tbody><Children nodes={node.content} /></tbody></table>
        </div>
      );
    case "tableRow":
      return <tr className="border-b border-line last:border-0 [&>th]:bg-sand"><Children nodes={node.content} /></tr>;
    case "tableHeader":
      return <th className="px-3 py-2 text-left font-semibold text-ink [&>p]:my-0"><Children nodes={node.content} /></th>;
    case "tableCell":
      return <td className="px-3 py-2 align-top text-ink-soft [&>p]:my-0"><Children nodes={node.content} /></td>;
    case "image": {
      const src = node.attrs.src;
      if (!src.startsWith("/api/assets/")) return null;
      // eslint-disable-next-line @next/next/no-img-element
      return <img src={src} alt={node.attrs.alt ?? ""} className="my-4 max-w-full rounded-[var(--radius-md)]" loading="lazy" />;
    }
    case "callout": {
      const tone = node.attrs?.tone ?? "info";
      const cls = tone === "summary" ? "border-bark/20 bg-bark-soft" : tone === "warning" ? "border-clay/30 bg-clay-soft/50" : "border-line bg-sand";
      const label = tone === "summary" ? "Zusammenfassung" : tone === "warning" ? "Hinweis" : null;
      return (
        <aside className={`my-4 rounded-[var(--radius-md)] border p-4 text-sm ${cls} [&>p]:my-1`}>
          {label && <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>}
          <Children nodes={node.content} />
        </aside>
      );
    }
    case "baustein":
      return <div className="my-5"><Baustein kind={node.attrs.kind} /></div>;
    default:
      return null;
  }
}

export function ContentBody({ doc }: { doc: Node }) {
  return <div className="content-body">{RenderNode({ node: doc, index: 0 })}</div>;
}
