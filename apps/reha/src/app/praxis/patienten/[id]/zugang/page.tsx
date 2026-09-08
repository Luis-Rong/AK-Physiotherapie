import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { PiktoDownload } from "@/components/pikto";
import { requireViewer } from "@/lib/auth/session";
import { auth } from "@/lib/auth/auth";
import { getPatient, listLoginEvents } from "@/lib/data/patients";
import { formatDateTime } from "@/lib/dates";
import { Card, CardTitle } from "@/components/ui/card";
import { AccessControls } from "./access-controls";

export default async function AccessPage({ params }: { params: Promise<{ id: string }> }) {
  await requireViewer("praxis");
  const { id } = await params;
  const patient = await getPatient(id);
  if (!patient) notFound();
  const [events, sessions] = await Promise.all([
    listLoginEvents(id, 25),
    auth.api.listUserSessions({ headers: await headers(), body: { userId: id } }).catch(() => ({ sessions: [] as { id: string; token: string; createdAt: Date; expiresAt: Date; ipAddress?: string | null; userAgent?: string | null }[] })),
  ]);

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="space-y-5">
        <Card className="border-sun/40 bg-sun-soft/40">
          <CardTitle>Übergabe am Tresen</CardTitle>
          <p className="mt-1 text-sm text-ink-soft">
            Ein Blatt mit QR-Code zum Login und Feld für das handschriftliche Passwort. Ausdrucken, Passwort eintragen, mitgeben.
          </p>
          <Link href={`/praxis/patienten/${id}/zugang/ausdruck`} className="mt-3 inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-sun px-4 py-2.5 text-sm font-semibold text-white hover:bg-sun-deep">
            <PiktoDownload size={16} /> Übergabeblatt öffnen
          </Link>
        </Card>
        <Card>
          <CardTitle>Zugang verwalten</CardTitle>
          <p className="mt-1 text-sm text-muted">Reset und Sperre wirken sofort; alle Geräte werden abgemeldet.</p>
          <AccessControls
            id={id}
            banned={patient.banned}
            banReason={patient.banReason}
            mustChangePassword={patient.mustChangePassword}
            tempExpires={patient.tempPasswordExpiresAt ? formatDateTime(patient.tempPasswordExpiresAt) : null}
            email={patient.email}
          />
        </Card>
        <Card>
          <CardTitle>Aktive Sitzungen</CardTitle>
          {sessions.sessions.length === 0 ? (
            <p className="mt-2 text-sm text-muted">Keine aktive Sitzung.</p>
          ) : (
            <ul className="mt-2 divide-y divide-line text-sm">
              {sessions.sessions.map((s) => (
                <li key={s.id} className="py-2">
                  <p className="text-ink">seit {formatDateTime(new Date(s.createdAt))} · läuft ab {formatDateTime(new Date(s.expiresAt))}</p>
                  <p className="truncate text-xs text-muted">{s.ipAddress ?? "IP unbekannt"} · {s.userAgent ?? "Gerät unbekannt"}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
      <Card>
        <CardTitle>Anmeldungen</CardTitle>
        <p className="mt-1 text-xs text-muted">Erfolgreiche und fehlgeschlagene Versuche (ADR 0005).</p>
        {events.length === 0 ? (
          <p className="mt-2 text-sm text-muted">Noch keine Anmeldung.</p>
        ) : (
          <ul className="mt-2 divide-y divide-line text-sm">
            {events.map((e) => (
              <li key={e.id} className="flex items-center justify-between gap-3 py-2">
                <span className="text-ink">{formatDateTime(e.at)}</span>
                <span className={e.success ? "text-moss" : "text-danger"}>{e.success ? "erfolgreich" : "fehlgeschlagen"}</span>
                <span className="truncate text-xs text-muted">{e.ip ?? ""}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
