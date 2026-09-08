import Link from "next/link";
import { requireViewer } from "@/lib/auth/session";
import { getCurrentSupplementPlan, getIntakeState, intakeCountsByDay, itemsActiveOn, SLOT_LABEL, type Slot } from "@/lib/data/supplements";
import { addDays, formatDate, mondayOf, today, WEEKDAY_SHORT } from "@/lib/dates";
import { Card } from "@/components/ui/card";
import { PageHeader, SectionTitle } from "@/components/page-header";
import { PiktoHaken, PiktoKapsel, PiktoTagebuch } from "@/components/pikto";
import { IlluLeer } from "@/components/pikto/illustrationen";
import { IntakeChecklist } from "./intake-checklist";
import { cn } from "@/lib/cn";

export default async function SupplementsPage({ searchParams }: { searchParams: Promise<{ datum?: string }> }) {
  const { user } = await requireViewer("patient");
  const sp = await searchParams;
  const date = /^\d{4}-\d{2}-\d{2}$/.test(sp.datum ?? "") ? sp.datum! : today();
  const plan = await getCurrentSupplementPlan(user.id);
  const items = plan ? itemsActiveOn(plan.items, date) : [];
  const state = items.length ? await getIntakeState(user.id, date) : new Map<string, boolean>();
  const monday = mondayOf(date);
  const counts = await intakeCountsByDay(user.id, monday, addDays(monday, 6));
  const slotsPerDay = items.reduce((n, i) => n + i.slots.length, 0);
  const takenToday = [...state.values()].filter(Boolean).length;

  return (
    <div className="space-y-4">
      <PageHeader
        tone="sun"
        icon={<PiktoKapsel size={30} />}
        title="Einnahme"
        intro="Ihr Supplement-Plan, wie von der Praxis eingetragen. Antippen, was Sie genommen haben."
      />

      {!plan || plan.items.length === 0 ? (
        <Card>
          <div className="flex items-center gap-4">
            <IlluLeer className="h-20 w-28 shrink-0" />
            <p className="text-sm text-ink-soft">Für Sie ist aktuell kein Supplement-Plan hinterlegt.</p>
          </div>
        </Card>
      ) : (
        <>
          <Card className="p-3">
            <ul className="flex justify-between gap-1" aria-label="Woche">
              {WEEKDAY_SHORT.map((d, i) => {
                const iso = addDays(monday, i);
                const c = counts.get(iso) ?? 0;
                const active = iso === date;
                const future = iso > today();
                const full = slotsPerDay > 0 && c >= slotsPerDay;
                return (
                  <li key={d}>
                    <Link
                      href={`/app/supplemente?datum=${iso}`}
                      aria-current={active ? "date" : undefined}
                      className={cn(
                        "flex w-11 flex-col items-center gap-1.5 rounded-[var(--radius-md)] py-2 text-xs font-semibold transition-colors",
                        active ? "bg-sun text-white shadow-sm" : "text-muted hover:bg-sun-soft",
                        future && "opacity-50",
                      )}
                    >
                      <span>{d}</span>
                      <span
                        className={cn(
                          "grid h-6 w-6 place-items-center rounded-full text-[10px] font-bold tabular-nums",
                          active ? "bg-white/25" : full ? "bg-moss text-white" : c > 0 ? "bg-sun-soft text-sun-deep" : "bg-sand",
                        )}
                      >
                        {full && !active ? <PiktoHaken size={14} strokeWidth={2.6} /> : slotsPerDay ? `${c}/${slotsPerDay}` : "–"}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Card>

          <Card>
            <SectionTitle
              tone="sun"
              icon={<PiktoKapsel size={18} />}
              aside={
                slotsPerDay > 0 && (
                  <span className="rounded-full bg-sun-soft px-2.5 py-1 text-xs font-semibold tabular-nums text-sun-deep">
                    {takenToday} / {slotsPerDay}
                  </span>
                )
              }
            >
              {formatDate(date, { weekday: "long", day: "2-digit", month: "2-digit" })}
            </SectionTitle>
            <IntakeChecklist date={date} items={items} state={Object.fromEntries(state)} />
          </Card>

          <Card>
            <SectionTitle tone="sun" icon={<PiktoTagebuch size={18} />}>
              Ihr Plan
            </SectionTitle>
            <ul className="mt-3 divide-y divide-line">
              {plan.items.map((i) => (
                <li key={i.id} className="flex items-start justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="font-medium text-ink">{i.name}</p>
                    <p className="text-xs text-muted">{[i.amount, i.dosage].filter(Boolean).join(" · ")}</p>
                  </div>
                  <div className="flex shrink-0 flex-wrap justify-end gap-1">
                    {(i.slots as Slot[]).map((s) => (
                      <span key={s} className="rounded-full bg-sun-soft px-2 py-0.5 text-[11px] font-semibold text-sun-deep">
                        {SLOT_LABEL[s]}
                      </span>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
            {plan.notes && <p className="mt-3 rounded-[var(--radius-md)] bg-sun-soft/50 p-3 text-sm text-ink-soft">{plan.notes}</p>}
          </Card>
        </>
      )}
    </div>
  );
}
