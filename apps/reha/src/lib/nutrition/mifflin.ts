/** Mifflin-St-Jeor (1990), wie im Rehabilitationstagebuch S. 7 angegeben. */
export function mifflinStJeor(input: { sex: "m" | "f"; ageYears: number; heightCm: number; weightKg: number }): number {
  const base = 10 * input.weightKg + 6.25 * input.heightCm - 5 * input.ageYears;
  return input.sex === "m" ? base + 5 : base - 161;
}
