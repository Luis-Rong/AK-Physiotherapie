import { drizzle } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";
import { Pool } from "pg";
import * as schema from "./schema";

/**
 * Verbindung der Anwendung mit der eingeschränkten Rolle reha_app.
 * Der Pool wird in der Dev-Umgebung am globalThis gehalten, damit Hot Reload
 * keine Verbindungen leckt.
 */
declare global {
  var __rehaPool: Pool | undefined;
}

function createPool() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL ist nicht gesetzt");
  return new Pool({ connectionString: url, max: 10 });
}

export const pool = globalThis.__rehaPool ?? createPool();
if (process.env.NODE_ENV !== "production") globalThis.__rehaPool = pool;

export const db = drizzle(pool, { schema, casing: "snake_case" });
export type Db = typeof db;
export type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];

export type ActorContext = {
  actorId: string | null;
  ip?: string | null;
  userAgent?: string | null;
};

/**
 * Schreibvorgang in einer Transaktion, in der der Audit-Trigger Akteur, IP und
 * User-Agent kennt (ADR 0002: wer, wann, was, von wo).
 */
export async function withActor<T>(ctx: ActorContext, fn: (tx: Tx) => Promise<T>): Promise<T> {
  return db.transaction(async (tx) => {
    await tx.execute(sql`SELECT set_config('app.actor_id', ${ctx.actorId ?? ""}, true)`);
    await tx.execute(sql`SELECT set_config('app.ip', ${ctx.ip ?? ""}, true)`);
    await tx.execute(sql`SELECT set_config('app.ua', ${(ctx.userAgent ?? "").slice(0, 300)}, true)`);
    return fn(tx);
  });
}
