"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { Alert } from "@/components/ui/card";

export function TotpForm({ mode, onVerified }: { mode: "verify" | "enable"; onVerified?: () => void }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error } = await authClient.twoFactor.verifyTotp({ code: code.replace(/\s/g, ""), trustDevice: false });
    setBusy(false);
    if (error) {
      setError(
        error.status === 429 || error.message?.toLowerCase().includes("lock")
          ? "Zu viele Fehlversuche. Bitte warten Sie 15 Minuten."
          : "Der Code ist nicht gültig. Bitte prüfen Sie Uhrzeit und App.",
      );
      return;
    }
    if (mode === "enable") {
      onVerified?.();
      return;
    }
    router.push("/praxis");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
      <Field label="Code" htmlFor="code">
        <Input
          id="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9 ]*"
          maxLength={7}
          required
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="text-center text-2xl tracking-[0.4em]"
        />
      </Field>
      {error && <Alert tone="danger">{error}</Alert>}
      <Button type="submit" size="lg" className="w-full" disabled={busy || code.replace(/\s/g, "").length !== 6}>
        {busy ? "Wird geprüft …" : mode === "enable" ? "Einrichtung abschließen" : "Bestätigen"}
      </Button>
    </form>
  );
}
