import { readFile } from "node:fs/promises";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { getPatientFile } from "@/lib/data/files";

/** Datei nur für die Patientin / den Patienten selbst oder die Praxis; nie über Dauerlinks. */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return new Response("Unauthorized", { status: 401 });
  const { id } = await ctx.params;
  if (!/^[0-9a-f-]{36}$/.test(id)) return new Response("Not found", { status: 404 });
  const file = await getPatientFile(id);
  if (!file) return new Response("Not found", { status: 404 });
  const isOwner = session.user.id === file.patientId;
  const isPraxis = session.user.role === "praxis";
  if (!isOwner && !isPraxis) return new Response("Forbidden", { status: 403 });
  if (file.withdrawn && !isPraxis) return new Response("Not found", { status: 404 });
  try {
    const bytes = await readFile(file.storedPath);
    const safeName = file.filename.replace(/[^\w.\-äöüÄÖÜß ]/g, "_");
    return new Response(new Uint8Array(bytes), {
      headers: {
        "Content-Type": file.mime,
        "Content-Length": String(bytes.length),
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
        "Content-Disposition": `inline; filename="${safeName}"`,
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
