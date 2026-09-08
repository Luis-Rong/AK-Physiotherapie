"use client";

import { useActionState, useState } from "react";
import { saveEntryAction, type EntryState } from "./actions";
import { Button } from "@/components/ui/button";
import { Field, Textarea } from "@/components/ui/field";
import { Alert } from "@/components/ui/card";
import { PainScale } from "@/components/pain/pain-scale";
import { IconTile } from "@/components/pikto/tile";
import { PiktoAmpel, PiktoHaken, PiktoHantel, PiktoSonne, PiktoStift } from "@/components/pikto";
import { cn } from "@/lib/cn";

type WeekShape = { id: string; sections: { key: string; label: string; exercises: { id: string; name: string; detail: string }[] }[] };

export function EntryForm({
  date,
  week,
  existing,
  pain,
  isToday,
}: {
  date: string;
  week: WeekShape | null;
  existing: { doneIds: string[]; remark: string } | null;
  pain: { during: number | null; after: number | null; next_morning: number | null };
  isToday: boolean;
}) {
  const [state, action, pending] = useActionState(saveEntryAction, {} as EntryState);
  const [done, setDone] = useState<Set<string>>(new Set(existing?.doneIds ?? []));
  const total = week?.sections.reduce((n, s) => n + s.exercises.length, 0) ?? 0;

  function toggle(id: string) {
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <form action={action} className="space-y-7">
      <input type="hidden" name="date" value={date} />
      <input type="hidden" name="weekVersionId" value={week?.id ?? ""} />
      {[...done].map((id) => (
        <input key={id} type="hidden" name="done" value={id} />
      ))}

      {week ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <IconTile tone="clay" size="sm">
                <PiktoHantel size={18} />
              </IconTile>
              <h2 className="text-lg font-semibold text-ink">Übungen</h2>
            </div>
            <span className="rounded-full bg-clay-soft px-2.5 py-1 text-xs font-semibold tabular-nums text-clay-deep">
              {done.size} / {total}
            </span>
          </div>
          {week.sections.map((s) => (
            <section key={s.key}>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">{s.label}</p>
              <ul className="space-y-1.5">
                {s.exercises.map((e) => {
                  const on = done.has(e.id);
                  return (
                    <li key={e.id}>
                      <button
                        type="button"
                        aria-pressed={on}
                        onClick={() => toggle(e.id)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-[var(--radius-md)] border px-3.5 py-3 text-left transition-colors active:scale-[.99]",
                          on ? "border-moss/40 bg-moss-soft" : "border-line bg-surface hover:bg-sand",
                        )}
                      >
                        <span className={cn("grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 transition-colors", on ? "border-moss bg-moss text-white" : "border-line-strong")}>
                          {on && <PiktoHaken size={18} strokeWidth={2.6} />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className={cn("block font-medium", on ? "text-moss" : "text-ink")}>{e.name}</span>
                          {e.detail && <span className="block text-xs text-muted">{e.detail}</span>}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      ) : (
        <Alert>Für diesen Tag liegt kein Wochenplan vor. Sie können trotzdem Schmerzwerte und eine Bemerkung eintragen.</Alert>
      )}

      <div className="space-y-5">
        <div className="flex items-center gap-2.5">
          <IconTile tone="berry" size="sm">
            <PiktoAmpel size={18} />
          </IconTile>
          <h2 className="text-lg font-semibold text-ink">Schmerz</h2>
          <span className="text-xs text-muted">0 bis 10</span>
        </div>
        <PainScale name="during" label="Während der Übungen" defaultValue={pain.during} />
        <PainScale name="after" label="Danach" defaultValue={pain.after} />
        <div id="morgen" className={cn("rounded-[var(--radius-md)] border p-3.5", isToday ? "border-line opacity-70" : "border-sun/50 bg-sun-soft/40")}>
          <div className="mb-2 flex items-center gap-2 text-sun-deep">
            <PiktoSonne size={18} />
            <span className="text-xs font-semibold uppercase tracking-wide">Nächster Morgen</span>
          </div>
          <PainScale name="next_morning" label="Wie war es am Morgen danach?" defaultValue={pain.next_morning} />
          <p className="mt-2 text-xs text-muted">
            {isToday ? "Tragen Sie das morgen ein. Die Startseite erinnert Sie daran." : "Ist der Schmerz wieder auf das Ausgangsniveau zurückgegangen?"}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2.5">
          <IconTile tone="bark" size="sm">
            <PiktoStift size={18} />
          </IconTile>
          <h2 className="text-lg font-semibold text-ink">Bemerkung</h2>
        </div>
        <Field label="Was ist Ihnen aufgefallen?" htmlFor="remark" hint="Schwellung, Instabilität, was gut ging – alles, was Ihre Praxis wissen sollte.">
          <Textarea id="remark" name="remark" defaultValue={existing?.remark ?? ""} maxLength={2000} />
        </Field>
      </div>

      {state.error && <Alert tone="danger">{state.error}</Alert>}
      <Button type="submit" size="lg" className="w-full bg-berry hover:bg-berry-deep" disabled={pending}>
        {pending ? "Wird gespeichert …" : "Speichern"}
      </Button>
    </form>
  );
}
