import * as React from "react";
import { cn } from "@/lib/cn";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-[var(--radius-lg)] border border-line bg-surface p-5 shadow-[var(--shadow-card)]", className)}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("text-lg font-semibold tracking-tight text-ink", className)} {...props} />;
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-muted", className)} {...props} />;
}

export function Alert({
  tone = "info",
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { tone?: "info" | "danger" | "success" }) {
  const tones = {
    info: "bg-bark-soft text-ink-soft border-line",
    danger: "bg-danger-soft text-danger border-danger/20",
    success: "bg-moss-soft text-moss border-moss/20",
  };
  return <div role="status" className={cn("rounded-[var(--radius-md)] border px-4 py-3 text-sm", tones[tone], className)} {...props} />;
}

export function Badge({
  tone = "neutral",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: "neutral" | "bark" | "clay" | "moss" | "gruen" | "gelb" | "rot" }) {
  const tones = {
    neutral: "bg-sand text-ink-soft",
    bark: "bg-bark-soft text-bark",
    clay: "bg-clay-soft text-clay-deep",
    moss: "bg-moss-soft text-moss",
    gruen: "bg-ampel-gruen-soft text-ampel-gruen",
    gelb: "bg-ampel-gelb-soft text-[#7A5A10]",
    rot: "bg-ampel-rot-soft text-ampel-rot",
  };
  return (
    <span
      className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", tones[tone], className)}
      {...props}
    />
  );
}
