import "server-only";
import { and, asc, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { supplementIntakes, supplementPlanItems, supplementPlanVersions } from "@/db/schema";

export { SLOT_LABEL, SLOTS, type Slot } from "@/lib/labels";

export type SupplementItem = typeof supplementPlanItems.$inferSelect;
export type SupplementPlan = typeof supplementPlanVersions.$inferSelect & { items: SupplementItem[] };

export async function getCurrentSupplementPlan(patientId: string): Promise<SupplementPlan | null> {
  const [plan] = await db
    .select()
    .from(supplementPlanVersions)
    .where(eq(supplementPlanVersions.patientId, patientId))
    .orderBy(desc(supplementPlanVersions.version))
    .limit(1);
  if (!plan) return null;
  const items = await db
    .select()
    .from(supplementPlanItems)
    .where(eq(supplementPlanItems.planVersionId, plan.id))
    .orderBy(asc(supplementPlanItems.position));
  return { ...plan, items };
}

/** Gültige Einträge an einem Datum (valid_from/valid_to beachten). */
export function itemsActiveOn(items: SupplementItem[], isoDate: string): SupplementItem[] {
  return items.filter((i) => (!i.validFrom || i.validFrom <= isoDate) && (!i.validTo || isoDate <= i.validTo));
}

export type IntakeState = Map<string, boolean>; // key itemId:slot → eingenommen

/** Aktueller Stand der Häkchen je (Item, Slot) für ein Datum; letzte Zeile gewinnt. */
export async function getIntakeState(patientId: string, isoDate: string): Promise<IntakeState> {
  const rows = await db
    .select()
    .from(supplementIntakes)
    .where(and(eq(supplementIntakes.patientId, patientId), eq(supplementIntakes.intakeDate, isoDate)))
    .orderBy(desc(supplementIntakes.createdAt));
  const state: IntakeState = new Map();
  for (const r of rows) {
    const key = `${r.itemId}:${r.slot}`;
    if (!state.has(key)) state.set(key, !r.revoked);
  }
  return state;
}

/** Anzahl eingenommener Slots je Tag in einem Zeitraum (für Wochenrückblick). */
export async function intakeCountsByDay(patientId: string, from: string, to: string): Promise<Map<string, number>> {
  const rows = await db
    .select({ date: supplementIntakes.intakeDate, itemId: supplementIntakes.itemId, slot: supplementIntakes.slot, revoked: supplementIntakes.revoked, createdAt: supplementIntakes.createdAt })
    .from(supplementIntakes)
    .where(and(eq(supplementIntakes.patientId, patientId), sql`${supplementIntakes.intakeDate} between ${from} and ${to}`))
    .orderBy(desc(supplementIntakes.createdAt));
  const seen = new Set<string>();
  const counts = new Map<string, number>();
  for (const r of rows) {
    const key = `${r.date}:${r.itemId}:${r.slot}`;
    if (seen.has(key)) continue;
    seen.add(key);
    if (!r.revoked) counts.set(r.date, (counts.get(r.date) ?? 0) + 1);
  }
  return counts;
}
