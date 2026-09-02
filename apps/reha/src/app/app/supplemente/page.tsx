import Link from "next/link";
import { requireViewer } from "@/lib/auth/session";
import { getCurrentSupplementPlan, getIntakeState, intakeCountsByDay, itemsActiveOn, SLOT_LABEL, type Slot } from "@/lib/data/supplements";
import { addDays, formatDate, mondayOf, today, WEEKDAY_SHORT } from "@/lib/dates";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
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

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-ink">Einnahme</h1>
        <CardDescription>Ihr Supplement-Plan, wie von der Praxis eingetragen. Haken Sie ab, was Sie genommen haben.</CardDescription>
      </div>

      {!plan || plan.items.length === 0 ? (
        <Card><p className="text-sm text-muted">Für Sie ist aktuell kein Supplement-Plan hinterlegt.</p></Card>
      ) : (
        <>
          <Card>
            <ul className="flex justify-between gap-1" aria-label="Woche">
              {WEEKDAY_SHORT.map((d, i) => {
                const iso = addDays(monday, i);
                const c = counts.get(iso) ?? 0;
                const active = iso === date;
                const future = iso > today();
                return (
                  <li key={d}>
                    <Link
                      href={`/app/supplemente?datum=${iso}`}
                      aria-current={active ? "date" : undefined}
                      className={cn("flex w-11 flex-col items-center gap-1 rounded-[var(--radius-md)] py-1.5 text-xs", active ? "bg-bark text-[#F7F1E8]" : "text-muted hover:bg-sand", future && "opacity-50")}
                    >
                      <span>{d}</span>
                      <span className={cn("grid h-6 w-6 place-items-center rounded-full text-[11px] font-semibold", active ? "bg-white/20" : c > 0 ? "bg-moss-soft text-moss" : "bg-sand")}>
                        {slotsPerDay ? `${c}/${slotsPerDay}` : "–"}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Card>
          <Card>
            <CardTitle>{formatDate(date, { weekday: "long", day: "2-digit", month: "2-digit" })}</CardTitle>
            <IntakeChecklist date={date} items={items} state={Object.fromEntries(state)} />
          </Card>
          <Card>
            <CardTitle>Ihr Plan</CardTitle>
            <table className="mt-3 w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-muted">
                  <th className="pb-2 font-medium">Supplement</th>
                  <th className="pb-2 font-medium">Dosierung</th>
                  <th className="pb-2 font-medium">Wann</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {plan.items.map((i) => (
                  <tr key={i.id}>
                    <td className="py-2 font-medium text-ink">{i.name}</td>
                    <td className="py-2 text-ink-soft">{[i.amount, i.dosage].filter(Boolean).join(" · ")}</td>
                    <td className="py-2 text-ink-soft">{(i.slots as Slot[]).map((s) => SLOT_LABEL[s]).join(", ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {plan.notes && <p className="mt-3 text-sm text-ink-soft">{plan.notes}</p>}
          </Card>
        </>
      )}
    </div>
  );
}
