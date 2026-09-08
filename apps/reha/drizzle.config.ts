import { defineConfig } from "drizzle-kit";

/**
 * Migrationen liegen als SQL in src/db/migrations und werden von Hand gepflegt
 * (Rollen, GRANTs, Trigger – ADR 0002). drizzle-kit dient nur zum Generieren
 * eines Schema-Diffs als Vorlage; die Datei wird danach ergänzt, nie blind übernommen.
 */
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema/index.ts",
  out: "./src/db/migrations",
  dbCredentials: { url: process.env.DATABASE_URL_OWNER ?? "" },
  strict: true,
  verbose: true,
});
