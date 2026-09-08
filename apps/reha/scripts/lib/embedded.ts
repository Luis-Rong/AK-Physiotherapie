/**
 * Eingebettetes Postgres für lokale Entwicklung und Tests (kein Docker nötig).
 * Legt dieselben Rollen an wie docker/init/01-roles.sql, damit Rechte und
 * Append-only-Erzwingung lokal genauso greifen wie in Produktion.
 */
import EmbeddedPostgres from "embedded-postgres";
import { existsSync } from "node:fs";
import path from "node:path";
import { Client } from "pg";

export type EmbeddedOptions = {
  dir: string;
  port: number;
  ownerPassword?: string;
  appPassword?: string;
};

export type EmbeddedHandle = {
  stop: () => Promise<void>;
  ownerUrl: string;
  appUrl: string;
  superUrl: string;
};

export async function startEmbedded(opts: EmbeddedOptions): Promise<EmbeddedHandle> {
  const dir = path.resolve(opts.dir);
  const ownerPw = opts.ownerPassword ?? "reha_owner";
  const appPw = opts.appPassword ?? "reha_app";
  const pg = new EmbeddedPostgres({
    databaseDir: dir,
    user: "postgres",
    password: "postgres",
    port: opts.port,
    persistent: true,
    // UTF-8 erzwingen: Windows-initdb nimmt sonst WIN1252, und Zeichen wie „≥“ scheitern
    initdbFlags: ["--encoding=UTF8", "--locale=C", "--lc-messages=C"],
    // Logs des Servers nur bei Bedarf: onLog/onError bleiben still
    onLog: () => {},
    onError: () => {},
  });

  if (!existsSync(path.join(dir, "PG_VERSION"))) {
    await pg.initialise();
  }
  await pg.start();

  const superUrl = `postgres://postgres:postgres@127.0.0.1:${opts.port}/postgres`;
  const client = new Client({ connectionString: superUrl });
  await client.connect();
  try {
    const roles = await client.query("SELECT rolname FROM pg_roles WHERE rolname IN ('reha_owner','reha_app')");
    const have = new Set(roles.rows.map((r: { rolname: string }) => r.rolname));
    if (!have.has("reha_owner")) {
      await client.query(`CREATE ROLE reha_owner LOGIN PASSWORD '${ownerPw}'`);
    }
    if (!have.has("reha_app")) {
      await client.query(`CREATE ROLE reha_app LOGIN PASSWORD '${appPw}' NOSUPERUSER NOCREATEDB NOCREATEROLE`);
    }
    const dbs = await client.query("SELECT 1 FROM pg_database WHERE datname = 'reha'");
    if (dbs.rowCount === 0) {
      await client.query("CREATE DATABASE reha OWNER reha_owner");
    }
  } finally {
    await client.end();
  }

  const rehaSuper = new Client({ connectionString: `postgres://postgres:postgres@127.0.0.1:${opts.port}/reha` });
  await rehaSuper.connect();
  try {
    await rehaSuper.query("ALTER SCHEMA public OWNER TO reha_owner");
    await rehaSuper.query("REVOKE ALL ON SCHEMA public FROM PUBLIC");
    await rehaSuper.query("GRANT USAGE ON SCHEMA public TO reha_app");
  } finally {
    await rehaSuper.end();
  }

  return {
    stop: () => pg.stop(),
    superUrl,
    ownerUrl: `postgres://reha_owner:${ownerPw}@127.0.0.1:${opts.port}/reha`,
    appUrl: `postgres://reha_app:${appPw}@127.0.0.1:${opts.port}/reha`,
  };
}
