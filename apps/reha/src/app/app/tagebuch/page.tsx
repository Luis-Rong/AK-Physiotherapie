import Link from "next/link";
import { Plus } from "lucide-react";
import { requireViewer } from "@/lib/auth/session";
import { listLogsForPatient } from "@/lib/data/plan";
import { groupByDay, listPain } from "@/lib/data/pain";
import { addDays, formatDate, today } from "@/lib/dates";
import { trafficLightEnabled } from "@/lib/pain/trafficLight";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { PainValue, TrafficLegend } from "@/components/pain/traffic-badge";
import { PainChart } from "@/components/pain/pain-chart";

export default async function DiaryPage() {
  const { user } = await requireViewer("patient");
  const date = today();
  const [logs, pain] = await Promise.all([
    listLogsForPatient(user.id, { from: addDays(date, -84) }),
    listPain(user.id, { from: addDays(date, -84) }),
  ]);
  const days = groupByDay(pain);
  const ampel = trafficLightEnabled();
  const chart = days.map((d) => ({ date: d.date, during: d.during?.nprs, after: d.after?.nprs, next_morning: d.next_morning?.nprs }));
  const logByDate = new Map(logs.map((l) => [l.logDate, l]));
  const dates = [...new Set([...logs.map((l) => l.logDate), ...days.map((d) => d.date)])].sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-ink">Tagebuch</h1>
          <CardDescription>Trainings- und Schmerzprotokoll. Ihre Praxis sieht diese Einträge.</CardDescription>
        </div>
        <Link href={`/app/tagebuch/eintrag?datum=${date}`} className="inline-flex shrink-0 items-center gap-1 rounded-[var(--radius-md)] bg-clay px-3.5 py-2.5 text-sm font-semibold text-[#FFF7F0] hover:bg-clay-deep">
          <Plus size={16} /> Eintrag
        </Link>
      </div>

      <Card>
        <CardTitle>Verlauf</CardTitle>
        <p className="mb-3 text-xs text-muted">Ihre eingegebenen Werte, ohne Bewertung. Die Einordnung übernimmt Ihre Praxis.</p>
        <PainChart data={chart} />
      </Card>

      <Card>
        <CardTitle>Einträge</CardTitle>
        {dates.length === 0 ? (
          <p className="mt-2 text-sm text-muted">Noch keine Einträge. Nach dem ersten Training legen Sie hier los.</p>
        ) : (
          <ul className="mt-2 divide-y divide-line">
            {dates.map((d) => {
              const log = logByDate.get(d);
              const day = days.find((x) => x.date === d);
              return (
                <li key={d}>
                  <Link href={`/app/tagebuch/eintrag?datum=${d}`} className="-mx-2 flex items-center justify-between gap-3 rounded-[var(--radius-md)] px-2 py-3 hover:bg-sand">
                    <div className="min-w-0">
                      <p className="font-medium text-ink">{formatDate(d, { weekday: "short", day: "2-digit", month: "2-digit", year: "numeric" })}</p>
                      <p className="truncate text-xs text-muted">
                        {log ? `${log.items.filter((i) => i.done).length}/${log.items.length} Übungen` : "kein Training eingetragen"}
                        {log?.remark ? ` · ${log.remark}` : ""}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5" aria-label="Schmerz während, danach, nächster Morgen">
                      {(["during", "after", "next_morning"] as const).map((ph) =>
                        day?.[ph] ? <PainValue key={ph} nprs={day[ph]!.nprs} enabled={ampel} size="sm" /> : <span key={ph} className="inline-block h-7 w-7 rounded-full border border-dashed border-line-strong" aria-hidden />,
                      )}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <Card>
        <CardTitle>Schmerzampel</CardTitle>
        <p className="mb-3 mt-1 text-sm text-ink-soft">
          Grundlage ist die Numerische Schmerzskala von 0 (kein Schmerz) bis 10 (stärkster vorstellbarer Schmerz). Entscheidend ist nicht nur der Wert während der Übung, sondern ob der Schmerz bis zum nächsten Morgen wieder auf das Ausgangsniveau zurückgeht.
        </p>
        <TrafficLegend />
        <p className="mt-3 text-xs text-muted">
          Bei anhaltenden Beschwerden im roten Bereich, plötzlich stark zunehmendem Schmerz, Schwellung oder Instabilitätsgefühl: Rücksprache mit Ihrer Praxis halten, statt eigenständig weiter zu trainieren.
        </p>
      </Card>
    </div>
  );
}
