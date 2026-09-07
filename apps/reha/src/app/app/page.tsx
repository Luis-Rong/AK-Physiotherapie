import Link from "next/link";
import { requireViewer } from "@/lib/auth/session";
import { findCurrentWeek, getLogForDate, listLogsForPatient } from "@/lib/data/plan";
import { getCurrentProfile } from "@/lib/data/patients";
import { listPain } from "@/lib/data/pain";
import { getCurrentSupplementPlan, getIntakeState, itemsActiveOn } from "@/lib/data/supplements";
import { addDays, formatDate, isoWeekday, today, WEEKDAY_LONG } from "@/lib/dates";
import { trafficLightEnabled } from "@/lib/pain/trafficLight";
import { Card, Badge } from "@/components/ui/card";
import { PainValue } from "@/components/pain/traffic-badge";
import { AmpelHinweis, AmpelKarte } from "@/components/pain/ampel";
import { IconTile } from "@/components/pikto/tile";
import { PiktoDownload, PiktoHaken, PiktoHantel, PiktoKapsel, PiktoMond, PiktoPfeil, PiktoPflanze, PiktoSonne, PiktoTagebuch } from "@/components/pikto";
import { listPatientFiles } from "@/lib/data/files";
import { IlluLeer, IlluMorgen, IlluRuhe } from "@/components/pikto/illustrationen";
import { IntakeChecklist } from "./supplemente/intake-checklist";

const PHASE_LABEL: Record<string, string> = { during: "Während der Übungen", after: "Danach", next_morning: "Am nächsten Morgen" };

function greeting(): string {
  const hour = Number(new Intl.DateTimeFormat("de-DE", { hour: "numeric", hour12: false, timeZone: "Europe/Berlin" }).format(new Date()));
  if (hour < 11) return "Guten Morgen";
  if (hour < 18) return "Guten Tag";
  return "Guten Abend";
}

