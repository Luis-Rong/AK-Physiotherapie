/**
 * Schmerzampel nach NPRS (0–10).
 *
 * Automatische Zuordnung ist aktiv (ADR 0011), Formulierung abgeschwächt (ADR 0007).
 * Mit PAIN_TRAFFIC_LIGHT=off fällt die Anzeige auf Zahl + statische Legende zurück,
 * ohne dass sich Datenmodell oder Oberfläche ändern.
 *
 * Bewusst NICHT hier: Trends, Mittelwerte, Schwellwert-Meldungen (ADR 0004).
 */
export type TrafficLevel = "gruen" | "gelb" | "rot";

export type TrafficLight = {
  level: TrafficLevel;
  label: string;
  range: string;
  hint: string;
};

export const TRAFFIC_LEGEND: Record<TrafficLevel, Omit<TrafficLight, "level">> = {
  gruen: {
    label: "Grün",
    range: "0–3",
    hint: "Unbedenklich. Übung kann wie geplant fortgeführt werden.",
  },
  gelb: {
    label: "Gelb",
    range: "4–5",
    hint: "Beobachten: Am nächsten Morgen prüfen, ob der Schmerz wieder abgeklungen ist. Falls nicht, beim nächsten Mal etwas weniger Wiederholungen, Gewicht oder Tempo wählen.",
  },
  rot: {
    label: "Rot",
    range: "6+",
    hint: "Der Reiz war intensiv. Belastung reduzieren und beobachten, ob der Schmerz bis zum nächsten Morgen abklingt. Bleibt er erhöht oder kommt Schwellung dazu, in der nächsten Sitzung ansprechen.",
  },
};

export function isValidNprs(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= 10;
}

export function trafficLevel(nprs: number): TrafficLevel {
  if (!isValidNprs(nprs)) throw new RangeError(`NPRS außerhalb 0–10: ${nprs}`);
  if (nprs <= 3) return "gruen";
  if (nprs <= 5) return "gelb";
  return "rot";
}

export function trafficLight(nprs: number): TrafficLight {
  const level = trafficLevel(nprs);
  return { level, ...TRAFFIC_LEGEND[level] };
}

/** Serverseitig auswerten; im Client nur den Wert weiterreichen. */
export function trafficLightEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  return (env.PAIN_TRAFFIC_LIGHT ?? "on").toLowerCase() !== "off";
}
