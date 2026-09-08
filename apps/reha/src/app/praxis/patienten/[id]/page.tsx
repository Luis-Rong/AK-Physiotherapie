import Link from "next/link";
import { requireViewer } from "@/lib/auth/session";
import { findCurrentWeek, listCurrentWeeks, listLogsForPatient } from "@/lib/data/plan";
import { groupByDay, listPain } from "@/lib/data/pain";
import { getCurrentProfile } from "@/lib/data/patients";
import { addDays, formatDate, today } from "@/lib/dates";
import { trafficLightEnabled } from "@/lib/pain/trafficLight";
import { Card, CardTitle } from "@/components/ui/card";
import { PainValue } from "@/components/pain/traffic-badge";
import { PainChart } from "@/components/pain/pain-chart";
import { WeekView } from "@/components/plan/week-view";

export default async function PatientOverview({ params }: { params: Promise<{ id: string }> }) {
  await requireViewer("praxis");
  const { id } = await params;
  const date = today();
  const [week, weeks, profile, logs, pain] = await Promise.all([
    findCurrentWeek(id),
    listCurrentWeeks(id),
    getCurrentProfile(id),
    listLogsForPatient(id, { from: addDays(date, -28) }),
    listPain(id, { from: addDays(date, -84) }),
  ]);
  const ampel = trafficLightEnabled();
  const days = groupByDay(pain);
  const chart = days.map((d) => ({ date: d.date, during: d.during?.nprs, after: d.after?.nprs, next_morning: d.next_morning?.nprs }));
  const plannedDays = weeks.reduce((n, w) => n + w.trainingDays.filter((dow) => addDays(w.startsOn, dow - 1) <= date && addDays(w.startsOn, dow - 1) >= addDays(date, -28)).length, 0);

  return (
    <div className="grid gap-5 lg:grid-cols-5">
      <div className="space-y-5 lg:col-span-3">
        <Card>
          <div className="flex items-baseline justify-between">
            <CardTitle>Schmerzverlauf</CardTitle>
            <span className="text-xs text-muted">letzte 12 Wochen</span>
          </div>
          <div className="mt-3"><PainChart data={chart} /></div>
        </Card>
        <Card>
          <div className="flex items-baseline justify-between">
            <CardTitle>Einträge der Patientin / des Patienten</CardTitle>
            <span className="text-xs text-muted">{logs.length} Trainings in 4 Wochen{plannedDays ? ` · ${plannedDays} geplant` : ""}</span>
          </div>
          {logs.length === 0 && days.length === 0 ? (
            <p className="mt-2 text-sm text-muted">Noch keine Einträge.</p>
          ) : (
            <table className="mt-3 w-full text-sm">
              <thead><tr className="text-left text-xs uppercase tracking-wide text-muted"><th className="pb-2 font-medium">Datum</th><th className="pb-2 font-medium">Übungen</th><th className="pb-2 font-medium">Während · Danach · Morgen</th><th className="pb-2 font-medium">Bemerkung</th></tr></thead>
              <tbody className="divide-y divide-line">
                {[...new Set([...logs.map((l) => l.logDate), ...days.map((d) => d.date)])].sort((a, b) => b.localeCompare(a)).slice(0, 20).map((d) => {
                  const log = logs.find((l) => l.logDate === d);
                  const day = days.find((x) => x.date === d);
                  return (
                    <tr key={d}>
                      <td className="py-2 text-ink">{formatDate(d, { weekday: "short", day: "2-digit", month: "2-digit" })}</td>
                      <td className="py-2 text-ink-soft">{log ? `${log.items.filter((i) => i.done).length}/${log.items.length}` : "–"}</td>
                      <td className="py-2">
                        <span className="flex gap-1.5">
                          {(["during", "after", "next_morning"] as const).map((ph) => (day?.[ph] ? <PainValue key={ph} nprs={day[ph]!.nprs} enabled={ampel} size="sm" /> : <span key={ph} className="inline-block h-7 w-7 rounded-full border border-dashed border-line-strong" />))}
                        </span>
                      </td>
                      <td className="max-w-[16rem] truncate py-2 text-ink-soft">{log?.remark ?? ""}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          <p className="mt-3 text-xs text-muted">Werte wie eingegeben. Die Ampel ordnet nur den einzelnen Wert zu; Verlauf und Konsequenz beurteilen Sie.</p>
        </Card>
      </div>
      <div className="space-y-5 lg:col-span-2">
        <Card>
          <div className="flex items-baseline justify-between">
            <CardTitle>Aktuelle Woche</CardTitle>
            <Link href={`/praxis/patienten/${id}/plan`} className="text-sm font-semibold text-bark">Plan bearbeiten</Link>
          </div>
          <div className="mt-3">{week ? <WeekView week={week} compact /> : <p className="text-sm text-muted">Für diese Woche gibt es keinen Plan.</p>}</div>
        </Card>
        <Card>
          <CardTitle>Profil</CardTitle>
          {profile ? (
            <dl className="mt-2 space-y-2 text-sm">
              {profile.goal && <div><dt className="text-xs uppercase tracking-wide text-muted">Ziel</dt><dd className="text-ink">{profile.goal}</dd></div>}
              <div className="flex gap-4">
                <div><dt className="text-xs uppercase tracking-wide text-muted">KRS</dt><dd className="text-ink">{profile.krsStage ?? "–"}</dd></div>
                <div><dt className="text-xs uppercase tracking-wide text-muted">OP-Kontext</dt><dd className="text-ink">{profile.opContext ? "ja" : "nein"}</dd></div>
                <div><dt className="text-xs uppercase tracking-wide text-muted">Ziele</dt><dd className="text-ink">{[profile.calorieTarget && `${profile.calorieTarget} kcal`, profile.proteinTargetG && `${profile.proteinTargetG} g P`].filter(Boolean).join(" · ") || "–"}</dd></div>
              </div>
            </dl>
          ) : (
            <p className="mt-2 text-sm text-muted">Noch kein Profil.</p>
          )}
          <Link href={`/praxis/patienten/${id}/profil`} className="mt-3 inline-block text-sm font-semibold text-bark">Bearbeiten</Link>
        </Card>
      </div>
    </div>
  );
}