export default async function TodayPage() {
  const { user } = await requireViewer("patient");
  const date = today();
  const [week, profile, plan, log, pain] = await Promise.all([
    findCurrentWeek(user.id),
    getCurrentProfile(user.id),
    getCurrentSupplementPlan(user.id),
    getLogForDate(user.id, date),
    listPain(user.id, { from: addDays(date, -7), to: date }),
  ]);
  const yesterday = addDays(date, -1);
  const [yLog, yPainMorning] = await Promise.all([
    getLogForDate(user.id, yesterday),
    listPain(user.id, { from: yesterday, to: yesterday }).then((l) => l.find((p) => p.phase === "next_morning")),
  ]);
  const recentLogs = await listLogsForPatient(user.id, { from: addDays(date, -7), to: date });
  const isTrainingDay = week?.trainingDays.includes(isoWeekday(date)) ?? false;
  const ampel = trafficLightEnabled();
  const activeItems = plan ? itemsActiveOn(plan.items, date) : [];
  const intake = activeItems.length ? await getIntakeState(user.id, date) : new Map<string, boolean>();
  const doneCount = log?.items.filter((i) => i.done).length ?? 0;
  const total = log?.items.length ?? 0;
  // „Zuletzt": der jüngste Wert der letzten 30 Tage, auch wenn die 7-Tage-Liste leer ist
  const latestPain = (pain.length ? pain : await listPain(user.id, { from: addDays(date, -30), to: date }))
    .slice()
    .sort((a, b) => (a.entryDate === b.entryDate ? 0 : a.entryDate < b.entryDate ? 1 : -1))[0];
  const firstName = user.name.split(" ")[0];
  const cutoff = addDays(date, -14);
  const recentFiles = (await listPatientFiles(user.id)).filter((f) => f.createdAt.toISOString().slice(0, 10) >= cutoff);

  return (
    <div className="space-y-4">
      {/* Begrüßung */}
      <section
        className={`relative overflow-hidden rounded-[var(--radius-lg)] border border-line p-5 ${isTrainingDay ? "bg-gradient-to-br from-sun-soft via-surface to-clay-soft" : "bg-gradient-to-br from-berry-soft via-surface to-sand"}`}
      >
        <div className="relative z-10 max-w-[58%] pb-1">
          <p className="text-sm font-medium text-muted">
            {WEEKDAY_LONG[isoWeekday(date) - 1]}, {formatDate(date)}
          </p>
          <h1 className="mt-1 text-2xl font-bold leading-tight tracking-tight text-ink">
            {greeting()}, {firstName}
          </h1>
          <div className="mt-3">
            {week ? (
              isTrainingDay ? (
                <Badge tone="clay" className="gap-1.5 px-3 py-1 text-[13px]">
                  <PiktoHantel size={14} /> Trainingstag
                </Badge>
              ) : (
                <Badge tone="berry" className="gap-1.5 px-3 py-1 text-[13px]">
                  <PiktoMond size={14} /> Ruhetag
                </Badge>
              )
            ) : (
              <Badge className="px-3 py-1 text-[13px]">Kein Plan diese Woche</Badge>
            )}
          </div>
        </div>
        {isTrainingDay || !week ? (
          <IlluMorgen className="absolute -right-1 bottom-0 h-full w-[42%] max-w-[14rem]" />
        ) : (
          <IlluRuhe className="absolute -right-1 bottom-0 h-full w-[42%] max-w-[14rem]" />
        )}
      </section>

      {/* Nachfrage: nächster Morgen */}
      {yLog && !yPainMorning && (
        <Card className="border-sun/40 bg-sun-soft/50">
          <div className="flex items-start gap-3">
            <IconTile tone="sun">
              <PiktoSonne size={22} />
            </IconTile>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-ink">Wie ist es Ihnen heute Morgen gegangen?</p>
              <p className="mt-0.5 text-sm text-ink-soft">Nach dem Training von gestern fehlt noch der Wert vom nächsten Morgen.</p>
              <Link href={`/app/tagebuch/eintrag?datum=${yesterday}#morgen`} className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-sun-deep">
                Jetzt eintragen <PiktoPfeil size={16} />
              </Link>
            </div>
          </div>
        </Card>
      )}

      {/* Training */}
      <Card>
        <div className="flex items-start gap-3">
          <IconTile tone="clay">
            <PiktoHantel size={24} />
          </IconTile>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold tracking-tight text-ink">Training</h2>
            {week ? (
              <p className="mt-0.5 text-sm text-muted">
                Woche {week.weekNumber}
                {week.goal ? ` · ${week.goal}` : ""}
              </p>
            ) : (
              <p className="mt-0.5 text-sm text-muted">Ihre Praxis hat für diese Woche noch keinen Plan hinterlegt.</p>
            )}
          </div>
        </div>
        {week && (
          <>
            {log && total > 0 && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="inline-flex items-center gap-1.5 font-medium text-moss">
                    <PiktoHaken size={18} /> {doneCount} von {total} Übungen geschafft
                  </span>
                  <span className="tabular-nums text-muted">{Math.round((doneCount / total) * 100)} %</span>
                </div>
                <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-sand">
                  <div className="h-full rounded-full bg-gradient-to-r from-clay to-sun transition-[width]" style={{ width: `${(doneCount / total) * 100}%` }} />
                </div>
              </div>
            )}
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              {!log && (
                <Link href={`/app/tagebuch/eintrag?datum=${date}`} className="flex flex-1 items-center justify-center gap-2 rounded-[var(--radius-md)] bg-clay px-4 py-3 text-sm font-semibold text-[#FFF7F0] hover:bg-clay-deep">
                  <PiktoHantel size={18} /> Training eintragen
                </Link>
              )}
              <Link href="/app/plan" className="flex flex-1 items-center justify-center gap-1 rounded-[var(--radius-md)] bg-sand px-4 py-3 text-sm font-semibold text-ink hover:bg-sand-deep">
                Plan ansehen <PiktoPfeil size={16} />
              </Link>
            </div>
          </>
        )}
      </Card>

      {/* Einnahme */}
      {activeItems.length > 0 && (
        <Card>
          <div className="flex items-center gap-3">
            <IconTile tone="sun">
              <PiktoKapsel size={24} />
            </IconTile>
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-ink">Einnahme heute</h2>
              <p className="text-sm text-muted">Antippen, wenn genommen.</p>
            </div>
          </div>
          <IntakeChecklist date={date} items={activeItems} state={Object.fromEntries(intake)} />
        </Card>
      )}

      {/* Tagebuch / Ampel */}
      <Card>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <IconTile tone="berry">
              <PiktoTagebuch size={24} />
            </IconTile>
            <h2 className="text-lg font-semibold tracking-tight text-ink">Letzte 7 Tage</h2>
          </div>
          <Link href="/app/tagebuch" className="inline-flex items-center gap-1 text-sm font-semibold text-berry-deep">
            Tagebuch <PiktoPfeil size={16} />
          </Link>
        </div>

        {latestPain ? (
          <div className="mt-4 rounded-[var(--radius-md)] bg-sand/70 p-4">
            <AmpelKarte
              nprs={latestPain.nprs}
              enabled={ampel}
              phaseLabel={`Zuletzt · ${formatDate(latestPain.entryDate, { weekday: "short", day: "2-digit", month: "2-digit" })} · ${PHASE_LABEL[latestPain.phase] ?? ""}`}
            />
            {ampel && <AmpelHinweis className="mt-3" />}
          </div>
        ) : null}

        {recentLogs.length === 0 && pain.length === 0 ? (
          <div className="mt-3 flex items-center gap-4">
            <IlluLeer className="h-20 w-28 shrink-0" />
            <p className="text-sm text-ink-soft">
              Noch keine Einträge in dieser Woche. Der erste Eintrag ist nur einen Tipp entfernt –{" "}
              <Link href={`/app/tagebuch/eintrag?datum=${date}`} className="font-semibold text-berry-deep">
                los geht&apos;s
              </Link>
              .
            </p>
          </div>
        ) : (
          <ul className="mt-3 divide-y divide-line">
            {recentLogs.map((l) => {
              const dayPain = pain.filter((p) => p.entryDate === l.logDate);
              return (
                <li key={l.id} className="flex items-center justify-between py-2.5 text-sm">
                  <span className="font-medium text-ink">{formatDate(l.logDate, { weekday: "short", day: "2-digit", month: "2-digit" })}</span>
                  <span className="flex items-center gap-1.5">
                    <span className="mr-2 text-muted">
                      {l.items.filter((i) => i.done).length}/{l.items.length} Übungen
                    </span>
                    {dayPain.map((p) => (
                      <PainValue key={p.id} nprs={p.nprs} enabled={ampel} size="sm" />
                    ))}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {/* Neue Dateien von der Praxis (letzte 14 Tage) */}
      {recentFiles.length > 0 && (
        <Card className="border-sun/40 bg-sun-soft/40">
          <div className="flex items-center gap-3">
            <IconTile tone="sun">
              <PiktoDownload size={22} />
            </IconTile>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-ink">
                {recentFiles.length === 1 ? "Ihre Praxis hat Ihnen eine Datei hinterlegt" : `Ihre Praxis hat Ihnen ${recentFiles.length} Dateien hinterlegt`}
              </p>
              <p className="truncate text-sm text-ink-soft">{recentFiles.map((f) => f.note || f.filename).join(" · ")}</p>
            </div>
            <Link href="/app/profil#dateien" className="inline-flex items-center gap-1 text-sm font-semibold text-sun-deep">
              Ansehen <PiktoPfeil size={16} />
            </Link>
          </div>
        </Card>
      )}

      {/* Reha-Stufe */}
      {profile?.krsStage && (
        <Card className="bg-moss-soft/60">
          <div className="flex items-center gap-3">
            <IconTile tone="moss">
              <PiktoPflanze size={24} />
            </IconTile>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Aktuelle Stufe laut Praxis</p>
              <p className="text-lg font-bold text-ink">KRS {profile.krsStage}</p>
            </div>
            <Link href="/app/wissen/reha-stadien" className="inline-flex items-center gap-1 text-sm font-semibold text-moss">
              Was heißt das? <PiktoPfeil size={16} />
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}
