"use client";

import { useActionState, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { TableKit } from "@tiptap/extension-table";
import { Bold, Heading2, Heading3, ImagePlus, Italic, List, ListOrdered, Quote, Redo2, Table as TableIcon, Undo2 } from "lucide-react";
import { saveContentAction, type ContentState } from "./actions";
import { BausteinNode, CalloutNode } from "@/lib/content/tiptap-extensions";
import { BAUSTEINE, type Doc } from "@/lib/content/types";
import { CONTENT_CATEGORIES, CONTENT_CATEGORY_LABEL } from "@/lib/labels";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { Alert, Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";

type Initial = { title: string; category: string; position: number; body: Doc; status: string };

export function ContentEditor({ slug, initial }: { slug: string | null; initial: Initial }) {
  const [state, action, pending] = useActionState(saveContentAction, {} as ContentState);
  const bodyRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3, 4] }, link: { openOnClick: false, autolink: false, validate: (href) => href.startsWith("/") } }),
      Image.configure({ inline: false, allowBase64: false }),
      TableKit.configure({ table: { resizable: false } }),
      BausteinNode,
      CalloutNode,
    ],
    content: initial.body,
    editorProps: { attributes: { class: "tiptap-editor" } },
  });

  async function upload(file: File) {
    setUploadError(null);
    const fd = new FormData();
    fd.set("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    if (!res.ok) {
      setUploadError(res.status === 413 ? "Bild ist zu groß (max. 5 MB)." : "Upload fehlgeschlagen.");
      return;
    }
    const { url } = (await res.json()) as { url: string };
    editor?.chain().focus().setImage({ src: url, alt: file.name.replace(/\.[a-z0-9]+$/i, "") }).run();
  }

  const tb = (active: boolean) => cn("h-9 w-9 rounded-[6px] grid place-items-center text-ink-soft hover:bg-sand", active && "bg-bark-soft text-bark");

  return (
    <form
      action={action}
      onSubmit={() => {
        if (bodyRef.current && editor) bodyRef.current.value = JSON.stringify(editor.getJSON());
      }}
      className="space-y-4"
    >
      {slug && <input type="hidden" name="slug" value={slug} />}
      <input type="hidden" name="body" ref={bodyRef} />
      <Card className="grid gap-3 md:grid-cols-6">
        <Field label="Titel" htmlFor="title" className="md:col-span-3"><Input id="title" name="title" required maxLength={160} defaultValue={initial.title} /></Field>
        <Field label="Kategorie" htmlFor="category" className="md:col-span-2">
          <Select id="category" name="category" defaultValue={initial.category}>{CONTENT_CATEGORIES.map((c) => <option key={c} value={c}>{CONTENT_CATEGORY_LABEL[c]}</option>)}</Select>
        </Field>
        <Field label="Reihenfolge" htmlFor="position"><Input id="position" name="position" type="number" min={0} max={999} defaultValue={initial.position} /></Field>
      </Card>

      <Card className="p-0">
        <div className="flex flex-wrap items-center gap-1 border-b border-line px-3 py-2" role="toolbar" aria-label="Formatierung">
          <button type="button" className={tb(!!editor?.isActive("bold"))} onClick={() => editor?.chain().focus().toggleBold().run()} aria-label="Fett"><Bold size={16} /></button>
          <button type="button" className={tb(!!editor?.isActive("italic"))} onClick={() => editor?.chain().focus().toggleItalic().run()} aria-label="Kursiv"><Italic size={16} /></button>
          <span className="mx-1 h-6 w-px bg-line" />
          <button type="button" className={tb(!!editor?.isActive("heading", { level: 2 }))} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} aria-label="Überschrift 2"><Heading2 size={16} /></button>
          <button type="button" className={tb(!!editor?.isActive("heading", { level: 3 }))} onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} aria-label="Überschrift 3"><Heading3 size={16} /></button>
          <button type="button" className={tb(!!editor?.isActive("bulletList"))} onClick={() => editor?.chain().focus().toggleBulletList().run()} aria-label="Aufzählung"><List size={16} /></button>
          <button type="button" className={tb(!!editor?.isActive("orderedList"))} onClick={() => editor?.chain().focus().toggleOrderedList().run()} aria-label="Nummerierung"><ListOrdered size={16} /></button>
          <button type="button" className={tb(!!editor?.isActive("blockquote"))} onClick={() => editor?.chain().focus().toggleBlockquote().run()} aria-label="Zitat"><Quote size={16} /></button>
          <button type="button" className={tb(false)} onClick={() => editor?.chain().focus().insertTable({ rows: 3, cols: 2, withHeaderRow: true }).run()} aria-label="Tabelle"><TableIcon size={16} /></button>
          <button type="button" className={tb(false)} onClick={() => fileRef.current?.click()} aria-label="Bild einfügen"><ImagePlus size={16} /></button>
          <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void upload(f); e.target.value = ""; }} />
          <span className="mx-1 h-6 w-px bg-line" />
          <select aria-label="Hinweisbox einfügen" className="h-9 rounded-[6px] border border-line bg-surface px-2 text-sm text-ink-soft" value="" onChange={(e) => { const tone = e.target.value; if (tone) editor?.chain().focus().insertContent({ type: "callout", attrs: { tone }, content: [{ type: "paragraph" }] }).run(); }}>
            <option value="">Box …</option><option value="summary">Zusammenfassung</option><option value="info">Info</option><option value="warning">Hinweis</option>
          </select>
          <select aria-label="Baustein einfügen" className="h-9 rounded-[6px] border border-line bg-surface px-2 text-sm text-ink-soft" value="" onChange={(e) => { const kind = e.target.value; if (kind) editor?.chain().focus().insertContent({ type: "baustein", attrs: { kind } }).run(); }}>
            <option value="">Baustein …</option>{BAUSTEINE.map((b) => <option key={b.kind} value={b.kind}>{b.label}</option>)}
          </select>
          <span className="ml-auto flex gap-1">
            <button type="button" className={tb(false)} onClick={() => editor?.chain().focus().undo().run()} aria-label="Rückgängig"><Undo2 size={16} /></button>
            <button type="button" className={tb(false)} onClick={() => editor?.chain().focus().redo().run()} aria-label="Wiederholen"><Redo2 size={16} /></button>
          </span>
        </div>
        <div className="px-5 py-3">
          <EditorContent editor={editor} />
        </div>
        {editor?.isActive("table") && (
          <div className="flex flex-wrap gap-1 border-t border-line px-3 py-2 text-xs">
            <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().addRowAfter().run()}>Zeile +</Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().deleteRow().run()}>Zeile −</Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().addColumnAfter().run()}>Spalte +</Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().deleteColumn().run()}>Spalte −</Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().deleteTable().run()}>Tabelle löschen</Button>
          </div>
        )}
      </Card>
      {uploadError && <Alert tone="danger">{uploadError}</Alert>}
      {state.error && <Alert tone="danger">{state.error}</Alert>}
      {state.saved && <Alert tone="success">Gespeichert als Fassung {state.saved.version} ({state.saved.status === "published" ? "veröffentlicht" : state.saved.status === "draft" ? "Entwurf" : "archiviert"}).</Alert>}
      <div className="flex flex-wrap gap-2">
        {/* Der Status kommt aus dem geklickten Button; ein Hidden-Feld wäre beim Submit noch veraltet */}
        <Button type="submit" name="status" value="draft" variant="secondary" disabled={pending}>Als Entwurf speichern</Button>
        <Button type="submit" name="status" value="published" disabled={pending}>Veröffentlichen</Button>
        {slug && initial.status !== "archived" && (
          <Button type="submit" name="status" value="archived" variant="outline" disabled={pending}>Archivieren (aus dem Portal nehmen)</Button>
        )}
      </div>
    </form>
  );
}
