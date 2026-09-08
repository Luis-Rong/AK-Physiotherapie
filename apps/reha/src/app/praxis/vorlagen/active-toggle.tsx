"use client";

import { useTransition } from "react";
import { setTemplateActiveAction } from "./actions";
import { Button } from "@/components/ui/button";

export function TemplateActiveToggle({ id, active }: { id: string; active: boolean }) {
  const [pending, start] = useTransition();
  return (
    <Button type="button" variant="ghost" size="sm" disabled={pending} onClick={() => start(() => setTemplateActiveAction(id, !active))}>
      {active ? "Deaktivieren" : "Aktivieren"}
    </Button>
  );
}
