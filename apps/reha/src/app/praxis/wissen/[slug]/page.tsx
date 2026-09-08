import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireViewer } from "@/lib/auth/session";
import { getCurrentBySlug, listContentHistory } from "@/lib/data/content";
import { formatDateTime } from "@/lib/dates";
import { Badge, Card, CardTitle } from "@/components/ui/card";
import { ContentEditor } from "./content-editor";

export default async function ContentEditPage({ params }: { params: Promise<{ slug: string }> }) {
  await requireViewer("praxis");
  const { slug } = await params;
  const isNew = slug === "neu";
  const current = isNew ? null : await getCurrentBySlug(slug);
  if (!isNew && !current) notFound();
  const history = isNew ? [] : await listContentHistory(slug);

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <Link href="/praxis/wissen" className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink"><ArrowLeft size={16} /> Wissensinhalte</Link>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold text-ink">{isNew ? "Neues Kapitel" : current!.title}</h1>
        {current && (current.status === "published" ? <Badge tone="moss">veröffentlicht</Badge> : current.status === "draft" ? <Badge tone="gelb">Entwurf</Badge> : <Badge>archiviert</Badge>)}
      </div>
      <ContentEditor
        slug={isNew ? null : slug}
        initial={{
          title: current?.title ?? "",
          category: current?.category ?? "einfuehrung",
          position: current?.position ?? 0,
          body: current?.body ?? { type: "doc", content: [{ type: "paragraph" }] },
          status: current?.status ?? "draft",
        }}
      />
      {history.length > 0 && (
        <Card>
          <CardTitle>Fassungen</CardTitle>
          <ul className="mt-2 divide-y divide-line text-sm">
            {history.map((h) => (
              <li key={h.id} className="flex items-center justify-between gap-3 py-2">
                <span className="text-ink">Fassung {h.version} · {h.title}</span>
                <span className="flex items-center gap-2 text-muted">
                  {formatDateTime(h.createdAt)}
                  {h.status === "published" ? <Badge tone="moss">veröffentlicht</Badge> : h.status === "draft" ? <Badge tone="gelb">Entwurf</Badge> : <Badge>archiviert</Badge>}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
