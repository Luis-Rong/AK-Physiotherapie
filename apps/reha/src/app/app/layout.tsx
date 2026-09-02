import { requireViewer } from "@/lib/auth/session";
import { PatientNav } from "@/components/nav/patient-nav";

export default async function PatientLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireViewer("patient");
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col">
      <header className="flex items-center justify-between px-5 pt-5 pb-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Rehabilitationstagebuch</p>
          <p className="text-lg font-semibold text-ink">Hallo {user.name.split(" ")[0]}</p>
        </div>
      </header>
      <main className="flex-1 px-5 pb-28 pt-2">{children}</main>
      <PatientNav />
    </div>
  );
}
