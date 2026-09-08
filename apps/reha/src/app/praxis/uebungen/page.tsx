import { requireViewer } from "@/lib/auth/session";
import { listExercises } from "@/lib/data/exercises";
import { CATEGORY_LABEL, type ExerciseCategory } from "@/lib/labels";
import { Badge, Card, CardDescription, CardTitle } from "@/components/ui/card";
import { ExerciseForm } from "./exercise-form";

export default async function ExercisesPage() {
  await requireViewer("praxis");
  const exercises = await listExercises({ includeInactive: true });
  const groups = (["aufwaermen", "training", "abwaermen", "allgemein"] as ExerciseCategory[]).map((c) => ({ c, list: exercises.filter((e) => e.category === c) }));
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Übungsbibliothek</h1>
        <CardDescription>Wiederverwendbare Übungen mit Beschreibung. Im Wochenplan wählen Sie daraus oder tippen frei ein. Bilder und Videos folgen in einer späteren Stufe.</CardDescription>
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          {groups.map(({ c, list }) => (
            <Card key={c} className="p-0">
              <h2 className="border-b border-line px-5 py-3 text-sm font-semibold text-ink">{CATEGORY_LABEL[c]} <span className="font-normal text-muted">· {list.length}</span></h2>
              {list.length === 0 ? (
                <p className="px-5 py-3 text-sm text-muted">Noch keine Übung.</p>
              ) : (
                <ul className="divide-y divide-line">
                  {list.map((e) => (
                    <li key={e.id} className="px-5 py-3">
                      <details>
                        <summary className="flex cursor-pointer items-center gap-2">
                          <span className="font-medium text-ink">{e.name}</span>
                          {!e.active && <Badge>inaktiv</Badge>}
                          {e.description && <span className="ml-auto hidden max-w-[50%] truncate text-xs text-muted md:inline">{e.description}</span>}
                        </summary>
                        <div className="mt-3">
                          <ExerciseForm exercise={{ id: e.id, name: e.name, category: e.category as ExerciseCategory, description: e.description ?? "", active: e.active }} />
                        </div>
                      </details>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          ))}
        </div>
        <Card className="self-start">
          <CardTitle>Neue Übung</CardTitle>
          <ExerciseForm />
        </Card>
      </div>
    </div>
  );
}
