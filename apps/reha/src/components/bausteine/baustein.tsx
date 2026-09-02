import type { BausteinKind } from "@/lib/content/types";
import { TrafficLegend } from "@/components/pain/traffic-badge";
import { KrsTreppe } from "./krs-treppe";
import { Heilungskurve } from "./heilungskurve";
import { PhasenKarten } from "./phasen-karten";
import { Muskelverlust } from "./muskelverlust";
import { AtemTimer } from "./atem-timer";
import { RuheumsatzRechner } from "./ruheumsatz-rechner";

/** Feste Bausteine, die der Physio in Inhalte einfügt, aber nicht verändert (ADR 0009). */
export function Baustein({ kind }: { kind: BausteinKind }) {
  switch (kind) {
    case "ampel":
      return (
        <div className="rounded-[var(--radius-lg)] border border-line bg-surface p-5">
          <p className="mb-3 text-sm font-semibold text-ink">Schmerzampel im Überblick</p>
          <TrafficLegend />
        </div>
      );
    case "krs":
      return <KrsTreppe />;
    case "heilungskurve":
      return <Heilungskurve />;
    case "phasen":
      return <PhasenKarten />;
    case "muskelverlust":
      return <Muskelverlust />;
    case "atem":
      return <AtemTimer />;
    case "ruheumsatz":
      return <RuheumsatzRechner />;
    default:
      return null;
  }
}
