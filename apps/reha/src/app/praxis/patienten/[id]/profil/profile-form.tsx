"use client";

import { useActionState } from "react";
import { saveProfileAction, type ProfileState } from "./actions";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { Alert } from "@/components/ui/card";

type Initial = { goal: string; movementProfile: string; notes: string; krsStage: number | null; opContext: boolean; calorieTarget: number | null; proteinTargetG: number | null };

export function ProfileForm({ id, initial }: { id: string; initial: Initial }) {
  const [state, action, pending] = useActionState(saveProfileAction, {} as ProfileState);
  return (
    <form action={action} className="mt-4 space-y-4">
      <input type="hidden" name="id" value={id} />
      <Field label="Zieldefinition" htmlFor="goal" hint="Was soll mit dieser Rehabilitation erreicht werden?">
        <Textarea id="goal" name="goal" defaultValue={initial.goal} maxLength={2000} className="min-h-20" />
      </Field>
      <Field label="Bewegungsprofil" htmlFor="movementProfile" hint="Sportart, Trainingslevel, Vorerkrankungen/Verletzungen">
        <Textarea id="movementProfile" name="movementProfile" defaultValue={initial.movementProfile} maxLength={2000} className="min-h-20" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="KRS-Stufe" htmlFor="krsStage" hint="Wird nur angezeigt, nie automatisch geprüft (ADR 0004).">
          <Select id="krsStage" name="krsStage" defaultValue={initial.krsStage ?? ""}>
            <option value="">keine</option>
            {Array.from({ length: 9 }, (_, i) => i + 1).map((n) => <option key={n} value={n}>KRS {n}</option>)}
          </Select>
        </Field>
        <div className="flex items-end pb-2">
          <label className="flex items-center gap-2 text-sm text-ink"><input type="checkbox" name="opContext" value="yes" defaultChecked={initial.opContext} className="h-4 w-4 accent-[var(--color-clay)]" /> OP-Kontext</label>
        </div>
        <Field label="Kalorienziel (kcal/Tag)" htmlFor="calorieTarget"><Input id="calorieTarget" name="calorieTarget" type="number" inputMode="numeric" min={0} max={9999} defaultValue={initial.calorieTarget ?? ""} /></Field>
        <Field label="Proteinziel (g/Tag)" htmlFor="proteinTargetG"><Input id="proteinTargetG" name="proteinTargetG" type="number" inputMode="numeric" min={0} max={999} defaultValue={initial.proteinTargetG ?? ""} /></Field>
      </div>
      <Field label="Anmerkungen" htmlFor="notes"><Textarea id="notes" name="notes" defaultValue={initial.notes} maxLength={4000} className="min-h-16" /></Field>
      {state.error && <Alert tone="danger">{state.error}</Alert>}
      {state.saved && <Alert tone="success">Gespeichert als Fassung {state.saved}.</Alert>}
      <Button type="submit" disabled={pending}>{pending ? "Wird gespeichert …" : "Als neue Fassung speichern"}</Button>
    </form>
  );
}
