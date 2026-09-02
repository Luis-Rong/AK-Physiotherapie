"use client";

import { useEffect, useRef, useState } from "react";
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
  const [step, setStep] = useState<number>(0);
  const [left, setLeft] = useState<number>(PATTERNS["4-7-8"].steps[0].s);
  const [round, setRound] = useState<number>(1);
  const timer = useRef<number | null>(null);
  const pattern = PATTERNS[key];

  useEffect(() => {
    if (!running) return;
    timer.current = window.setInterval(() => {
      setLeft((l) => {
        if (l > 1) return l - 1;
        setStep((s) => {
          const next = (s + 1) % pattern.steps.length;
          if (next === 0) {
            setRound((r) => {
              if (r >= pattern.rounds) {
                setRunning(false);
                return 1;
              }
              return r + 1;
            });
          }
          return next;
        });
        return 0;
      });
    }, 1000);
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [running, pattern]);

  useEffect(() => {
    if (left === 0) setLeft(pattern.steps[step]?.s ?? 0);
  }, [left, step, pattern]);

  function reset(k: Key = key) {
    setRunning(false);
    setKey(k);
    setStep(0);
    setRound(1);
    setLeft(PATTERNS[k].steps[0].s);
  }

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
