"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireViewer } from "@/lib/auth/session";
import { withActor } from "@/db/client";
import { contentVersions } from "@/db/schema";
import { getCurrentBySlug } from "@/lib/data/content";
import { CONTENT_CATEGORIES } from "@/lib/labels";
import { sanitizeDoc } from "@/lib/content/sanitize";

export type ContentState = { error?: string; saved?: { version: number; status: string } };

const schema = z.object({
  slug: z.string().regex(/^[a-z0-9-]{2,80}$/).nullable(),
  title: z.string().trim().min(2).max(160),
  category: z.enum(CONTENT_CATEGORIES as [string, ...string[]]),
  position: z.coerce.number().int().min(0).max(999),
  status: z.enum(["draft", "published", "archived"]),
});

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Speichert eine neue Fassung (Entwurf, veröffentlicht oder archiviert). */
export async function saveContentAction(_prev: ContentState, form: FormData): Promise<ContentState> {
  const viewer = await requireViewer("praxis");
  const parsed = schema.safeParse({
    slug: form.get("slug") ? String(form.get("slug")) : null,
    title: form.get("title"),
    category: form.get("category"),
    position: form.get("position") ?? 0,
    status: form.get("status"),
  });
  if (!parsed.success) return { error: "Bitte Titel, Kategorie und Status prüfen." };
  let body: unknown;
  try {
    body = JSON.parse(String(form.get("body") ?? ""));
  } catch {
    return { error: "Inhalt konnte nicht gelesen werden." };
  }
  const clean = sanitizeDoc(body);
  if (!clean) return { error: "Inhalt hat ein unbekanntes Format." };
  const d = parsed.data;

  let slug = d.slug;
  let previous = slug ? await getCurrentBySlug(slug) : null;
  if (!slug) {
    const base = slugify(d.title) || "kapitel";
    slug = base;
    let n = 2;
    while (await getCurrentBySlug(slug)) slug = `${base}-${n++}`;
    previous = null;
  }
  const version = (previous?.version ?? 0) + 1;

  await withActor(viewer.actor, async (tx) => {
    await tx.insert(contentVersions).values({
      slug: slug!,
      version,
      supersedesId: previous?.id ?? null,
      title: d.title,
      category: d.category,
      position: d.position,
      body: clean,
      status: d.status,
      authorId: viewer.user.id,
    });
  });
  revalidatePath("/praxis/wissen");
  revalidatePath("/app/wissen");
  if (!d.slug) redirect(`/praxis/wissen/${slug}`);
  return { saved: { version, status: d.status } };
}
