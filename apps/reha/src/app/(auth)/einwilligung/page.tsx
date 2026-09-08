import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { requireSessionUser } from "@/lib/auth/session";
import { CONSENT_VERSION, consentSections } from "@/lib/consent/document";
import { ConsentForm } from "./consent-form";

export default async function ConsentPage() {
  await requireSessionUser();
  return (
    <Card>
      <CardTitle>Einwilligung</CardTitle>
      <CardDescription className="mt-1">
        Bevor Sie das Portal nutzen, bitten wir um Ihre Zustimmung zur Verarbeitung Ihrer Gesundheitsdaten.
      </CardDescription>
      <div className="mt-5 space-y-4 text-sm leading-relaxed text-ink-soft">
        {consentSections.map((s) => (
          <section key={s.title}>
            <h3 className="mb-1 font-semibold text-ink">{s.title}</h3>
            <p>{s.body}</p>
          </section>
        ))}
        <p className="text-xs text-muted">Fassung {CONSENT_VERSION}</p>
      </div>
      <ConsentForm />
    </Card>
  );
}
