/** Muskelverlust der Oberschenkelmuskulatur bei Inaktivität (Tagebuch S. 12, aus klinischen Studien). */
const ROWS = [
  { label: "2 Tage Inaktivität", pct: 1.7, note: "ca. 0,1 kg" },
  { label: "7 Tage Inaktivität", pct: 5.5, note: "ca. 0,3 kg" },
  { label: "2 Wochen nach Knie-TEP (ältere Patienten)", pct: 16, note: "bis zu 14–18 %" },
];

export function Muskelverlust() {
  const max = 20;
  return (
    <figure className="rounded-[var(--radius-lg)] border border-line bg-surface p-5">
      <figcaption className="mb-3 text-sm font-semibold text-ink">Ausmaß des Muskelverlusts bei Inaktivität</figcaption>
      <ul className="space-y-3">
        {ROWS.map((r, i) => (
          <li key={r.label} className="grid grid-cols-[minmax(0,10rem)_1fr_auto] items-center gap-3 text-sm">
            <span className="text-ink-soft">{r.label}</span>
            <span className="h-6 overflow-hidden rounded-[4px] bg-sand" aria-hidden>
              <span className="block h-full rounded-[4px]" style={{ width: `${(r.pct / max) * 100}%`, background: i === 2 ? "var(--color-ampel-rot)" : "var(--color-clay)", opacity: 0.55 + i * 0.2 }} />
            </span>
            <span className="font-semibold text-ink">{r.note}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-muted">Muskelverlust der Oberschenkelmuskulatur in Prozent, abhängig von der Dauer der Inaktivität. 80 % des gesamten Verlusts treten in den ersten zwei Wochen auf.</p>
    </figure>
  );
}
