import "server-only";
import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { painEntries } from "@/db/schema";

import type { PainPhase } from "@/lib/labels";
export { PHASE_LABEL, PHASES, type PainPhase } from "@/lib/labels";

export type PainEntry = typeof painEntries.$inferSelect;

/** Aktuellster Wert je (Datum, Phase); Korrekturen ersetzen ältere Zeilen. */
export async function listPain(patientId: string, opts: { from?: string; to?: string } = {}): Promise<PainEntry[]> {
  const conds = [eq(painEntries.patientId, patientId)];
  if (opts.from) conds.push(sql`${painEntries.entryDate} >= ${opts.from}`);
  if (opts.to) conds.push(sql`${painEntries.entryDate} <= ${opts.to}`);
  const rows = await db
    .select()
    .from(painEntries)
    .where(and(...conds))
    .orderBy(desc(painEntries.entryDate), desc(painEntries.createdAt));
  const latest = new Map<string, PainEntry>();
  for (const r of rows) {
    const key = `${r.entryDate}:${r.phase}`;
    if (!latest.has(key)) latest.set(key, r);
  }
  return [...latest.values()].sort((a, b) => a.entryDate.localeCompare(b.entryDate));
}

export type PainDay = { date: string; during?: PainEntry; after?: PainEntry; next_morning?: PainEntry };

export function groupByDay(entries: PainEntry[]): PainDay[] {
  const days = new Map<string, PainDay>();
  for (const e of entries) {
    const d = days.get(e.entryDate) ?? { date: e.entryDate };
    d[e.phase as PainPhase] = e;
    days.set(e.entryDate, d);
  }
  return [...days.values()].sort((a, b) => a.date.localeCompare(b.date));
}
