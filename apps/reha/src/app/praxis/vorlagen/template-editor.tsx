"use client";

import { useActionState, useState } from "react";
import { saveTemplateAction, type TemplateState } from "./actions";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { Alert } from "@/components/ui/card";
import { SECTION_LABEL, SECTIONS, type Section } from "@/lib/labels";
import { WEEKDAY_SHORT } from "@/lib/dates";
import { PiktoPlus } from "@/components/pikto";
import { cn } from "@/lib/cn";

type Row = { key: string; section: Section; exerciseId: string | null; name: string; sets: string; reps: string; weight: string; duration: string; remarks: string };
type Week = { key: string; goal: string; notes: string; trainingDays: number[]; exercises: Row[] };
type Lib = { id: string; name: string; category: string };
export type TemplateInitial = {
  id?: string;
  name: string;
  description: string;
  weeks: { goal: string; notes: string; trainingDays: number[]; exercises: Omit<Row, "key">[] }[];
};

let counter = 0;
const k = () => `k${counter++}`;

export function TemplateEditor({ initial, library }: { initial: TemplateInitial; library: Lib[] }) {
  const [state, action, pending] = useActionState(saveTemplateAction, {} as TemplateState);
  const [weeks, setWeeks] = useState<Week[]>(() =>
    initial.weeks.length
      ? initial.weeks.map((w) => ({ key: k(), goal: w.goal, notes: w.notes, trainingDays: w.trainingDays, exercises: w.exercises.map((e) => ({ ...e, key: k() })) }))
      : [{ key: k(), goal: "", notes: "", trainingDays: [1, 3, 5], exercises: [] }],
  );

  const patchWeek = (wk: string, patch: Partial<Week>) => setWeeks((ws) => ws.map((w) => (w.key === wk ? { ...w, ...patch } : w)));
  const patchRow = (wk: string, rk: string, patch: Partial<Row>) =>
    setWeeks((ws) => ws.map((w) => (w.key === wk ? { ...w, exercises: w.exercises.map((r) => (r.key === rk ? { ...r, ...patch } : r)) } : w)));
  const addRow = (wk: string, section: Section) =>
    setWeeks((ws) => ws.map((w) => (w.key === wk ? { ...w, exercises: [...w.exercises, { key: k(), section, exerciseId: null, name: "", sets: "", reps: "", weight: "", duration: "", remarks: "" }] } : w)));
  const removeRow = (wk: string, rk: string) => setWeeks((ws) => ws.map((w) => (w.key === wk ? { ...w, exercises: w.exercises.filter((r) => r.key !== rk) } : w)));
  const addWeek = () =>
    setWeeks((ws) => {
      const last = ws.at(-1);
      return [...ws, { key: k(), goal: "", notes: "", trainingDays: last?.trainingDays ?? [1, 3, 5], exercises: (last?.exercises ?? []).map((e) => ({ ...e, key: k() })) }];
    });
  const removeWeek = (wk: string) => setWeeks((ws) => (ws.length > 1 ? ws.filter((w) => w.key !== wk) : ws));
  const pick = (wk: string, rk: string, name: string) => {
    const hit = library.find((l) => l.name.toLowerCase() === name.trim().toLowerCase());
    patchRow(wk, rk, { name, exerciseId: hit?.id ?? null });
  };
  const libFor = (section: Section) =>
    library.filter((l) => (section === "warmup" ? l.category === "aufwaermen" : section === "cooldown" ? l.category === "abwaermen" : l.category === "training") || l.category === "allgemein");

  const payload = JSON.stringify(
    weeks.map((w, i) => ({ weekNumber: i + 1, goal: w.goal, notes: w.notes, trainingDays: w.trainingDays, exercises: w.exercises.map(({ key: _k, ...r }) => r) })),
  );

  return (
    <form action={action} className="space-y-6">
      {initial.id && <input type="hidden" name="id" value={initial.id} />}
      <input type="hidden" name="weeks" value={payload} />
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Name der Vorlage" htmlFor="name">
          <Input id="name" name="name" required maxLength={120} defaultValue={initial.name} placeholder="z. B. Knie-TEP, Wochen 1–4" />
        </Field>
        <Field label="Beschreibung" htmlFor="description" className="md:col-span-2" hint="Für wen, welche Phase – nur intern sichtbar.">
          <Input id="description" name="description" maxLength={1000} defaultValue={initial.description} />
        </Field>
      </div>

      {weeks.map((w, wi) => (
        <section key={w.key} className="space-y-4 rounded-[var(--radius-lg)] border border-line bg-surface p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-base font-semibold text-ink">Woche {wi + 1}</h3>
            <Button type="button" variant="ghost" size="sm" disabled={weeks.length === 1} onClick={() => removeWeek(w.key)}>
              Woche entfernen
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Trainingsziel der Woche" htmlFor={`goal-${w.key}`}>
              <Input id={`goal-${w.key}`} value={w.goal} maxLength={200} onChange={(e) => patchWeek(w.key, { goal: e.target.value })} />
            </Field>
            <fieldset>
              <legend className="mb-2 text-sm font-medium text-ink-soft">Trainingstage</legend>
              <div className="flex gap-1.5">
                {WEEKDAY_SHORT.map((d, i) => {
                  const n = i + 1;
                  const on = w.trainingDays.includes(n);
                  return (
                    <button
                      key={d}
                      type="button"
                      aria-pressed={on}
                      onClick={() => patchWeek(w.key, { trainingDays: on ? w.trainingDays.filter((x) => x !== n) : [...w.trainingDays, n].sort() })}
                      className={cn("h-10 w-10 rounded-full text-sm font-semibold", on ? "bg-clay text-[#FFF7F0]" : "bg-sand text-muted hover:bg-sand-deep")}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          </div>

          {SECTIONS.map((section) => {
            const list = w.exercises.filter((r) => r.section === section);
            const isMain = section === "main";
            return (
              <div key={section} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-ink">{SECTION_LABEL[section]}</h4>
                  <Button type="button" variant="ghost" size="sm" onClick={() => addRow(w.key, section)}>
                    <PiktoPlus size={14} /> Übung
                  </Button>
                </div>
                <datalist id={`lib-${w.key}-${section}`}>
                  {libFor(section).map((l) => (
                    <option key={l.id} value={l.name} />
                  ))}
                </datalist>
                {list.length === 0 && <p className="text-xs text-muted">Keine Übungen in diesem Abschnitt.</p>}
                <ul className="space-y-2">
                  {list.map((r) => (
                    <li key={r.key} className="rounded-[var(--radius-md)] border border-line bg-sand/40 p-3">
                      <div className="grid gap-2 md:grid-cols-12">
                        <Input aria-label="Übung" list={`lib-${w.key}-${section}`} value={r.name} onChange={(e) => pick(w.key, r.key, e.target.value)} placeholder="Übung wählen oder eintippen" required className="h-10 md:col-span-4" />
                        {isMain ? (
                          <>
                            <Input aria-label="Gewicht" value={r.weight} onChange={(e) => patchRow(w.key, r.key, { weight: e.target.value })} placeholder="Gewicht" className="h-10 md:col-span-2" />
                            <Input aria-label="Wiederholungen" value={r.reps} onChange={(e) => patchRow(w.key, r.key, { reps: e.target.value })} placeholder="Wdh." className="h-10 md:col-span-2" />
                          </>
                        ) : (
                          <Input aria-label="Dauer" value={r.duration} onChange={(e) => patchRow(w.key, r.key, { duration: e.target.value })} placeholder="Dauer" className="h-10 md:col-span-4" />
                        )}
                        <Input aria-label="Sätze" value={r.sets} onChange={(e) => patchRow(w.key, r.key, { sets: e.target.value })} placeholder="Sätze" className="h-10 md:col-span-1" />
                        <Input aria-label="Anmerkungen" value={r.remarks} onChange={(e) => patchRow(w.key, r.key, { remarks: e.target.value })} placeholder="Anmerkungen" className="h-10 md:col-span-2" />
                        <Button type="button" variant="ghost" size="sm" className="md:col-span-1" onClick={() => removeRow(w.key, r.key)}>
                          Entfernen
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}

          <Field label="Notizen zum Wochenverlauf" htmlFor={`notes-${w.key}`} hint="Wird beim Anwenden in die Woche übernommen und ist dann für den Patienten sichtbar.">
            <Textarea id={`notes-${w.key}`} value={w.notes} maxLength={4000} onChange={(e) => patchWeek(w.key, { notes: e.target.value })} />
          </Field>
        </section>
      ))}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" variant="secondary" onClick={addWeek}>
          <PiktoPlus size={16} /> Woche anhängen (kopiert die letzte)
        </Button>
      </div>

      {state.error && <Alert tone="danger">{state.error}</Alert>}
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Wird gespeichert …" : "Vorlage speichern"}
      </Button>
    </form>
  );
}
