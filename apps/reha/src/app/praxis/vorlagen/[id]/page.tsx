import Link from "next/link";
import { notFound } from "next/navigation";
import { requireViewer } from "@/lib/auth/session";
import { getTemplate } from "@/lib/data/templates";
import { listExercises } from "@/lib/data/exercises";
import { Card } from "@/components/ui/card";
import { PiktoPfeilLinks } from "@/components/pikto";
import { TemplateEditor, type TemplateInitial } from "../template-editor";

export default async function TemplateEditPage({ params }: { params: Promise<{ id: string }> }) {
  await requireViewer("praxis");
  const { id } = await params;
  const library = (await listExercises()).map((e) => ({ id: e.id, name: e.name, category: e.category }));
  let initial: TemplateInitial;
  if (id === "neu") {
    initial = { name: "", description: "", weeks: [] };
  } else {
    const t = await getTemplate(id);
    if (!t) notFound();
    initial = { id: t.id, name: t.name, description: t.description ?? "", weeks: t.weeks };
  }
  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <Link href="/praxis/vorlagen" className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
        <PiktoPfeilLinks size={16} /> Alle Vorlagen
      </Link>
      <h1 className="text-2xl font-semibold text-ink">{id === "neu" ? "Vorlage anlegen" : `Vorlage bearbeiten: ${initial.name}`}</h1>
      <Card>
        <TemplateEditor initial={initial} library={library} />
      </Card>
    </div>
  );
}
