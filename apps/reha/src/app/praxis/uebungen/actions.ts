"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { requireViewer } from "@/lib/auth/session";
import { withActor } from "@/db/client";
import { exercises } from "@/db/schema";

export type ExerciseState = { error?: string; savedAt?: number };

const schema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1).max(120),
  category: z.enum(["aufwaermen", "training", "abwaermen", "allgemein"]),
  description: z.string().trim().max(2000),
  active: z.boolean(),
});

/** Übungen sind Stammdaten: änderbar, Änderungen werden per Trigger protokolliert. */
export async function saveExerciseAction(_prev: ExerciseState, form: FormData): Promise<ExerciseState> {
  const viewer = await requireViewer("praxis");
  const parsed = schema.safeParse({
    id: form.get("id") ? String(form.get("id")) : undefined,
    name: form.get("name"),
    category: form.get("category"),
    description: form.get("description") ?? "",
    active: form.get("id") ? form.get("active") === "yes" : true,
  });
  if (!parsed.success) return { error: "Bitte Eingaben prüfen." };
  const d = parsed.data;
  await withActor(viewer.actor, async (tx) => {
    if (d.id) {
      await tx.update(exercises).set({ name: d.name, category: d.category, description: d.description || null, active: d.active, updatedAt: new Date() }).where(eq(exercises.id, d.id));
    } else {
      await tx.insert(exercises).values({ name: d.name, category: d.category, description: d.description || null, active: true, createdBy: viewer.user.id });
    }
  });
  revalidatePath("/praxis/uebungen");
  return { savedAt: Date.now() };
}
