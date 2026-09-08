/**
 * `pnpm db:seed` – füllt eine leere Datenbank mit synthetischen Daten aus
 * packages/testdata. Nur für lokal und Staging. Bricht ab, wenn schon Konten existieren.
 */
import "./lib/env";
import { seedAccounts, seedExercises, seedSupplements, seedTotpSecret, seedWeeks } from "@ak-physio/testdata";
import { eq, sql } from "drizzle-orm";
import { auth } from "../src/lib/auth/auth";
import { db, withActor } from "../src/db/client";
import * as t from "../src/db/schema";
import { CONSENT_KEY, CONSENT_VERSION } from "../src/lib/consent/document";
import { seedContent } from "../content-seed";
import { ensureSeededTwoFactor } from "./lib/seed-two-factor";
import { base32Encode } from "./lib/totp";

/** Für geseedete Praxis-Konten den festen Test-TOTP-Schlüssel setzen (auch nachträglich). */
async function syncSeededTwoFactor(): Promise<void> {
  for (const a of seedAccounts.filter((a) => a.twoFactorSeeded)) {
    const [u] = await db.select({ id: t.user.id }).from(t.user).where(eq(t.user.email, a.email)).limit(1);
    if (!u) continue;
    await ensureSeededTwoFactor(u.id);
    console.log(`2FA-Test-Schlüssel gesetzt für ${a.email} (Code: pnpm totp)`);
  }
}

function printAccounts(): void {
  console.log("Konten:");
  for (const a of seedAccounts) {
    const hint = a.mustChangePassword ? "  (temporär)" : a.twoFactorSeeded ? "  (2FA: pnpm totp)" : "";
    console.log(`  ${a.role.padEnd(8)} ${a.email.padEnd(24)} ${a.password}${hint}`);
  }
  console.log(`  2FA-Schlüssel für die Authenticator-App: ${base32Encode(seedTotpSecret)}`);
}

function mondayOfWeek(offsetWeeks: number): string {
  const d = new Date();
  const day = (d.getDay() + 6) % 7; // 0 = Montag
  d.setDate(d.getDate() - day + offsetWeeks * 7);
  return d.toISOString().slice(0, 10);
}

