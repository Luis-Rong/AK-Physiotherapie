"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, CalendarCheck, Dumbbell, Home, Pill, UserRound } from "lucide-react";
import { cn } from "@/lib/cn";

const items = [
  { href: "/app", label: "Heute", icon: Home, exact: true },
  { href: "/app/plan", label: "Plan", icon: Dumbbell },
  { href: "/app/tagebuch", label: "Tagebuch", icon: CalendarCheck },
  { href: "/app/supplemente", label: "Einnahme", icon: Pill },
  { href: "/app/wissen", label: "Wissen", icon: BookOpen },
  { href: "/app/profil", label: "Profil", icon: UserRound },
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
                  "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium",
                  active ? "text-bark" : "text-muted hover:text-ink-soft",
                )}
              >
                <span className={cn("grid h-8 w-12 place-items-center rounded-full", active && "bg-bark-soft")}>
                  <Icon size={20} strokeWidth={active ? 2.4 : 2} aria-hidden />
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
