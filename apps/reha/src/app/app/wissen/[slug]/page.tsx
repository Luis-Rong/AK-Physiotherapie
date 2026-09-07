import Link from "next/link";
import { notFound } from "next/navigation";
import { requireViewer } from "@/lib/auth/session";
import { getAuthorName, getPublishedBySlug, listPublishedContent } from "@/lib/data/content";
import { CONTENT_CATEGORY_LABEL, type ContentCategory } from "@/lib/labels";
import { formatDate } from "@/lib/dates";
import { ContentBody } from "@/components/content/render";
import { PageHeader } from "@/components/page-header";
import { IconTile, TONE_TEXT } from "@/components/pikto/tile";
import { PiktoPerson, PiktoPfeil, PiktoPfeilLinks } from "@/components/pikto";
import { CATEGORY_ICON, CATEGORY_TONE } from "@/components/wissen/kategorie";

export default async function KnowledgeArticle({ params }: { params: Promise<{ slug: string }> }) {
  await requireViewer("patient");
  const { slug } = await params;
  const article = await getPublishedBySlug(slug);
  if (!article) notFound();
  const category = article.category as ContentCategory;
  const [siblings, author] = await Promise.all([listPublishedContent(), getAuthorName(article.authorId)]);
  const chapter = siblings.filter((c) => c.category === category);
  const idx = chapter.findIndex((s) => s.slug === slug);
  const prev = chapter[idx - 1];
  const next = chapter[idx + 1];
  const tone = CATEGORY_TONE[category];
  const Icon = CATEGORY_ICON[category];

  return (
    <article className="space-y-4">
      <PageHeader tone={tone} icon={<Icon size={30} />} back={{ href: "/app/wissen", label: "Wissen" }} title={article.title} intro={CONTENT_CATEGORY_LABEL[category]} />

      {/* Autorenzeile: Inhalte kommen von der Praxis, nicht vom Betreiber (ADR 0009, ADR 0012) */}
      <div className="flex items-center gap-3 rounded-[var(--radius-md)] bg-sand/70 px-4 py-3 text-sm">
        <IconTile tone="bark" size="sm">
          <PiktoPerson size={16} />
        </IconTile>
        <p className="min-w-0 text-ink-soft">
          <span className="font-semibold text-ink">{author ? `Von ${author}` : "Von Ihrer Praxis"}</span> · Praxis AK Physiotherapie · Stand{" "}
          {formatDate(article.createdAt.toISOString().slice(0, 10))}
        </p>
      </div>

      <div className="rounded-[var(--radius-lg)] border border-line bg-surface px-5 py-2">
        <ContentBody doc={article.body} />
      </div>

      <p className="text-xs text-muted">
        Dieser Text stammt von Ihrer Praxis und ersetzt kein persönliches Gespräch. Bei Fragen zu Ihrer Situation wenden Sie sich an Ihre Therapeutin oder
        Ihren Therapeuten.
      </p>

      <nav className="grid gap-2 text-sm sm:grid-cols-2" aria-label="Weitere Kapitel">
        {prev ? (
          <Link href={`/app/wissen/${prev.slug}`} className={`flex items-center gap-2 rounded-[var(--radius-md)] border border-line bg-surface px-4 py-3 font-semibold ${TONE_TEXT[tone]}`}>
            <PiktoPfeilLinks size={16} /> <span className="min-w-0 truncate">{prev.title}</span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/app/wissen/${next.slug}`}
            className={`flex items-center justify-end gap-2 rounded-[var(--radius-md)] border border-line bg-surface px-4 py-3 text-right font-semibold ${TONE_TEXT[tone]}`}
          >
            <span className="min-w-0 truncate">{next.title}</span> <PiktoPfeil size={16} />
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </article>
  );
}
