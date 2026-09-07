import { requireViewer } from "@/lib/auth/session";
import { findWeekForDate, getLogForDate, SECTION_LABEL, type Section } from "@/lib/data/plan";
import { listPain } from "@/lib/data/pain";
import { formatDate, today } from "@/lib/dates";
import { trafficLightEnabled } from "@/lib/pain/trafficLight";
import { PHASE_LABEL } from "@/lib/labels";
import { Card } from "@/components/ui/card";
import { Ampel, AmpelHinweis, AmpelLegende } from "@/components/pain/ampel";
import { PageHeader } from "@/components/page-header";
import { PiktoStift } from "@/components/pikto";
import { EntryForm } from "./entry-form";

export default async function EntryPage({ searchParams }: { searchParams: Promise<{ datum?: string }> }) {
  const { user } = await requireViewer("patient");
  const sp = await searchParams;
  const date = /^\d{4}-\d{2}-\d{2}$/.test(sp.datum ?? "") && sp.datum! <= today() ? sp.datum! : today();
  const [week, log, pain] = await Promise.all([findWeekForDate(user.id, date), getLogForDate(user.id, date), listPain(user.id, { from: date, to: date })]);
  const ampel = trafficLightEnabled();
  const byPhase = Object.fromEntries(pain.map((p) => [p.phase, p]));
  const sections: Section[] = ["warmup", "main", "cooldown"];

  return (
    <div className="space-y-4">
      <PageHeader
        tone="berry"
        icon={<PiktoStift size={30} />}
        back={{ href: "/app/tagebuch", label: "Tagebuch" }}
        title={formatDate(date, { weekday: "long", day: "2-digit", month: "2-digit" })}
        intro={
          log
            ? "Für diesen Tag ist schon etwas eingetragen. Änderungen werden als neue Fassung gespeichert; die alte bleibt für Ihre Praxis sichtbar."
            : "Was haben Sie gemacht, und wie hat sich der Schmerz verhalten?"
        }
      />

      {pain.length > 0 && (
        <Card className="bg-berry-soft/40">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Bisher eingetragen</p>
          <ul className="mt-3 flex flex-wrap gap-5">
            {(["during", "after", "next_morning"] as const).map(
              (ph) =>
                byPhase[ph] && (
                  <li key={ph} className="flex items-center gap-2.5">
                    <Ampel nprs={byPhase[ph]!.nprs} enabled={ampel} size="sm" />
                    <span>
                      <span className="block text-lg font-bold tabular-nums leading-none text-ink">{byPhase[ph]!.nprs}</span>
                      <span className="block text-xs text-muted">{PHASE_LABEL[ph]}</span>
                    </span>
                  </li>
                ),
            )}
          </ul>
          {ampel && <AmpelHinweis className="mt-3" />}
        </Card>
      )}

      <Card>
        <EntryForm
          date={date}
          week={
            week
              ? {
                  id: week.id,
                  sections: sections
                    .map((s) => ({
                      key: s,
                      label: SECTION_LABEL[s],
                      exercises: week.exercises
                        .filter((e) => e.section === s)
                        .map((e) => ({
                          id: e.id,
                          name: e.name,
                          detail: [e.sets && `${e.sets} Sätze`, e.reps && `${e.reps} Wdh.`, e.weight, e.duration].filter(Boolean).join(" · "),
                        })),
                    }))
                    .filter((s) => s.exercises.length > 0),
                }
              : null
          }
          existing={log ? { doneIds: log.items.filter((i) => i.done).map((i) => i.weekExerciseId), remark: log.remark ?? "" } : null}
          pain={{ during: byPhase.during?.nprs ?? null, after: byPhase.after?.nprs ?? null, next_morning: byPhase.next_morning?.nprs ?? null }}
          isToday={date === today()}
        />
      </Card>

      <details className="rounded-[var(--radius-lg)] border border-line bg-surface p-4">
        <summary className="cursor-pointer text-sm font-semibold text-ink">Wie lese ich die Schmerzampel?</summary>
        <div className="mt-3">
          <AmpelLegende />
          <AmpelHinweis className="mt-3" />
        </div>
      </details>
    </div>
  );
}
