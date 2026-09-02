"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createPatientAction, type CreatePatientState } from "./actions";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { Alert } from "@/components/ui/card";
import { TempPasswordReveal } from "@/components/praxis/temp-password";

export function NewPatientForm() {
  const [state, action, pending] = useActionState(createPatientAction, {} as CreatePatientState);

  if (state.created) {
    return (
      <div className="space-y-4">
        <Alert tone="success">Konto für {state.created.name} angelegt.</Alert>
        <TempPasswordReveal email={state.created.email} password={state.created.tempPassword} expires={state.created.expires} />
        <div className="flex gap-2">
          <Link href={`/praxis/patienten/${state.created.id}`} className="rounded-[var(--radius-md)] bg-bark px-4 py-2.5 text-sm font-semibold text-[#F7F1E8] hover:bg-bark-deep">Zum Patienten</Link>
          <Link href="/praxis/patienten/neu" className="rounded-[var(--radius-md)] bg-sand px-4 py-2.5 text-sm font-semibold text-ink hover:bg-sand-deep">Weiteres Konto</Link>
        </div>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <Field label="Vor- und Nachname" htmlFor="name" error={state.fieldErrors?.name}>
        <Input id="name" name="name" autoComplete="off" required maxLength={120} />
      </Field>
      <Field label="E-Mail-Adresse (Zugangskennung)" htmlFor="email" hint="Es wird keine E-Mail verschickt. Die Adresse dient nur zur Anmeldung." error={state.fieldErrors?.email}>
        <Input id="email" name="email" type="email" autoComplete="off" required />
      </Field>
      <fieldset className="space-y-3 rounded-[var(--radius-md)] border border-line p-4">
        <legend className="px-1 text-sm font-semibold text-ink-soft">Angaben zur Person (optional, später änderbar)</legend>
        <Field label="Zieldefinition" htmlFor="goal"><Textarea id="goal" name="goal" maxLength={2000} className="min-h-16" /></Field>
        <Field label="Bewegungsprofil (Sportart, Trainingslevel, Vorerkrankungen/Verletzungen)" htmlFor="movementProfile"><Textarea id="movementProfile" name="movementProfile" maxLength={2000} className="min-h-16" /></Field>
        <label className="flex items-center gap-2 text-sm text-ink"><input type="checkbox" name="opContext" value="yes" className="h-4 w-4 accent-[var(--color-clay)]" /> Rehabilitation nach Operation (blendet den OP-Ernährungsleitfaden ein)</label>
      </fieldset>
      {state.error && <Alert tone="danger">{state.error}</Alert>}
      <Button type="submit" size="lg" disabled={pending}>{pending ? "Wird angelegt …" : "Konto anlegen"}</Button>
    </form>
  );
}
