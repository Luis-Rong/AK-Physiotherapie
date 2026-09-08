import { notFound } from "next/navigation";
import { requireViewer } from "@/lib/auth/session";
import { getPatient } from "@/lib/data/patients";
import { listPatientFiles } from "@/lib/data/files";
import { formatDateTime } from "@/lib/dates";
import { Badge, Card, CardTitle } from "@/components/ui/card";
import { UploadForm, WithdrawButton } from "./upload-form";

function fmtSize(n: number): string {
  return n >= 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`;
}

export default async function FilesPage({ params }: { params: Promise<{ id: string }> }) {
  await requireViewer("praxis");
  const { id } = await params;
  const patient = await getPatient(id);
  if (!patient) notFound();
  const files = await listPatientFiles(id, { all: true });

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card>
        <CardTitle>Datei hinterlegen</CardTitle>
        <p className="mb-3 mt-1 text-xs text-muted">
          Statt Mail oder Messenger: Die Datei liegt im Portal, nur diese Person und die Praxis sehen sie. Jede Ablage wird protokolliert.
        </p>
        <UploadForm patientId={id} />
      </Card>
      <Card>
        <CardTitle>Hinterlegte Dateien</CardTitle>
        {files.length === 0 ? (
          <p className="mt-2 text-sm text-muted">Noch keine Datei.</p>
        ) : (
          <ul className="mt-2 divide-y divide-line text-sm">
            {files.map((f) => (
              <li key={f.id} className="flex flex-wrap items-center gap-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <a href={`/api/patient-files/${f.id}`} target="_blank" rel="noopener" className={f.withdrawn ? "text-muted line-through" : "font-medium text-ink hover:underline"}>
                    {f.filename}
                  </a>
                  <p className="text-xs text-muted">
                    {f.note ? `${f.note} · ` : ""}
                    {fmtSize(f.size)} · {formatDateTime(f.createdAt)}
                  </p>
                </div>
                {f.withdrawn ? <Badge>zurückgezogen</Badge> : <WithdrawButton fileId={f.id} />}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
