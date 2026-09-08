"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireViewer } from "@/lib/auth/session";
import { withActor } from "@/db/client";
import { assessments, patientProfileVersions } from "@/db/schema";
import { getCurrentProfile, getPatient } from "@/lib/data/patients";

export type ProfileState = { error?: string; saved?: number };
export type AssessmentState = { error?: string; savedAt?: number };

const optionalInt = (max: number) => z.union([z.literal(""), z.coerce.number().int().min(0).max(max)]).transform((v) => (v === "" ? null : v));

const profileSchema = z.object({
  id: z.string().min(1),
  goal: z.string().trim().max(2000),
  movementProfile: z.string().trim().max(2000),
  notes: z.string().trim().max(4000),
  krsStage: z.union([z.literal(""), z.coerce.number().int().min(1).max(9)]).transform((v) => (v === "" ? null : v)),
  opContext: z.boolean(),
  calorieTarget: optionalInt(9999),
  proteinTargetG: optionalInt(999),
});

export async function saveProfileAction(_prev: ProfileState, form: FormData): Promise<ProfileState> {
  const viewer = await requireViewer("praxis");
  const parsed = profileSchema.safeParse({
    id: form.get("id"),
    goal: form.get("goal") ?? "",
    movementProfile: form.get("movementProfile") ?? "",
    notes: form.get("notes") ?? "",
    krsStage: form.get("krsStage") ?? "",
    opContext: form.get("opContext") === "yes",
    calorieTarget: form.get("calorieTarget") ?? "",
    proteinTargetG: form.get("proteinTargetG") ?? "",
  });
  if (!parsed.success) return { error: "Bitte Eingaben prüfen." };
  const d = parsed.data;
  const patient = await getPatient(d.id);
  if (!patient) return { error: "Unbekanntes Konto." };
  const previous = await getCurrentProfile(d.id);
  const version = (previous?.version ?? 0) + 1;
  await withActor(viewer.actor, async (tx) => {
    await tx.insert(patientProfileVersions).values({
      patientId: d.id,
      version,
      supersedesId: previous?.id ?? null,
      goal: d.goal || null,
      movementProfile: d.movementProfile || null,
      notes: d.notes || null,
      krsStage: d.krsStage,
      opContext: d.opContext,
      calorieTarget: d.calorieTarget,
      proteinTargetG: d.proteinTargetG,
      createdBy: viewer.user.id,
    });
  });
  revalidatePath(`/praxis/patienten/${d.id}`);
  return { saved: version };
}

const assessmentSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1).max(120),
  assessedOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  side: z.enum(["", "links", "rechts", "beide"]).transform((v) => (v === "" ? null : v)),
  score: z.string().trim().min(1).max(40),
  remark: z.string().trim().max(500),
});

export async function addAssessmentAction(_prev: AssessmentState, form: FormData): Promise<AssessmentState> {
  const viewer = await requireViewer("praxis");
  const parsed = assessmentSchema.safeParse({
    id: form.get("id"),
    name: form.get("name"),
    assessedOn: form.get("assessedOn"),
    side: form.get("side") ?? "",
    score: form.get("score"),
    remark: form.get("remark") ?? "",
  });
  if (!parsed.success) return { error: "Bitte Eingaben prüfen." };
  const d = parsed.data;
  const patient = await getPatient(d.id);
  if (!patient) return { error: "Unbekanntes Konto." };
  await withActor(viewer.actor, async (tx) => {
    await tx.insert(assessments).values({ patientId: d.id, name: d.name, assessedOn: d.assessedOn, side: d.side, score: d.score, remark: d.remark || null, createdBy: viewer.user.id });
  });
  revalidatePath(`/praxis/patienten/${d.id}`);
  return { savedAt: Date.now() };
}
