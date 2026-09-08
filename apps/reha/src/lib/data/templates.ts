import "server-only";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { planTemplates } from "@/db/schema";

export type PlanTemplate = typeof planTemplates.$inferSelect;

export async function listTemplates(includeInactive = false): Promise<PlanTemplate[]> {
  const rows = await db.select().from(planTemplates).orderBy(asc(planTemplates.name));
  return includeInactive ? rows : rows.filter((r) => r.active);
}

export async function getTemplate(id: string): Promise<PlanTemplate | null> {
  const [row] = await db.select().from(planTemplates).where(eq(planTemplates.id, id)).limit(1);
  return row ?? null;
}
