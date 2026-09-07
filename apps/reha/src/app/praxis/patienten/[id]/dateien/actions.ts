"use server";

import { revalidatePath } from "next/cache";
import { requireViewer } from "@/lib/auth/session";
import { withActor } from "@/db/client";
import { patientFiles } from "@/db/schema";
import { getPatientFile } from "@/lib/data/files";

/** Datei zurückziehen: neue Zeile mit withdrawn = true, die alte bleibt (ADR 0002). */
export async function withdrawFileAction(fileId: string): Promise<void> {
  const viewer = await requireViewer("praxis");
  const file = await getPatientFile(fileId);
  if (!file || file.withdrawn) return;
  await withActor(viewer.actor, async (tx) => {
    await tx.insert(patientFiles).values({
      patientId: file.patientId,
      filename: file.filename,
      mime: file.mime,
      size: file.size,
      sha256: file.sha256,
      storedPath: file.storedPath,
      note: file.note,
      withdrawn: true,
      supersedesId: file.id,
      createdBy: viewer.user.id,
    });
  });
  revalidatePath(`/praxis/patienten/${file.patientId}/dateien`);
  revalidatePath("/app");
}
