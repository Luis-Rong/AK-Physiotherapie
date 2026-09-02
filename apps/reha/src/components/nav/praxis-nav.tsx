"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, Dumbbell, LogOut, Settings, Users } from "lucide-react";
import { Brand } from "@/components/brand";
import { authClient } from "@/lib/auth/client";
import { cn } from "@/lib/cn";

const items = [
  { href: "/praxis", label: "Patienten", icon: Users, exact: true, prefix: "/praxis/patienten" },
  { href: "/praxis/uebungen", label: "Übungen", icon: Dumbbell },
  { href: "/praxis/wissen", label: "Wissen", icon: BookOpen },
  { href: "/praxis/konto", label: "Konto", icon: Settings },
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
    const active = it.exact
      ? pathname === it.href || (it.prefix ? pathname.startsWith(it.prefix) : false)
      : pathname.startsWith(it.href);
    const Icon = it.icon;
    return (
      <Link
        key={it.href}
        href={it.href}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium transition-colors md:w-full",
          active ? "bg-bark-soft text-bark" : "text-ink-soft hover:bg-sand",
        )}
      >
        <Icon size={18} aria-hidden />
        <span className="hidden md:inline">{it.label}</span>
      </Link>
    );
  });

  return (
    <aside className="sticky top-0 z-20 flex h-dvh w-16 shrink-0 flex-col border-r border-line bg-surface px-2 py-4 md:w-60 md:px-4">
      <Brand compact className="mb-6 justify-center md:justify-start" />
      <div className="mb-6 hidden md:block">
        <p className="text-xs uppercase tracking-wide text-muted">Praxisbereich</p>
        <p className="truncate text-sm font-semibold text-ink">{userName}</p>
      </div>
      <nav aria-label="Praxisnavigation" className="flex flex-col gap-1">
        {links}
      </nav>
      <button
        type="button"
        onClick={logout}
        className="mt-auto flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium text-ink-soft hover:bg-sand"
      >
        <LogOut size={18} aria-hidden />
        <span className="hidden md:inline">Abmelden</span>
      </button>
    </aside>
  );
}
