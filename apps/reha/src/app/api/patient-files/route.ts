import { createHash, randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { withActor } from "@/db/client";
import { patientFiles } from "@/db/schema";
import { getPatient } from "@/lib/data/patients";

const MAX_BYTES = 10 * 1024 * 1024;
const TYPES: Record<string, string> = { "application/pdf": "pdf", "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp" };

/**
 * Datei für einen Patienten hinterlegen (PDF, PNG, JPEG, WebP; max. 10 MB). Nur Praxis.
 * Die Datei liegt unter UPLOAD_DIR/patienten/<id>/, der Datensatz ist append-only (ADR 0002).
 */
export async function POST(req: Request) {
  const h = await headers();
  const session = await auth.api.getSession({ headers: h });
  if (!session || session.user.role !== "praxis") return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const form = await req.formData();
  const file = form.get("file");
  const patientId = String(form.get("patientId") ?? "");
  const note = String(form.get("note") ?? "").trim().slice(0, 300);
  if (!(file instanceof File)) return NextResponse.json({ error: "no file" }, { status: 400 });
  const patient = await getPatient(patientId);
  if (!patient) return NextResponse.json({ error: "patient" }, { status: 404 });
  const ext = TYPES[file.type];
  if (!ext) return NextResponse.json({ error: "type" }, { status: 415 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "size" }, { status: 413 });

  const bytes = Buffer.from(await file.arrayBuffer());
  const magicOk =
    (ext === "pdf" && bytes.subarray(0, 5).toString("ascii") === "%PDF-") ||
    (ext === "png" && bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) ||
    (ext === "jpg" && bytes[0] === 0xff && bytes[1] === 0xd8) ||
    (ext === "webp" && bytes.subarray(0, 4).toString("ascii") === "RIFF" && bytes.subarray(8, 12).toString("ascii") === "WEBP");
  if (!magicOk) return NextResponse.json({ error: "type" }, { status: 415 });

  const dir = path.resolve(process.env.UPLOAD_DIR ?? "./data/uploads", "patienten", patientId);
  await mkdir(dir, { recursive: true });
  const id = randomUUID();
  const storedPath = path.join(dir, `${id}.${ext}`);
  await writeFile(storedPath, bytes);

  await withActor({ actorId: session.user.id, ip: h.get("x-forwarded-for"), userAgent: h.get("user-agent") }, async (tx) => {
    await tx.insert(patientFiles).values({
      id,
      patientId,
      filename: file.name.slice(0, 200),
      mime: file.type,
      size: bytes.length,
      sha256: createHash("sha256").update(bytes).digest("hex"),
      storedPath,
      note: note || null,
      createdBy: session.user.id,
    });
  });
  return NextResponse.json({ id });
}
