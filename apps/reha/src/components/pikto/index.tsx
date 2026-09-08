import type { SVGProps } from "react";

/**
 * Eigene Piktogramme der Reha-Plattform (ADR 0012: eigene Zeichen, keine Emojis).
 * Einheitlich: 24er-Raster, runde Linien, currentColor. Dekorativ per Voreinstellung
 * (aria-hidden); wer ein Label braucht, gibt `title` mit.
 */
export type PiktoProps = SVGProps<SVGSVGElement> & { size?: number; title?: string };

function Svg({ size = 24, title, children, ...rest }: PiktoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      {...rest}
    >
      {title && <title>{title}</title>}
      {children}
    </svg>
  );
}

/** Sonne – Heute, Morgen */
export function PiktoSonne(p: PiktoProps) {
  return (
    <Svg {...p}>
      <circle cx="12" cy="12" r="4" fill="currentColor" fillOpacity=".18" />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4" />
    </Svg>
  );
}

/** Hantel – Training, Plan */
export function PiktoHantel(p: PiktoProps) {
  return (
    <Svg {...p}>
      <rect x="2.5" y="9" width="3.5" height="6" rx="1.2" fill="currentColor" fillOpacity=".18" />
      <rect x="18" y="9" width="3.5" height="6" rx="1.2" fill="currentColor" fillOpacity=".18" />
      <rect x="6" y="7" width="3" height="10" rx="1.2" />
      <rect x="15" y="7" width="3" height="10" rx="1.2" />
      <path d="M9 12h6" />
    </Svg>
  );
}

/** Tagebuch – aufgeschlagenes Buch mit Lesezeichen */
export function PiktoTagebuch(p: PiktoProps) {
  return (
    <Svg {...p}>
      <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v15H5.5A1.5 1.5 0 0 0 4 20.5z" fill="currentColor" fillOpacity=".18" />
      <path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H13v15h5.5a1.5 1.5 0 0 1 1.5 1.5z" />
      <path d="M7 8h2M7 11h2M15.5 4v6l1.5-1.2L18.5 10V4" />
    </Svg>
  );
}

/** Kapsel – Einnahme, Supplemente */
export function PiktoKapsel(p: PiktoProps) {
  return (
    <Svg {...p}>
      <g transform="rotate(-45 12 12)">
        <path d="M4 12a3.5 3.5 0 0 1 3.5-3.5H12v7H7.5A3.5 3.5 0 0 1 4 12z" fill="currentColor" fillOpacity=".25" stroke="none" />
        <rect x="4" y="8.5" width="16" height="7" rx="3.5" />
        <path d="M12 8.5v7" />
      </g>
      <path d="M19.5 2.5l.6 1.4 1.4.6-1.4.6-.6 1.4-.6-1.4-1.4-.6 1.4-.6z" fill="currentColor" stroke="none" />
    </Svg>
  );
}

/** Glühbirne – Wissen */
export function PiktoLampe(p: PiktoProps) {
  return (
    <Svg {...p}>
      <path d="M9 18h6M10 21h4" />
      <path d="M8.5 14.5A6 6 0 1 1 15.5 14.5c-.7.6-1 1.4-1 2.5h-5c0-1.1-.3-1.9-1-2.5z" fill="currentColor" fillOpacity=".18" />
      <path d="M12 8.5v3l1.5 1.5" />
    </Svg>
  );
}

/** Person – Profil */
export function PiktoPerson(p: PiktoProps) {
  return (
    <Svg {...p}>
      <circle cx="12" cy="8" r="4" fill="currentColor" fillOpacity=".18" />
      <path d="M4.5 20.5c.8-3.6 3.8-5.5 7.5-5.5s6.7 1.9 7.5 5.5" />
    </Svg>
  );
}

/** Pflanze – Heilung, Reha-Stufe, Fortschritt */
export function PiktoPflanze(p: PiktoProps) {
  return (
    <Svg {...p}>
      <path d="M12 21v-9" />
      <path d="M12 12c0-4 2.5-6.5 7-6.5 0 4.5-2.5 6.5-7 6.5z" fill="currentColor" fillOpacity=".2" />
      <path d="M12 16c0-3.2-2-5-5.5-5 0 3.5 2 5 5.5 5z" fill="currentColor" fillOpacity=".2" />
      <path d="M7 21h10" />
    </Svg>
  );
}

/** Haken im Kreis – erledigt */
export function PiktoHaken(p: PiktoProps) {
  return (
    <Svg {...p}>
      <circle cx="12" cy="12" r="9" fill="currentColor" fillOpacity=".18" />
      <path d="m8.5 12.5 2.3 2.3L15.5 9.5" />
    </Svg>
  );
}

