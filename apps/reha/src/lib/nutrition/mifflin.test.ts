import { describe, expect, it } from "vitest";
import { mifflinStJeor } from "./mifflin";

describe("Mifflin-St-Jeor", () => {
  it("rechnet die Formel aus dem Tagebuch", () => {
    expect(mifflinStJeor({ sex: "m", ageYears: 30, heightCm: 180, weightKg: 80 })).toBe(10 * 80 + 6.25 * 180 - 5 * 30 + 5);
    expect(mifflinStJeor({ sex: "f", ageYears: 30, heightCm: 165, weightKg: 60 })).toBe(10 * 60 + 6.25 * 165 - 5 * 30 - 161);
  });
});
