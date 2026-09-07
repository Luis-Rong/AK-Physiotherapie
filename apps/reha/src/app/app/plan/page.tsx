import Link from "next/link";
import { requireViewer } from "@/lib/auth/session";
import { findCurrentWeek, getWeekVersion, listCurrentWeeks } from "@/lib/data/plan";
import { Card } from "@/components/ui/card";
import { WeekView } from "@/components/plan/week-view";
import { PageHeader } from "@/components/page-header";
import { PiktoHantel } from "@/components/pikto";
import { IlluLeer } from "@/components/pikto/illustrationen";
import { cn } from "@/lib/cn";

export default async function PlanPage({ searchParams }: { searchParams: Promise<{ woche?: string }> }) {
  const { user } = await requireViewer("patient");
  const sp = await searchParams;
  const weeks = await listCurrentWeeks(user.id);
  const current = await findCurrentWeek(user.id);
  const requested = sp.woche ? weeks.find((w) => String(w.weekNumber) === sp.woche) : null;
  const week = requested ? await getWeekVersion(requested.id) : (current ?? (weeks.at(-1) ? await getWeekVersion(weeks.at(-1)!.id) : null));

  return (
    <div className="space-y-4">
      <PageHeader
        tone="clay"
        icon={<PiktoHantel size={30} />}
        title="Trainingsplan"
        intro="Woche für Woche von Ihrer Praxis angepasst – Übungen und Parameter wachsen mit Ihrem Fortschritt."
      />
      {weeks.length > 1 && (
        <nav aria-label="Wochen" className="-mx-5 overflow-x-auto px-5">
          <ul className="flex gap-2">
            {weeks.map((w) => (
              <li key={w.id}>
                <Link
                  href={`/app/plan?woche=${w.weekNumber}`}
                  aria-current={week?.weekNumber === w.weekNumber ? "page" : undefined}
                  className={cn(
                    "inline-block whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                    week?.weekNumber === w.weekNumber ? "bg-clay text-[#FFF7F0] shadow-sm" : "bg-clay-soft/60 text-clay-deep hover:bg-clay-soft",
                  )}
                >
                  Woche {w.weekNumber}
                  {current?.id === w.id ? " · aktuell" : ""}
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
        <Card>
          <div className="flex items-center gap-4">
            <IlluLeer className="h-20 w-28 shrink-0" />
            <p className="text-sm text-ink-soft">Ihre Praxis hat noch keinen Plan für Sie angelegt. Sobald er da ist, erscheint er hier.</p>
          </div>
        </Card>
      )}
      <p className="text-xs text-muted">
        Übungen und Parameter (Sätze, Wiederholungen, Gewicht, Pausen) sind bewusst nicht starr, sondern werden von Woche zu Woche an den aktuellen
        Zustand angepasst. Grundlage sind Wundheilungsphase, Gewebebelastbarkeit und Ihre Angaben im Schmerztagebuch.
      </p>
    </div>
  );
}
