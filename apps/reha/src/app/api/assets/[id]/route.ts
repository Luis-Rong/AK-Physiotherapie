import { readFile } from "node:fs/promises";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth/auth";
import { db } from "@/db/client";
import { contentAssets } from "@/db/schema";

/** Bilder nur für eingeloggte Nutzer, nie über Dauerlinks (portal-konzept.md Abschnitt 3). */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return new Response("Unauthorized", { status: 401 });
  const { id } = await ctx.params;
  if (!/^[0-9a-f-]{36}$/.test(id)) return new Response("Not found", { status: 404 });
  const [asset] = await db.select().from(contentAssets).where(eq(contentAssets.id, id)).limit(1);
  if (!asset) return new Response("Not found", { status: 404 });
  try {
    const bytes = await readFile(asset.storedPath);
    return new Response(new Uint8Array(bytes), {
      headers: {
        "Content-Type": asset.mime,
        "Content-Length": String(bytes.length),
        "Cache-Control": "private, max-age=3600",
        "X-Content-Type-Options": "nosniff",
        "Content-Disposition": "inline",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
