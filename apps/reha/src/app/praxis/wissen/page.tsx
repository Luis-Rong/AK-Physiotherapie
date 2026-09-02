import Link from "next/link";
import { Plus } from "lucide-react";
import { requireViewer } from "@/lib/auth/session";
import { listCurrentContent } from "@/lib/data/content";
import { CONTENT_CATEGORIES, CONTENT_CATEGORY_LABEL } from "@/lib/labels";
import { formatDateTime } from "@/lib/dates";
import { Badge, Card, CardDescription } from "@/components/ui/card";

export default async function ContentAdminPage() {
  await requireViewer("praxis");
  const content = await listCurrentContent();
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Wissensinhalte</h1>
          <CardDescription>Kapitel für Patientinnen und Patienten. Entwürfe sind nur hier sichtbar; jede Änderung wird als neue Fassung gespeichert.</CardDescription>
        </div>
        <Link href="/praxis/wissen/neu" className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-clay px-4 py-2.5 text-sm font-semibold text-[#FFF7F0] hover:bg-clay-deep"><Plus size={16} /> Neues Kapitel</Link>
      </div>
      <Card className="border-clay/30 bg-clay-soft/40 text-sm text-ink-soft">
        <strong className="text-ink">Verantwortung für Aussagen (ADR 0009):</strong> Gesundheitsbezogene Aussagen zu Nährstoffen müssen der Health-Claims-Verordnung (EU 1924/2006) entsprechen; § 3 HWG verbietet irreführende Wirkaussagen. Die Erstinhalte aus dem Tagebuch tragen an kritischen Stellen einen Redaktionshinweis.
      </Card>
      {CONTENT_CATEGORIES.map((c) => {
        const items = content.filter((x) => x.category === c);
        if (items.length === 0) return null;
        return (
          <Card key={c} className="p-0">
            <h2 className="border-b border-line px-5 py-3 text-sm font-semibold text-ink">{CONTENT_CATEGORY_LABEL[c]}</h2>
            <ul className="divide-y divide-line">
              {items.map((it) => (
                <li key={it.id}>
                  <Link href={`/praxis/wissen/${it.slug}`} className="flex flex-wrap items-center gap-3 px-5 py-3 hover:bg-sand/60">
                    <span className="min-w-0 flex-1 font-medium text-ink">{it.title}</span>
                    <span className="text-xs text-muted">Fassung {it.version} · {formatDateTime(it.createdAt)}</span>
                    {it.status === "published" ? <Badge tone="moss">veröffentlicht</Badge> : it.status === "draft" ? <Badge tone="gelb">Entwurf</Badge> : <Badge>archiviert</Badge>}
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        );
      })}
    </div>
  );
}
