"use client";

import { useState } from "react";
import { Copy, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Zeigt ein temporäres Passwort genau einmal; danach ist es nicht mehr abrufbar. */
export function TempPasswordReveal({ email, password, expires }: { email: string; password: string; expires: string }) {
  const [shown, setShown] = useState(true);
  const [copied, setCopied] = useState(false);
  return (
    <div className="rounded-[var(--radius-md)] border border-clay/30 bg-clay-soft/40 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-clay-deep">Temporäres Passwort · nur jetzt sichtbar</p>
      <dl className="mt-2 space-y-1 text-sm">
        <div className="flex gap-2"><dt className="w-24 text-muted">Anmeldung</dt><dd className="text-ink">{email}</dd></div>
        <div className="flex items-center gap-2">
          <dt className="w-24 text-muted">Passwort</dt>
          <dd className="font-mono text-lg tracking-wide text-ink">{shown ? password : "••••-••••-••••"}</dd>
          <Button variant="ghost" size="icon" aria-label={shown ? "verbergen" : "anzeigen"} onClick={() => setShown((s) => !s)}>{shown ? <EyeOff size={16} /> : <Eye size={16} />}</Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="kopieren"
            onClick={async () => {
              await navigator.clipboard.writeText(password);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
          >
            <Copy size={16} />
          </Button>
          {copied && <span className="text-xs text-moss">kopiert</span>}
        </div>
        <div className="flex gap-2"><dt className="w-24 text-muted">Gültig bis</dt><dd className="text-ink">{expires}</dd></div>
      </dl>
      <p className="mt-3 text-xs text-ink-soft">
        Passwort persönlich, per SMS oder auf Papier übergeben, nicht im selben Kanal wie den Link (ADR 0005). Am einfachsten: das Übergabeblatt
        unter „Zugang“ drucken und das Passwort dort von Hand eintragen.
      </p>
    </div>
  );
}
