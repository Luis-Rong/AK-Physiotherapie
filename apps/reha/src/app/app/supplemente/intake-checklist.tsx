"use client";

import { useOptimistic, useTransition } from "react";
import { Check } from "lucide-react";
import { toggleIntakeAction } from "./actions";
import { SLOT_LABEL, type Slot } from "@/lib/labels";
import { cn } from "@/lib/cn";

type Item = { id: string; name: string; dosage: string | null; amount: string | null; slots: string[] };

export function IntakeChecklist({ date, items, state }: { date: string; items: Item[]; state: Record<string, boolean> }) {
  const [optimistic, setOptimistic] = useOptimistic(state, (prev, key: string) => ({ ...prev, [key]: !prev[key] }));
  const [pending, start] = useTransition();

  function toggle(itemId: string, slot: Slot) {
    const key = `${itemId}:${slot}`;
    start(async () => {
      setOptimistic(key);
      await toggleIntakeAction({ date, itemId, slot, taken: !optimistic[key] });
    });
  }

  const slots: Slot[] = ["morning", "noon", "evening"];
  return (
    <div className="mt-3 space-y-4" aria-busy={pending}>
      {slots.map((slot) => {
        const forSlot = items.filter((i) => i.slots.includes(slot));
        if (forSlot.length === 0) return null;
        return (
          <div key={slot}>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">{SLOT_LABEL[slot]}</p>
            <ul className="space-y-1.5">
              {forSlot.map((i) => {
                const key = `${i.id}:${slot}`;
                const on = !!optimistic[key];
                return (
                  <li key={key}>
                    <button
                      type="button"
                      aria-pressed={on}
                      onClick={() => toggle(i.id, slot)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-[var(--radius-md)] border px-3.5 py-2.5 text-left transition-colors",
                        on ? "border-moss/40 bg-moss-soft" : "border-line bg-surface hover:bg-sand",
                      )}
                    >
                      <span className={cn("grid h-6 w-6 shrink-0 place-items-center rounded-full border", on ? "border-moss bg-moss text-white" : "border-line-strong")}>
                        {on && <Check size={14} strokeWidth={3} />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-medium text-ink">{i.name}</span>
                        <span className="block text-xs text-muted">{[i.amount, i.dosage].filter(Boolean).join(" · ")}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
