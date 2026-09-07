import "server-only";
import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { planWeekExercises, planWeekVersions, trainingLogItems, trainingLogs } from "@/db/schema";
import { addDays, today } from "@/lib/dates";

export { SECTION_LABEL, SECTIONS, type Section } from "@/lib/labels";

export type WeekExercise = typeof planWeekExercises.$inferSelect;
export type WeekVersion = typeof planWeekVersions.$inferSelect;
export type WeekWithExercises = WeekVersion & { exercises: WeekExercise[] };

/** Aktuellste Version jeder Woche eines Patienten, nach Startdatum sortiert. */
export async function listCurrentWeeks(patientId: string): Promise<WeekVersion[]> {
  const rows = await db
    .select()
    .from(planWeekVersions)
    .where(eq(planWeekVersions.patientId, patientId))
    .orderBy(asc(planWeekVersions.weekNumber), desc(planWeekVersions.version));
  const seen = new Set<number>();
  const current: WeekVersion[] = [];
  for (const r of rows) {
    if (seen.has(r.weekNumber)) continue;
    seen.add(r.weekNumber);
    current.push(r);
  }
  return current.sort((a, b) => a.startsOn.localeCompare(b.startsOn));
}

export async function getWeekVersion(id: string): Promise<WeekWithExercises | null> {
  const [week] = await db.select().from(planWeekVersions).where(eq(planWeekVersions.id, id)).limit(1);
  if (!week) return null;
  const exercises = await db
    .select()
    .from(planWeekExercises)
    .where(eq(planWeekExercises.weekVersionId, id))
    .orderBy(asc(planWeekExercises.section), asc(planWeekExercises.position));
  return { ...week, exercises: sortBySection(exercises) };
}

export function sortBySection(list: WeekExercise[]): WeekExercise[] {
  const order: Record<string, number> = { warmup: 0, main: 1, cooldown: 2 };
  return [...list].sort((a, b) => (order[a.section] ?? 9) - (order[b.section] ?? 9) || a.position - b.position);
}

/** Woche, in die ein Datum fällt (starts_on ≤ Datum < starts_on + 7), sonst null. */
export async function findWeekForDate(patientId: string, isoDate: string): Promise<WeekWithExercises | null> {
  const weeks = await listCurrentWeeks(patientId);
  const hit = weeks.find((w) => w.startsOn <= isoDate && isoDate < addDays(w.startsOn, 7));
  return hit ? getWeekVersion(hit.id) : null;
}

export async function findCurrentWeek(patientId: string) {
  return findWeekForDate(patientId, today());
}

/** Alle Versionen einer Wochennummer (Historie für die Praxis). */
export async function listWeekHistory(patientId: string, weekNumber: number): Promise<WeekVersion[]> {
  return db
    .select()
    .from(planWeekVersions)
    .where(and(eq(planWeekVersions.patientId, patientId), eq(planWeekVersions.weekNumber, weekNumber)))
    .orderBy(desc(planWeekVersions.version));
}

export type TrainingLog = typeof trainingLogs.$inferSelect & { items: (typeof trainingLogItems.$inferSelect)[] };

/** Aktuellster Trainingseintrag je Datum (Korrekturen ersetzen ältere Zeilen). */
export async function listLogsForPatient(patientId: string, opts: { from?: string; to?: string } = {}): Promise<TrainingLog[]> {
  const conds = [eq(trainingLogs.patientId, patientId)];
  if (opts.from) conds.push(sql`${trainingLogs.logDate} >= ${opts.from}`);
  if (opts.to) conds.push(sql`${trainingLogs.logDate} <= ${opts.to}`);
  const logs = await db
    .select()
    .from(trainingLogs)
    .where(and(...conds))
    .orderBy(desc(trainingLogs.logDate), desc(trainingLogs.createdAt));
  const latestPerDate = new Map<string, typeof trainingLogs.$inferSelect>();
  for (const l of logs) if (!latestPerDate.has(l.logDate)) latestPerDate.set(l.logDate, l);
  const ids = [...latestPerDate.values()].map((l) => l.id);
  const items = ids.length ? await db.select().from(trainingLogItems).where(inArray(trainingLogItems.logId, ids)) : [];
  return [...latestPerDate.values()].map((l) => ({ ...l, items: items.filter((i) => i.logId === l.id) }));
}

export async function getLogForDate(patientId: string, isoDate: string): Promise<TrainingLog | null> {
  const [log] = await listLogsForPatient(patientId, { from: isoDate, to: isoDate });
  return log ?? null;
}
