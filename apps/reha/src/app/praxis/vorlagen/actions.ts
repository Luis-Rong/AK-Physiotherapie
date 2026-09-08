"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { requireViewer } from "@/lib/auth/session";
import { db, withActor } from "@/db/client";
import { exercises, planTemplates, planWeekExercises, planWeekVersions } from "@/db/schema";
import { templateSchema } from "@/lib/plan/template-schema";
import { getTemplate } from "@/lib/data/templates";
import { getWeekVersion, listCurrentWeeks, listWeekHistory } from "@/lib/data/plan";
import { getPatient } from "@/lib/data/patients";
import { addDays, isoWeekday } from "@/lib/dates";

export type TemplateState = { error?: string };

/** Vorlage anlegen oder überschreiben (Stammdaten: hier ist Ändern erlaubt, der Audit-Trigger protokolliert). */
export async function saveTemplateAction(_prev: TemplateState, form: FormData): Promise<TemplateState> {
  const viewer = await requireViewer("praxis");
  let weeksRaw: unknown;
  try {
    weeksRaw = JSON.parse(String(form.get("weeks") ?? "[]"));
  } catch {
    return { error: "Wochen konnten nicht gelesen werden." };
  }
  const parsed = templateSchema.safeParse({ name: form.get("name") ?? "", description: form.get("description") ?? "", weeks: weeksRaw });
  if (!parsed.success) return { error: "Bitte Eingaben prüfen: " + parsed.error.issues[0]?.message };
  const d = parsed.data;
  const weeks = d.weeks.map((w, i) => ({ ...w, weekNumber: i + 1, trainingDays: [...new Set(w.trainingDays)].sort() }));
  const id = String(form.get("id") ?? "");

  await withActor(viewer.actor, async (tx) => {
    if (id) {
      await tx.update(planTemplates).set({ name: d.name, description: d.description || null, weeks, updatedAt: new Date() }).where(eq(planTemplates.id, id));
    } else {
      await tx.insert(planTemplates).values({ name: d.name, description: d.description || null, weeks, createdBy: viewer.user.id });
    }
  });
  revalidatePath("/praxis/vorlagen");
  redirect("/praxis/vorlagen");
}

export async function setTemplateActiveAction(id: string, active: boolean): Promise<void> {
  const viewer = await requireViewer("praxis");
  await withActor(viewer.actor, async (tx) => {
    await tx.update(planTemplates).set({ active, updatedAt: new Date() }).where(eq(planTemplates.id, id));
  });
  revalidatePath("/praxis/vorlagen");
}

/** Alle aktuellen Wochen eines Patienten als neue Vorlage sichern. */
export async function saveWeeksAsTemplateAction(_prev: TemplateState, form: FormData): Promise<TemplateState> {
  const viewer = await requireViewer("praxis");
  const patientId = String(form.get("patientId") ?? "");
  const name = String(form.get("name") ?? "").trim();
  if (!name || name.length > 120) return { error: "Bitte einen Namen für die Vorlage angeben." };
  const metas = await listCurrentWeeks(patientId);
  if (metas.length === 0) return { error: "Dieser Plan hat noch keine Wochen." };
  const full = await Promise.all(metas.map((m) => getWeekVersion(m.id)));
  const weeks = full
    .filter((w): w is NonNullable<typeof w> => !!w)
    .map((w, i) => ({
      weekNumber: i + 1,
      goal: w.goal ?? "",
      notes: w.notes ?? "",
      trainingDays: w.trainingDays,
      exercises: w.exercises.map((e) => ({
        section: e.section as "warmup" | "main" | "cooldown",
        exerciseId: e.exerciseId,
        name: e.name,
        sets: e.sets ?? "",
        reps: e.reps ?? "",
        weight: e.weight ?? "",
        duration: e.duration ?? "",
        remarks: e.remarks ?? "",
      })),
    }));
  await withActor(viewer.actor, async (tx) => {
    await tx.insert(planTemplates).values({ name, description: `Aus einem Patientenplan übernommen, ${weeks.length} Wochen.`, weeks, createdBy: viewer.user.id });
  });
  revalidatePath("/praxis/vorlagen");
  redirect("/praxis/vorlagen");
}

const applySchema = z.object({
  patientId: z.string().min(1),
  templateId: z.string().uuid(),
  startsOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

/**
 * Vorlage auf einen Patienten anwenden: jede Vorlagenwoche wird eine neue Woche
 * (Nummer fortlaufend hinter den vorhandenen, Startdatum wöchentlich). Jede Woche ist
 * danach einzeln anpassbar; Anpassungen erzeugen wie immer neue Fassungen (ADR 0002).
 */
export async function applyTemplateAction(_prev: TemplateState, form: FormData): Promise<TemplateState> {
  const viewer = await requireViewer("praxis");
  const parsed = applySchema.safeParse({ patientId: form.get("patientId"), templateId: form.get("templateId"), startsOn: form.get("startsOn") });
  if (!parsed.success) return { error: "Bitte Vorlage und Startdatum angeben." };
  const d = parsed.data;
  if (isoWeekday(d.startsOn) !== 1) return { error: "Die erste Woche muss an einem Montag beginnen." };
  const [patient, template] = await Promise.all([getPatient(d.patientId), getTemplate(d.templateId)]);
  if (!patient) return { error: "Unbekanntes Konto." };
  if (!template || !template.active) return { error: "Vorlage nicht gefunden." };

  const existing = await listCurrentWeeks(d.patientId);
  const nextNumber = existing.length ? Math.max(...existing.map((w) => w.weekNumber)) + 1 : 1;
  const ids = [...new Set(template.weeks.flatMap((w) => w.exercises.map((e) => e.exerciseId)).filter((x): x is string => !!x))];
  const known = new Set(ids.length ? (await db.select({ id: exercises.id }).from(exercises).where(inArray(exercises.id, ids))).map((r) => r.id) : []);

  await withActor(viewer.actor, async (tx) => {
    for (const [i, w] of template.weeks.entries()) {
      const weekNumber = nextNumber + i;
      const history = await listWeekHistory(d.patientId, weekNumber);
      const previous = history[0] ?? null;
      const [week] = await tx
        .insert(planWeekVersions)
        .values({
          patientId: d.patientId,
          weekNumber,
          startsOn: addDays(d.startsOn, 7 * i),
          version: (previous?.version ?? 0) + 1,
          supersedesId: previous?.id ?? null,
          goal: w.goal || null,
          notes: w.notes || null,
          trainingDays: [...new Set(w.trainingDays)].sort(),
          createdBy: viewer.user.id,
        })
        .returning({ id: planWeekVersions.id });
      const positions: Record<string, number> = {};
      if (w.exercises.length) {
        await tx.insert(planWeekExercises).values(
          w.exercises.map((e) => ({
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
    }
  });
  revalidatePath(`/praxis/patienten/${d.patientId}`);
  revalidatePath("/app");
  redirect(`/praxis/patienten/${d.patientId}/plan`);
}
