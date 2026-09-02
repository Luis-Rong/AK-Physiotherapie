import Link from "next/link";
import { Plus } from "lucide-react";
import { requireViewer } from "@/lib/auth/session";
import { findCurrentWeek, listCurrentWeeks } from "@/lib/data/plan";
import { formatDate, WEEKDAY_SHORT } from "@/lib/dates";
import { Badge, Card } from "@/components/ui/card";

export default async function PlanListPage({ params }: { params: Promise<{ id: string }> }) {
  await requireViewer("praxis");
  const { id } = await params;
  const [weeks, current] = await Promise.all([listCurrentWeeks(id), findCurrentWeek(id)]);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">Wochenpläne, jede Woche einzeln anpassbar. Änderungen erzeugen eine neue Fassung; alte Fassungen bleiben einsehbar.</p>
        <Link href={`/praxis/patienten/${id}/plan/neu`} className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-clay px-4 py-2.5 text-sm font-semibold text-[#FFF7F0] hover:bg-clay-deep">
          <Plus size={16} /> {weeks.length ? `Woche ${Math.max(...weeks.map((w) => w.weekNumber)) + 1} anlegen` : "Woche 1 anlegen"}
        </Link>
      </div>
      <Card className="p-0">
        {weeks.length === 0 ? (
          <p className="p-5 text-sm text-muted">Noch kein Plan. Die erste Woche wird mit leeren Abschnitten angelegt.</p>
        ) : (
          <ul className="divide-y divide-line">
            {weeks.map((w) => (
              <li key={w.id}>
                <Link href={`/praxis/patienten/${id}/plan/${w.weekNumber}`} className="flex flex-wrap items-center gap-3 px-5 py-3.5 hover:bg-sand/60">
                  <span className="w-24 font-semibold text-ink">Woche {w.weekNumber}</span>
                  <span className="w-28 text-sm text-ink-soft">ab {formatDate(w.startsOn)}</span>
                  <span className="min-w-0 flex-1 truncate text-sm text-ink">{w.goal ?? <span className="text-muted">ohne Wochenziel</span>}</span>
                  <span className="flex gap-0.5">
                    {WEEKDAY_SHORT.map((d, i) => (
                      <span key={d} className={`grid h-6 w-6 place-items-center rounded-full text-[10px] font-semibold ${w.trainingDays.includes(i + 1) ? "bg-bark text-[#F7F1E8]" : "bg-sand text-muted"}`}>{d}</span>
                    ))}
                  </span>
                  {current?.id === w.id && <Badge tone="clay">aktuell</Badge>}
                  {w.version > 1 && <Badge>Fassung {w.version}</Badge>}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
