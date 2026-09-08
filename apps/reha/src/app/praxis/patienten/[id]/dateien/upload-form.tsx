"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { withdrawFileAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { Alert } from "@/components/ui/card";

const ERRORS: Record<string, string> = {
  type: "Nur PDF, PNG, JPEG oder WebP.",
  size: "Die Datei ist größer als 10 MB.",
  forbidden: "Keine Berechtigung.",
};

export function UploadForm({ patientId }: { patientId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    fd.set("patientId", patientId);
    const res = await fetch("/api/patient-files", { method: "POST", body: fd });
    setBusy(false);
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      setError(ERRORS[body.error ?? ""] ?? "Upload fehlgeschlagen.");
      return;
    }
    formRef.current?.reset();
    router.refresh();
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="space-y-3">
      <Field label="Datei" htmlFor="file" hint="PDF, PNG, JPEG oder WebP, bis 10 MB. Zum Beispiel ein Übungsblatt, ein Foto der richtigen Ausführung, eine Befundkopie.">
        <Input id="file" name="file" type="file" required accept="application/pdf,image/png,image/jpeg,image/webp" className="h-auto py-2" />
      </Field>
      <Field label="Kurze Beschreibung" htmlFor="note" hint="Sieht die Patientin / der Patient neben der Datei.">
        <Input id="note" name="note" maxLength={300} placeholder="z. B. Übungsblatt Woche 3" />
      </Field>
      {error && <Alert tone="danger">{error}</Alert>}
      <Button type="submit" variant="accent" disabled={busy}>
        {busy ? "Wird hochgeladen …" : "Datei hinterlegen"}
      </Button>
    </form>
  );
}

export function WithdrawButton({ fileId }: { fileId: string }) {
  const [pending, start] = useTransition();
  return (
    <Button type="button" variant="ghost" size="sm" disabled={pending} onClick={() => start(() => withdrawFileAction(fileId))}>
      Zurückziehen
    </Button>
  );
}
