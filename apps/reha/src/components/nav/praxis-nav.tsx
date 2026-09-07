"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Brand } from "@/components/brand";
import { authClient } from "@/lib/auth/client";
import { cn } from "@/lib/cn";
import { PiktoAbmelden, PiktoGruppe, PiktoHantel, PiktoLampe, PiktoTagebuch, PiktoZahnrad, type PiktoProps } from "@/components/pikto";
import { TONE_TILE, type Tone } from "@/components/pikto/tile";

const items: { href: string; label: string; icon: (p: PiktoProps) => React.JSX.Element; tone: Tone; exact?: boolean; prefix?: string }[] = [
  { href: "/praxis", label: "Patienten", icon: PiktoGruppe, tone: "bark", exact: true, prefix: "/praxis/patienten" },
  { href: "/praxis/vorlagen", label: "Vorlagen", icon: PiktoTagebuch, tone: "sun" },
  { href: "/praxis/uebungen", label: "Übungen", icon: PiktoHantel, tone: "clay" },
  { href: "/praxis/wissen", label: "Wissen", icon: PiktoLampe, tone: "sky" },
  { href: "/praxis/konto", label: "Konto", icon: PiktoZahnrad, tone: "moss" },
];

export function PraxisNav({ userName }: { userName: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await authClient.signOut();
    router.push("/login?grund=abgemeldet");
    router.refresh();
  }

  const links = items.map((it) => {
    const active = it.exact ? pathname === it.href || (it.prefix ? pathname.startsWith(it.prefix) : false) : pathname.startsWith(it.href);
    const Icon = it.icon;
    return (
      <Link
        key={it.href}
        href={it.href}
        aria-current={active ? "page" : undefined}
        title={it.label}
        className={cn(
          "flex items-center gap-3 rounded-[var(--radius-md)] px-2 py-2 text-sm font-medium transition-colors md:w-full md:px-3",
          active ? TONE_TILE[it.tone] : "text-ink-soft hover:bg-sand",
        )}
      >
        <span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-[10px]", !active && "bg-sand/70")}>
          <Icon size={20} />
        </span>
        <span className="hidden md:inline">{it.label}</span>
      </Link>
    );
  });

  return (
    <aside className="sticky top-0 z-20 flex h-dvh w-16 shrink-0 flex-col border-r border-line bg-surface px-2 py-4 md:w-60 md:px-4">
      <Brand compact className="mb-6 justify-center md:justify-start" />
      <div className="mb-6 hidden md:block">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Praxisbereich</p>
        <p className="truncate text-sm font-semibold text-ink">{userName}</p>
      </div>
      <nav aria-label="Praxisnavigation" className="flex flex-col gap-1">
        {links}
      </nav>
      <button
        type="button"
        onClick={logout}
        title="Abmelden"
        className="mt-auto flex items-center gap-3 rounded-[var(--radius-md)] px-2 py-2 text-sm font-medium text-ink-soft hover:bg-sand md:px-3"
      >
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] bg-sand/70">
          <PiktoAbmelden size={20} />
        </span>
        <span className="hidden md:inline">Abmelden</span>
      </button>
    </aside>
  );
}
