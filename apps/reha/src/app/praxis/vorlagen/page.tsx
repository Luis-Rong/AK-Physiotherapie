import Link from "next/link";
import { requireViewer } from "@/lib/auth/session";
import { listTemplates } from "@/lib/data/templates";
import { formatDate } from "@/lib/dates";
import { Badge, Card } from "@/components/ui/card";
import { PiktoPlus } from "@/components/pikto";
import { TemplateActiveToggle } from "./active-toggle";

export default async function TemplatesPage() {
  await requireViewer("praxis");
  const templates = await listTemplates(true);
  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Plan-Vorlagen</h1>
          <p className="mt-1 text-sm text-muted">
            Einmal anlegen, auf jeden passenden Patienten anwenden. Danach bleibt jede Woche einzeln anpassbar – die Vorlage ist der Start, nicht die Vorschrift.
          </p>
        </div>
        <Link href="/praxis/vorlagen/neu" className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-clay px-4 py-2.5 text-sm font-semibold text-[#FFF7F0] hover:bg-clay-deep">
          <PiktoPlus size={16} /> Vorlage anlegen
        </Link>
      </div>
      <Card className="p-0">
        {templates.length === 0 ? (
          <p className="p-5 text-sm text-muted">
            Noch keine Vorlage. Entweder hier neu anlegen oder in einem Patientenplan unter „Trainingsplan“ den bestehenden Plan als Vorlage sichern.
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {templates.map((t) => (
              <li key={t.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
                <Link href={`/praxis/vorlagen/${t.id}`} className="min-w-0 flex-1">
                  <span className="block font-semibold text-ink">{t.name}</span>
                  <span className="block truncate text-sm text-muted">
                    {t.weeks.length} {t.weeks.length === 1 ? "Woche" : "Wochen"}
                    {t.description ? ` · ${t.description}` : ""} · Stand {formatDate(t.updatedAt.toISOString().slice(0, 10))}
                  </span>
                </Link>
                {!t.active && <Badge>inaktiv</Badge>}
                <TemplateActiveToggle id={t.id} active={t.active} />
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
