"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { APIError } from "better-auth/api";
import { auth } from "@/lib/auth/auth";
import { requireSessionUser } from "@/lib/auth/session";
import { withActor } from "@/db/client";
import { user as userTable } from "@/db/schema";

export type ChangePasswordState = {
  error?: string;
  fieldErrors?: { next?: string; confirm?: string };
};

export async function changePasswordAction(_prev: ChangePasswordState, form: FormData): Promise<ChangePasswordState> {
  const viewer = await requireSessionUser();
  const current = String(form.get("current") ?? "");
  const next = String(form.get("next") ?? "");
  const confirm = String(form.get("confirm") ?? "");

  if (next.length < 10) return { fieldErrors: { next: "Mindestens 10 Zeichen." } };
  if (next.length > 128) return { fieldErrors: { next: "Höchstens 128 Zeichen." } };
  if (next !== confirm) return { fieldErrors: { confirm: "Die Passwörter stimmen nicht überein." } };
  if (next === current) return { fieldErrors: { next: "Das neue Passwort muss sich vom bisherigen unterscheiden." } };

  try {
    await auth.api.changePassword({
      headers: await headers(),
      body: { currentPassword: current, newPassword: next, revokeOtherSessions: true },
    });
  } catch (err) {
    if (err instanceof APIError) {
      return { error: err.status === 429 ? "Zu viele Versuche. Bitte kurz warten." : "Das aktuelle Passwort ist nicht korrekt." };
    }
    throw err;
  }

  if (viewer.user.mustChangePassword) {
    await withActor(viewer.actor, async (tx) => {
      await tx
        .update(userTable)
        .set({ mustChangePassword: false, tempPasswordExpiresAt: null, updatedAt: new Date() })
        .where(eq(userTable.id, viewer.user.id));
    });
  }

  redirect(viewer.user.role === "praxis" ? "/praxis" : "/app");
}
