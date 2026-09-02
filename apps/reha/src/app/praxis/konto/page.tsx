import Link from "next/link";
import { headers } from "next/headers";
import { requireViewer } from "@/lib/auth/session";
import { auth } from "@/lib/auth/auth";
import { listLoginEvents } from "@/lib/data/patients";
import { formatDateTime } from "@/lib/dates";
import { Badge, Card, CardDescription, CardTitle } from "@/components/ui/card";
import { SessionList } from "./session-list";

export default async function AccountPage() {
  const { user, sessionId } = await requireViewer("praxis");
  const h = await headers();
  const [sessions, events] = await Promise.all([auth.api.listSessions({ headers: h }), listLoginEvents(user.id, 15)]);
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Konto</h1>
        <CardDescription>{user.name} · {user.email} · Rolle Praxis</CardDescription>
      </div>
      <Card>
        <CardTitle>Sicherheit</CardTitle>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex items-center justify-between"><dt className="text-ink-soft">Zweiter Faktor (TOTP)</dt><dd>{user.twoFactorEnabled ? <Badge tone="moss">aktiv</Badge> : <Badge tone="rot">fehlt</Badge>}</dd></div>
          <div className="flex items-center justify-between"><dt className="text-ink-soft">Passwort</dt><dd><Link href="/passwort-aendern" className="font-semibold text-bark">ändern</Link></dd></div>
        </dl>
        <p className="mt-3 text-xs text-muted">Praxiszugänge sehen Gesundheitsdaten aller Patientinnen und Patienten. Jede Person nutzt ein eigenes Konto; Konten werden nicht geteilt (§ 203 StGB, Audit-Log).</p>
      </Card>
      <Card>
        <CardTitle>Aktive Sitzungen</CardTitle>
        <SessionList sessions={sessions.map((s) => ({ id: s.id, token: s.token, createdAt: s.createdAt.toISOString(), ipAddress: s.ipAddress ?? null, userAgent: s.userAgent ?? null, current: s.id === sessionId }))} />
      </Card>
      <Card>
        <CardTitle>Letzte Anmeldungen</CardTitle>
        <ul className="mt-2 divide-y divide-line text-sm">
          {events.map((e) => (
            <li key={e.id} className="flex items-center justify-between gap-3 py-2">
              <span className="text-ink">{formatDateTime(e.at)}</span>
              <span className={e.success ? "text-moss" : "text-danger"}>{e.success ? "erfolgreich" : "fehlgeschlagen"}</span>
              <span className="truncate text-xs text-muted">{e.ip ?? ""}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
