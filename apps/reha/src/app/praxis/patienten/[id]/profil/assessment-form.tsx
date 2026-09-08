"use client";

import { useActionState } from "react";
import { addAssessmentAction, type AssessmentState } from "./actions";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { Alert } from "@/components/ui/card";

export function AssessmentForm({ id }: { id: string }) {
  const [state, action, pending] = useActionState(addAssessmentAction, {} as AssessmentState);
  return (
    <form action={action} className="mt-4 space-y-3" key={state.savedAt}>
      <input type="hidden" name="id" value={id} />
      <Field label="Assessment" htmlFor="name"><Input id="name" name="name" required maxLength={120} placeholder="z. B. Kniebeugung (Goniometer)" /></Field>
      <div className="grid grid-cols-3 gap-3">
        <Field label="Datum" htmlFor="assessedOn"><Input id="assessedOn" name="assessedOn" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} /></Field>
        <Field label="Seite" htmlFor="side">
          <Select id="side" name="side" defaultValue="">
            <option value="">–</option><option value="links">links</option><option value="rechts">rechts</option><option value="beide">beide</option>
          </Select>
        </Field>
        <Field label="Wert / Score" htmlFor="score"><Input id="score" name="score" required maxLength={40} placeholder="95°" /></Field>
      </div>
      <Field label="Bemerkung" htmlFor="remark"><Input id="remark" name="remark" maxLength={500} /></Field>
      {state.error && <Alert tone="danger">{state.error}</Alert>}
      <Button type="submit" variant="secondary" disabled={pending}>{pending ? "Wird gespeichert …" : "Messung speichern"}</Button>
    </form>
  );
}
