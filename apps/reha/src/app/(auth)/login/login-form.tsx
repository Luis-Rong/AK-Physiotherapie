"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { Alert } from "@/components/ui/card";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { data, error } = await authClient.signIn.email({ email: email.trim().toLowerCase(), password });
    setBusy(false);
    if (error) {
      setError(
        error.status === 429
          ? "Zu viele Versuche. Bitte warten Sie eine Minute."
          : error.status === 403 && error.message?.toLowerCase().includes("gesperrt")
            ? error.message
            : "E-Mail-Adresse oder Passwort ist nicht korrekt.",
      );
      return;
    }
    if (data && "twoFactorRedirect" in data && data.twoFactorRedirect) {
      router.push("/2fa");
      return;
    }
    router.push("/app");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
      <Field label="E-Mail-Adresse" htmlFor="email">
        <Input
          id="email"
          type="email"
          autoComplete="username"
          inputMode="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </Field>
      <Field label="Passwort" htmlFor="password">
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </Field>
      {error && <Alert tone="danger">{error}</Alert>}
      <Button type="submit" size="lg" className="w-full" disabled={busy}>
        {busy ? "Wird geprüft …" : "Anmelden"}
      </Button>
    </form>
  );
}
