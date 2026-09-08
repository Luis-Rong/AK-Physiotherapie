/**
 * `pnpm db:reset` – leert alle Tabellen (nur lokal/Staging). TRUNCATE umgeht die
 * append-only-Trigger bewusst: Das ist das Werkzeug für Testumgebungen, nie für Prod.
 */
import "./lib/env";
import { Client } from "pg";

async function main() {
  if (process.env.NODE_ENV === "production") throw new Error("Nicht in Produktion.");
  const c = new Client({ connectionString: process.env.DATABASE_URL_OWNER });
  await c.connect();
  const tables = (
    await c.query<{ tablename: string }>(
      "SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename <> 'schema_migrations'",
    )
  ).rows.map((r) => `"${r.tablename}"`);
  await c.query(`TRUNCATE ${tables.join(", ")} RESTART IDENTITY CASCADE`);
  await c.end();
  console.log(`Geleert: ${tables.length} Tabellen`);
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
