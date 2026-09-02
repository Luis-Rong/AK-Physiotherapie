import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireViewer } from "@/lib/auth/session";
import { findWeekForDate, getLogForDate, SECTION_LABEL, type Section } from "@/lib/data/plan";
import { listPain } from "@/lib/data/pain";
import { formatDate, today } from "@/lib/dates";
import { trafficLightEnabled } from "@/lib/pain/trafficLight";
import { Card, CardDescription } from "@/components/ui/card";
import { PainValue, TrafficLegend } from "@/components/pain/traffic-badge";
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
      <Link href="/app/tagebuch" className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink"><ArrowLeft size={16} /> Tagebuch</Link>
      <div>
        <h1 className="text-xl font-semibold text-ink">{formatDate(date, { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" })}</h1>
        <CardDescription>
          {log ? "Sie haben für diesen Tag bereits eingetragen. Änderungen werden als neue Fassung gespeichert; die alte bleibt für Ihre Praxis sichtbar." : "Was haben Sie gemacht, und wie hat sich der Schmerz verhalten?"}
        </CardDescription>
      </div>

      {log && pain.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-ink-soft">
          Bisher:
          {(["during", "after", "next_morning"] as const).map((ph) => byPhase[ph] && (
            <span key={ph} className="inline-flex items-center gap-1">
              <PainValue nprs={byPhase[ph]!.nprs} enabled={ampel} size="sm" />
              <span className="text-xs text-muted">{ph === "during" ? "während" : ph === "after" ? "danach" : "morgen"}</span>
            </span>
          ))}
        </div>
      )}

      <Card>
        <EntryForm
          date={date}
          week={week ? {
            id: week.id,
            sections: sections.map((s) => ({ key: s, label: SECTION_LABEL[s], exercises: week.exercises.filter((e) => e.section === s).map((e) => ({ id: e.id, name: e.name, detail: [e.sets && `${e.sets} Sätze`, e.reps && `${e.reps} Wdh.`, e.weight, e.duration].filter(Boolean).join(" · ") })) })).filter((s) => s.exercises.length > 0),
          } : null}
          existing={log ? { doneIds: log.items.filter((i) => i.done).map((i) => i.weekExerciseId), remark: log.remark ?? "" } : null}
          pain={{ during: byPhase.during?.nprs ?? null, after: byPhase.after?.nprs ?? null, next_morning: byPhase.next_morning?.nprs ?? null }}
          isToday={date === today()}
        />
      </Card>

      <details className="rounded-[var(--radius-md)] border border-line bg-surface p-4">
        <summary className="cursor-pointer text-sm font-semibold text-ink">Wie lese ich die Schmerzampel?</summary>
        <div className="mt-3"><TrafficLegend /></div>
      </details>
    </div>
  );
}