async function main() {
  if (process.env.NODE_ENV === "production") throw new Error("Seed läuft nicht in Produktion (Regel 1).");
  const existing = await db.select({ n: sql<number>`count(*)` }).from(t.user);
  if (Number(existing[0]?.n ?? 0) > 0) {
    console.log("Datenbank enthält bereits Konten, Seed übersprungen.");
    await syncSeededTwoFactor();
    printAccounts();
    return;
  }

  const ctx = await auth.$context;
  const ids = new Map<string, string>();
  for (const a of seedAccounts) {
    const created = await ctx.internalAdapter.createUser({
      name: a.name,
      email: a.email,
      emailVerified: true,
      role: a.role,
      mustChangePassword: a.mustChangePassword,
      tempPasswordExpiresAt: a.mustChangePassword ? new Date(Date.now() + 7 * 86_400_000) : null,
    }, { method: "admin" });
    ids.set(a.id, created.id);
    await ctx.internalAdapter.linkAccount({
      userId: created.id,
      issuer: "local:credential",
      providerId: "credential",
      accountId: created.id,
      password: await ctx.password.hash(a.password),
    });
    if (a.twoFactorSeeded) await ensureSeededTwoFactor(created.id);
  }
  const physioSeed = seedAccounts.find((a) => a.id === "seed-praxis-1")!;
  const maraSeed = seedAccounts.find((a) => a.id === "seed-patient-1")!;
  const physio = { id: ids.get(physioSeed.id)! };
  const mara = { id: ids.get(maraSeed.id)! };
  const actor = { actorId: physio.id, ip: "127.0.0.1", userAgent: "seed" };

  await withActor(actor, async (tx) => {
    // Einwilligung für Mara, damit sie direkt ins Portal kommt
    await tx.insert(t.consents).values({
      userId: mara.id,
      documentKey: CONSENT_KEY,
      documentVersion: CONSENT_VERSION,
      decision: "accepted",
      ip: "127.0.0.1",
      userAgent: "seed",
    });

    const exRows = await tx
      .insert(t.exercises)
      .values(seedExercises.map((e) => ({ ...e, createdBy: physio.id })))
      .returning({ id: t.exercises.id, name: t.exercises.name });
    const exByName = new Map(exRows.map((r) => [r.name, r.id]));

    await tx.insert(t.patientProfileVersions).values({
      patientId: mara.id,
      version: 1,
      goal: "Nach Kreuzband-OP zurück zum Fußball (Return to Sport)",
      movementProfile: "Fußball Kreisliga, 3× Training/Woche, keine Vorerkrankungen",
      krsStage: 2,
      opContext: true,
      calorieTarget: 2300,
      proteinTargetG: 130,
      createdBy: physio.id,
    });

    for (const [i, w] of seedWeeks.entries()) {
      const [week] = await tx
        .insert(t.planWeekVersions)
        .values({
          patientId: mara.id,
          weekNumber: w.weekNumber,
          startsOn: mondayOfWeek(i - 1),
          version: 1,
          goal: w.goal,
          notes: w.notes ?? null,
          trainingDays: w.trainingDays,
          createdBy: physio.id,
        })
        .returning({ id: t.planWeekVersions.id });
      const rows = [
        ...w.warmup.map((e, p) => ({ section: "warmup", position: p, ...e })),
        ...w.main.map((e, p) => ({ section: "main", position: p, ...e })),
        ...w.cooldown.map((e, p) => ({ section: "cooldown", position: p, ...e })),
      ];
      await tx.insert(t.planWeekExercises).values(
        rows.map((r) => ({
          weekVersionId: week!.id,
          section: r.section,
          position: r.position,
          exerciseId: exByName.get(r.name) ?? null,
          name: r.name,
          duration: "duration" in r ? (r.duration ?? null) : null,
          weight: "weight" in r ? (r.weight ?? null) : null,
          reps: "reps" in r ? (r.reps ?? null) : null,
          sets: r.sets ?? null,
          remarks: r.remarks ?? null,
        })),
      );
    }

    const [plan] = await tx
      .insert(t.supplementPlanVersions)
      .values({ patientId: mara.id, version: 1, createdBy: physio.id })
      .returning({ id: t.supplementPlanVersions.id });
    await tx.insert(t.supplementPlanItems).values(
      seedSupplements.map((s, p) => ({ planVersionId: plan!.id, position: p, ...s })),
    );

    await tx.insert(t.assessments).values([
      { patientId: mara.id, name: "Kniebeugung (Goniometer)", assessedOn: mondayOfWeek(-1), side: "links", score: "95°", createdBy: physio.id },
      { patientId: mara.id, name: "Kniebeugung (Goniometer)", assessedOn: mondayOfWeek(-1), side: "rechts", score: "135°", createdBy: physio.id },
    ]);
  });

  // Wissensinhalte aus dem PDF: als Entwurf (ADR 0009); lokal/staging zusätzlich eine
  // veröffentlichte Fassung, damit der Patientenbereich etwas zu zeigen hat
  await withActor(actor, async (tx) => {
    for (const c of seedContent) {
      await tx.insert(t.contentVersions).values({ slug: c.slug, version: 1, title: c.title, category: c.category, position: c.position, body: c.body, status: "draft", authorId: physio.id });
      if (process.env.SEED_PUBLISH_CONTENT !== "false") {
        await tx.insert(t.contentVersions).values({ slug: c.slug, version: 2, title: c.title, category: c.category, position: c.position, body: c.body, status: "published", authorId: physio.id });
      }
    }
  });

  // Ein paar Patienteneinträge von Mara aus der Vorwoche
  const maraActor = { actorId: mara.id, ip: "127.0.0.1", userAgent: "seed" };
  await withActor(maraActor, async (tx) => {
    const [week] = await tx.select().from(t.planWeekVersions).where(eq(t.planWeekVersions.weekNumber, 1)).limit(1);
    if (!week) return;
    const exs = await tx.select().from(t.planWeekExercises).where(eq(t.planWeekExercises.weekVersionId, week.id));
    const dates = [1, 3, 5].map((dow) => {
      const d = new Date(week.startsOn);
      d.setDate(d.getDate() + dow - 1);
      return d.toISOString().slice(0, 10);
    });
    const pains = [
      [3, 2, 1],
      [4, 3, 2],
      [2, 2, 1],
    ];
    for (const [i, date] of dates.entries()) {
      const [log] = await tx
        .insert(t.trainingLogs)
        .values({ patientId: mara.id, weekVersionId: week.id, logDate: date, createdBy: mara.id })
        .returning({ id: t.trainingLogs.id });
      await tx.insert(t.trainingLogItems).values(exs.map((e, j) => ({ logId: log!.id, weekExerciseId: e.id, done: !(i === 1 && j === exs.length - 1) })));
      const [during, after, morning] = pains[i]!;
      await tx.insert(t.painEntries).values([
        { patientId: mara.id, trainingLogId: log!.id, entryDate: date, phase: "during", nprs: during!, createdBy: mara.id },
        { patientId: mara.id, trainingLogId: log!.id, entryDate: date, phase: "after", nprs: after!, createdBy: mara.id },
        { patientId: mara.id, trainingLogId: log!.id, entryDate: date, phase: "next_morning", nprs: morning!, createdBy: mara.id },
      ]);
    }
  });

  console.log("Seed fertig.");
  printAccounts();
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
