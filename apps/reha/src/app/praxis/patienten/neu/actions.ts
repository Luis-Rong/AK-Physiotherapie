"use server";

import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { APIError } from "better-auth/api";
import { auth, TEMP_PASSWORD_VALIDITY_DAYS } from "@/lib/auth/auth";
import { requireViewer } from "@/lib/auth/session";
import { generateTempPassword } from "@/lib/auth/tempPassword";
import { db, withActor } from "@/db/client";
import { patientProfileVersions, user as userTable } from "@/db/schema";
import { formatDate } from "@/lib/dates";

export type CreatePatientState = {
  error?: string;
  fieldErrors?: { name?: string; email?: string };
  created?: { id: string; name: string; email: string; tempPassword: string; expires: string };
};

const schema = z.object({
  name: z.string().trim().min(2, "Bitte einen Namen eingeben.").max(120),
  email: z.string().trim().toLowerCase().email("Bitte eine gültige E-Mail-Adresse eingeben."),
  goal: z.string().trim().max(2000),
  movementProfile: z.string().trim().max(2000),
  opContext: z.boolean(),
});

export async function createPatientAction(_prev: CreatePatientState, form: FormData): Promise<CreatePatientState> {
  const viewer = await requireViewer("praxis");
  const parsed = schema.safeParse({
    name: form.get("name"),
    email: form.get("email"),
    goal: form.get("goal") ?? "",
    movementProfile: form.get("movementProfile") ?? "",
    opContext: form.get("opContext") === "yes",
  });
  if (!parsed.success) {
    const f = parsed.error.flatten().fieldErrors;
    return { fieldErrors: { name: f.name?.[0], email: f.email?.[0] } };
  }
  const data = parsed.data;
  const [existing] = await db.select({ id: userTable.id }).from(userTable).where(eq(userTable.email, data.email)).limit(1);
  if (existing) return { fieldErrors: { email: "Für diese Adresse gibt es bereits ein Konto." } };

  const tempPassword = generateTempPassword();
  const expiresAt = new Date(Date.now() + TEMP_PASSWORD_VALIDITY_DAYS * 86_400_000);
  let created: { id: string };
  try {
    const res = await auth.api.createUser({
      headers: await headers(),
      body: {
        name: data.name,
        email: data.email,
        password: tempPassword,
        role: "patient",
        data: { mustChangePassword: true, tempPasswordExpiresAt: expiresAt, createdById: viewer.user.id },
      },
    });
    created = { id: res.user.id };
  } catch (err) {
    if (err instanceof APIError) return { error: `Konto konnte nicht angelegt werden (${err.message}).` };
    throw err;
  }

  await withActor(viewer.actor, async (tx) => {
    // better-auth setzt die Zusatzfelder bereits; sicherheitshalber nachziehen, falls ein Feld nicht durchgereicht wurde
    await tx.update(userTable).set({ mustChangePassword: true, tempPasswordExpiresAt: expiresAt, createdById: viewer.user.id }).where(eq(userTable.id, created.id));
    if (data.goal || data.movementProfile || data.opContext) {
      await tx.insert(patientProfileVersions).values({
        patientId: created.id,
        version: 1,
        goal: data.goal || null,
        movementProfile: data.movementProfile || null,
        opContext: data.opContext,
        createdBy: viewer.user.id,
      });
    }
  });

  return { created: { id: created.id, name: data.name, email: data.email, tempPassword, expires: formatDate(expiresAt.toISOString().slice(0, 10)) } };
}
