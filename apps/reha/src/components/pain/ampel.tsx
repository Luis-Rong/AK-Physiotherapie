import { cn } from "@/lib/cn";
import { TRAFFIC_LEGEND, trafficLevel, type TrafficLevel } from "@/lib/pain/trafficLight";

/**
 * Die Schmerzampel als Ampel: Gehäuse mit drei Lichtern, genau eines leuchtet (ADR 0011,
 * Formulierung ADR 0007). Mit `enabled=false` (PAIN_TRAFFIC_LIGHT=off) leuchtet nichts
 * und nur die Zahl bleibt. Kein Trend, keine Bewertung über den einen Wert hinaus.
 */
const LIGHT: Record<TrafficLevel, string> = {
  gruen: "var(--color-ampel-gruen)",
  gelb: "var(--color-ampel-gelb)",
  rot: "var(--color-ampel-rot)",
};

export function Ampel({
  nprs,
  enabled,
  size = "md",
  orientation = "vertical",
  className,
}: {
  nprs: number;
  enabled: boolean;
  size?: "sm" | "md" | "lg";
  orientation?: "vertical" | "horizontal";
  className?: string;
}) {
  const level = enabled ? trafficLevel(nprs) : null;
  const order: TrafficLevel[] = ["rot", "gelb", "gruen"];
  const px = size === "lg" ? 34 : size === "sm" ? 14 : 22;
  const gap = Math.round(px * 0.35);
  const pad = Math.round(px * 0.4);
  const w = px + pad * 2;
  const h = px * 3 + gap * 2 + pad * 2;
  const vertical = orientation === "vertical";
  const label = level ? `Schmerz ${nprs} von 10, Stufe ${TRAFFIC_LEGEND[level].label}` : `Schmerz ${nprs} von 10`;
  return (
    <svg
      width={vertical ? w : h}
      height={vertical ? h : w}
      viewBox={vertical ? `0 0 ${w} ${h}` : `0 0 ${h} ${w}`}
      role="img"
      aria-label={label}
      className={cn("shrink-0", className)}
    >
      <rect x="0" y="0" width={vertical ? w : h} height={vertical ? h : w} rx={pad + px / 2} fill="var(--color-ink)" opacity=".9" />
      {order.map((l, i) => {
        const c = pad + px / 2 + i * (px + gap);
        const cx = vertical ? w / 2 : c;
        const cy = vertical ? c : w / 2;
        const on = level === l;
        return (
          <g key={l}>
            {on && <circle cx={cx} cy={cy} r={px / 2 + pad * 0.55} fill={LIGHT[l]} opacity=".35" />}
            <circle cx={cx} cy={cy} r={px / 2} fill={on ? LIGHT[l] : "var(--color-sand-deep)"} opacity={on ? 1 : 0.25} />
            {on && <circle cx={cx - px * 0.18} cy={cy - px * 0.18} r={px * 0.12} fill="#fff" opacity=".55" />}
          </g>
        );
      })}
    </svg>
  );
}

/** Ampel mit Wert, Stufe und Erklärung – der Baustein für Karten. */
export function AmpelKarte({ nprs, enabled, phaseLabel, className }: { nprs: number; enabled: boolean; phaseLabel?: string; className?: string }) {
  const level = enabled ? trafficLevel(nprs) : null;
  return (
    <div className={cn("flex items-center gap-4", className)}>
      <Ampel nprs={nprs} enabled={enabled} size="md" />
      <div className="min-w-0">
        {phaseLabel && <p className="text-xs font-semibold uppercase tracking-wide text-muted">{phaseLabel}</p>}
        <p className="text-2xl font-bold tabular-nums text-ink">
          {nprs}
          <span className="ml-1 text-sm font-medium text-muted">von 10</span>
          {level && (
            <span className="ml-2 text-sm font-semibold" style={{ color: LIGHT[level] }}>
              {TRAFFIC_LEGEND[level].label}
            </span>
          )}
        </p>
        {level && <p className="mt-0.5 text-sm text-ink-soft">{TRAFFIC_LEGEND[level].hint}</p>}
      </div>
    </div>
  );
}

/** Legende: drei kleine Ampeln, je eine leuchtet, mit Bereich und Erklärung. */
export function AmpelLegende({ compact = false, className }: { compact?: boolean; className?: string }) {
  const levels: TrafficLevel[] = ["gruen", "gelb", "rot"];
  const sample: Record<TrafficLevel, number> = { gruen: 2, gelb: 4, rot: 7 };
  return (
    <ul className={cn("space-y-3", className)}>
      {levels.map((l) => (
        <li key={l} className="flex items-start gap-3">
          <Ampel nprs={sample[l]} enabled size="sm" />
          <div className="min-w-0 pt-0.5">
            <p className="text-sm font-semibold" style={{ color: LIGHT[l] }}>
              {TRAFFIC_LEGEND[l].label} <span className="font-medium text-muted">· {TRAFFIC_LEGEND[l].range}</span>
            </p>
            {!compact && <p className="mt-0.5 text-sm text-ink-soft">{TRAFFIC_LEGEND[l].hint}</p>}
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Pflichthinweis unter jeder Ampel-Anzeige (ADR 0012). */
export function AmpelHinweis({ className }: { className?: string }) {
  return (
    <p className={cn("text-xs leading-relaxed text-muted", className)}>
      Die Ampel ordnet nur den Wert ein, den Sie eingetragen haben. Sie ist kein ärztlicher Rat und ersetzt nicht die
      Einschätzung Ihrer Praxis – bei Unsicherheit sprechen Sie das dort an.
    </p>
  );
}
