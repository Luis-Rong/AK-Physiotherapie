import { Brand } from "@/components/brand";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 py-8">
      <Brand className="mb-8" />
      <div className="flex-1">{children}</div>
      <p className="mt-10 text-center text-xs text-muted">
        Praxis AK Physiotherapie · Geschützter Bereich
      </p>
    </main>
  );
}
