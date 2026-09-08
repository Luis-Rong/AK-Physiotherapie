import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type Tone = "clay" | "sun" | "berry" | "sky" | "moss" | "bark";

/** Farbige Kachel hinter einem Piktogramm – der Bereichsakzent auf Karten und in Listen. */
export const TONE_TILE: Record<Tone, string> = {
  clay: "bg-clay-soft text-clay-deep",
  sun: "bg-sun-soft text-sun-deep",
  berry: "bg-berry-soft text-berry-deep",
  sky: "bg-sky-soft text-sky-deep",
  moss: "bg-moss-soft text-moss",
  bark: "bg-bark-soft text-bark",
};

export const TONE_TEXT: Record<Tone, string> = {
  clay: "text-clay-deep",
  sun: "text-sun-deep",
  berry: "text-berry-deep",
  sky: "text-sky-deep",
  moss: "text-moss",
  bark: "text-bark",
};

export const TONE_BG: Record<Tone, string> = {
  clay: "bg-clay",
  sun: "bg-sun",
  berry: "bg-berry",
  sky: "bg-sky",
  moss: "bg-moss",
  bark: "bg-bark",
};

export function IconTile({ tone, size = "md", className, children }: { tone: Tone; size?: "sm" | "md" | "lg"; className?: string; children: ReactNode }) {
  const dims = size === "lg" ? "h-14 w-14 rounded-[18px]" : size === "sm" ? "h-8 w-8 rounded-[10px]" : "h-11 w-11 rounded-[14px]";
  return <span className={cn("grid shrink-0 place-items-center", dims, TONE_TILE[tone], className)}>{children}</span>;
}
