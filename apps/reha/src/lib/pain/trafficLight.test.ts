import { describe, expect, it } from "vitest";
import { isValidNprs, trafficLevel, trafficLight, trafficLightEnabled } from "./trafficLight";

describe("Schmerzampel", () => {
  it("ordnet NPRS-Werte den Stufen aus dem Tagebuch zu", () => {
    expect([0, 1, 2, 3].map(trafficLevel)).toEqual(["gruen", "gruen", "gruen", "gruen"]);
    expect([4, 5].map(trafficLevel)).toEqual(["gelb", "gelb"]);
    expect([6, 7, 8, 9, 10].map(trafficLevel)).toEqual(["rot", "rot", "rot", "rot", "rot"]);
  });

  it("verwendet die abgeschwächte Formulierung aus ADR 0007", () => {
    const rot = trafficLight(8);
    expect(rot.hint).not.toMatch(/sofort abbrechen/i);
    expect(rot.hint).toMatch(/nächsten Morgen/);
  });

  it("weist ungültige Werte zurück", () => {
    expect(() => trafficLevel(11)).toThrow(RangeError);
    expect(() => trafficLevel(-1)).toThrow(RangeError);
    expect(() => trafficLevel(2.5)).toThrow(RangeError);
    expect(isValidNprs("3")).toBe(false);
  });

  it("lässt sich per Umgebungsvariable abschalten (Rückfall ADR 0007)", () => {
    expect(trafficLightEnabled({})).toBe(true);
    expect(trafficLightEnabled({ PAIN_TRAFFIC_LIGHT: "on" })).toBe(true);
    expect(trafficLightEnabled({ PAIN_TRAFFIC_LIGHT: "OFF" })).toBe(false);
  });
});
