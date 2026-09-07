import Link from "next/link";
import { requireViewer } from "@/lib/auth/session";
import { getCurrentProfile, listAssessments } from "@/lib/data/patients";
import { formatDate } from "@/lib/dates";
import { Card } from "@/components/ui/card";
import { PageHeader, SectionTitle } from "@/components/page-header";
import { PiktoDownload, PiktoLineal, PiktoPerson, PiktoPfeil, PiktoPflanze, PiktoZiel } from "@/components/pikto";
import { LogoutButton } from "./logout-button";

export default async function ProfilePage() {
  const { user } = await requireViewer("patient");
  const [profile, assessments] = await Promise.all([getCurrentProfile(user.id), listAssessments(user.id)]);

  return (
    <div className="space-y-4">
      <PageHeader tone="bark" icon={<PiktoPerson size={30} />} title={user.name} intro="Angaben, die Ihre Praxis für Sie hinterlegt hat." />

      <Card>
        <SectionTitle tone="moss" icon={<PiktoZiel size={18} />}>
          Ziel und Ausgangslage
        </SectionTitle>
        {profile ? (
          <dl className="mt-4 space-y-3 text-sm">
            {profile.goal && (
              <div className="rounded-[var(--radius-md)] bg-moss-soft/60 p-3">
                <dt className="text-xs font-semibold uppercase tracking-wide text-moss">Ihr Ziel</dt>
                <dd className="mt-0.5 font-medium text-ink">{profile.goal}</dd>
              </div>
            )}
            {profile.movementProfile && (
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Bewegungsprofil</dt>
                <dd className="mt-0.5 text-ink">{profile.movementProfile}</dd>
              </div>
            )}
            {profile.krsStage && (
              <div className="flex items-center justify-between gap-3">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Aktuelle KRS-Stufe</dt>
                  <dd className="mt-0.5 flex items-center gap-1.5 text-ink">
                    <PiktoPflanze size={16} className="text-moss" /> Stufe {profile.krsStage}
                  </dd>
                </div>
                <Link href="/app/wissen/reha-stadien" className="inline-flex items-center gap-1 text-sm font-semibold text-moss">
                  Erklärung <PiktoPfeil size={14} />
                </Link>
              </div>
            )}
            {(profile.calorieTarget || profile.proteinTargetG) && (
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Zielwerte Ernährung</dt>
                <dd className="mt-1 flex flex-wrap gap-2">
                  {profile.calorieTarget && <span className="rounded-full bg-sun-soft px-3 py-1 text-sm font-semibold text-sun-deep">{profile.calorieTarget} kcal / Tag</span>}
                  {profile.proteinTargetG && <span className="rounded-full bg-sun-soft px-3 py-1 text-sm font-semibold text-sun-deep">{profile.proteinTargetG} g Protein / Tag</span>}
                </dd>
              </div>
            )}
            {profile.notes && (
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Anmerkungen</dt>
                <dd className="mt-0.5 text-ink">{profile.notes}</dd>
              </div>
            )}
            <p className="text-xs text-muted">Stand {formatDate(profile.createdAt.toISOString().slice(0, 10))}</p>
          </dl>
        ) : (
          <p className="mt-2 text-sm text-muted">Noch keine Angaben hinterlegt.</p>
        )}
      </Card>

      <Card>
        <SectionTitle tone="sky" icon={<PiktoLineal size={18} />}>
          Messungen
        </SectionTitle>
        <p className="mt-1 text-xs text-muted">Aus der Praxis, als Referenz für Ihr Therapieziel.</p>
        {assessments.length === 0 ? (
          <p className="mt-2 text-sm text-muted">Noch keine Messungen.</p>
        ) : (
          <ul className="mt-3 divide-y divide-line">
            {assessments.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <p className="font-medium text-ink">
                    {a.name}
                    {a.side && <span className="ml-1.5 rounded-full bg-sky-soft px-2 py-0.5 text-[11px] font-semibold text-sky-deep">{a.side}</span>}
                  </p>
                  <p className="text-xs text-muted">{formatDate(a.assessedOn)}</p>
                </div>
                <p className="shrink-0 text-lg font-bold tabular-nums text-ink">{a.score}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <SectionTitle tone="bark" icon={<PiktoPerson size={18} />}>
          Konto
        </SectionTitle>
        <p className="mt-1 text-sm text-muted">{user.email}</p>
        <div className="mt-3 flex flex-col gap-2">
          <Link href="/passwort-aendern" className="rounded-[var(--radius-md)] bg-sand px-4 py-2.5 text-center text-sm font-semibold text-ink hover:bg-sand-deep">
            Passwort ändern
          </Link>
          <a
            href="/app/profil/export"
            download
            className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] border border-line-strong px-4 py-2.5 text-center text-sm font-semibold text-ink hover:bg-sand"
          >
            <PiktoDownload size={18} /> Meine Daten herunterladen
          </a>
          <LogoutButton />
        </div>
        <p className="mt-4 text-xs text-muted">
          Der Download enthält alle zu Ihrer Person gespeicherten Daten als Datei (Auskunft nach Art. 15 DSGVO). Sie können Ihre Einwilligung
          jederzeit gegenüber Ihrer Praxis widerrufen. Behandlungsdokumentation wird zehn Jahre aufbewahrt.
        </p>
      </Card>
    </div>
  );
}
