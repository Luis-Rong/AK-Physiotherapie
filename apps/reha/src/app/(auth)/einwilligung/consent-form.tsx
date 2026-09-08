"use client";

import { useActionState } from "react";
import { acceptConsentAction, type ConsentState } from "./actions";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/card";

export function ConsentForm() {
  const [state, action, pending] = useActionState(acceptConsentAction, {} as ConsentState);
  return (
    <form action={action} className="mt-6 space-y-4">
      <label className="flex items-start gap-3 rounded-[var(--radius-md)] border border-line bg-sand p-3.5 text-sm text-ink">
        <input type="checkbox" name="accept" value="yes" required className="mt-0.5 h-5 w-5 accent-[var(--color-clay)]" />
        <span>
          Ich willige ein, dass meine Gesundheitsdaten wie beschrieben im Portal verarbeitet werden. Mir ist bekannt,
          dass die Nutzung freiwillig ist und ich die Einwilligung jederzeit widerrufen kann.
        </span>
      </label>
      {state.error && <Alert tone="danger">{state.error}</Alert>}
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Wird gespeichert …" : "Zustimmen und weiter"}
      </Button>
    </form>
  );
}
