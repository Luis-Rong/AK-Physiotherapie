import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { auth, type Role, type SessionUser } from "./auth";
import type { ActorContext } from "@/db/client";
import { hasCurrentConsent } from "@/lib/consent/status";

/** Sitzung einmal pro Request laden (React cache dedupliziert innerhalb eines Renders). */
export const getSession = cache(async () => {
  const h = await headers();
  return auth.api.getSession({ headers: h });
});

export type Viewer = {
  user: SessionUser;
  sessionId: string;
  actor: ActorContext;
};

async function actorFrom(user: SessionUser): Promise<ActorContext> {
  const h = await headers();
  return {
    actorId: user.id,
    ip: h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? null,
    userAgent: h.get("user-agent"),
  };
}

function tempPasswordExpired(user: SessionUser): boolean {
  if (!user.mustChangePassword || !user.tempPasswordExpiresAt) return false;
  return new Date(user.tempPasswordExpiresAt).getTime() < Date.now();
}

/**
 * Erzwingt eine gültige Sitzung mit der geforderten Rolle und den Onboarding-Schritten
 * aus ADR 0005: Passwortwechsel, 2FA für die Praxis, Einwilligung für Patienten.
 * Wird in den Layouts von /app und /praxis aufgerufen; Server Actions rufen es erneut auf.
 */
export async function requireViewer(role: Role): Promise<Viewer> {
  const viewer = await requireSessionUser();
  const user = viewer.user;
  if (user.role !== role) {
    redirect(user.role === "praxis" ? "/praxis" : "/app");
  }
  if (user.mustChangePassword) redirect("/passwort-aendern");
  if (role === "praxis" && !user.twoFactorEnabled) redirect("/2fa-einrichten");
  if (role === "patient" && !(await hasCurrentConsent(user.id))) redirect("/einwilligung");
  return viewer;
}

/** Für Onboarding-Seiten: eingeloggt, aber Schritte noch offen. */
export async function requireSessionUser(): Promise<Viewer> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (tempPasswordExpired(session.user)) {
    await auth.api.signOut({ headers: await headers() });
    redirect("/login?grund=abgelaufen");
  }
  return { user: session.user, sessionId: session.session.id, actor: await actorFrom(session.user) };
}
