import "server-only";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { exercises } from "@/db/schema";

export type Exercise = typeof exercises.$inferSelect;
export { CATEGORY_LABEL, CATEGORIES, type ExerciseCategory } from "@/lib/labels";

export async function listExercises(opts: { includeInactive?: boolean } = {}): Promise<Exercise[]> {
  const q = db.select().from(exercises).orderBy(asc(exercises.category), asc(exercises.name));
  const rows = opts.includeInactive ? await q : await q.where(eq(exercises.active, true));
  return rows;
}

export async function getExercise(id: string): Promise<Exercise | null> {
  const [row] = await db.select().from(exercises).where(eq(exercises.id, id)).limit(1);
  return row ?? null;
}
