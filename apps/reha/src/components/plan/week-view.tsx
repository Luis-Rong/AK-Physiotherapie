import type { WeekWithExercises } from "@/lib/data/plan";
import { SECTION_LABEL, type Section } from "@/lib/labels";
import { WEEKDAY_SHORT, formatDate } from "@/lib/dates";
import { Badge } from "@/components/ui/card";
import { IconTile, type Tone } from "@/components/pikto/tile";
import { PiktoHaken, PiktoHantel, PiktoMond, PiktoSonne, PiktoZiel } from "@/components/pikto";
import { cn } from "@/lib/cn";

const SECTIONS: Section[] = ["warmup", "main", "cooldown"];
const SECTION_TONE: Record<Section, Tone> = { warmup: "sun", main: "clay", cooldown: "sky" };
const SECTION_ICON: Record<Section, typeof PiktoHantel> = { warmup: PiktoSonne, main: PiktoHantel, cooldown: PiktoMond };

/** Anzeige einer Trainingswoche, gemeinsam für Patient und Praxis. */
export function WeekView({ week, doneIds, compact = false }: { week: WeekWithExercises; doneIds?: Set<string>; compact?: boolean }) {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <IconTile tone="clay">
            <PiktoZiel size={22} />
          </IconTile>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              Woche {week.weekNumber} · ab {formatDate(week.startsOn)}
            </p>
            {week.goal && <p className="mt-0.5 font-semibold text-ink">{week.goal}</p>}
          </div>
        </div>
        <ul className="flex gap-1" aria-label="Trainingstage">
          {WEEKDAY_SHORT.map((d, i) => {
            const on = week.trainingDays.includes(i + 1);
            return (
              <li
                key={d}
                className={cn("grid h-8 w-8 place-items-center rounded-full text-xs font-semibold", on ? "bg-clay text-[#FFF7F0]" : "bg-sand text-muted")}
                aria-label={`${d}${on ? " Trainingstag" : ""}`}
              >
                {d}
              </li>
            );
          })}
        </ul>
      </div>
      {SECTIONS.map((s) => {
        const items = week.exercises.filter((e) => e.section === s);
        if (items.length === 0) return null;
        const Icon = SECTION_ICON[s];
        return (
          <section key={s}>
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink">
              <IconTile tone={SECTION_TONE[s]} size="sm">
                <Icon size={16} />
              </IconTile>
              {SECTION_LABEL[s]}
              <span className="text-xs font-medium text-muted">· {items.length}</span>
            </h3>
            <ul className="divide-y divide-line overflow-hidden rounded-[var(--radius-md)] border border-line bg-surface">
              {items.map((e, i) => {
                const done = doneIds?.has(e.id);
                return (
                  <li key={e.id} className={cn("flex items-start gap-3 px-3.5 py-3", done && "bg-moss-soft/40")}>
                    <span
                      className={cn(
                        "mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-bold tabular-nums",
                        done ? "bg-moss text-white" : "bg-sand text-ink-soft",
                      )}
                    >
                      {done ? <PiktoHaken size={16} strokeWidth={2.6} /> : i + 1}
                    </span>
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
                    {done && <Badge tone="moss">erledigt</Badge>}
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
      {week.notes && !compact && (
        <section className="rounded-[var(--radius-md)] bg-clay-soft/50 p-3.5 text-sm text-ink-soft">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-clay-deep">Hinweis der Praxis</p>
          {week.notes}
        </section>
      )}
    </div>
  );
}
