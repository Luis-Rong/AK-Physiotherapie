import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireViewer } from "@/lib/auth/session";
import { getPublishedBySlug, listPublishedContent } from "@/lib/data/content";
import { CONTENT_CATEGORY_LABEL, type ContentCategory } from "@/lib/labels";
import { ContentBody } from "@/components/content/render";

export default async function KnowledgeArticle({ params }: { params: Promise<{ slug: string }> }) {
  await requireViewer("patient");
  const { slug } = await params;
  const article = await getPublishedBySlug(slug);
  if (!article) notFound();
  const siblings = (await listPublishedContent()).filter((c) => c.category === article.category);
  const idx = siblings.findIndex((s) => s.slug === slug);
  const prev = siblings[idx - 1];
  const next = siblings[idx + 1];

  return (
    <article className="space-y-4">
      <Link href="/app/wissen" className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink"><ArrowLeft size={16} /> Wissen</Link>
      <header>
        <p className="text-xs uppercase tracking-wide text-muted">{CONTENT_CATEGORY_LABEL[article.category as ContentCategory]}</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink">{article.title}</h1>
      </header>
      <div className="rounded-[var(--radius-lg)] border border-line bg-surface px-5 py-2">
        <ContentBody doc={article.body} />
      </div>
      <nav className="flex justify-between gap-3 text-sm" aria-label="Weitere Kapitel">
        {prev ? <Link href={`/app/wissen/${prev.slug}`} className="text-bark">← {prev.title}</Link> : <span />}
        {next ? <Link href={`/app/wissen/${next.slug}`} className="text-right text-bark">{next.title} →</Link> : <span />}
      </nav>
    </article>
  );
}
