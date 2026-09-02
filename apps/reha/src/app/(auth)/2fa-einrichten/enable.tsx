"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import { authClient } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { Alert } from "@/components/ui/card";
import { TotpForm } from "../2fa/totp-form";

type Step = { name: "password" } | { name: "scan"; uri: string; qr: string; backupCodes: string[] } | { name: "done"; backupCodes: string[] };

export function EnableTwoFactor() {
  const router = useRouter();
  const [step, setStep] = useState<Step>({ name: "password" });
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function start(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { data, error } = await authClient.twoFactor.enable({ password });
    setBusy(false);
    if (error || !data || data.method !== "totp") {
      setError("Das Passwort ist nicht korrekt.");
      return;
    }
    const qr = await QRCode.toDataURL(data.totpURI, { margin: 1, width: 220, color: { dark: "#2A211B", light: "#FFFFFF" } });
    setStep({ name: "scan", uri: data.totpURI, qr, backupCodes: data.backupCodes });
  }

  if (step.name === "password") {
    return (
      <form onSubmit={start} className="mt-6 space-y-4" noValidate>
        <Field label="Passwort bestätigen" htmlFor="pw">
          <Input id="pw" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>
        {error && <Alert tone="danger">{error}</Alert>}
        <Button type="submit" size="lg" className="w-full" disabled={busy}>
          {busy ? "Wird vorbereitet …" : "Weiter"}
        </Button>
      </form>
    );
  }

  if (step.name === "scan") {
    const secret = new URL(step.uri).searchParams.get("secret") ?? "";
    return (
      <div className="mt-6 space-y-5">
        <ol className="list-decimal space-y-2 pl-5 text-sm text-ink-soft">
          <li>QR-Code mit der Authenticator-App scannen.</li>
          <li>Den angezeigten sechsstelligen Code unten eingeben.</li>
        </ol>
        <div className="flex flex-col items-center gap-3 rounded-[var(--radius-md)] border border-line bg-surface p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={step.qr} alt="QR-Code für die Authenticator-App" width={220} height={220} />
          <p className="text-xs text-muted">Manuell eintragen:</p>
          <code className="break-all text-center text-xs text-ink">{secret}</code>
        </div>
        <TotpForm mode="enable" onVerified={() => setStep({ name: "done", backupCodes: step.backupCodes })} />
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      <Alert tone="success">Der zweite Faktor ist aktiv.</Alert>
      <p className="text-sm text-ink-soft">
        Bewahren Sie diese Ersatzcodes an einem sicheren Ort auf (Passwort-Manager, Tresor). Jeder Code gilt einmal,
        falls die App nicht verfügbar ist. Sie werden nur jetzt angezeigt.
      </p>
      <ul className="grid grid-cols-2 gap-2 rounded-[var(--radius-md)] bg-sand p-3 font-mono text-sm">
        {step.backupCodes.map((c) => (
          <li key={c}>{c}</li>
        ))}
      </ul>
      <Button
        size="lg"
        className="w-full"
        onClick={() => {
          router.push("/praxis");
          router.refresh();
        }}
      >
        Zur Praxisübersicht
      </Button>
    </div>
  );
}
