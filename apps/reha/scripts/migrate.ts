/**
 * `pnpm db:migrate` – wendet ausstehende Migrationen mit DATABASE_URL_OWNER an.
 * In Docker läuft das als Einmal-Container vor dem App-Start.
 */
import "dotenv/config";
import { runMigrations } from "./lib/migrate";

const url = process.env.DATABASE_URL_OWNER;
if (!url) {
  console.error("DATABASE_URL_OWNER fehlt");
  process.exit(1);
}
runMigrations(url)
  .then((applied) => {
    console.log(applied.length ? `Angewendet: ${applied.join(", ")}` : "Alles aktuell");
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
