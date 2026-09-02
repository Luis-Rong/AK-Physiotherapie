"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { authClient } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/card";

type S = { id: string; token: string; createdAt: string; ipAddress: string | null; userAgent: string | null; current: boolean };

export function SessionList({ sessions }: { sessions: S[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <ul className="mt-2 divide-y divide-line text-sm" aria-busy={pending}>
      {sessions.map((s) => (
        <li key={s.id} className="flex items-center justify-between gap-3 py-2">
          <div className="min-w-0">
            <p className="text-ink">
              seit {new Date(s.createdAt).toLocaleString("de-DE")} {s.current && <Badge tone="bark" className="ml-1">dieses Gerät</Badge>}
            </p>
            <p className="truncate text-xs text-muted">{s.ipAddress ?? "IP unbekannt"} · {s.userAgent ?? "Gerät unbekannt"}</p>
          </div>
          {!s.current && (
            <Button
              variant="outline"
              size="sm"
              disabled={pending}
              onClick={() =>
                start(async () => {
                  await authClient.revokeSession({ token: s.token });
                  router.refresh();
                })
              }
            >
              Abmelden
            </Button>
          )}
        </li>
      ))}
    </ul>
  );
}
