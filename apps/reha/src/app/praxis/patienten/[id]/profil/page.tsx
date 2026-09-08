import { notFound } from "next/navigation";
import { requireViewer } from "@/lib/auth/session";
import { getCurrentProfile, getPatient, listAssessments } from "@/lib/data/patients";
import { formatDate } from "@/lib/dates";
import { Card, CardTitle } from "@/components/ui/card";
import { ProfileForm } from "./profile-form";
import { AssessmentForm } from "./assessment-form";
import { AssessmentChart } from "@/components/assessments/assessment-chart";

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  await requireViewer("praxis");
  const { id } = await params;
  const patient = await getPatient(id);
  if (!patient) notFound();
  const [profile, assessments] = await Promise.all([getCurrentProfile(id), listAssessments(id)]);

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card>
        <CardTitle>Angaben zur Person</CardTitle>
        <p className="mt-1 text-xs text-muted">Jede Änderung wird als neue Fassung gespeichert{profile ? `, aktuell Fassung ${profile.version} vom ${formatDate(profile.createdAt.toISOString().slice(0, 10))}` : ""}.</p>
        <ProfileForm
          id={id}
          initial={{
            goal: profile?.goal ?? "",
            movementProfile: profile?.movementProfile ?? "",
            notes: profile?.notes ?? "",
            krsStage: profile?.krsStage ?? null,
            opContext: profile?.opContext ?? false,
            calorieTarget: profile?.calorieTarget ?? null,
            proteinTargetG: profile?.proteinTargetG ?? null,
          }}
        />
      </Card>
      <div className="space-y-5">
        <Card>
          <CardTitle>Assessments</CardTitle>
          <p className="mt-1 text-xs text-muted">Messungen als Referenz für das Therapieziel. Die Patientin / der Patient sieht sie ohne Bewertung.</p>
          {assessments.length === 0 ? (
            <p className="mt-2 text-sm text-muted">Noch keine Messung.</p>
          ) : (
            <>
            <div className="mt-4">
              <AssessmentChart rows={assessments.map((a) => ({ name: a.name, side: a.side, assessedOn: a.assessedOn, score: a.score }))} />
            </div>
            <table className="mt-3 w-full text-sm">
              <thead><tr className="text-left text-xs uppercase tracking-wide text-muted"><th className="pb-2 font-medium">Datum</th><th className="pb-2 font-medium">Assessment</th><th className="pb-2 font-medium">Seite</th><th className="pb-2 text-right font-medium">Wert</th></tr></thead>
              <tbody className="divide-y divide-line">
                {assessments.map((a) => (
                  <tr key={a.id}><td className="py-2 text-ink-soft">{formatDate(a.assessedOn)}</td><td className="py-2 text-ink">{a.name}{a.remark ? <span className="block text-xs text-muted">{a.remark}</span> : null}</td><td className="py-2 text-ink-soft">{a.side ?? "–"}</td><td className="py-2 text-right font-medium text-ink">{a.score}</td></tr>
                ))}
              </tbody>
            </table>
            </>
          )}
        </Card>
        <Card>
          <CardTitle>Messung erfassen</CardTitle>
          <AssessmentForm id={id} />
        </Card>
      </div>
    </div>
  );
}
