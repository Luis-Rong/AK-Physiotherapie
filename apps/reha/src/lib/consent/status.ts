import { and, desc, eq } from "drizzle-orm";
import { cache } from "react";
import { db } from "@/db/client";
import { consents } from "@/db/schema";
import { CONSENT_KEY, CONSENT_VERSION } from "./document";

/** Gilt die aktuelle Fassung der Einwilligung für diesen Nutzer als angenommen? */
export const hasCurrentConsent = cache(async (userId: string): Promise<boolean> => {
  const rows = await db
    .select({ decision: consents.decision, version: consents.documentVersion })
    .from(consents)
    .where(and(eq(consents.userId, userId), eq(consents.documentKey, CONSENT_KEY)))
    .orderBy(desc(consents.createdAt))
    .limit(1);
  const latest = rows[0];
  return !!latest && latest.decision === "accepted" && latest.version === CONSENT_VERSION;
});
