import { requireViewer } from "@/lib/auth/session";
import { PraxisNav } from "@/components/nav/praxis-nav";

export default async function PraxisLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireViewer("praxis");
  return (
    <div className="flex min-h-dvh">
      <PraxisNav userName={user.name} />
      <main className="min-w-0 flex-1 px-5 py-6 md:px-10 md:py-8">{children}</main>
    </div>
  );
}
