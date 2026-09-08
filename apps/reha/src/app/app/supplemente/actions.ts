"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { requireViewer } from "@/lib/auth/session";
import { db, withActor } from "@/db/client";
import { supplementIntakes, supplementPlanItems, supplementPlanVersions } from "@/db/schema";

const schema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  itemId: z.string().uuid(),
  slot: z.enum(["morning", "noon", "evening"]),
  taken: z.boolean(),
});

/** Häkchen setzen oder zurücknehmen: immer eine neue Zeile (append-only). */
export async function toggleIntakeAction(input: z.infer<typeof schema>) {
  const viewer = await requireViewer("patient");
  const data = schema.parse(input);
  // Der Eintrag muss zu einem Plan dieses Patienten gehören
  const [owner] = await db
    .select({ patientId: supplementPlanVersions.patientId })
    .from(supplementPlanItems)
    .innerJoin(supplementPlanVersions, eq(supplementPlanItems.planVersionId, supplementPlanVersions.id))
    .where(eq(supplementPlanItems.id, data.itemId))
    .limit(1);
  if (!owner || owner.patientId !== viewer.user.id) throw new Error("Nicht erlaubt");

  await withActor(viewer.actor, async (tx) => {
    await tx.insert(supplementIntakes).values({
      patientId: viewer.user.id,
      itemId: data.itemId,
      intakeDate: data.date,
      slot: data.slot,
      revoked: !data.taken,
    });
  });
  revalidatePath("/app");
  revalidatePath("/app/supplemente");
}
