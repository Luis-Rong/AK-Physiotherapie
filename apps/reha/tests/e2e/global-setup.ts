import { mkdtempSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { execSync } from "node:child_process";
import { startEmbedded } from "../../scripts/lib/embedded";
import { runMigrations } from "../../scripts/lib/migrate";

/** Eigenes Postgres für E2E, Seed über das reguläre Skript (nur synthetische Daten). */
export default async function globalSetup() {
  const dir = mkdtempSync(path.join(os.tmpdir(), "reha-e2e-"));
  const handle = await startEmbedded({ dir, port: 5455 });
  await runMigrations(handle.ownerUrl);
  execSync("pnpm tsx scripts/seed.ts", {
    stdio: "inherit",
    env: {
      ...process.env,
      DATABASE_URL: handle.appUrl,
      DATABASE_URL_OWNER: handle.ownerUrl,
      BETTER_AUTH_SECRET: "e2e-only-secret-not-for-production-000000",
      BETTER_AUTH_URL: "http://127.0.0.1:3100",
      SEED_PUBLISH_CONTENT: "true",
    },
  });
  // Handle für den Teardown merken (Prozesse überleben den Setup-Prozess nicht, daher Datei)
  writeFileSync(path.join(process.cwd(), "data", "e2e-db.json"), JSON.stringify({ dir }));
  (globalThis as { __rehaE2E?: unknown }).__rehaE2E = handle;
}
