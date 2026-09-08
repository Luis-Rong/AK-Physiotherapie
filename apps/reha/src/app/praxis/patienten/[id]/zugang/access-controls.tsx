"use client";

import { useActionState } from "react";
import { banAction, resetPasswordAction, unbanAction, type AccessState } from "./actions";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { Alert } from "@/components/ui/card";
import { TempPasswordReveal } from "@/components/praxis/temp-password";

export function AccessControls(props: { id: string; banned: boolean; banReason: string | null; mustChangePassword: boolean; tempExpires: string | null; email: string }) {
  const [resetState, resetAction, resetPending] = useActionState(resetPasswordAction, {} as AccessState);
  const [banState, banFormAction, banPending] = useActionState(banAction, {} as AccessState);
  const [unbanState, unbanFormAction, unbanPending] = useActionState(unbanAction, {} as AccessState);

  return (
    <div className="mt-4 space-y-5">
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-ink">Temporäres Passwort</h3>
        {props.mustChangePassword && !resetState.tempPassword && (
          <p className="text-sm text-muted">Das aktuelle temporäre Passwort wurde noch nicht geändert{props.tempExpires ? ` (gültig bis ${props.tempExpires})` : ""}.</p>
        )}
        {resetState.tempPassword ? (
          <TempPasswordReveal email={props.email} password={resetState.tempPassword} expires={resetState.expires ?? ""} />
        ) : (
          <form action={resetAction}>
            <input type="hidden" name="id" value={props.id} />
            <Button type="submit" variant="secondary" disabled={resetPending}>{resetPending ? "Wird erzeugt …" : "Neues temporäres Passwort vergeben"}</Button>
          </form>
        )}
        {resetState.error && <Alert tone="danger">{resetState.error}</Alert>}
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-ink">Sperre</h3>
        {props.banned ? (
          <form action={unbanFormAction} className="space-y-2">
            <input type="hidden" name="id" value={props.id} />
            <Alert tone="danger">Gesperrt{props.banReason ? `: ${props.banReason}` : ""}.</Alert>
            <Button type="submit" variant="secondary" disabled={unbanPending}>Sperre aufheben</Button>
            {unbanState.error && <Alert tone="danger">{unbanState.error}</Alert>}
          </form>
        ) : (
          <form action={banFormAction} className="space-y-2">
            <input type="hidden" name="id" value={props.id} />
            <Field label="Grund (intern, optional)" htmlFor="reason"><Input id="reason" name="reason" maxLength={200} placeholder="z. B. Behandlung beendet" /></Field>
            <Button type="submit" variant="danger" disabled={banPending}>Zugang sperren</Button>
            {banState.error && <Alert tone="danger">{banState.error}</Alert>}
          </form>
        )}
      </section>
    </div>
  );
}
