import { requireViewer } from "@/lib/auth/session";
import { PatientNav } from "@/components/nav/patient-nav";
import { Brand } from "@/components/brand";

export default async function PatientLayout({ children }: { children: React.ReactNode }) {
  await requireViewer("patient");
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col">
      <header className="flex items-center justify-between px-5 pt-4 pb-2">
        <Brand />
      </header>
      <main className="flex-1 px-5 pb-28 pt-2">{children}</main>
      <PatientNav />
    </div>
  );
}
