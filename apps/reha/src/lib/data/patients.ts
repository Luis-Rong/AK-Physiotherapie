import "server-only";
import { asc, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { assessments, loginEvents, patientProfileVersions, user } from "@/db/schema";

export type PatientUser = Pick<
  typeof user.$inferSelect,
  "id" | "name" | "email" | "createdAt" | "banned" | "banReason" | "mustChangePassword" | "tempPasswordExpiresAt"
>;

export async function listPatients(): Promise<(PatientUser & { lastLogin: Date | null })[]> {
  const rows = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      banned: user.banned,
      banReason: user.banReason,
      mustChangePassword: user.mustChangePassword,
      tempPasswordExpiresAt: user.tempPasswordExpiresAt,
      lastLogin: sql<Date | null>`(SELECT max(le.at) FROM login_events le WHERE le.user_id = "user".id AND le.success)`,
    })
    .from(user)
    .where(eq(user.role, "patient"))
    .orderBy(asc(user.name));
  return rows;
}

export async function getPatient(id: string): Promise<PatientUser | null> {
  const [row] = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      banned: user.banned,
      banReason: user.banReason,
      mustChangePassword: user.mustChangePassword,
      tempPasswordExpiresAt: user.tempPasswordExpiresAt,
    })
    .from(user)
    .where(eq(user.id, id))
    .limit(1);
  return row ?? null;
}

export type Profile = typeof patientProfileVersions.$inferSelect;

export async function getCurrentProfile(patientId: string): Promise<Profile | null> {
  const [row] = await db
    .select()
    .from(patientProfileVersions)
    .where(eq(patientProfileVersions.patientId, patientId))
    .orderBy(desc(patientProfileVersions.version))
    .limit(1);
  return row ?? null;
}

export type Assessment = typeof assessments.$inferSelect;

/** Aktuellste Fassung jeder Messung (supersedes-Kette aufgelöst). */
export async function listAssessments(patientId: string): Promise<Assessment[]> {
  const rows = await db
    .select()
    .from(assessments)
    .where(eq(assessments.patientId, patientId))
    .orderBy(desc(assessments.createdAt));
  const superseded = new Set(rows.map((r) => r.supersedesId).filter(Boolean));
  return rows.filter((r) => !superseded.has(r.id)).sort((a, b) => b.assessedOn.localeCompare(a.assessedOn) || a.name.localeCompare(b.name));
}

export async function listLoginEvents(userId: string, limit = 20) {
  return db.select().from(loginEvents).where(eq(loginEvents.userId, userId)).orderBy(desc(loginEvents.at)).limit(limit);
}
