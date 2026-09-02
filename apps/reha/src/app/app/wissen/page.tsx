import Link from "next/link";
import { BedDouble, BookOpen, ChevronRight, Dumbbell, HeartPulse, Salad, Thermometer } from "lucide-react";
import { requireViewer } from "@/lib/auth/session";
import { listPublishedContent } from "@/lib/data/content";
import { getCurrentProfile } from "@/lib/data/patients";
import { CONTENT_CATEGORIES, CONTENT_CATEGORY_LABEL, type ContentCategory } from "@/lib/labels";
import { plainText } from "@/lib/content/types";
import { Card, CardDescription } from "@/components/ui/card";

const ICONS: Record<ContentCategory, typeof BookOpen> = {
  einfuehrung: BookOpen,
  schlaf: BedDouble,
  ernaehrung: Salad,
  bewegung: Dumbbell,
  schmerz: Thermometer,
  reha: HeartPulse,
};

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
      <div>
        <h1 className="text-xl font-semibold text-ink">Wissen</h1>
        <CardDescription>Hintergrund zu den drei Säulen: Bewegung, Ernährung und Schlaf. Zum Nachlesen, wenn Sie es brauchen.</CardDescription>
      </div>
      {grouped.length === 0 ? (
        <Card><p className="text-sm text-muted">Ihre Praxis hat noch keine Inhalte veröffentlicht.</p></Card>
      ) : (
        grouped.map(({ c, items }) => {
          const Icon = ICONS[c];
          const highlight = c === "ernaehrung" && profile?.opContext;
          return (
            <Card key={c} className="p-0">
              <div className="flex items-center gap-3 border-b border-line px-5 py-4">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-bark-soft text-bark"><Icon size={20} /></span>
                <div>
                  <h2 className="font-semibold text-ink">{CONTENT_CATEGORY_LABEL[c]}</h2>
                  <p className="text-xs text-muted">{INTRO[c]}{highlight ? " Für Ihre Situation nach der Operation besonders relevant." : ""}</p>
                </div>
              </div>
              <ul className="divide-y divide-line">
                {items.map((it) => (
                  <li key={it.id}>
                    <Link href={`/app/wissen/${it.slug}`} className="flex items-center gap-3 px-5 py-3 hover:bg-sand/60">
                      <span className="min-w-0 flex-1">
                        <span className="block font-medium text-ink">{it.title}</span>
                        <span className="block truncate text-xs text-muted">{plainText(it.body).slice(0, 110)}</span>
                      </span>
                      <ChevronRight size={18} className="shrink-0 text-muted" />
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
