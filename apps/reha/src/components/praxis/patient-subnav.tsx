"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

export function PatientSubnav({ id }: { id: string }) {
  const pathname = usePathname();
  const base = `/praxis/patienten/${id}`;
  const items = [
    { href: base, label: "Übersicht", exact: true },
    { href: `${base}/plan`, label: "Trainingsplan" },
    { href: `${base}/supplemente`, label: "Supplemente" },
    { href: `${base}/profil`, label: "Profil & Assessments" },
    { href: `${base}/dateien`, label: "Dateien" },
    { href: `${base}/zugang`, label: "Zugang" },
  ];
  return (
    <nav aria-label="Patientenbereiche" className="-mx-5 overflow-x-auto px-5 md:mx-0 md:px-0">
      <ul className="flex gap-1 border-b border-line">
        {items.map((it) => {
          const active = it.exact ? pathname === it.href : pathname.startsWith(it.href);
          return (
            <li key={it.href}>
              <Link
                href={it.href}
                aria-current={active ? "page" : undefined}
                className={cn("inline-block whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium", active ? "border-clay text-ink" : "border-transparent text-muted hover:text-ink")}
              >
                {it.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
