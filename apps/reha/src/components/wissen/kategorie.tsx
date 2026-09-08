import type { ContentCategory } from "@/lib/labels";
import type { Tone } from "@/components/pikto/tile";
import { PiktoAmpel, PiktoApfel, PiktoHantel, PiktoLampe, PiktoMond, PiktoPflanze, type PiktoProps } from "@/components/pikto";

/** Farbe und Piktogramm je Wissenskategorie – gemeinsam für Übersicht und Artikel. */
export const CATEGORY_TONE: Record<ContentCategory, Tone> = {
  einfuehrung: "sky",
  schlaf: "berry",
  ernaehrung: "sun",
  bewegung: "clay",
  schmerz: "berry",
  reha: "moss",
};

export const CATEGORY_ICON: Record<ContentCategory, (p: PiktoProps) => React.JSX.Element> = {
  einfuehrung: PiktoLampe,
  schlaf: PiktoMond,
  ernaehrung: PiktoApfel,
  bewegung: PiktoHantel,
  schmerz: PiktoAmpel,
  reha: PiktoPflanze,
};
