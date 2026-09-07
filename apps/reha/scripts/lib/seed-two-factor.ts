/**
 * Hinterlegt für ein geseedetes Praxis-Konto den festen Test-TOTP-Schlüssel – so, wie
 * better-auth ihn beim regulären Einrichten speichern würde (Secret und Ersatzcodes
 * symmetrisch mit BETTER_AUTH_SECRET verschlüsselt, Konto auf twoFactorEnabled).
 * Nur lokal/Staging; der Aufrufer prüft NODE_ENV.
 */
import { generateRandomString, symmetricEncrypt } from "better-auth/crypto";
import { eq } from "drizzle-orm";
import { seedTotpSecret } from "@ak-physio/testdata";
import { auth } from "../../src/lib/auth/auth";
import { db } from "../../src/db/client";
import * as t from "../../src/db/schema";

export async function ensureSeededTwoFactor(userId: string): Promise<void> {
  const ctx = await auth.$context;
  const key = ctx.secretConfig;
  const secret = await symmetricEncrypt({ key, data: seedTotpSecret });
  const codes = Array.from({ length: 10 }, () => generateRandomString(10, "a-z", "0-9", "A-Z")).map(
    (c) => `${c.slice(0, 5)}-${c.slice(5)}`,
  );
  const backupCodes = await symmetricEncrypt({ key, data: JSON.stringify(codes) });

  const existing = await db.select({ id: t.twoFactor.id }).from(t.twoFactor).where(eq(t.twoFactor.userId, userId));
  const row = { secret, backupCodes, verified: true, failedVerificationCount: 0, lockedUntil: null };
  if (existing[0]) {
    await db.update(t.twoFactor).set(row).where(eq(t.twoFactor.id, existing[0].id));
  } else {
    await db.insert(t.twoFactor).values({ id: generateRandomString(32), userId, ...row });
  }
  await db.update(t.user).set({ twoFactorEnabled: true }).where(eq(t.user.id, userId));
}
