/**
 * `pnpm db:local` – startet ein lokales Postgres unter ./data/pg auf Port 5433,
 * legt Rollen und Datenbank an, wendet Migrationen an und bleibt laufen.
 * Passt zu den Werten in .env.example.
 */
import { startEmbedded } from "./lib/embedded";
import { runMigrations } from "./lib/migrate";

async function main() {
  const port = Number(process.env.PGPORT ?? 5433);
  const handle = await startEmbedded({ dir: "./data/pg", port });
  const applied = await runMigrations(handle.ownerUrl);
  console.log(`Postgres läuft auf 127.0.0.1:${port}`);
  console.log(`  App:   ${handle.appUrl}`);
  console.log(`  Owner: ${handle.ownerUrl}`);
  console.log(applied.length ? `Migrationen angewendet: ${applied.join(", ")}` : "Migrationen: alles aktuell");
  console.log("Beenden mit Strg+C.");

  const stop = async () => {
    await handle.stop();
    process.exit(0);
  };
  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);
  // am Leben halten
  setInterval(() => {}, 1 << 30);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
