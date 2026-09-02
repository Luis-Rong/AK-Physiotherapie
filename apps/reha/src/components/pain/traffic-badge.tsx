import { Badge } from "@/components/ui/card";
import { TRAFFIC_LEGEND, trafficLevel, type TrafficLevel } from "@/lib/pain/trafficLight";

/**
 * Zeigt einen NPRS-Wert. Mit `enabled` (Serverseite: trafficLightEnabled()) wird
 * die Ampelstufe automatisch zugeordnet (ADR 0011); ohne nur die Zahl.
 */
export function PainValue({ nprs, enabled, size = "md" }: { nprs: number; enabled: boolean; size?: "sm" | "md" | "lg" }) {
  const level: TrafficLevel | null = enabled ? trafficLevel(nprs) : null;
  const dims = size === "lg" ? "h-12 w-12 text-xl" : size === "sm" ? "h-7 w-7 text-xs" : "h-9 w-9 text-sm";
  const tone = level === "gruen" ? "bg-ampel-gruen text-white" : level === "gelb" ? "bg-ampel-gelb text-white" : level === "rot" ? "bg-ampel-rot text-white" : "bg-sand text-ink";
  return (
    <span
      className={`inline-grid place-items-center rounded-full font-bold tabular-nums ${dims} ${tone}`}
      aria-label={level ? `Schmerz ${nprs} von 10, Stufe ${TRAFFIC_LEGEND[level].label}` : `Schmerz ${nprs} von 10`}
    >
      {nprs}
    </span>
  );
}

export function TrafficLegend({ compact = false }: { compact?: boolean }) {
  const levels: TrafficLevel[] = ["gruen", "gelb", "rot"];
  return (
    <ul className={compact ? "space-y-1.5" : "space-y-3"}>
      {levels.map((l) => (
        <li key={l} className="flex gap-3">
          <Badge tone={l} className="mt-0.5 shrink-0">
            {TRAFFIC_LEGEND[l].label} · {TRAFFIC_LEGEND[l].range}
          </Badge>
          {!compact && <p className="text-sm text-ink-soft">{TRAFFIC_LEGEND[l].hint}</p>}
        </li>
      ))}
    </ul>
  );
}
