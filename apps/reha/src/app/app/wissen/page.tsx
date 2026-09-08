import Link from "next/link";
import { requireViewer } from "@/lib/auth/session";
import { listPublishedContent } from "@/lib/data/content";
import { getCurrentProfile } from "@/lib/data/patients";
import { CONTENT_CATEGORIES, CONTENT_CATEGORY_LABEL, type ContentCategory } from "@/lib/labels";
import { plainText } from "@/lib/content/types";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { IconTile, TONE_TEXT } from "@/components/pikto/tile";
import { PiktoLampe, PiktoPfeil } from "@/components/pikto";
import { IlluLeer } from "@/components/pikto/illustrationen";
import { CATEGORY_ICON, CATEGORY_TONE } from "@/components/wissen/kategorie";

const INTRO: Record<ContentCategory, string> = {
  einfuehrung: "Warum Struktur den Unterschied macht.",
  schlaf: "Die Phase, in der die eigentliche Regeneration stattfindet.",
  ernaehrung: "Bausteine für Reparatur und Wachstum.",
  bewegung: "Der Reiz, an dem das Gewebe wächst.",
  schmerz: "Schmerz einordnen statt vermeiden.",
  reha: "Wundheilung und Kraftaufbau im Zusammenspiel.",
};

export default async function KnowledgePage() {
  const { user } = await requireViewer("patient");
  const [content, profile] = await Promise.all([listPublishedContent(), getCurrentProfile(user.id)]);
  const grouped = CONTENT_CATEGORIES.map((c) => ({ c, items: content.filter((x) => x.category === c) })).filter((g) => g.items.length > 0);

  return (
    <div className="space-y-4">
      <PageHeader
        tone="sky"
        icon={<PiktoLampe size={30} />}
        title="Wissen"
        intro="Hintergrund zu den drei Säulen Bewegung, Ernährung und Schlaf – von Ihrer Praxis geschrieben, zum Nachlesen, wenn Sie es brauchen."
      />
      {grouped.length === 0 ? (
        <Card>
          <div className="flex items-center gap-4">
            <IlluLeer className="h-20 w-28 shrink-0" />
            <p className="text-sm text-ink-soft">Ihre Praxis hat noch keine Inhalte veröffentlicht.</p>
          </div>
        </Card>
      ) : (
        grouped.map(({ c, items }) => {
          const Icon = CATEGORY_ICON[c];
          const tone = CATEGORY_TONE[c];
          const highlight = c === "ernaehrung" && profile?.opContext;
          return (
            <Card key={c} className="overflow-hidden p-0">
              <div className="flex items-center gap-3 border-b border-line px-4 py-4">
                <IconTile tone={tone}>
                  <Icon size={24} />
                </IconTile>
                <div className="min-w-0">
                  <h2 className="font-semibold text-ink">{CONTENT_CATEGORY_LABEL[c]}</h2>
                  <p className="text-xs text-muted">
                    {INTRO[c]}
                    {highlight ? " Für Ihre Situation nach der Operation besonders relevant." : ""}
                  </p>
                </div>
              </div>
              <ul className="divide-y divide-line">
                {items.map((it) => (
                  <li key={it.id}>
                    <Link href={`/app/wissen/${it.slug}`} className="flex items-center gap-3 px-4 py-3 hover:bg-sand/60">
                      <span className="min-w-0 flex-1">
                        <span className="block font-medium text-ink">{it.title}</span>
                        <span className="block truncate text-xs text-muted">{plainText(it.body).slice(0, 110)}</span>
                      </span>
                      <PiktoPfeil size={18} className={`shrink-0 ${TONE_TEXT[tone]}`} />
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          );
        })
      )}
    </div>
  );
}
