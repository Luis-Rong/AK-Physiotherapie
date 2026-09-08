"use client";

import { useActionState } from "react";
import { applyTemplateAction, saveWeeksAsTemplateAction, type TemplateState } from "@/app/praxis/vorlagen/actions";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { Alert } from "@/components/ui/card";

type Tpl = { id: string; name: string; weeks: number };

/** Vorlage anwenden: hängt die Vorlagenwochen hinter die vorhandenen Wochen. */
export function ApplyTemplateForm({ patientId, templates, defaultStart }: { patientId: string; templates: Tpl[]; defaultStart: string }) {
  const [state, action, pending] = useActionState(applyTemplateAction, {} as TemplateState);
  if (templates.length === 0) return <p className="text-sm text-muted">Noch keine aktive Vorlage vorhanden.</p>;
  return (
    <form action={action} className="grid gap-3 md:grid-cols-[1fr_auto_auto] md:items-end">
      <input type="hidden" name="patientId" value={patientId} />
      <Field label="Vorlage" htmlFor="templateId">
        <select id="templateId" name="templateId" required className="h-11 w-full rounded-[var(--radius-md)] border border-line-strong bg-surface px-3 text-[15px] text-ink">
          {templates.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name} · {t.weeks} {t.weeks === 1 ? "Woche" : "Wochen"}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Erste Woche ab (Montag)" htmlFor="startsOn">
        <Input id="startsOn" name="startsOn" type="date" required defaultValue={defaultStart} />
      </Field>
      <Button type="submit" variant="accent" disabled={pending}>
        {pending ? "Wird angelegt …" : "Vorlage anwenden"}
      </Button>
      {state.error && <Alert tone="danger" className="md:col-span-3">{state.error}</Alert>}
    </form>
  );
}

/** Bestehenden Plan als Vorlage sichern. */
export function SaveAsTemplateForm({ patientId }: { patientId: string }) {
  const [state, action, pending] = useActionState(saveWeeksAsTemplateAction, {} as TemplateState);
  return (
    <form action={action} className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
      <input type="hidden" name="patientId" value={patientId} />
      <Field label="Als Vorlage sichern unter" htmlFor="tplName" hint="Alle Wochen dieses Plans, ohne Patientenbezug.">
        <Input id="tplName" name="name" required maxLength={120} placeholder="z. B. Knie-TEP, Wochen 1–4" />
      </Field>
      <Button type="submit" variant="secondary" disabled={pending}>
        {pending ? "Wird gesichert …" : "Vorlage sichern"}
      </Button>
      {state.error && <Alert tone="danger" className="md:col-span-2">{state.error}</Alert>}
    </form>
  );
}
