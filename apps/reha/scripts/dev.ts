/**
 * `pnpm dev` – startet das eingebettete Postgres (wie `db:local`), wendet Migrationen an,
 * seedet bei Bedarf und startet danach `next dev`. Ein Befehl, eine Datenbank, ein Server –
 * kein zweites Terminal mehr nötig.
 *
 * Port: Next liest PORT aus der Umgebung (Standard 3000). Damit better-auth die
 * Anfragen des Browsers akzeptiert, wird BETTER_AUTH_URL auf denselben Port gesetzt,
 * sofern es auf localhost zeigt.
 */
import "./lib/env";
import { spawn } from "node:child_process";
import { startEmbedded } from "./lib/embedded";
import { runMigrations } from "./lib/migrate";

function run(command: string, env: NodeJS.ProcessEnv = process.env): Promise<void> {
  return new Promise((resolve, reject) => {
    // Ein einzelner Befehlsstring mit shell:true, damit pnpm(.cmd) auch unter Windows startet.
    const child = spawn(command, { stdio: "inherit", shell: true, env });
    child.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`${command} beendet mit Code ${code}`))));
    child.on("error", reject);
  });
}

async function main() {
  const pgPort = Number(process.env.PGPORT ?? 5433);
  const handle = await startEmbedded({ dir: "./data/pg", port: pgPort });
  const applied = await runMigrations(handle.ownerUrl);
  console.log(`Postgres läuft auf 127.0.0.1:${pgPort}`);
  console.log(applied.length ? `Migrationen angewendet: ${applied.join(", ")}` : "Migrationen: alles aktuell");

  // Seed legt Testkonten an (oder gleicht den 2FA-Test-Schlüssel ab) und listet die Zugänge.
  await run("pnpm exec tsx scripts/seed.ts");

  const webPort = process.env.PORT ?? "3000";
  const env: NodeJS.ProcessEnv = { ...process.env, PORT: webPort };
  const authUrl = process.env.BETTER_AUTH_URL ?? "";
  if (!authUrl || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/?$/.test(authUrl)) {
    env.BETTER_AUTH_URL = `http://localhost:${webPort}`;
  }
  console.log(`Next startet auf http://localhost:${webPort} (BETTER_AUTH_URL=${env.BETTER_AUTH_URL})`);

  const stop = async () => {
    await handle.stop();
  };
  process.on("SIGINT", () => stop().finally(() => process.exit(0)));
  process.on("SIGTERM", () => stop().finally(() => process.exit(0)));

  try {
    await run("pnpm exec next dev", env);
  } finally {
    await stop();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