/** Pfeil rechts – weiter */
export function PiktoPfeil(p: PiktoProps) {
  return (
    <Svg {...p}>
      <path d="M5 12h13M13 6l6 6-6 6" />
    </Svg>
  );
}

/** Pfeil links – zurück */
export function PiktoPfeilLinks(p: PiktoProps) {
  return (
    <Svg {...p}>
      <path d="M19 12H6M11 6l-6 6 6 6" />
    </Svg>
  );
}

/** Plus – neu anlegen */
export function PiktoPlus(p: PiktoProps) {
  return (
    <Svg {...p}>
      <path d="M12 5v14M5 12h14" />
    </Svg>
  );
}

/** Apfel – Ernährung */
export function PiktoApfel(p: PiktoProps) {
  return (
    <Svg {...p}>
      <path d="M12 8c-1.5-1.5-4.5-1.5-6 .5-2 2.6-1 7.5 1.2 10.2 1.3 1.6 3 1.8 4.8.9 1.8.9 3.5.7 4.8-.9C19 16 20 11.1 18 8.5c-1.5-2-4.5-2-6-.5z" fill="currentColor" fillOpacity=".18" />
      <path d="M12 8V5.5" />
      <path d="M12 5.5c1-2 3-2.5 4.5-2-.3 2-2 3.2-4.5 2z" fill="currentColor" fillOpacity=".3" />
    </Svg>
  );
}

/** Lineal – Messungen, Assessments */
export function PiktoLineal(p: PiktoProps) {
  return (
    <Svg {...p}>
      <rect x="2.5" y="8" width="19" height="8" rx="2" fill="currentColor" fillOpacity=".18" />
      <path d="M6.5 8v3M10 8v4.5M13.5 8v3M17 8v4.5" />
    </Svg>
  );
}

/** Ziel – Zielscheibe */
export function PiktoZiel(p: PiktoProps) {
  return (
    <Svg {...p}>
      <circle cx="12" cy="12" r="9" fill="currentColor" fillOpacity=".12" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
    </Svg>
  );
}

/** Stift – Bemerkung, Eintrag */
export function PiktoStift(p: PiktoProps) {
  return (
    <Svg {...p}>
      <path d="M4 20l4.5-1 10-10-3.5-3.5-10 10z" fill="currentColor" fillOpacity=".18" />
      <path d="M13 7.5l3.5 3.5" />
    </Svg>
  );
}

/** Gruppe – Patientinnen und Patienten */
export function PiktoGruppe(p: PiktoProps) {
  return (
    <Svg {...p}>
      <circle cx="9" cy="8" r="3.5" fill="currentColor" fillOpacity=".18" />
      <circle cx="16.5" cy="9" r="2.8" />
      <path d="M2.5 19c.6-3.2 3.1-5 6.5-5s5.9 1.8 6.5 5" />
      <path d="M16.5 14.5c2.7 0 4.5 1.4 5 4" />
    </Svg>
  );
}

/** Tür mit Pfeil – abmelden */
export function PiktoAbmelden(p: PiktoProps) {
  return (
    <Svg {...p}>
      <path d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4" />
      <path d="M14 8l4 4-4 4M18 12H9" />
    </Svg>
  );
}

/** Zahnrad – Einstellungen, Konto */
export function PiktoZahnrad(p: PiktoProps) {
  return (
    <Svg {...p}>
      <circle cx="12" cy="12" r="3" fill="currentColor" fillOpacity=".2" />
      <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1" />
      <circle cx="12" cy="12" r="6.5" />
    </Svg>
  );
}

/** Download – Daten herunterladen */
export function PiktoDownload(p: PiktoProps) {
  return (
    <Svg {...p}>
      <path d="M12 4v11M7.5 10.5 12 15l4.5-4.5" />
      <path d="M4 17v1.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V17" />
    </Svg>
  );
}

/** Kleine Ampel – Legende, Hinweise */
export function PiktoAmpel(p: PiktoProps) {
  return (
    <Svg {...p}>
      <rect x="8" y="2.5" width="8" height="19" rx="3" fill="currentColor" fillOpacity=".15" />
      <circle cx="12" cy="7" r="1.8" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.8" fill="currentColor" stroke="none" fillOpacity=".55" />
      <circle cx="12" cy="17" r="1.8" fill="currentColor" stroke="none" fillOpacity=".3" />
    </Svg>
  );
}

/** Mond – Abend, Ruhetag */
export function PiktoMond(p: PiktoProps) {
  return (
    <Svg {...p}>
      <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" fill="currentColor" fillOpacity=".18" />
      <path d="M17 3.5l.5 1 1 .5-1 .5-.5 1-.5-1-1-.5 1-.5z" fill="currentColor" stroke="none" />
    </Svg>
  );
}
