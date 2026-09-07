import { eq } from "drizzle-orm";
import { requireViewer } from "@/lib/auth/session";
import { db } from "@/db/client";
import * as t from "@/db/schema";
import { getCurrentProfile, listAssessments } from "@/lib/data/patients";
import { getWeekVersion, listCurrentWeeks, listLogsForPatient } from "@/lib/data/plan";
import { listPain } from "@/lib/data/pain";
import { getCurrentSupplementPlan } from "@/lib/data/supplements";

/**
 * Datenauskunft und -übertragbarkeit (Art. 15 und Art. 20 DSGVO, ADR 0012): Der Patient
 * lädt seine Daten als JSON – im Portal, nicht per Mail. Reine Anzeige der gespeicherten
 * Werte, keine Auswertung. Nur die eigene Sitzung; Praxiskonten kommen hier nicht hin.
 */
export async function GET() {
  const { user } = await requireViewer("patient");
  const [profile, weeks, logs, pain, supplements, assessments, consents] = await Promise.all([
    getCurrentProfile(user.id),
    listCurrentWeeks(user.id).then((ws) => Promise.all(ws.map((w) => getWeekVersion(w.id)))),
    listLogsForPatient(user.id, { from: "2000-01-01" }),
    listPain(user.id, { from: "2000-01-01" }),
    getCurrentSupplementPlan(user.id),
    listAssessments(user.id),
    db.select().from(t.consents).where(eq(t.consents.userId, user.id)),
  ]);

  const body = {
    format: "ak-physio-reha-export",
    version: 1,
    exportedAt: new Date().toISOString(),
    hinweis: "Auskunft nach Art. 15 DSGVO. Enthält die zu Ihrer Person gespeicherten Daten der Reha-Plattform, ohne Bewertung.",
    konto: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt },
    profil: profile,
    trainingsplaene: weeks,
    trainingsprotokolle: logs,
    schmerzwerte: pain,
    supplementPlan: supplements,
    messungen: assessments,
    einwilligungen: consents,
  };

  const stamp = new Date().toISOString().slice(0, 10);
  return new Response(JSON.stringify(body, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="reha-daten-${stamp}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
