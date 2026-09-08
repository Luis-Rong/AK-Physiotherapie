import "server-only";
import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { contentVersions, user } from "@/db/schema";

/** Name der Autorin/des Autors einer Inhaltsversion – wird im Patientenbereich als Quelle genannt (ADR 0012). */
export async function getAuthorName(authorId: string | null): Promise<string | null> {
  if (!authorId) return null;
  const [row] = await db.select({ name: user.name }).from(user).where(eq(user.id, authorId)).limit(1);
  return row?.name ?? null;
}
import type { Doc } from "@/lib/content/types";

export type ContentVersion = Omit<typeof contentVersions.$inferSelect, "body"> & { body: Doc };

/** Aktuellste Version je Slug (alle Status), für die Praxis. */
export async function listCurrentContent(): Promise<ContentVersion[]> {
  const rows = await db.select().from(contentVersions).orderBy(asc(contentVersions.slug), desc(contentVersions.version));
  const seen = new Set<string>();
  const out: ContentVersion[] = [];
  for (const r of rows) {
    if (seen.has(r.slug)) continue;
    seen.add(r.slug);
    out.push(r as ContentVersion);
  }
  return out.sort((a, b) => a.category.localeCompare(b.category) || a.position - b.position || a.title.localeCompare(b.title));
}

/** Aktuell veröffentlichte Fassung je Slug: die höchste Version mit Status published,
 *  sofern keine spätere Version archiviert wurde. */
export async function listPublishedContent(): Promise<ContentVersion[]> {
  const rows = await db.select().from(contentVersions).orderBy(asc(contentVersions.slug), desc(contentVersions.version));
  const bySlug = new Map<string, typeof rows>();
  for (const r of rows) bySlug.set(r.slug, [...(bySlug.get(r.slug) ?? []), r]);
  const out: ContentVersion[] = [];
  for (const versions of bySlug.values()) {
    for (const v of versions) {
      if (v.status === "archived") break;
      if (v.status === "published") {
        out.push(v as ContentVersion);
        break;
      }
    }
  }
  return out.sort((a, b) => a.category.localeCompare(b.category) || a.position - b.position || a.title.localeCompare(b.title));
}

export async function getPublishedBySlug(slug: string): Promise<ContentVersion | null> {
  const all = await listPublishedContent();
  return all.find((c) => c.slug === slug) ?? null;
}

export async function getCurrentBySlug(slug: string): Promise<ContentVersion | null> {
  const [row] = await db.select().from(contentVersions).where(eq(contentVersions.slug, slug)).orderBy(desc(contentVersions.version)).limit(1);
  return (row as ContentVersion | undefined) ?? null;
}

export async function listContentHistory(slug: string): Promise<ContentVersion[]> {
  const rows = await db.select().from(contentVersions).where(eq(contentVersions.slug, slug)).orderBy(desc(contentVersions.version));
  return rows as ContentVersion[];
}
