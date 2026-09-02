/** Fachliche Bezeichnungen, ohne Server-Abhängigkeiten – nutzbar in Client- und Server-Komponenten. */

export type Section = "warmup" | "main" | "cooldown";
export const SECTIONS: Section[] = ["warmup", "main", "cooldown"];
export const SECTION_LABEL: Record<Section, string> = {
  warmup: "Aufwärmen & Vorbereiten",
  main: "Training",
  cooldown: "Abwärmen",
};

export type Slot = "morning" | "noon" | "evening";
export const SLOTS: Slot[] = ["morning", "noon", "evening"];
export const SLOT_LABEL: Record<Slot, string> = { morning: "Morgens", noon: "Mittags", evening: "Abends" };

export type PainPhase = "during" | "after" | "next_morning";
export const PHASES: PainPhase[] = ["during", "after", "next_morning"];
export const PHASE_LABEL: Record<PainPhase, string> = {
  during: "Während",
  after: "Danach",
  next_morning: "Nächster Morgen",
};

export type ExerciseCategory = "aufwaermen" | "training" | "abwaermen" | "allgemein";
export const CATEGORIES: ExerciseCategory[] = ["aufwaermen", "training", "abwaermen", "allgemein"];
export const CATEGORY_LABEL: Record<ExerciseCategory, string> = {
  aufwaermen: "Aufwärmen",
  training: "Training",
  abwaermen: "Abwärmen",
  allgemein: "Allgemein",
};

export type ContentCategory = "einfuehrung" | "schlaf" | "ernaehrung" | "bewegung" | "schmerz" | "reha";
export const CONTENT_CATEGORIES: ContentCategory[] = ["einfuehrung", "schlaf", "ernaehrung", "bewegung", "schmerz", "reha"];
export const CONTENT_CATEGORY_LABEL: Record<ContentCategory, string> = {
  einfuehrung: "Einführung",
  schlaf: "Säule Schlaf",
  ernaehrung: "Säule Ernährung",
  bewegung: "Säule Bewegung",
  schmerz: "Schmerztagebuch",
  reha: "Rehabilitationsstadien",
};
