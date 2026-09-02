"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { APIError } from "better-auth/api";
import { auth, TEMP_PASSWORD_VALIDITY_DAYS } from "@/lib/auth/auth";
import { requireViewer } from "@/lib/auth/session";
import { generateTempPassword } from "@/lib/auth/tempPassword";
import { db, withActor } from "@/db/client";
import { user as userTable } from "@/db/schema";
import { formatDate } from "@/lib/dates";

export type AccessState = { error?: string; tempPassword?: string; expires?: string };

async function requirePatient(id: string) {
  const [u] = await db.select({ id: userTable.id, role: userTable.role }).from(userTable).where(eq(userTable.id, id)).limit(1);
  if (!u || u.role !== "patient") throw new Error("Unbekanntes Patientenkonto");
  return u;
}

/** Neues temporäres Passwort (ADR 0005): alle Sitzungen beenden, Wechsel erzwingen. */
export async function resetPasswordAction(_prev: AccessState, form: FormData): Promise<AccessState> {
  const viewer = await requireViewer("praxis");
  const id = String(form.get("id"));
  await requirePatient(id);
  const tempPassword = generateTempPassword();
  const expiresAt = new Date(Date.now() + TEMP_PASSWORD_VALIDITY_DAYS * 86_400_000);
  try {
    const h = await headers();
    await auth.api.setUserPassword({ headers: h, body: { userId: id, newPassword: tempPassword } });
    await auth.api.revokeUserSessions({ headers: h, body: { userId: id } });
  } catch (err) {
    if (err instanceof APIError) return { error: `Zurücksetzen fehlgeschlagen (${err.message}).` };
    throw err;
  }
  await withActor(viewer.actor, async (tx) => {
    await tx.update(userTable).set({ mustChangePassword: true, tempPasswordExpiresAt: expiresAt, updatedAt: new Date() }).where(eq(userTable.id, id));
  });
  revalidatePath(`/praxis/patienten/${id}`);
  return { tempPassword, expires: formatDate(expiresAt.toISOString().slice(0, 10)) };
}

export async function banAction(_prev: AccessState, form: FormData): Promise<AccessState> {
  const viewer = await requireViewer("praxis");
  const id = String(form.get("id"));
  const reason = String(form.get("reason") ?? "").trim().slice(0, 200);
  await requirePatient(id);
  try {
    const h = await headers();
    await auth.api.banUser({ headers: h, body: { userId: id, banReason: reason || undefined } });
    await auth.api.revokeUserSessions({ headers: h, body: { userId: id } });
  } catch (err) {
    if (err instanceof APIError) return { error: `Sperren fehlgeschlagen (${err.message}).` };
    throw err;
  }
  // Audit-Trigger auf "user" protokolliert die Änderung; Akteur aus der Session nachtragen
  await withActor(viewer.actor, async (tx) => {
    await tx.update(userTable).set({ updatedAt: new Date() }).where(eq(userTable.id, id));
  });
  revalidatePath(`/praxis/patienten/${id}`);
  return {};
}

export async function unbanAction(_prev: AccessState, form: FormData): Promise<AccessState> {
  const viewer = await requireViewer("praxis");
  const id = String(form.get("id"));
  await requirePatient(id);
  try {
    await auth.api.unbanUser({ headers: await headers(), body: { userId: id } });
  } catch (err) {
    if (err instanceof APIError) return { error: `Entsperren fehlgeschlagen (${err.message}).` };
    throw err;
  }
  await withActor(viewer.actor, async (tx) => {
    await tx.update(userTable).set({ updatedAt: new Date() }).where(eq(userTable.id, id));
  });
  revalidatePath(`/praxis/patienten/${id}`);
  return {};
}
