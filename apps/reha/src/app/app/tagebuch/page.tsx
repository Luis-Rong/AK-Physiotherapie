import Link from "next/link";
import { requireViewer } from "@/lib/auth/session";
import { listLogsForPatient } from "@/lib/data/plan";
import { groupByDay, listPain } from "@/lib/data/pain";
import { addDays, formatDate, today } from "@/lib/dates";
import { trafficLightEnabled } from "@/lib/pain/trafficLight";
import { Card } from "@/components/ui/card";
import { PainValue } from "@/components/pain/traffic-badge";
import { AmpelHinweis, AmpelKarte, AmpelLegende } from "@/components/pain/ampel";
import { PainChart } from "@/components/pain/pain-chart";
import { PageHeader, SectionTitle } from "@/components/page-header";
import { PiktoAmpel, PiktoPfeil, PiktoPlus, PiktoStift, PiktoTagebuch } from "@/components/pikto";
import { IlluLeer } from "@/components/pikto/illustrationen";
import { PHASE_LABEL } from "@/lib/labels";

export default async function DiaryPage() {
  const { user } = await requireViewer("patient");
  const date = today();
  const [logs, pain] = await Promise.all([
    listLogsForPatient(user.id, { from: addDays(date, -84) }),
    listPain(user.id, { from: addDays(date, -84) }),
  ]);
  const days = groupByDay(pain);
  const ampel = trafficLightEnabled();
  const chart = days.map((d) => ({ date: d.date, during: d.during?.nprs, after: d.after?.nprs, next_morning: d.next_morning?.nprs }));
  const logByDate = new Map(logs.map((l) => [l.logDate, l]));
  const dates = [...new Set([...logs.map((l) => l.logDate), ...days.map((d) => d.date)])].sort((a, b) => b.localeCompare(a));
  const latest = [...pain].sort((a, b) => b.entryDate.localeCompare(a.entryDate))[0];

  return (
    <div className="space-y-4">
      <PageHeader
        tone="berry"
        icon={<PiktoTagebuch size={30} />}
        title="Tagebuch"
        intro="Training und Schmerz, Tag für Tag. Ihre Praxis sieht diese Einträge."
        action={
          <Link href={`/app/tagebuch/eintrag?datum=${date}`} className="inline-flex items-center gap-1.5 rounded-full bg-berry px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-berry-deep">
            <PiktoPlus size={16} strokeWidth={2.6} /> Eintrag
          </Link>
        }
      />

      {latest && (
        <Card className="border-berry/20 bg-gradient-to-br from-berry-soft/70 to-surface">
          <AmpelKarte
            nprs={latest.nprs}
            enabled={ampel}
            phaseLabel={`Zuletzt · ${formatDate(latest.entryDate, { weekday: "short", day: "2-digit", month: "2-digit" })} · ${PHASE_LABEL[latest.phase as keyof typeof PHASE_LABEL] ?? ""}`}
          />
          {ampel && <AmpelHinweis className="mt-3" />}
        </Card>
      )}

      <Card>
        <SectionTitle tone="berry" icon={<PiktoStift size={18} />}>
          Verlauf
        </SectionTitle>
        <p className="mb-3 mt-1 text-xs text-muted">Ihre eingegebenen Werte, ohne Bewertung. Die Einordnung übernimmt Ihre Praxis.</p>
        <PainChart data={chart} />
      </Card>

      <Card>
        <SectionTitle tone="berry" icon={<PiktoTagebuch size={18} />}>
          Einträge
        </SectionTitle>
        {dates.length === 0 ? (
          <div className="mt-3 flex items-center gap-4">
            <IlluLeer className="h-20 w-28 shrink-0" />
            <p className="text-sm text-ink-soft">
              Noch keine Einträge. Nach dem ersten Training geht es hier los –{" "}
              <Link href={`/app/tagebuch/eintrag?datum=${date}`} className="font-semibold text-berry-deep">
                jetzt eintragen
              </Link>
              .
            </p>
          </div>
        ) : (
          <ul className="mt-2 divide-y divide-line">
            {dates.map((d) => {
              const log = logByDate.get(d);
              const day = days.find((x) => x.date === d);
              return (
                <li key={d}>
                  <Link href={`/app/tagebuch/eintrag?datum=${d}`} className="-mx-2 flex items-center justify-between gap-3 rounded-[var(--radius-md)] px-2 py-3 hover:bg-berry-soft/40">
                    <div className="min-w-0">
                      <p className="font-semibold text-ink">{formatDate(d, { weekday: "short", day: "2-digit", month: "2-digit", year: "numeric" })}</p>
                      <p className="truncate text-xs text-muted">
                        {log ? `${log.items.filter((i) => i.done).length}/${log.items.length} Übungen` : "kein Training eingetragen"}
                        {log?.remark ? ` · ${log.remark}` : ""}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5" aria-label="Schmerz während, danach, nächster Morgen">
                      {(["during", "after", "next_morning"] as const).map((ph) =>
                        day?.[ph] ? (
                          <PainValue key={ph} nprs={day[ph]!.nprs} enabled={ampel} size="sm" />
                        ) : (
                          <span key={ph} className="inline-block h-7 w-7 rounded-full border border-dashed border-line-strong" aria-hidden />
                        ),
                      )}
                      <PiktoPfeil size={16} className="ml-1 text-muted" />
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <Card>
        <SectionTitle tone="berry" icon={<PiktoAmpel size={18} />}>
          Die Schmerzampel
        </SectionTitle>
        <p className="mb-4 mt-2 text-sm text-ink-soft">
          Grundlage ist die Schmerzskala von 0 (kein Schmerz) bis 10 (stärkster vorstellbarer Schmerz). Entscheidend ist nicht nur der Wert
          während der Übung, sondern ob der Schmerz bis zum nächsten Morgen wieder auf das Ausgangsniveau zurückgeht.
        </p>
        <AmpelLegende />
        <AmpelHinweis className="mt-4" />
        <p className="mt-2 text-xs text-muted">
          Bei anhaltenden Beschwerden im roten Bereich, plötzlich stark zunehmendem Schmerz, Schwellung oder Instabilitätsgefühl: Rücksprache mit
          Ihrer Praxis halten, statt eigenständig weiter zu trainieren.
        </p>
      </Card>
    </div>
  );
}
