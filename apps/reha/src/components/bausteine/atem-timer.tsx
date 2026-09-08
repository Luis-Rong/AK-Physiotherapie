"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

/** Atemübungen aus dem Tagebuch S. 6: 4-7-8 und Box Breathing. Reiner Timer, keine Messung. */
const PATTERNS = {
  "4-7-8": { label: "4-7-8", steps: [{ name: "Einatmen (Nase)", s: 4 }, { name: "Halten", s: 7 }, { name: "Ausatmen (Mund)", s: 8 }], rounds: 4, hint: "Beruhigt das Nervensystem und erleichtert das Einschlafen." },
  box: { label: "Box Breathing", steps: [{ name: "Einatmen", s: 4 }, { name: "Halten", s: 4 }, { name: "Ausatmen", s: 4 }, { name: "Pause", s: 4 }], rounds: 6, hint: "Die gleichmäßige Struktur hilft, Stresshormone zu senken und den Geist zu beruhigen." },
} as const;

type Key = keyof typeof PATTERNS;

export function AtemTimer() {
  const [key, setKey] = useState<Key>("4-7-8");
  const [running, setRunning] = useState(false);
  // ein Zustand für Schritt, Restsekunden und Runde, damit ein Tick atomar bleibt
  const [t, setT] = useState<{ step: number; left: number; round: number }>({ step: 0, left: PATTERNS["4-7-8"].steps[0].s, round: 1 });
  const pattern = PATTERNS[key];

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setT((cur) => {
        if (cur.left > 1) return { ...cur, left: cur.left - 1 };
        const nextStep = (cur.step + 1) % pattern.steps.length;
        const nextRound = nextStep === 0 ? cur.round + 1 : cur.round;
        if (nextRound > pattern.rounds) {
          window.setTimeout(() => setRunning(false), 0);
          return { step: 0, left: pattern.steps[0].s, round: 1 };
        }
        return { step: nextStep, left: pattern.steps[nextStep]!.s, round: nextRound };
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [running, pattern]);

  function reset(k: Key = key) {
    setRunning(false);
    setKey(k);
    setT({ step: 0, left: PATTERNS[k].steps[0].s, round: 1 });
  }

  const { step, left, round } = t;
  const current = pattern.steps[step]!;
  const progress = 1 - left / current.s;

  return (
    <div className="rounded-[var(--radius-lg)] border border-line bg-surface p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-ink">Atemübung</p>
        <div className="flex gap-1">
          {(Object.keys(PATTERNS) as Key[]).map((k) => (
            <button key={k} type="button" onClick={() => reset(k)} aria-pressed={k === key} className={`rounded-full px-3 py-1 text-xs font-semibold ${k === key ? "bg-bark text-[#F7F1E8]" : "bg-sand text-muted"}`}>
              {PATTERNS[k].label}
            </button>
          ))}
        </div>
      </div>
      <p className="mt-1 text-xs text-muted">{pattern.hint}</p>
      <div className="mt-4 flex flex-col items-center gap-3">
        <div className="relative grid h-36 w-36 place-items-center rounded-full bg-sand" aria-live="polite">
          <div className="absolute inset-0 rounded-full border-4 border-clay transition-transform duration-1000 ease-linear" style={{ transform: `scale(${0.6 + progress * 0.4})`, opacity: running ? 0.9 : 0.4 }} aria-hidden />
          <div className="relative text-center">
            <p className="text-xs uppercase tracking-wide text-muted">{current.name}</p>
            <p className="text-3xl font-bold tabular-nums text-ink">{left}</p>
            <p className="text-[11px] text-muted">Runde {round}/{pattern.rounds}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => setRunning((r) => !r)}>{running ? "Pause" : "Start"}</Button>
          <Button size="sm" variant="secondary" onClick={() => reset()}>Zurücksetzen</Button>
        </div>
        <p className="text-xs text-muted">{pattern.steps.map((s) => `${s.s} s ${s.name.toLowerCase()}`).join(" · ")}</p>
      </div>
    </div>
  );
}
