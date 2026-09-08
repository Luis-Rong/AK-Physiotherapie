import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireViewer } from "@/lib/auth/session";
import { getWeekVersion, listCurrentWeeks, listWeekHistory } from "@/lib/data/plan";
import { listExercises } from "@/lib/data/exercises";
import { addDays, formatDate, formatDateTime, mondayOf, today } from "@/lib/dates";
import { Card, CardTitle } from "@/components/ui/card";
import { WeekEditor, type EditorInitial } from "./week-editor";

export default async function WeekEditPage({ params }: { params: Promise<{ id: string; week: string }> }) {
  await requireViewer("praxis");
  const { id, week: weekParam } = await params;
  const weeks = await listCurrentWeeks(id);
  const library = (await listExercises()).map((e) => ({ id: e.id, name: e.name, category: e.category }));

  let initial: EditorInitial;
  let heading: string;
  let history: Awaited<ReturnType<typeof listWeekHistory>> = [];

  if (weekParam === "neu") {
    const last = weeks.at(-1);
    const source = last ? await getWeekVersion(last.id) : null;
    const weekNumber = last ? last.weekNumber + 1 : 1;
    heading = `Woche ${weekNumber} anlegen${source ? ` (Vorlage: Woche ${source.weekNumber})` : ""}`;
    initial = {
      weekNumber,
      startsOn: last ? addDays(last.startsOn, 7) : mondayOf(today()),
      goal: "",
      notes: "",
      trainingDays: source?.trainingDays ?? [1, 3, 5],
      exercises: source?.exercises.map((e) => ({ section: e.section, exerciseId: e.exerciseId, name: e.name, sets: e.sets ?? "", reps: e.reps ?? "", weight: e.weight ?? "", duration: e.duration ?? "", remarks: e.remarks ?? "" })) ?? [],
    };
  } else {
    const weekNumber = Number(weekParam);
    const meta = weeks.find((w) => w.weekNumber === weekNumber);
    if (!meta) notFound();
    const week = await getWeekVersion(meta.id);
    if (!week) notFound();
    history = await listWeekHistory(id, weekNumber);
    heading = `Woche ${weekNumber} bearbeiten`;
    initial = {
      weekNumber,
      startsOn: week.startsOn,
      goal: week.goal ?? "",
      notes: week.notes ?? "",
      trainingDays: week.trainingDays,
      exercises: week.exercises.map((e) => ({ section: e.section, exerciseId: e.exerciseId, name: e.name, sets: e.sets ?? "", reps: e.reps ?? "", weight: e.weight ?? "", duration: e.duration ?? "", remarks: e.remarks ?? "" })),
    };
  }

  return (
    <div className="space-y-4">
      <Link href={`/praxis/patienten/${id}/plan`} className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink"><ArrowLeft size={16} /> Alle Wochen</Link>
      <h2 className="text-xl font-semibold text-ink">{heading}</h2>
      <Card>
        <WeekEditor patientId={id} initial={initial} library={library} />
      </Card>
      {history.length > 1 && (
        <Card>
          <CardTitle>Fassungen</CardTitle>
          <ul className="mt-2 divide-y divide-line text-sm">
            {history.map((h) => (
              <li key={h.id} className="flex justify-between py-2">
                <span className="text-ink">Fassung {h.version}{h.goal ? ` · ${h.goal}` : ""}</span>
                <span className="text-muted">{formatDateTime(h.createdAt)} · ab {formatDate(h.startsOn)}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
