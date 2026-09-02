/** Die 9 KRS-Stufen (Bant et al., 2017) als Treppe, Werte aus dem Rehabilitationstagebuch S. 20. */
const STUFEN = [
  { n: 1, name: "Koordination", serien: "2–3", wdh: "10–15", pause: "35 Sek." },
  { n: 2, name: "Extensive Kraftausdauer", serien: "2–3", wdh: "21–30", pause: "45 Sek." },
  { n: 3, name: "Intensive Kraftausdauer", serien: "2–3", wdh: "16–20", pause: "60 Sek." },
  { n: 4, name: "Extensives Rekrutieren", serien: "2–4", wdh: "9–15", pause: "120 Sek." },
  { n: 5, name: "Intensives Rekrutieren I", serien: "2–4", wdh: "5–7", pause: "120 Sek." },
  { n: 6, name: "Intensives Rekrutieren II", serien: "2–4", wdh: "3–4", pause: "3 Min." },
  { n: 7, name: "Intensives Rekrutieren III", serien: "1–3", wdh: "1–2", pause: "4 Min." },
  { n: 8, name: "Prestretch", serien: "–", wdh: "–", pause: "–" },
  { n: 9, name: "Plyometrie", serien: "–", wdh: "–", pause: "–" },
];

export function KrsTreppe({ current }: { current?: number | null }) {
  return (
    <figure className="rounded-[var(--radius-lg)] border border-line bg-surface p-5">
      <figcaption className="mb-4 text-sm font-semibold text-ink">KRS-Stufen: Aufbau, Methode und Trainingsparameter</figcaption>
      <ol className="grid grid-cols-9 items-end gap-1" aria-label="Neun KRS-Stufen mit steigender Belastung">
        {STUFEN.map((s) => {
          const grundlage = s.n <= 3;
          const isCurrent = current === s.n;
          return (
            <li key={s.n} className="flex flex-col items-center gap-1 text-center">
              <span className="text-[11px] font-semibold text-ink">KRS {s.n}</span>
              <div
                className={`w-full rounded-t-[6px] ${grundlage ? "bg-bark" : "bg-clay"} ${isCurrent ? "ring-2 ring-offset-2 ring-ink" : ""}`}
                style={{ height: `${28 + s.n * 14}px` }}
                title={`${s.name}: Serien ${s.serien}, Wdh. ${s.wdh}, Pause ${s.pause}`}
              />
            </li>
          );
        })}
      </ol>
      <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted">
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-4 rounded-sm bg-bark" /> Grundlagenaufbau (Koordination, Kraftausdauer)</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-4 rounded-sm bg-clay" /> Maximal-, Schnell- und Reaktivkraft</span>
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-xs">
          <thead><tr className="text-left text-muted"><th className="py-1 pr-2 font-medium">Stufe</th><th className="py-1 pr-2 font-medium">Methode</th><th className="py-1 pr-2 font-medium">Serien</th><th className="py-1 pr-2 font-medium">Wdh.</th><th className="py-1 font-medium">Pause</th></tr></thead>
          <tbody className="divide-y divide-line">
            {STUFEN.map((s) => (
              <tr key={s.n} className={current === s.n ? "bg-bark-soft font-semibold" : ""}>
                <td className="py-1 pr-2 text-ink">KRS {s.n}</td><td className="py-1 pr-2 text-ink">{s.name}</td><td className="py-1 pr-2 text-ink-soft">{s.serien}</td><td className="py-1 pr-2 text-ink-soft">{s.wdh}</td><td className="py-1 text-ink-soft">{s.pause}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-muted">Zeitangaben und Zuordnung sind Orientierungswerte. Die tatsächliche Progression richtet sich nach klinischen Kriterien (Schmerz, Schwellung, Beweglichkeit, Kraft), die Ihre Praxis beurteilt.</p>
    </figure>
  );
}
