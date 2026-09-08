import { cn } from "@/lib/cn";

/** Wortmarke der Reha-Plattform. Das echte Logo (SVG) folgt, sobald es vorliegt. */
export function Brand({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-bark text-[13px] font-bold tracking-tight text-[#F3EBDF]">
        AK
      </span>
      {!compact && (
        <span className="leading-tight">
          <span className="block text-[15px] font-semibold text-ink">AK Physio</span>
          <span className="block text-xs text-muted">Rehabilitationstagebuch</span>
        </span>
      )}
    </div>
  );
}
