// Migrationen im Container ausführen (Einmal-Dienst vor dem App-Start).
// Nutzt das im Standalone-Bundle enthaltene pg-Modul.
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

// pg so auflösen, wie es der Server selbst tut (Standalone-Bundle)
const require = createRequire(path.resolve("./apps/reha/server.js"));
const { Client } = require("pg");

const url = process.env.DATABASE_URL_OWNER;
if (!url) {
  console.error("DATABASE_URL_OWNER fehlt");
  process.exit(1);
}
const dir = path.resolve("./migrations");
const client = new Client({ connectionString: url });
await client.connect();
try {
  await client.query("CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())");
  const done = new Set((await client.query("SELECT name FROM schema_migrations")).rows.map((r) => r.name));
  for (const file of readdirSync(dir).filter((f) => f.endsWith(".sql")).sort()) {
    if (done.has(file)) continue;
    await client.query("BEGIN");
    try {
      await client.query(readFileSync(path.join(dir, file), "utf8"));
      await client.query("INSERT INTO schema_migrations (name) VALUES ($1)", [file]);
      await client.query("COMMIT");
      console.log("angewendet:", file);
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    }
  }
  console.log("Migrationen aktuell");
} finally {
  await client.end();
}
