import Link from "next/link";
import { requireViewer } from "@/lib/auth/session";
import { findCurrentWeek, listCurrentWeeks } from "@/lib/data/plan";
import { listTemplates } from "@/lib/data/templates";
import { addDays, formatDate, mondayOf, today, WEEKDAY_SHORT } from "@/lib/dates";
import { Badge, Card, CardTitle } from "@/components/ui/card";
import { PiktoPlus } from "@/components/pikto";
import { ApplyTemplateForm, SaveAsTemplateForm } from "./template-forms";

export default async function PlanListPage({ params }: { params: Promise<{ id: string }> }) {
  await requireViewer("praxis");
  const { id } = await params;
  const [weeks, current, templates] = await Promise.all([listCurrentWeeks(id), findCurrentWeek(id), listTemplates()]);
  const last = weeks.at(-1);
  const defaultStart = last ? addDays(last.startsOn, 7) : mondayOf(today());
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">Wochenpläne, jede Woche einzeln anpassbar. Änderungen erzeugen eine neue Fassung; alte Fassungen bleiben einsehbar.</p>
        <Link href={`/praxis/patienten/${id}/plan/neu`} className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-clay px-4 py-2.5 text-sm font-semibold text-[#FFF7F0] hover:bg-clay-deep">
          <PiktoPlus size={16} /> {weeks.length ? `Woche ${Math.max(...weeks.map((w) => w.weekNumber)) + 1} anlegen` : "Woche 1 anlegen"}
        </Link>
      </div>
      <Card className="p-0">
        {weeks.length === 0 ? (
          <p className="p-5 text-sm text-muted">Noch kein Plan. Entweder unten eine Vorlage anwenden oder die erste Woche von Hand anlegen.</p>
        ) : (
          <ul className="divide-y divide-line">
            {weeks.map((w) => (
              <li key={w.id}>
                <Link href={`/praxis/patienten/${id}/plan/${w.weekNumber}`} className="flex flex-wrap items-center gap-3 px-5 py-3.5 hover:bg-sand/60">
                  <span className="w-24 font-semibold text-ink">Woche {w.weekNumber}</span>
                  <span className="w-28 text-sm text-ink-soft">ab {formatDate(w.startsOn)}</span>
                  <span className="min-w-0 flex-1 truncate text-sm text-ink">{w.goal ?? <span className="text-muted">ohne Wochenziel</span>}</span>
                  <span className="flex gap-0.5">
                    {WEEKDAY_SHORT.map((d, i) => (
                      <span key={d} className={`grid h-6 w-6 place-items-center rounded-full text-[10px] font-semibold ${w.trainingDays.includes(i + 1) ? "bg-clay text-[#FFF7F0]" : "bg-sand text-muted"}`}>
                        {d}
                      </span>
                    ))}
                  </span>
                  {current?.id === w.id && <Badge tone="clay">aktuell</Badge>}
                  {w.version > 1 && <Badge>Fassung {w.version}</Badge>}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardTitle>Vorlage anwenden</CardTitle>
          <p className="mb-3 mt-1 text-xs text-muted">Hängt die Wochen der Vorlage hinter die vorhandenen. Danach jede Woche wie gewohnt anpassen.</p>
          <ApplyTemplateForm patientId={id} templates={templates.map((t) => ({ id: t.id, name: t.name, weeks: t.weeks.length }))} defaultStart={defaultStart} />
        </Card>
        {weeks.length > 0 && (
          <Card>
            <CardTitle>Plan als Vorlage sichern</CardTitle>
            <p className="mb-3 mt-1 text-xs text-muted">Für den nächsten Patienten mit ähnlichem Verlauf. Verwaltung unter „Vorlagen“.</p>
            <SaveAsTemplateForm patientId={id} />
          </Card>
        )}
      </div>
    </div>
  );
}
