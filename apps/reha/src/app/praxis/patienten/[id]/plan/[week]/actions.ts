"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { inArray } from "drizzle-orm";
import { requireViewer } from "@/lib/auth/session";
import { db, withActor } from "@/db/client";
import { exercises, planWeekExercises, planWeekVersions } from "@/db/schema";
import { listWeekHistory } from "@/lib/data/plan";
import { getPatient } from "@/lib/data/patients";
import { isoWeekday } from "@/lib/dates";

export type WeekState = { error?: string };

const row = z.object({
  section: z.enum(["warmup", "main", "cooldown"]),
  exerciseId: z.string().uuid().nullable(),
  name: z.string().trim().min(1).max(120),
  sets: z.string().trim().max(40),
  reps: z.string().trim().max(40),
  weight: z.string().trim().max(40),
  duration: z.string().trim().max(40),
  remarks: z.string().trim().max(500),
});

const schema = z.object({
  patientId: z.string().min(1),
  weekNumber: z.coerce.number().int().min(1).max(200),
  startsOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  goal: z.string().trim().max(200),
  notes: z.string().trim().max(4000),
  trainingDays: z.array(z.number().int().min(1).max(7)),
  exercises: z.array(row).max(60),
});

/** Speichert eine Woche als neue Version (ADR 0002); die vorherige bleibt referenziert. */
export async function saveWeekAction(_prev: WeekState, form: FormData): Promise<WeekState> {
  const viewer = await requireViewer("praxis");
  let exercisesRaw: unknown;
  try {
    exercisesRaw = JSON.parse(String(form.get("exercises") ?? "[]"));
  } catch {
    return { error: "Übungen konnten nicht gelesen werden." };
  }
  const parsed = schema.safeParse({
    patientId: form.get("patientId"),
    weekNumber: form.get("weekNumber"),
    startsOn: form.get("startsOn"),
    goal: form.get("goal") ?? "",
    notes: form.get("notes") ?? "",
    trainingDays: String(form.get("trainingDays") ?? "").split(",").filter(Boolean).map(Number),
    exercises: exercisesRaw,
  });
  if (!parsed.success) return { error: "Bitte Eingaben prüfen: " + parsed.error.issues[0]?.message };
  const d = parsed.data;
  if (isoWeekday(d.startsOn) !== 1) return { error: "Die Woche muss an einem Montag beginnen." };
  const patient = await getPatient(d.patientId);
  if (!patient) return { error: "Unbekanntes Konto." };

  // Bibliotheksverweise prüfen, sonst als Freitext speichern
  const ids = [...new Set(d.exercises.map((e) => e.exerciseId).filter((x): x is string => !!x))];
  const known = new Set(ids.length ? (await db.select({ id: exercises.id }).from(exercises).where(inArray(exercises.id, ids))).map((r) => r.id) : []);

  const history = await listWeekHistory(d.patientId, d.weekNumber);
  const previous = history[0] ?? null;
  const version = (previous?.version ?? 0) + 1;

  await withActor(viewer.actor, async (tx) => {
    const [week] = await tx
      .insert(planWeekVersions)
      .values({
        patientId: d.patientId,
        weekNumber: d.weekNumber,
        startsOn: d.startsOn,
        version,
        supersedesId: previous?.id ?? null,
        goal: d.goal || null,
        notes: d.notes || null,
        trainingDays: [...new Set(d.trainingDays)].sort(),
        createdBy: viewer.user.id,
      })
      .returning({ id: planWeekVersions.id });
    const positions: Record<string, number> = {};
    if (d.exercises.length) {
      await tx.insert(planWeekExercises).values(
        d.exercises.map((e) => ({
          weekVersionId: week!.id,
          section: e.section,
          position: (positions[e.section] = (positions[e.section] ?? -1) + 1),
          exerciseId: e.exerciseId && known.has(e.exerciseId) ? e.exerciseId : null,
          name: e.name,
          sets: e.sets || null,
          reps: e.reps || null,
          weight: e.weight || null,
          duration: e.duration || null,
          remarks: e.remarks || null,
        })),
      );
    }
  });

  revalidatePath(`/praxis/patienten/${d.patientId}`);
  revalidatePath("/app");
  redirect(`/praxis/patienten/${d.patientId}/plan`);
}
