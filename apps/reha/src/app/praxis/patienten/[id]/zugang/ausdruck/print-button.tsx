"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PiktoPfeilLinks } from "@/components/pikto";

export function PrintButton() {
  const { id } = useParams<{ id: string }>();
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Link href={`/praxis/patienten/${id}/zugang`} className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
        <PiktoPfeilLinks size={16} /> Zugang
      </Link>
      <Button type="button" variant="accent" onClick={() => window.print()}>
        Übergabeblatt drucken
      </Button>
    </div>
  );
}
