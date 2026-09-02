"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

/**
 * Eingabe der Numerischen Schmerzskala 0–10 als Tastenreihe.
 * Bewusst ohne Farben: Die Zuordnung zur Ampel passiert erst nach dem Speichern
 * serverseitig (ADR 0011), damit die Eingabe selbst keine Bewertung nahelegt.
 */
export function PainScale({ name, defaultValue, required = false, label }: { name: string; defaultValue?: number | null; required?: boolean; label: string }) {
  const [value, setValue] = useState<number | null>(defaultValue ?? null);
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium text-ink-soft">
        {label}
        {!required && <span className="ml-1 font-normal text-muted">(optional)</span>}
      </legend>
      <input type="hidden" name={name} value={value ?? ""} />
      <div className="grid grid-cols-11 gap-1">
        {Array.from({ length: 11 }, (_, n) => (
          <button
            key={n}
            type="button"
            aria-pressed={value === n}
            onClick={() => setValue(value === n && !required ? null : n)}
            className={cn(
              "h-11 rounded-[var(--radius-sm)] border text-sm font-semibold tabular-nums transition-colors",
              value === n ? "border-bark bg-bark text-[#F7F1E8]" : "border-line-strong bg-surface text-ink hover:bg-sand",
            )}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="mt-1 flex justify-between text-[11px] text-muted">
        <span>kein Schmerz</span>
        <span>stärkster vorstellbarer Schmerz</span>
      </div>
    </fieldset>
  );
}
