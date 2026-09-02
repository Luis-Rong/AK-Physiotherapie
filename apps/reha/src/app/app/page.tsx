import Link from "next/link";
import { ArrowRight, CheckCircle2, Dumbbell } from "lucide-react";
import { requireViewer } from "@/lib/auth/session";
import { findCurrentWeek, getLogForDate, listLogsForPatient } from "@/lib/data/plan";
import { getCurrentProfile } from "@/lib/data/patients";
import { listPain } from "@/lib/data/pain";
import { getCurrentSupplementPlan, getIntakeState, itemsActiveOn } from "@/lib/data/supplements";
import { addDays, formatDate, isoWeekday, today, WEEKDAY_LONG } from "@/lib/dates";
import { trafficLightEnabled } from "@/lib/pain/trafficLight";
import { Card, CardTitle, Badge } from "@/components/ui/card";
import { PainValue } from "@/components/pain/traffic-badge";
import { IntakeChecklist } from "./supplemente/intake-checklist";

export default async function TodayPage() {
  const { user } = await requireViewer("patient");
  const date = today();
  const [week, profile, plan, log, pain] = await Promise.all([
    findCurrentWeek(user.id),
    getCurrentProfile(user.id),
    getCurrentSupplementPlan(user.id),
    getLogForDate(user.id, date),
    listPain(user.id, { from: addDays(date, -7), to: date }),
  ]);
  const yesterday = addDays(date, -1);
  const [yLog, yPainMorning] = await Promise.all([
    getLogForDate(user.id, yesterday),
    listPain(user.id, { from: yesterday, to: yesterday }).then((l) => l.find((p) => p.phase === "next_morning")),
  ]);
  const recentLogs = await listLogsForPatient(user.id, { from: addDays(date, -7), to: date });
  const isTrainingDay = week?.trainingDays.includes(isoWeekday(date)) ?? false;
  const ampel = trafficLightEnabled();
  const activeItems = plan ? itemsActiveOn(plan.items, date) : [];
  const intake = activeItems.length ? await getIntakeState(user.id, date) : new Map<string, boolean>();
  const doneCount = log?.items.filter((i) => i.done).length ?? 0;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">{WEEKDAY_LONG[isoWeekday(date) - 1]}, {formatDate(date)}</p>

      {yLog && !yPainMorning && (
        <Card className="border-clay/30 bg-clay-soft/40">
          <p className="text-sm text-ink">
            Wie ist es Ihnen heute Morgen nach dem Training von gestern gegangen?
          </p>
          <Link href={`/app/tagebuch/eintrag?datum=${yesterday}#morgen`} className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-clay-deep">
            Nächsten Morgen eintragen <ArrowRight size={16} />
          </Link>
        </Card>
      )}

      <Card>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>Training</CardTitle>
            {week ? (
              <p className="mt-1 text-sm text-muted">
                Woche {week.weekNumber}{week.goal ? ` · ${week.goal}` : ""}
              </p>
            ) : (
              <p className="mt-1 text-sm text-muted">Für diese Woche liegt noch kein Plan vor.</p>
            )}
          </div>
          {week && (isTrainingDay ? <Badge tone="clay">Trainingstag</Badge> : <Badge>Ruhetag</Badge>)}
        </div>
        {week && (
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            {log ? (
              <div className="flex flex-1 items-center gap-2 rounded-[var(--radius-md)] bg-moss-soft px-3.5 py-3 text-sm text-moss">
                <CheckCircle2 size={18} /> Heute eingetragen: {doneCount} von {log.items.length} Übungen
              </div>
            ) : (
              <Link href={`/app/tagebuch/eintrag?datum=${date}`} className="flex flex-1 items-center justify-center gap-2 rounded-[var(--radius-md)] bg-clay px-4 py-3 text-sm font-semibold text-[#FFF7F0] hover:bg-clay-deep">
                <Dumbbell size={18} /> Training eintragen
              </Link>
            )}
            <Link href="/app/plan" className="flex items-center justify-center gap-1 rounded-[var(--radius-md)] bg-sand px-4 py-3 text-sm font-semibold text-ink hover:bg-sand-deep">
              Plan ansehen <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </Card>

      {activeItems.length > 0 && (
        <Card>
          <CardTitle>Supplemente heute</CardTitle>
          <IntakeChecklist date={date} items={activeItems} state={Object.fromEntries(intake)} />
        </Card>
      )}

      <Card>
        <div className="flex items-baseline justify-between">
          <CardTitle>Letzte 7 Tage</CardTitle>
          <Link href="/app/tagebuch" className="text-sm font-semibold text-bark">Tagebuch</Link>
        </div>
        {recentLogs.length === 0 && pain.length === 0 ? (
          <p className="mt-2 text-sm text-muted">Noch keine Einträge in dieser Woche.</p>
        ) : (
          <ul className="mt-3 divide-y divide-line">
            {recentLogs.map((l) => {
              const dayPain = pain.filter((p) => p.entryDate === l.logDate);
              return (
                <li key={l.id} className="flex items-center justify-between py-2.5 text-sm">
                  <span className="text-ink">{formatDate(l.logDate, { weekday: "short", day: "2-digit", month: "2-digit" })}</span>
                  <span className="flex items-center gap-1.5">
                    <span className="mr-2 text-muted">{l.items.filter((i) => i.done).length}/{l.items.length} Übungen</span>
                    {dayPain.map((p) => (
                      <PainValue key={p.id} nprs={p.nprs} enabled={ampel} size="sm" />
                    ))}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {profile?.krsStage && (
        <Card className="bg-bark-soft/60">
          <p className="text-xs uppercase tracking-wide text-muted">Aktuelle Stufe laut Praxis</p>
          <p className="mt-1 font-semibold text-ink">KRS {profile.krsStage}</p>
          <Link href="/app/wissen/reha-stadien" className="mt-1 inline-block text-sm text-bark">Was bedeutet das?</Link>
        </Card>
      )}
    </div>
  );
}
