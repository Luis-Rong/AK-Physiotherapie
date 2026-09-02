"use server";

import { redirect } from "next/navigation";
import { requireSessionUser } from "@/lib/auth/session";
import { withActor } from "@/db/client";
import { consents } from "@/db/schema";
import { CONSENT_KEY, CONSENT_VERSION } from "@/lib/consent/document";

export type ConsentState = { error?: string };

export async function acceptConsentAction(_prev: ConsentState, form: FormData): Promise<ConsentState> {
  const viewer = await requireSessionUser();
  if (form.get("accept") !== "yes") return { error: "Bitte bestätigen Sie die Einwilligung." };
  await withActor(viewer.actor, async (tx) => {
    await tx.insert(consents).values({
      userId: viewer.user.id,
      documentKey: CONSENT_KEY,
      documentVersion: CONSENT_VERSION,
      decision: "accepted",
      ip: viewer.actor.ip ?? null,
      userAgent: viewer.actor.userAgent?.slice(0, 300) ?? null,
    });
  });
  redirect(viewer.user.role === "praxis" ? "/praxis" : "/app");
}
