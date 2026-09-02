import Link from "next/link";
import { requireViewer } from "@/lib/auth/session";
import { findCurrentWeek, getWeekVersion, listCurrentWeeks } from "@/lib/data/plan";
import { Card, CardDescription } from "@/components/ui/card";
import { WeekView } from "@/components/plan/week-view";
import { cn } from "@/lib/cn";

export default async function PlanPage({ searchParams }: { searchParams: Promise<{ woche?: string }> }) {
  const { user } = await requireViewer("patient");
  const sp = await searchParams;
  const weeks = await listCurrentWeeks(user.id);
  const current = await findCurrentWeek(user.id);
  const requested = sp.woche ? weeks.find((w) => String(w.weekNumber) === sp.woche) : null;
  const week = requested ? await getWeekVersion(requested.id) : current ?? (weeks.at(-1) ? await getWeekVersion(weeks.at(-1)!.id) : null);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-ink">Trainingsplan</h1>
        <CardDescription>Wochenweise von Ihrer Praxis angepasst. Übungen und Parameter ändern sich mit Ihrem Fortschritt.</CardDescription>
      </div>
      {weeks.length > 1 && (
        <nav aria-label="Wochen" className="-mx-5 overflow-x-auto px-5">
          <ul className="flex gap-2">
            {weeks.map((w) => (
              <li key={w.id}>
                <Link
                  href={`/app/plan?woche=${w.weekNumber}`}
                  aria-current={week?.weekNumber === w.weekNumber ? "page" : undefined}
                  className={cn("inline-block whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium", week?.weekNumber === w.weekNumber ? "bg-bark text-[#F7F1E8]" : "bg-sand text-ink-soft hover:bg-sand-deep")}
                >
                  Woche {w.weekNumber}{current?.id === w.id ? " · aktuell" : ""}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
      {week ? (
        <Card>
          <WeekView week={week} />
        </Card>
      ) : (
        <Card><p className="text-sm text-muted">Ihre Praxis hat noch keinen Plan für Sie angelegt.</p></Card>
      )}
      <p className="text-xs text-muted">
        Übungen und Parameter (Sätze, Wiederholungen, Gewicht, Pausen) sind bewusst nicht starr, sondern werden von Woche zu Woche an den aktuellen Zustand angepasst. Grundlage sind Wundheilungsphase, Gewebebelastbarkeit und Ihre Angaben im Schmerztagebuch.
      </p>
    </div>
  );
}
