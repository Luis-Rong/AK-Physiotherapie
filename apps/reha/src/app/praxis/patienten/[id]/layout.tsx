import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireViewer } from "@/lib/auth/session";
import { getPatient } from "@/lib/data/patients";
import { Badge } from "@/components/ui/card";
import { PatientSubnav } from "@/components/praxis/patient-subnav";

export default async function PatientLayout({ children, params }: { children: React.ReactNode; params: Promise<{ id: string }> }) {
  await requireViewer("praxis");
  const { id } = await params;
  const patient = await getPatient(id);
  if (!patient) notFound();
  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <Link href="/praxis" className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink"><ArrowLeft size={16} /> Patienten</Link>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold text-ink">{patient.name}</h1>
        {patient.banned ? <Badge tone="rot">gesperrt</Badge> : patient.mustChangePassword ? <Badge tone="gelb">temporäres Passwort</Badge> : <Badge tone="moss">aktiv</Badge>}
        <span className="text-sm text-muted">{patient.email}</span>
      </div>
      <PatientSubnav id={id} />
      {children}
    </div>
  );
}
