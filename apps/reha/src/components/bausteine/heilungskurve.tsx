/**
 * Verlauf der Gewebebelastbarkeit über die drei Wundheilungsphasen (illustrativ, wie im
 * Tagebuch S. 22): logarithmische Zeitachse, Punkte für die KRS-Stufen. Reine Anzeige.
 */
const W = 640;
const H = 300;
const PAD = { l: 44, r: 16, t: 28, b: 40 };
const DAYS_MAX = 400;
const x = (day: number) => PAD.l + (Math.log10(Math.max(day, 1)) / Math.log10(DAYS_MAX)) * (W - PAD.l - PAD.r);
const y = (pct: number) => H - PAD.b - (pct / 100) * (H - PAD.t - PAD.b);

const curve: [number, number][] = [
  [1, 15], [2, 14], [3, 12], [5, 14], [8, 18], [14, 24], [21, 32], [28, 42], [45, 52], [60, 58], [90, 66], [120, 72], [180, 80], [240, 86], [360, 92],
];
const stufen = [
  { day: 3, pct: 10, label: "KRS 1 Koordination" },
  { day: 10, pct: 22, label: "KRS 2–3 Kraftausdauer" },
  { day: 28, pct: 42, label: "KRS 4 Ext. Rekrutieren" },
  { day: 75, pct: 62, label: "KRS 5–7 Int. Rekrutieren" },
  { day: 180, pct: 80, label: "KRS 8 Prestretch" },
  { day: 300, pct: 90, label: "KRS 9 Plyometrie" },
];
const phasen = [
  { from: 1, to: 5, label: "Entzündungsphase", fill: "var(--color-ampel-rot-soft)", text: "var(--color-ampel-rot)" },
  { from: 5, to: 21, label: "Proliferationsphase", fill: "var(--color-ampel-gelb-soft)", text: "#7A5A10" },
  { from: 21, to: DAYS_MAX, label: "Konsolidierung / Remodellierung", fill: "var(--color-ampel-gruen-soft)", text: "var(--color-ampel-gruen)" },
];
const ticks = [1, 2, 5, 14, 21, 60, 120, 240, 360];

export function Heilungskurve() {
  const path = curve.map(([d, p], i) => `${i === 0 ? "M" : "L"}${x(d).toFixed(1)},${y(p).toFixed(1)}`).join(" ");
  return (
    <figure className="rounded-[var(--radius-lg)] border border-line bg-surface p-5">
      <figcaption className="mb-2 text-sm font-semibold text-ink">Wundheilungsphasen und Kraftaufbau (KRS-System)</figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Verlauf der Gewebebelastbarkeit über die drei Wundheilungsphasen mit Zuordnung der KRS-Stufen">
        {phasen.map((ph) => (
          <g key={ph.label}>
            <rect x={x(ph.from)} y={PAD.t} width={x(ph.to) - x(ph.from)} height={H - PAD.t - PAD.b} fill={ph.fill} />
            <text x={x(ph.from) + 6} y={PAD.t + 14} fontSize="11" fontWeight="600" fill={ph.text}>{ph.label}</text>
          </g>
        ))}
        {[0, 20, 40, 60, 80, 100].map((p) => (
          <g key={p}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(p)} y2={y(p)} stroke="var(--color-chart-grid)" />
            <text x={PAD.l - 8} y={y(p) + 4} fontSize="10" textAnchor="end" fill="var(--color-muted)">{p}</text>
          </g>
        ))}
        {ticks.map((d) => (
          <text key={d} x={x(d)} y={H - PAD.b + 16} fontSize="10" textAnchor="middle" fill="var(--color-muted)">{d}</text>
        ))}
        <text x={(W + PAD.l) / 2} y={H - 6} fontSize="10" textAnchor="middle" fill="var(--color-muted)">Tage nach Verletzung / Operation (logarithmische Skala)</text>
        <text transform={`translate(12 ${H / 2}) rotate(-90)`} fontSize="10" textAnchor="middle" fill="var(--color-muted)">Gewebebelastbarkeit (illustrativ, %)</text>
        <path d={path} fill="none" stroke="var(--color-ink)" strokeWidth="2.5" strokeLinejoin="round" />
        {stufen.map((s) => (
          <g key={s.label}>
            <circle cx={x(s.day)} cy={y(s.pct)} r="4" fill="var(--color-ink)" />
            <text x={x(s.day) + 7} y={y(s.pct) - 6} fontSize="10" fontWeight="600" fill="var(--color-ink)">{s.label}</text>
          </g>
        ))}
      </svg>
      <p className="mt-2 text-xs text-muted">Zeitangaben und KRS-Zuordnung sind typische Orientierungswerte, keine Vorgabe für den Einzelfall.</p>
    </figure>
  );
}
