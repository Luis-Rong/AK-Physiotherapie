"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { PiktoHantel, PiktoKapsel, PiktoLampe, PiktoPerson, PiktoSonne, PiktoTagebuch, type PiktoProps } from "@/components/pikto";
import { TONE_TILE, TONE_TEXT, type Tone } from "@/components/pikto/tile";

const items: { href: string; label: string; icon: (p: PiktoProps) => React.JSX.Element; tone: Tone; exact?: boolean }[] = [
  { href: "/app", label: "Heute", icon: PiktoSonne, tone: "sun", exact: true },
  { href: "/app/plan", label: "Plan", icon: PiktoHantel, tone: "clay" },
  { href: "/app/tagebuch", label: "Tagebuch", icon: PiktoTagebuch, tone: "berry" },
  { href: "/app/supplemente", label: "Einnahme", icon: PiktoKapsel, tone: "sun" },
  { href: "/app/wissen", label: "Wissen", icon: PiktoLampe, tone: "sky" },
  { href: "/app/profil", label: "Profil", icon: PiktoPerson, tone: "bark" },
];

export function PatientNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Hauptnavigation"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/80"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto grid max-w-3xl grid-cols-6">
        {items.map((it) => {
          const active = it.exact ? pathname === it.href : pathname.startsWith(it.href);
          const Icon = it.icon;
          return (
            <li key={it.href}>
              <Link
                href={it.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-1 py-2 text-[11px] font-semibold transition-colors",
                  active ? TONE_TEXT[it.tone] : "text-muted hover:text-ink-soft",
                )}
              >
                <span className={cn("grid h-8 w-12 place-items-center rounded-full transition-colors", active && TONE_TILE[it.tone])}>
                  <Icon size={22} strokeWidth={active ? 2.3 : 2} />
                </span>
                {it.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
