"use client";

import { useActionState } from "react";
import { changePasswordAction, type ChangePasswordState } from "./actions";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { Alert } from "@/components/ui/card";

const initial: ChangePasswordState = {};

export function PasswordForm({ forced }: { forced: boolean }) {
  const [state, action, pending] = useActionState(changePasswordAction, initial);
  return (
    <form action={action} className="mt-6 space-y-4">
      <Field label={forced ? "Temporäres Passwort" : "Aktuelles Passwort"} htmlFor="current">
        <Input id="current" name="current" type="password" autoComplete="current-password" required />
      </Field>
      <Field
        label="Neues Passwort"
        htmlFor="next"
        hint="Mindestens 10 Zeichen. Ein Satz, den Sie sich merken können, ist besser als ein kurzes Kunstwort."
        error={state.fieldErrors?.next}
      >
        <Input id="next" name="next" type="password" autoComplete="new-password" minLength={10} required />
      </Field>
      <Field label="Neues Passwort wiederholen" htmlFor="confirm" error={state.fieldErrors?.confirm}>
        <Input id="confirm" name="confirm" type="password" autoComplete="new-password" minLength={10} required />
      </Field>
      {state.error && <Alert tone="danger">{state.error}</Alert>}
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Wird gespeichert …" : "Passwort speichern"}
      </Button>
    </form>
  );
}
