import { existsSync, readFileSync, rmSync } from "node:fs";
import path from "node:path";

export default async function globalTeardown() {
  const handle = (globalThis as { __rehaE2E?: { stop: () => Promise<void> } }).__rehaE2E;
  if (handle) await handle.stop();
  const marker = path.join(process.cwd(), "data", "e2e-db.json");
  if (existsSync(marker)) {
    const { dir } = JSON.parse(readFileSync(marker, "utf8")) as { dir: string };
    rmSync(dir, { recursive: true, force: true });
    rmSync(marker, { force: true });
  }
}
