/**
 * Führt die SQL-Migrationen aus src/db/migrations in Dateinamensreihenfolge aus.
 * Läuft mit der Owner-Verbindung. Jede Datei wird in einer Transaktion angewendet
 * und in schema_migrations vermerkt.
 */
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { Client } from "pg";

export async function runMigrations(ownerUrl: string, dir = path.resolve(__dirname, "../../src/db/migrations")) {
  const client = new Client({ connectionString: ownerUrl });
  await client.connect();
  const applied: string[] = [];
  try {
    await client.query(
      "CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())",
    );
    const done = new Set(
      (await client.query("SELECT name FROM schema_migrations")).rows.map((r: { name: string }) => r.name),
    );
    const files = readdirSync(dir)
      .filter((f) => f.endsWith(".sql"))
      .sort();
    for (const file of files) {
      if (done.has(file)) continue;
      const sql = readFileSync(path.join(dir, file), "utf8");
      await client.query("BEGIN");
      try {
        await client.query(sql);
        await client.query("INSERT INTO schema_migrations (name) VALUES ($1)", [file]);
        await client.query("COMMIT");
        applied.push(file);
      } catch (err) {
        await client.query("ROLLBACK");
        throw new Error(`Migration ${file} fehlgeschlagen: ${(err as Error).message}`);
      }
    }
  } finally {
    await client.end();
  }
  return applied;
}
