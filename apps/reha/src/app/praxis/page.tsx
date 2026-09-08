import Link from "next/link";
import { Plus } from "lucide-react";
import { requireViewer } from "@/lib/auth/session";
import { listPatients } from "@/lib/data/patients";
import { formatDateTime } from "@/lib/dates";
import { Badge, Card, CardDescription } from "@/components/ui/card";

export default async function PatientsPage() {
  await requireViewer("praxis");
  const patients = await listPatients();
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Patientinnen und Patienten</h1>
          <CardDescription>Alle Konten, die Sie angelegt haben. Termine und Abrechnung bleiben in thevea.</CardDescription>
        </div>
        <Link href="/praxis/patienten/neu" className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-clay px-4 py-2.5 text-sm font-semibold text-[#FFF7F0] hover:bg-clay-deep">
          <Plus size={16} /> Konto anlegen
        </Link>
      </div>
      <Card className="p-0">
        {patients.length === 0 ? (
          <p className="p-5 text-sm text-muted">Noch keine Konten. Legen Sie das erste an.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="hidden px-5 py-3 font-medium md:table-cell">E-Mail</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="hidden px-5 py-3 font-medium md:table-cell">Letzte Anmeldung</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {patients.map((p) => (
                <tr key={p.id} className="hover:bg-sand/60">
                  <td className="px-5 py-3">
                    <Link href={`/praxis/patienten/${p.id}`} className="font-medium text-ink hover:text-bark">{p.name}</Link>
                  </td>
                  <td className="hidden px-5 py-3 text-ink-soft md:table-cell">{p.email}</td>
                  <td className="px-5 py-3">
                    {p.banned ? <Badge tone="rot">gesperrt</Badge> : p.mustChangePassword ? <Badge tone="gelb">temporäres Passwort</Badge> : <Badge tone="moss">aktiv</Badge>}
                  </td>
                  <td className="hidden px-5 py-3 text-ink-soft md:table-cell">{p.lastLogin ? formatDateTime(new Date(p.lastLogin)) : "noch nie"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
