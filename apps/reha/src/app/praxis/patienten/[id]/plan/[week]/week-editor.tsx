"use client";

import { useActionState, useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { saveWeekAction, type WeekState } from "./actions";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { Alert } from "@/components/ui/card";
import { SECTION_LABEL, SECTIONS, type Section } from "@/lib/labels";
import { WEEKDAY_SHORT } from "@/lib/dates";
import { cn } from "@/lib/cn";

export type EditorRow = { section: string; exerciseId: string | null; name: string; sets: string; reps: string; weight: string; duration: string; remarks: string };
export type EditorInitial = { weekNumber: number; startsOn: string; goal: string; notes: string; trainingDays: number[]; exercises: EditorRow[] };
type Lib = { id: string; name: string; category: string };

let keyCounter = 0;
const withKey = (r: EditorRow) => ({ ...r, key: `r${keyCounter++}` });

export function WeekEditor({ patientId, initial, library }: { patientId: string; initial: EditorInitial; library: Lib[] }) {
  const [state, action, pending] = useActionState(saveWeekAction, {} as WeekState);
  const [rows, setRows] = useState(() => initial.exercises.map(withKey));
  const [days, setDays] = useState<number[]>(initial.trainingDays);

  function update(key: string, patch: Partial<EditorRow>) {
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }
  function add(section: Section) {
    setRows((rs) => [...rs, withKey({ section, exerciseId: null, name: "", sets: "", reps: "", weight: "", duration: "", remarks: "" })]);
  }
  function remove(key: string) {
    setRows((rs) => rs.filter((r) => r.key !== key));
  }
  function move(key: string, dir: -1 | 1) {
    setRows((rs) => {
      const idx = rs.findIndex((r) => r.key === key);
      const row = rs[idx]!;
      const same = rs.filter((r) => r.section === row.section);
      const pos = same.findIndex((r) => r.key === key);
      const target = same[pos + dir];
      if (!target) return rs;
      const out = [...rs];
      const ti = out.findIndex((r) => r.key === target.key);
      out[idx] = target;
      out[ti] = row;
      return out;
    });
  }
  function pickFromLibrary(key: string, name: string) {
    const hit = library.find((l) => l.name.toLowerCase() === name.trim().toLowerCase());
    update(key, { name, exerciseId: hit?.id ?? null });
  }

  const payload = JSON.stringify(rows.map(({ key: _k, ...r }) => r));
  const libFor = (section: Section) => library.filter((l) => (section === "warmup" ? l.category === "aufwaermen" : section === "cooldown" ? l.category === "abwaermen" : l.category === "training") || l.category === "allgemein");

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="patientId" value={patientId} />
      <input type="hidden" name="weekNumber" value={initial.weekNumber} />
      <input type="hidden" name="exercises" value={payload} />
      <input type="hidden" name="trainingDays" value={days.join(",")} />

      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Woche beginnt am (Montag)" htmlFor="startsOn"><Input id="startsOn" name="startsOn" type="date" required defaultValue={initial.startsOn} /></Field>
        <Field label="Trainingsziel der Woche" htmlFor="goal" className="md:col-span-2"><Input id="goal" name="goal" defaultValue={initial.goal} maxLength={200} placeholder="z. B. Kraftausdauer aufbauen (KRS 2)" /></Field>
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-ink-soft">Trainingstage</legend>
        <div className="flex gap-1.5">
          {WEEKDAY_SHORT.map((d, i) => {
            const n = i + 1;
            const on = days.includes(n);
            return (
              <button key={d} type="button" aria-pressed={on} onClick={() => setDays((ds) => (on ? ds.filter((x) => x !== n) : [...ds, n].sort()))} className={cn("h-10 w-10 rounded-full text-sm font-semibold", on ? "bg-bark text-[#F7F1E8]" : "bg-sand text-muted hover:bg-sand-deep")}>
                {d}
              </button>
            );
          })}
        </div>
      </fieldset>

      {SECTIONS.map((section) => {
        const list = rows.filter((r) => r.section === section);
        const isMain = section === "main";
        return (
          <section key={section} className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-ink">{SECTION_LABEL[section]}</h3>
              <Button type="button" variant="ghost" size="sm" onClick={() => add(section)}><Plus size={14} /> Übung</Button>
            </div>
            <datalist id={`lib-${section}`}>{libFor(section).map((l) => <option key={l.id} value={l.name} />)}</datalist>
            {list.length === 0 && <p className="text-xs text-muted">Keine Übungen in diesem Abschnitt.</p>}
            <ul className="space-y-2">
              {list.map((r, i) => (
                <li key={r.key} className="rounded-[var(--radius-md)] border border-line bg-sand/40 p-3">
                  <div className="grid gap-2 md:grid-cols-12">
                    <div className="md:col-span-4">
                      <Input aria-label="Übung" list={`lib-${section}`} value={r.name} onChange={(e) => pickFromLibrary(r.key, e.target.value)} placeholder="Übung wählen oder eintippen" required className="h-10" />
                      <p className="mt-0.5 text-[11px] text-muted">{r.exerciseId ? "aus der Bibliothek" : r.name ? "eigene Eingabe" : ""}</p>
                    </div>
                    {isMain ? (
                      <>
                        <Input aria-label="Gewicht" value={r.weight} onChange={(e) => update(r.key, { weight: e.target.value })} placeholder="Gewicht" className="h-10 md:col-span-2" />
                        <Input aria-label="Wiederholungen" value={r.reps} onChange={(e) => update(r.key, { reps: e.target.value })} placeholder="Wdh." className="h-10 md:col-span-2" />
                      </>
                    ) : (
                      <Input aria-label="Dauer" value={r.duration} onChange={(e) => update(r.key, { duration: e.target.value })} placeholder="Dauer" className="h-10 md:col-span-4" />
                    )}
                    <Input aria-label="Sätze" value={r.sets} onChange={(e) => update(r.key, { sets: e.target.value })} placeholder="Sätze" className="h-10 md:col-span-1" />
                    <Input aria-label="Anmerkungen" value={r.remarks} onChange={(e) => update(r.key, { remarks: e.target.value })} placeholder="Anmerkungen" className="h-10 md:col-span-2" />
                    <div className="flex gap-1 md:col-span-1">
                      <Button type="button" variant="ghost" size="icon" aria-label="nach oben" disabled={i === 0} onClick={() => move(r.key, -1)}><ArrowUp size={14} /></Button>
                      <Button type="button" variant="ghost" size="icon" aria-label="nach unten" disabled={i === list.length - 1} onClick={() => move(r.key, 1)}><ArrowDown size={14} /></Button>
                      <Button type="button" variant="ghost" size="icon" aria-label="entfernen" onClick={() => remove(r.key)}><Trash2 size={14} /></Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      <Field label="Notizen zum Wochenverlauf" htmlFor="notes" hint="Sichtbar für die Patientin / den Patienten."><Textarea id="notes" name="notes" defaultValue={initial.notes} maxLength={4000} /></Field>

      {state.error && <Alert tone="danger">{state.error}</Alert>}
      <Button type="submit" size="lg" disabled={pending}>{pending ? "Wird gespeichert …" : "Woche speichern"}</Button>
    </form>
  );
}
