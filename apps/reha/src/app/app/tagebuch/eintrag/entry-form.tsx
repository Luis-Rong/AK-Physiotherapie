"use client";

import { useActionState, useState } from "react";
import { Check } from "lucide-react";
import { saveEntryAction, type EntryState } from "./actions";
import { Button } from "@/components/ui/button";
import { Field, Textarea } from "@/components/ui/field";
import { Alert } from "@/components/ui/card";
import { PainScale } from "@/components/pain/pain-scale";
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

  function toggle(id: string) {
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="date" value={date} />
      <input type="hidden" name="weekVersionId" value={week?.id ?? ""} />
      {[...done].map((id) => <input key={id} type="hidden" name="done" value={id} />)}

      {week ? (
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-ink">Übungen</h2>
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
                        className={cn("flex w-full items-center gap-3 rounded-[var(--radius-md)] border px-3.5 py-2.5 text-left transition-colors", on ? "border-moss/40 bg-moss-soft" : "border-line bg-surface hover:bg-sand")}
                      >
                        <span className={cn("grid h-6 w-6 shrink-0 place-items-center rounded-full border", on ? "border-moss bg-moss text-white" : "border-line-strong")}>{on && <Check size={14} strokeWidth={3} />}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-medium text-ink">{e.name}</span>
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
        <h2 className="text-base font-semibold text-ink">Schmerz (NPRS 0–10)</h2>
        <PainScale name="during" label="Während der Übungen" defaultValue={pain.during} />
        <PainScale name="after" label="Danach" defaultValue={pain.after} />
        <div id="morgen" className={cn("rounded-[var(--radius-md)] border border-line p-3.5", isToday && "opacity-70")}>
          <PainScale name="next_morning" label="Am nächsten Morgen" defaultValue={pain.next_morning} />
          <p className="mt-2 text-xs text-muted">
            {isToday ? "Tragen Sie das morgen ein. Die Startseite erinnert Sie daran." : "Ist der Schmerz wieder auf das Ausgangsniveau zurückgegangen?"}
          </p>
        </div>
      </div>

      <Field label="Bemerkung" htmlFor="remark" hint="Was aufgefallen ist: Schwellung, Instabilität, was gut ging.">
        <Textarea id="remark" name="remark" defaultValue={existing?.remark ?? ""} maxLength={2000} />
      </Field>

      {state.error && <Alert tone="danger">{state.error}</Alert>}
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Wird gespeichert …" : "Speichern"}
      </Button>
    </form>
  );
}
