import type { SVGProps } from "react";

/**
 * Kleine Illustrationen, selbst gezeichnet, in der Farbwelt der Tokens.
 * Rein dekorativ (aria-hidden). Farben über CSS-Variablen, damit sie mit der
 * Palette mitgehen.
 */
type IlluProps = SVGProps<SVGSVGElement> & { className?: string };

/** Morgen: Sonne hinter Hügeln, eine Person streckt sich. Für die Heute-Seite. */
export function IlluMorgen({ className, ...rest }: IlluProps) {
  return (
    <svg viewBox="0 0 160 120" className={className} aria-hidden {...rest}>
      {/* Sonne */}
      <g stroke="var(--color-sun)" strokeWidth="3" strokeLinecap="round">
        <path d="M118 12v8M118 56v8M96 34h8M132 34h8M102.4 18.4l5.6 5.6M128 44l5.6 5.6M102.4 49.6l5.6-5.6M128 24l5.6-5.6" />
      </g>
      <circle cx="118" cy="34" r="13" fill="var(--color-sun)" />
      <circle cx="118" cy="34" r="19" fill="var(--color-sun)" opacity=".18" />
      {/* Hügel */}
      <path d="M0 96c30-22 62-24 92-8 24 12 46 12 68 0v32H0z" fill="var(--color-moss-soft)" />
      <path d="M0 108c34-16 70-16 104-2 20 8 38 8 56 0v14H0z" fill="var(--color-moss)" opacity=".55" />
      {/* Person */}
      <g stroke="var(--color-bark)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M56 58v30" />
        <path d="M56 66l-14-12M56 66l14-12" />
        <path d="M56 88l-9 22M56 88l9 22" />
        <path d="M42 54l-3-6M70 54l3-6" stroke="var(--color-clay)" />
      </g>
      <circle cx="56" cy="47" r="8" fill="var(--color-clay-soft)" stroke="var(--color-bark)" strokeWidth="4" />
    </svg>
  );
}

/** Leerer Zustand: offenes Heft mit Blatt und Stift. */
export function IlluLeer({ className, ...rest }: IlluProps) {
  return (
    <svg viewBox="0 0 120 80" className={className} aria-hidden {...rest}>
      <rect x="14" y="16" width="44" height="52" rx="6" fill="var(--color-sand)" stroke="var(--color-bark)" strokeWidth="3" />
      <rect x="58" y="16" width="44" height="52" rx="6" fill="var(--color-surface)" stroke="var(--color-bark)" strokeWidth="3" />
      <g stroke="var(--color-line-strong)" strokeWidth="3" strokeLinecap="round">
        <path d="M24 30h24M24 40h18M24 50h22" />
      </g>
      <path d="M78 46c0-9 6-15 16-15 0 10-6 15-16 15z" fill="var(--color-moss-soft)" stroke="var(--color-moss)" strokeWidth="3" />
      <path d="M78 46l-8 10" stroke="var(--color-moss)" strokeWidth="3" strokeLinecap="round" />
      <path d="M96 66l12-12" stroke="var(--color-clay)" strokeWidth="6" strokeLinecap="round" />
      <path d="M108 54l3-3" stroke="var(--color-sun)" strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}

/** Ruhetag: Mond und Sterne über einer Decke. */
export function IlluRuhe({ className, ...rest }: IlluProps) {
  return (
    <svg viewBox="0 0 160 120" className={className} aria-hidden {...rest}>
      <path d="M126 22a20 20 0 1 0 18 28 16 16 0 0 1-18-28z" fill="var(--color-sun-soft)" stroke="var(--color-sun)" strokeWidth="3" strokeLinejoin="round" />
      <g fill="var(--color-sun)">
        <path d="M92 20l1.5 3 3 1.5-3 1.5-1.5 3-1.5-3-3-1.5 3-1.5z" />
        <path d="M108 60l1 2 2 1-2 1-1 2-1-2-2-1 2-1z" />
        <path d="M150 70l1 2 2 1-2 1-1 2-1-2-2-1 2-1z" />
      </g>
      <path d="M0 96c30-22 62-24 92-8 24 12 46 12 68 0v32H0z" fill="var(--color-berry-soft)" />
      <path d="M0 108c34-16 70-16 104-2 20 8 38 8 56 0v14H0z" fill="var(--color-berry)" opacity=".4" />
      <g stroke="var(--color-bark)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M30 86h48" />
        <path d="M36 86l-4-14M72 86l4-14" />
      </g>
      <circle cx="30" cy="70" r="8" fill="var(--color-clay-soft)" stroke="var(--color-bark)" strokeWidth="4" />
    </svg>
  );
}
