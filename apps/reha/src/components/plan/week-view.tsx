import type { WeekWithExercises } from "@/lib/data/plan";
import { SECTION_LABEL, type Section } from "@/lib/labels";
import { WEEKDAY_SHORT, formatDate } from "@/lib/dates";
import { Badge } from "@/components/ui/card";
import { cn } from "@/lib/cn";

const SECTIONS: Section[] = ["warmup", "main", "cooldown"];

/** Anzeige einer Trainingswoche, gemeinsam für Patient und Praxis. */
export function WeekView({ week, doneIds, compact = false }: { week: WeekWithExercises; doneIds?: Set<string>; compact?: boolean }) {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted">Woche {week.weekNumber} · ab {formatDate(week.startsOn)}</p>
          {week.goal && <p className="mt-0.5 font-semibold text-ink">{week.goal}</p>}
        </div>
        <ul className="flex gap-1" aria-label="Trainingstage">
          {WEEKDAY_SHORT.map((d, i) => {
            const on = week.trainingDays.includes(i + 1);
            return (
              <li key={d} className={cn("grid h-8 w-8 place-items-center rounded-full text-xs font-semibold", on ? "bg-bark text-[#F7F1E8]" : "bg-sand text-muted")} aria-label={`${d}${on ? " Trainingstag" : ""}`}>
                {d}
              </li>
            );
          })}
        </ul>
      </div>
      {SECTIONS.map((s) => {
        const items = week.exercises.filter((e) => e.section === s);
        if (items.length === 0) return null;
        return (
          <section key={s}>
            <h3 className="mb-2 text-sm font-semibold text-ink-soft">{SECTION_LABEL[s]}</h3>
            <ul className="divide-y divide-line overflow-hidden rounded-[var(--radius-md)] border border-line bg-surface">
              {items.map((e) => (
                <li key={e.id} className={cn("flex items-start gap-3 px-3.5 py-3", doneIds?.has(e.id) && "bg-moss-soft/40")}>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-ink">{e.name}</p>
                    <p className="mt-0.5 flex flex-wrap gap-x-3 text-sm text-muted">
                      {e.sets && <span>{e.sets} Sätze</span>}
                      {e.reps && <span>{e.reps} Wdh.</span>}
                      {e.weight && <span>{e.weight}</span>}
                      {e.duration && <span>{e.duration}</span>}
                    </p>
                    {e.remarks && !compact && <p className="mt-1 text-sm text-ink-soft">{e.remarks}</p>}
                  </div>
                  {doneIds?.has(e.id) && <Badge tone="moss">erledigt</Badge>}
                </li>
              ))}
            </ul>
          </section>
        );
      })}
      {week.notes && !compact && (
        <section className="rounded-[var(--radius-md)] bg-sand p-3.5 text-sm text-ink-soft">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">Hinweis der Praxis</p>
          {week.notes}
        </section>
      )}
    </div>
  );
}
