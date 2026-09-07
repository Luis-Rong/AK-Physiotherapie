import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { IconTile, TONE_TEXT, type Tone } from "@/components/pikto/tile";
import { PiktoPfeilLinks } from "@/components/pikto";

/**
 * Seitenkopf im Patientenbereich: Bereichsfarbe, Piktogramm, Titel, ein Satz Einordnung,
 * optional eine Aktion rechts. Auf dem Handy bleibt alles in einer Zeile plus Text.
 */
export function PageHeader({
  tone,
  icon,
  title,
  intro,
  action,
  back,
  className,
}: {
  tone: Tone;
  icon: ReactNode;
  title: string;
  intro?: ReactNode;
  action?: ReactNode;
  back?: { href: string; label: string };
  className?: string;
}) {
  return (
    <header className={cn("space-y-2", className)}>
      {back && (
        <Link href={back.href} className={cn("inline-flex items-center gap-1 text-sm font-semibold", TONE_TEXT[tone])}>
          <PiktoPfeilLinks size={16} /> {back.label}
        </Link>
      )}
      <div className="flex items-center gap-3">
        <IconTile tone={tone} size="lg">
          {icon}
        </IconTile>
        <div className="min-w-0 flex-1">
          <h1 className="text-[22px] font-bold leading-tight tracking-tight text-ink">{title}</h1>
          {intro && <p className="mt-0.5 text-sm text-muted">{intro}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </header>
  );
}

/** Abschnittstitel innerhalb einer Karte, mit kleiner Kachel. */
export function SectionTitle({ tone, icon, children, aside }: { tone: Tone; icon: ReactNode; children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <IconTile tone={tone} size="sm">
          {icon}
        </IconTile>
        <h2 className="text-lg font-semibold tracking-tight text-ink">{children}</h2>
      </div>
      {aside}
    </div>
  );
}
