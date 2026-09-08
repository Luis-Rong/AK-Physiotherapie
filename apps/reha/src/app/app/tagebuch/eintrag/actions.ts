"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { requireViewer } from "@/lib/auth/session";
import { db, withActor } from "@/db/client";
import { painEntries, planWeekExercises, planWeekVersions, trainingLogItems, trainingLogs } from "@/db/schema";
import { getLogForDate } from "@/lib/data/plan";
import { listPain } from "@/lib/data/pain";
import { today } from "@/lib/dates";

export type EntryState = { error?: string };

const nprs = z.union([z.literal(""), z.coerce.number().int().min(0).max(10)]).transform((v) => (v === "" ? null : v));

const schema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  weekVersionId: z.string().uuid().or(z.literal("")),
  done: z.array(z.string().uuid()),
  during: nprs,
  after: nprs,
  next_morning: nprs,
  remark: z.string().max(2000),
});

/**
 * Speichert Trainingseintrag und Schmerzwerte als neue Zeilen (ADR 0002).
 * Ein bestehender Eintrag desselben Tages wird per supersedes_id ersetzt, nicht geändert.
 */
export async function saveEntryAction(_prev: EntryState, form: FormData): Promise<EntryState> {
  const viewer = await requireViewer("patient");
  const parsed = schema.safeParse({
    date: form.get("date"),
    weekVersionId: form.get("weekVersionId") ?? "",
    done: form.getAll("done"),
    during: form.get("during") ?? "",
    after: form.get("after") ?? "",
    next_morning: form.get("next_morning") ?? "",
    remark: form.get("remark") ?? "",
  });
  if (!parsed.success) return { error: "Bitte prüfen Sie Ihre Eingaben." };
  const data = parsed.data;
  if (data.date > today()) return { error: "Einträge für die Zukunft sind nicht möglich." };

  const patientId = viewer.user.id;
  const [previousLog, previousPain] = await Promise.all([getLogForDate(patientId, data.date), listPain(patientId, { from: data.date, to: data.date })]);

  // Wochenplan muss dem Patienten gehören; erledigte Übungen müssen zur Woche gehören
  let weekVersionId: string | null = null;
  let validExerciseIds = new Set<string>();
  if (data.weekVersionId) {
    const [week] = await db.select({ id: planWeekVersions.id, patientId: planWeekVersions.patientId }).from(planWeekVersions).where(eq(planWeekVersions.id, data.weekVersionId)).limit(1);
    if (!week || week.patientId !== patientId) return { error: "Der Plan gehört nicht zu Ihrem Konto." };
    weekVersionId = week.id;
    const exs = await db.select({ id: planWeekExercises.id }).from(planWeekExercises).where(eq(planWeekExercises.weekVersionId, week.id));
    validExerciseIds = new Set(exs.map((e) => e.id));
  }
  const doneIds = data.done.filter((id) => validExerciseIds.has(id));

  await withActor(viewer.actor, async (tx) => {
    let logId: string | null = null;
    if (weekVersionId) {
      const previousDone = new Set(previousLog?.items.filter((i) => i.done).map((i) => i.weekExerciseId) ?? []);
      const unchanged = previousLog && previousLog.weekVersionId === weekVersionId && (previousLog.remark ?? "") === data.remark && previousDone.size === doneIds.length && doneIds.every((id) => previousDone.has(id));
      if (unchanged) {
        logId = previousLog.id;
      } else {
        const [log] = await tx
          .insert(trainingLogs)
          .values({ patientId, weekVersionId, logDate: data.date, remark: data.remark || null, supersedesId: previousLog?.id ?? null, createdBy: patientId })
          .returning({ id: trainingLogs.id });
        logId = log!.id;
        if (validExerciseIds.size > 0) {
          const all = await tx.select({ id: planWeekExercises.id }).from(planWeekExercises).where(inArray(planWeekExercises.id, [...validExerciseIds]));
          await tx.insert(trainingLogItems).values(all.map((e) => ({ logId: logId!, weekExerciseId: e.id, done: doneIds.includes(e.id) })));
        }
      }
    }
    const phases = [
      ["during", data.during],
      ["after", data.after],
      ["next_morning", data.next_morning],
    ] as const;
    for (const [phase, value] of phases) {
      if (value === null) continue;
      const prev = previousPain.find((p) => p.phase === phase);
      if (prev && prev.nprs === value) continue;
      await tx.insert(painEntries).values({ patientId, trainingLogId: logId, entryDate: data.date, phase, nprs: value, supersedesId: prev?.id ?? null, createdBy: patientId });
    }
  });

  revalidatePath("/app");
  revalidatePath("/app/tagebuch");
  redirect("/app/tagebuch");
}
