"use client";

import { useActionState, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { saveSupplementPlanAction, type SupplementState } from "./actions";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { Alert } from "@/components/ui/card";
import { SLOT_LABEL, SLOTS } from "@/lib/labels";
import { cn } from "@/lib/cn";

export type ItemRow = { name: string; dosage: string; amount: string; slots: string[]; validFrom: string; validTo: string };
let counter = 0;
const withKey = (r: ItemRow) => ({ ...r, key: `s${counter++}` });

export function SupplementEditor({ patientId, initial }: { patientId: string; initial: { notes: string; items: ItemRow[] } }) {
  const [state, action, pending] = useActionState(saveSupplementPlanAction, {} as SupplementState);
  const [rows, setRows] = useState(() => initial.items.map(withKey));
  const update = (key: string, patch: Partial<ItemRow>) => setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));

  return (
    <form action={action} className="mt-4 space-y-4">
      <input type="hidden" name="patientId" value={patientId} />
      <input type="hidden" name="items" value={JSON.stringify(rows.map(({ key: _k, ...r }) => r))} />
      <ul className="space-y-2">
        {rows.map((r) => (
          <li key={r.key} className="rounded-[var(--radius-md)] border border-line bg-sand/40 p-3">
            <div className="grid gap-2 md:grid-cols-12">
              <Input aria-label="Supplement" value={r.name} onChange={(e) => update(r.key, { name: e.target.value })} placeholder="Supplement" required className="h-10 md:col-span-4" />
              <Input aria-label="Dosierung" value={r.dosage} onChange={(e) => update(r.key, { dosage: e.target.value })} placeholder="Dosierung, z. B. 2000 IE" className="h-10 md:col-span-3" />
              <Input aria-label="Menge" value={r.amount} onChange={(e) => update(r.key, { amount: e.target.value })} placeholder="Menge, z. B. 1 Kapsel" className="h-10 md:col-span-3" />
              <div className="flex items-center justify-end md:col-span-2">
                <Button type="button" variant="ghost" size="icon" aria-label="entfernen" onClick={() => setRows((rs) => rs.filter((x) => x.key !== r.key))}><Trash2 size={14} /></Button>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 md:col-span-6">
                {SLOTS.map((s) => {
                  const on = r.slots.includes(s);
                  return (
                    <button key={s} type="button" aria-pressed={on} onClick={() => update(r.key, { slots: on ? r.slots.filter((x) => x !== s) : [...r.slots, s] })} className={cn("h-9 rounded-full px-3.5 text-sm font-medium", on ? "bg-bark text-[#F7F1E8]" : "bg-sand text-muted hover:bg-sand-deep")}>
                      {SLOT_LABEL[s]}
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted md:col-span-6">
                <span>von</span><Input aria-label="gültig von" type="date" value={r.validFrom} onChange={(e) => update(r.key, { validFrom: e.target.value })} className="h-9 text-sm" />
                <span>bis</span><Input aria-label="gültig bis" type="date" value={r.validTo} onChange={(e) => update(r.key, { validTo: e.target.value })} className="h-9 text-sm" />
              </div>
            </div>
          </li>
        ))}
      </ul>
      <Button type="button" variant="secondary" size="sm" onClick={() => setRows((rs) => [...rs, withKey({ name: "", dosage: "", amount: "", slots: ["morning"], validFrom: "", validTo: "" })])}><Plus size={14} /> Supplement</Button>
      <Field label="Hinweis für die Patientin / den Patienten" htmlFor="notes"><Textarea id="notes" name="notes" defaultValue={initial.notes} maxLength={2000} className="min-h-16" /></Field>
      {state.error && <Alert tone="danger">{state.error}</Alert>}
      {state.saved && <Alert tone="success">Gespeichert als Fassung {state.saved}.</Alert>}
      <Button type="submit" disabled={pending}>{pending ? "Wird gespeichert …" : "Als neue Fassung speichern"}</Button>
    </form>
  );
}
