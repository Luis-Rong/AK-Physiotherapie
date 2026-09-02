"use client";

import { useState } from "react";
import { Field, Input, Select } from "@/components/ui/field";
import { mifflinStJeor } from "@/lib/nutrition/mifflin";

/**
 * Ruheumsatz-Rechner (ADR 0010): rechnet ausschließlich im Browser, speichert nichts,
 * kein Bezug zum Profil. Der Disclaimer ist Teil des Bausteins, nicht des Inhalts.
 */
export function RuheumsatzRechner() {
  const [sex, setSex] = useState<"m" | "f">("m");
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const a = Number(age), h = Number(height), w = Number(weight);
  const valid = a >= 14 && a <= 100 && h >= 120 && h <= 230 && w >= 30 && w <= 250;
  const bmr = valid ? mifflinStJeor({ sex, ageYears: a, heightCm: h, weightKg: w }) : null;

  return (
    <div className="rounded-[var(--radius-lg)] border border-line bg-surface p-5">
      <p className="text-sm font-semibold text-ink">Ruheumsatz überschlagen (Mifflin-St-Jeor)</p>
      <p className="mt-1 text-xs text-muted">Nichts davon wird gespeichert oder an die Praxis übertragen.</p>
      <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Field label="Geschlecht" htmlFor="rr-sex">
          <Select id="rr-sex" value={sex} onChange={(e) => setSex(e.target.value as "m" | "f")}><option value="m">männlich</option><option value="f">weiblich</option></Select>
        </Field>
        <Field label="Alter (Jahre)" htmlFor="rr-age"><Input id="rr-age" inputMode="numeric" value={age} onChange={(e) => setAge(e.target.value)} autoComplete="off" /></Field>
        <Field label="Größe (cm)" htmlFor="rr-h"><Input id="rr-h" inputMode="numeric" value={height} onChange={(e) => setHeight(e.target.value)} autoComplete="off" /></Field>
        <Field label="Gewicht (kg)" htmlFor="rr-w"><Input id="rr-w" inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value)} autoComplete="off" /></Field>
      </div>
      <div className="mt-4 rounded-[var(--radius-md)] bg-sand p-3.5 text-sm" aria-live="polite">
        {bmr ? (
          <p className="text-ink">Ungefährer Ruheumsatz: <strong className="text-lg">{Math.round(bmr / 10) * 10} kcal</strong> pro Tag</p>
        ) : (
          <p className="text-muted">Bitte alle Werte eingeben.</p>
        )}
      </div>
      <p className="mt-3 text-xs text-ink-soft">
        <strong>Kein therapeutischer Wert.</strong> Das ist ein grober Orientierungswert nach einer allgemeinen Formel. Ihr tatsächlicher Bedarf hängt von Aktivität, Heilungsphase und Gesundheitszustand ab. Die für Sie geltenden Zielwerte legt Ihre Praxis fest; bei Diabetes, Nierenerkrankungen oder Mangelernährung ist eine ärztliche oder ernährungsberaterische Abstimmung zwingend.
      </p>
    </div>
  );
}
