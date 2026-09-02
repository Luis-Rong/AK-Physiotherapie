"use client";

import { useActionState } from "react";
import { saveExerciseAction, type ExerciseState } from "./actions";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { Alert } from "@/components/ui/card";
import { CATEGORIES, CATEGORY_LABEL, type ExerciseCategory } from "@/lib/labels";

type Ex = { id: string; name: string; category: ExerciseCategory; description: string; active: boolean };

export function ExerciseForm({ exercise }: { exercise?: Ex }) {
  const [state, action, pending] = useActionState(saveExerciseAction, {} as ExerciseState);
  const uid = exercise?.id ?? "neu";
  return (
    <form action={action} className="space-y-3" key={exercise ? undefined : state.savedAt}>
      {exercise && <input type="hidden" name="id" value={exercise.id} />}
      <Field label="Name" htmlFor={`name-${uid}`}><Input id={`name-${uid}`} name="name" required maxLength={120} defaultValue={exercise?.name ?? ""} /></Field>
      <Field label="Kategorie" htmlFor={`cat-${uid}`}>
        <Select id={`cat-${uid}`} name="category" defaultValue={exercise?.category ?? "training"}>
          {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>)}
        </Select>
      </Field>
      <Field label="Beschreibung / Ausführung" htmlFor={`desc-${uid}`} hint="Sichtbar für Patientinnen und Patienten."><Textarea id={`desc-${uid}`} name="description" maxLength={2000} defaultValue={exercise?.description ?? ""} className="min-h-20" /></Field>
      {exercise && (
        <label className="flex items-center gap-2 text-sm text-ink"><input type="checkbox" name="active" value="yes" defaultChecked={exercise.active} className="h-4 w-4 accent-[var(--color-clay)]" /> aktiv (in Plänen auswählbar)</label>
      )}
      {state.error && <Alert tone="danger">{state.error}</Alert>}
      {state.savedAt && <Alert tone="success">Gespeichert.</Alert>}
      <Button type="submit" variant={exercise ? "secondary" : "primary"} size="sm" disabled={pending}>{pending ? "…" : exercise ? "Änderung speichern" : "Übung anlegen"}</Button>
    </form>
  );
}
