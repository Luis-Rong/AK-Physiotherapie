import { notFound } from "next/navigation";
import { requireViewer } from "@/lib/auth/session";
import { getPatient } from "@/lib/data/patients";
import { getCurrentSupplementPlan, intakeCountsByDay } from "@/lib/data/supplements";
import { addDays, formatDate, formatDateTime, today } from "@/lib/dates";
import { Card, CardTitle } from "@/components/ui/card";
import { SupplementEditor } from "./supplement-editor";

export default async function SupplementsAdminPage({ params }: { params: Promise<{ id: string }> }) {
  await requireViewer("praxis");
  const { id } = await params;
  const patient = await getPatient(id);
  if (!patient) notFound();
  const plan = await getCurrentSupplementPlan(id);
  const from = addDays(today(), -13);
  const counts = plan ? await intakeCountsByDay(id, from, today()) : new Map<string, number>();
  const slotsPerDay = plan?.items.reduce((n, i) => n + i.slots.length, 0) ?? 0;

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardTitle>Supplement-Plan</CardTitle>
        <p className="mt-1 text-xs text-muted">
          Jede Änderung wird als neue Fassung gespeichert{plan ? `, aktuell Fassung ${plan.version} vom ${formatDateTime(plan.createdAt)}` : ""}. Bitte nur Formulierungen verwenden, die als Health Claims zulässig sind (ADR 0009).
        </p>
        <SupplementEditor
          patientId={id}
          initial={{
            notes: plan?.notes ?? "",
            items: plan?.items.map((i) => ({ name: i.name, dosage: i.dosage ?? "", amount: i.amount ?? "", slots: i.slots, validFrom: i.validFrom ?? "", validTo: i.validTo ?? "" })) ?? [],
          }}
        />
      </Card>
      <Card>
        <CardTitle>Einnahme, letzte 14 Tage</CardTitle>
        <p className="mt-1 text-xs text-muted">Häkchen der Patientin / des Patienten je Tag.</p>
        {!plan ? (
          <p className="mt-2 text-sm text-muted">Kein Plan.</p>
        ) : (
          <ul className="mt-3 space-y-1 text-sm">
            {Array.from({ length: 14 }, (_, i) => addDays(from, i)).reverse().map((d) => {
              const c = counts.get(d) ?? 0;
              return (
                <li key={d} className="flex items-center justify-between">
                  <span className="text-ink-soft">{formatDate(d, { weekday: "short", day: "2-digit", month: "2-digit" })}</span>
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-24 overflow-hidden rounded-full bg-sand"><span className="block h-full bg-moss" style={{ width: slotsPerDay ? `${Math.min(100, (c / slotsPerDay) * 100)}%` : "0%" }} /></span>
                    <span className="w-10 text-right tabular-nums text-ink">{c}/{slotsPerDay}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
