/**
 * `pnpm praxis:konto --name "Vorname Nachname" --email name@praxis.example`
 *
 * Legt das erste Praxiskonto an – der einzige Weg auf einem frischen System, ohne
 * SQL von Hand abzusetzen. Vergibt ein temporäres Passwort (7 Tage gültig, Wechsel
 * beim ersten Login erzwungen); den zweiten Faktor richtet die Person selbst ein.
 * Läuft mit DATABASE_URL (App-Rolle) und BETTER_AUTH_SECRET aus der Umgebung.
 */
import "./lib/env";
import { parseArgs } from "node:util";
import { eq } from "drizzle-orm";
import { auth, TEMP_PASSWORD_VALIDITY_DAYS } from "../src/lib/auth/auth";
import { generateTempPassword } from "../src/lib/auth/tempPassword";
import { db } from "../src/db/client";
import * as t from "../src/db/schema";

async function main() {
  const { values } = parseArgs({ options: { name: { type: "string" }, email: { type: "string" } } });
  const name = values.name?.trim();
  const email = values.email?.trim().toLowerCase();
  if (!name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.error('Aufruf: pnpm praxis:konto --name "Vorname Nachname" --email name@praxis.example');
    process.exit(1);
  }

  const [existing] = await db.select({ id: t.user.id }).from(t.user).where(eq(t.user.email, email)).limit(1);
  if (existing) {
    console.error(`Es gibt bereits ein Konto mit ${email}. Passwort-Reset läuft über den Praxisbereich.`);
    process.exit(1);
  }

  const ctx = await auth.$context;
  const tempPassword = generateTempPassword();
  const expiresAt = new Date(Date.now() + TEMP_PASSWORD_VALIDITY_DAYS * 86_400_000);
  const created = await ctx.internalAdapter.createUser(
    { name, email, emailVerified: true, role: "praxis", mustChangePassword: true, tempPasswordExpiresAt: expiresAt },
    { method: "admin" },
  );
  await ctx.internalAdapter.linkAccount({
    userId: created.id,
    issuer: "local:credential",
    providerId: "credential",
    accountId: created.id,
    password: await ctx.password.hash(tempPassword),
  });

  console.log("Praxiskonto angelegt.");
  console.log(`  Name:      ${name}`);
  console.log(`  E-Mail:    ${email}`);
  console.log(`  Passwort:  ${tempPassword}   (temporär, gültig bis ${expiresAt.toLocaleDateString("de-DE")})`);
  console.log("  Beim ersten Login: Passwort wechseln, dann zweiten Faktor einrichten.");
  console.log("  Das Passwort nur persönlich übergeben – nicht per Mail, nicht per Messenger.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
