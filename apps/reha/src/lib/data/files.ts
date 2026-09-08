import "server-only";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { patientFiles } from "@/db/schema";

export type PatientFile = typeof patientFiles.$inferSelect;

/** Aktueller Stand je Datei: die jüngste Zeile der supersedes-Kette. Zurückgezogene bleiben sichtbar, wenn `all`. */
export async function listPatientFiles(patientId: string, opts: { all?: boolean } = {}): Promise<PatientFile[]> {
  const rows = await db.select().from(patientFiles).where(eq(patientFiles.patientId, patientId)).orderBy(desc(patientFiles.createdAt));
  const superseded = new Set(rows.map((r) => r.supersedesId).filter(Boolean));
  const current = rows.filter((r) => !superseded.has(r.id));
  return opts.all ? current : current.filter((r) => !r.withdrawn);
}

export async function getPatientFile(id: string): Promise<PatientFile | null> {
  const [row] = await db.select().from(patientFiles).where(eq(patientFiles.id, id)).limit(1);
  return row ?? null;
}
