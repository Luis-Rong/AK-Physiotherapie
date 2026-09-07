import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { requireViewer } from "@/lib/auth/session";
import { getPatient } from "@/lib/data/patients";
import { formatDate } from "@/lib/dates";
import { PrintButton } from "./print-button";

/**
 * Übergabeblatt für den Tresen (A5): QR-Code zum Login, Feld für das handschriftlich
 * eingetragene temporäre Passwort, die ersten Schritte. Bewusst ohne Passwort im
 * Ausdruck aus dem System – das schreibt die Praxis von Hand (ADR 0005: getrennte Kanäle).
 */
export default async function HandoverPrintPage({ params }: { params: Promise<{ id: string }> }) {
  await requireViewer("praxis");
  const { id } = await params;
  const patient = await getPatient(id);
  if (!patient) notFound();
  const base = (process.env.BETTER_AUTH_URL ?? "").replace(/\/$/, "");
  const loginUrl = `${base}/login`;
  const qr = await QRCode.toString(loginUrl, { type: "svg", margin: 1, width: 160, color: { dark: "#2A211B", light: "#FFFFFF" } });
  const expires = patient.tempPasswordExpiresAt ? formatDate(patient.tempPasswordExpiresAt.toISOString().slice(0, 10)) : null;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="print:hidden">
        <PrintButton />
        <p className="mt-2 text-xs text-muted">
          A5 oder A4, Schwarz-Weiß reicht. Das Passwort tragen Sie von Hand ein – es steht absichtlich nicht im Ausdruck.
        </p>
      </div>

      <article className="print-sheet rounded-[var(--radius-lg)] border border-line bg-white p-8 text-[#2A211B] shadow-[var(--shadow-card)] print:rounded-none print:border-0 print:p-0 print:shadow-none">
        <header className="flex items-start justify-between gap-6 border-b-2 border-[#2A211B] pb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.14em] text-[#7B6C60]">AK Physiotherapie · Rehabilitationstagebuch</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight">Ihr Zugang zum Reha-Tagebuch</h1>
            <p className="mt-1 text-sm text-[#55463C]">für {patient.name}</p>
          </div>
          <div className="shrink-0" dangerouslySetInnerHTML={{ __html: qr }} aria-label={`QR-Code: ${loginUrl}`} />
        </header>

        <section className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-[#2A211B]/20 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#7B6C60]">Adresse</p>
            <p className="mt-1 break-all font-mono text-sm">{loginUrl}</p>
            <p className="mt-2 text-xs text-[#55463C]">QR-Code mit der Handykamera scannen oder Adresse eintippen. Danach „Zum Startbildschirm hinzufügen“ – dann ist es wie eine App.</p>
          </div>
          <div className="rounded-lg border border-[#2A211B]/20 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#7B6C60]">Anmeldung</p>
            <p className="mt-1 text-sm">
              E-Mail: <span className="font-mono">{patient.email}</span>
            </p>
            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-[#7B6C60]">Temporäres Passwort (handschriftlich)</p>
            <div className="mt-1 h-10 rounded border-b-2 border-dashed border-[#2A211B]/50" />
            {expires && <p className="mt-2 text-xs text-[#55463C]">gültig bis {expires}</p>}
          </div>
        </section>

        <section className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#7B6C60]">So geht es los</p>
          <ol className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
            {[
              "Adresse öffnen, mit E-Mail und dem temporären Passwort anmelden.",
              "Ein eigenes Passwort wählen (mindestens 10 Zeichen).",
              "Die Einwilligung lesen und bestätigen – ohne sie geht es nicht weiter, das ist Absicht.",
              "Nach jedem Training kurz eintragen: Übungen abhaken, Schmerz 0–10, am nächsten Morgen noch einmal.",
            ].map((s, i) => (
              <li key={i} className="flex gap-2">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#2A211B] text-xs font-bold text-white">{i + 1}</span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
        </section>

        <footer className="mt-6 border-t border-[#2A211B]/20 pt-3 text-xs text-[#55463C]">
          Dieses Blatt enthält Zugangsdaten. Bitte nicht fotografieren oder weitergeben und nach der ersten Anmeldung vernichten. Das temporäre Passwort
          wird nach dem ersten Login ungültig. Bei Problemen: in der Praxis melden, wir setzen ein neues Passwort.
        </footer>
      </article>

      <style>{`@media print { body { background: #fff; } aside, nav, header.site { display: none !important; } .print-sheet { page-break-inside: avoid; } @page { size: A5 portrait; margin: 12mm; } }`}</style>
    </div>
  );
}
