import Link from "next/link";
import { requireViewer } from "@/lib/auth/session";
import { getCurrentProfile, listAssessments } from "@/lib/data/patients";
import { formatDate } from "@/lib/dates";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { LogoutButton } from "./logout-button";

export default async function ProfilePage() {
  const { user } = await requireViewer("patient");
  const [profile, assessments] = await Promise.all([getCurrentProfile(user.id), listAssessments(user.id)]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-ink">{user.name}</h1>
        <CardDescription>Angaben, die Ihre Praxis für Sie hinterlegt hat.</CardDescription>
      </div>

      <Card>
        <CardTitle>Ziel und Ausgangslage</CardTitle>
        {profile ? (
          <dl className="mt-3 space-y-3 text-sm">
            {profile.goal && <div><dt className="text-xs uppercase tracking-wide text-muted">Zieldefinition</dt><dd className="mt-0.5 text-ink">{profile.goal}</dd></div>}
            {profile.movementProfile && <div><dt className="text-xs uppercase tracking-wide text-muted">Bewegungsprofil</dt><dd className="mt-0.5 text-ink">{profile.movementProfile}</dd></div>}
            {profile.krsStage && <div><dt className="text-xs uppercase tracking-wide text-muted">Aktuelle KRS-Stufe</dt><dd className="mt-0.5 text-ink">Stufe {profile.krsStage} <Link href="/app/wissen/reha-stadien" className="ml-1 text-bark">Erklärung</Link></dd></div>}
            {(profile.calorieTarget || profile.proteinTargetG) && (
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted">Zielwerte Ernährung</dt>
                <dd className="mt-0.5 text-ink">{[profile.calorieTarget && `${profile.calorieTarget} kcal/Tag`, profile.proteinTargetG && `${profile.proteinTargetG} g Protein/Tag`].filter(Boolean).join(" · ")}</dd>
              </div>
            )}
            {profile.notes && <div><dt className="text-xs uppercase tracking-wide text-muted">Anmerkungen</dt><dd className="mt-0.5 text-ink">{profile.notes}</dd></div>}
            <p className="text-xs text-muted">Stand {formatDate(profile.createdAt.toISOString().slice(0, 10))}</p>
          </dl>
        ) : (
          <p className="mt-2 text-sm text-muted">Noch keine Angaben hinterlegt.</p>
        )}
      </Card>

      <Card>
        <CardTitle>Assessments</CardTitle>
        <p className="mt-1 text-xs text-muted">Messungen aus der Praxis, als Referenz für Ihr Therapieziel.</p>
        {assessments.length === 0 ? (
          <p className="mt-2 text-sm text-muted">Noch keine Messungen.</p>
        ) : (
          <table className="mt-3 w-full text-sm">
            <thead><tr className="text-left text-xs uppercase tracking-wide text-muted"><th className="pb-2 font-medium">Datum</th><th className="pb-2 font-medium">Assessment</th><th className="pb-2 font-medium">Seite</th><th className="pb-2 text-right font-medium">Wert</th></tr></thead>
            <tbody className="divide-y divide-line">
              {assessments.map((a) => (
                <tr key={a.id}><td className="py-2 text-ink-soft">{formatDate(a.assessedOn)}</td><td className="py-2 text-ink">{a.name}</td><td className="py-2 text-ink-soft">{a.side ?? "–"}</td><td className="py-2 text-right font-medium text-ink">{a.score}</td></tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Card>
        <CardTitle>Konto</CardTitle>
        <p className="mt-1 text-sm text-muted">{user.email}</p>
        <div className="mt-3 flex flex-col gap-2">
          <Link href="/passwort-aendern" className="rounded-[var(--radius-md)] bg-sand px-4 py-2.5 text-center text-sm font-semibold text-ink hover:bg-sand-deep">Passwort ändern</Link>
          <LogoutButton />
        </div>
        <p className="mt-4 text-xs text-muted">
          Sie können Ihre Einwilligung jederzeit gegenüber Ihrer Praxis widerrufen. Behandlungsdokumentation wird zehn Jahre aufbewahrt.
        </p>
      </Card>
    </div>
  );
}
