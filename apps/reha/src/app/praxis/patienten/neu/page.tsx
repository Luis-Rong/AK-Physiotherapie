import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireViewer } from "@/lib/auth/session";
import { Card, CardDescription } from "@/components/ui/card";
import { NewPatientForm } from "./new-patient-form";

export default async function NewPatientPage() {
  await requireViewer("praxis");
  return (
    <div className="mx-auto max-w-xl space-y-5">
      <Link href="/praxis" className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink"><ArrowLeft size={16} /> Patienten</Link>
      <div>
        <h1 className="text-2xl font-semibold text-ink">Konto anlegen</h1>
        <CardDescription>
          Sie erhalten ein temporäres Passwort, das Sie der Person persönlich mitgeben. Es gilt sieben Tage; bei der ersten Anmeldung wird ein eigenes Passwort gesetzt.
        </CardDescription>
      </div>
      <Card>
        <NewPatientForm />
      </Card>
    </div>
  );
}
