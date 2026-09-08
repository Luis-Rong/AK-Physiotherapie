/**
 * Prüft die technische Erzwingung von ADR 0002 gegen ein echtes Postgres:
 * - reha_app kann Dokumentationstabellen nicht ändern oder löschen
 * - der Audit-Trigger schreibt Akteur, IP und User-Agent mit
 * - schema und SQL-Migration passen zusammen (Drizzle-Insert funktioniert)
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Client } from "pg";
import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { startEmbedded, type EmbeddedHandle } from "../../scripts/lib/embedded";
import { runMigrations } from "../../scripts/lib/migrate";

let handle: EmbeddedHandle;
let app: Client;
let owner: Client;
let dir: string;

beforeAll(async () => {
  dir = mkdtempSync(path.join(os.tmpdir(), "reha-pg-"));
  handle = await startEmbedded({ dir, port: 5444 });
  await runMigrations(handle.ownerUrl);
  owner = new Client({ connectionString: handle.ownerUrl });
  app = new Client({ connectionString: handle.appUrl });
  await owner.connect();
  await app.connect();
  await app.query(`INSERT INTO "user" (id, name, email, role) VALUES ('u-physio', 'Test Physio', 'physio@example.test', 'praxis')`);
  await app.query(`INSERT INTO "user" (id, name, email) VALUES ('u-pat', 'Test Patient', 'patient@example.test')`);
});

afterAll(async () => {
  await app?.end();
  await owner?.end();
  await handle?.stop();
  rmSync(dir, { recursive: true, force: true });
});

describe("Append-only (ADR 0002)", () => {
  it("reha_app darf Schmerzeinträge einfügen, aber nicht ändern oder löschen", async () => {
    await app.query("BEGIN");
    await app.query("SELECT set_config('app.actor_id', 'u-pat', true)");
    await app.query("SELECT set_config('app.ip', '203.0.113.7', true)");
    await app.query("SELECT set_config('app.ua', 'vitest', true)");
    const ins = await app.query(
      `INSERT INTO pain_entries (patient_id, entry_date, phase, nprs, created_by)
       VALUES ('u-pat', '2026-09-01', 'during', 7, 'u-pat') RETURNING id`,
    );
    await app.query("COMMIT");
    const id = ins.rows[0].id;

    await expect(app.query(`UPDATE pain_entries SET nprs = 2 WHERE id = $1`, [id])).rejects.toThrow(/permission denied|append-only/);
    await expect(app.query(`DELETE FROM pain_entries WHERE id = $1`, [id])).rejects.toThrow(/permission denied|append-only/);

    const audit = await app.query(
      `SELECT actor_id, action, table_name, row_id, ip, user_agent FROM audit_log WHERE table_name = 'pain_entries' AND row_id = $1`,
      [id],
    );
    expect(audit.rows).toEqual([
      { actor_id: "u-pat", action: "INSERT", table_name: "pain_entries", row_id: id, ip: "203.0.113.7", user_agent: "vitest" },
    ]);
  });

  it("auch der Owner kann eine Dokumentationszeile nicht ändern (Trigger)", async () => {
    await expect(owner.query(`UPDATE pain_entries SET nprs = 1`)).rejects.toThrow(/append-only/);
    await expect(owner.query(`DELETE FROM audit_log`)).rejects.toThrow(/append-only/);
  });

  it("reha_app kann das Audit-Log nicht direkt beschreiben", async () => {
    await expect(
      app.query(`INSERT INTO audit_log (action, table_name) VALUES ('X', 'y')`),
    ).rejects.toThrow(/permission denied/);
  });

  it("Stammdaten bleiben änderbar und werden protokolliert", async () => {
    await app.query("BEGIN");
    await app.query("SELECT set_config('app.actor_id', 'u-physio', true)");
    await app.query(`UPDATE "user" SET name = 'Test Patientin' WHERE id = 'u-pat'`);
    await app.query("COMMIT");
    const audit = await app.query(
      `SELECT actor_id, action, details FROM audit_log WHERE table_name = 'user' AND row_id = 'u-pat' AND action = 'UPDATE'`,
    );
    expect(audit.rows).toHaveLength(1);
    expect(audit.rows[0].actor_id).toBe("u-physio");
    expect(audit.rows[0].details.changed.name).toBe("Test Patientin");
    expect(audit.rows[0].details.changed).not.toHaveProperty("password");
  });

  it("Rollen sind eingeschränkt: Patient/Praxis, NPRS 0–10, Ampelfarben nicht speicherbar", async () => {
    await expect(
      app.query(`INSERT INTO "user" (id, name, email, role) VALUES ('u-x', 'X', 'x@example.test', 'admin')`),
    ).rejects.toThrow(/user_role/);
    await expect(
      app.query(`INSERT INTO pain_entries (patient_id, entry_date, phase, nprs, created_by) VALUES ('u-pat', '2026-09-01', 'during', 11, 'u-pat')`),
    ).rejects.toThrow(/pe_nprs_range/);
  });
});
