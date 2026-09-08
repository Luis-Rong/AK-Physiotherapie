"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireViewer } from "@/lib/auth/session";
import { withActor } from "@/db/client";
import { supplementPlanItems, supplementPlanVersions } from "@/db/schema";
import { getPatient } from "@/lib/data/patients";
import { getCurrentSupplementPlan } from "@/lib/data/supplements";

export type SupplementState = { error?: string; saved?: number };

const dateOrEmpty = z.union([z.literal(""), z.string().regex(/^\d{4}-\d{2}-\d{2}$/)]).transform((v) => (v === "" ? null : v));

const item = z.object({
  name: z.string().trim().min(1).max(120),
  dosage: z.string().trim().max(80),
  amount: z.string().trim().max(80),
  slots: z.array(z.enum(["morning", "noon", "evening"])).min(1, "Mindestens ein Einnahmezeitpunkt."),
  validFrom: dateOrEmpty,
  validTo: dateOrEmpty,
});

const schema = z.object({
  patientId: z.string().min(1),
  notes: z.string().trim().max(2000),
  items: z.array(item).max(40),
});

export async function saveSupplementPlanAction(_prev: SupplementState, form: FormData): Promise<SupplementState> {
  const viewer = await requireViewer("praxis");
  let itemsRaw: unknown;
  try {
    itemsRaw = JSON.parse(String(form.get("items") ?? "[]"));
  } catch {
    return { error: "Einträge konnten nicht gelesen werden." };
  }
  const parsed = schema.safeParse({ patientId: form.get("patientId"), notes: form.get("notes") ?? "", items: itemsRaw });
  if (!parsed.success) return { error: "Bitte Eingaben prüfen: " + parsed.error.issues[0]?.message };
  const d = parsed.data;
  const patient = await getPatient(d.patientId);
  if (!patient) return { error: "Unbekanntes Konto." };
  const previous = await getCurrentSupplementPlan(d.patientId);
  const version = (previous?.version ?? 0) + 1;

  await withActor(viewer.actor, async (tx) => {
    const [plan] = await tx
      .insert(supplementPlanVersions)
      .values({ patientId: d.patientId, version, supersedesId: previous?.id ?? null, notes: d.notes || null, createdBy: viewer.user.id })
      .returning({ id: supplementPlanVersions.id });
    if (d.items.length) {
      await tx.insert(supplementPlanItems).values(
        d.items.map((i, position) => ({ planVersionId: plan!.id, position, name: i.name, dosage: i.dosage || null, amount: i.amount || null, slots: [...new Set(i.slots)], validFrom: i.validFrom, validTo: i.validTo })),
      );
    }
  });
  revalidatePath(`/praxis/patienten/${d.patientId}`);
  revalidatePath("/app");
  return { saved: version };
}
