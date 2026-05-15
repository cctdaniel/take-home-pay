import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const TONE_CLASSES = {
  neutral: "border-zinc-800 bg-zinc-800/50 text-zinc-400",
  positive: "border-emerald-500/20 bg-emerald-500/10 text-zinc-300",
  warning: "border-amber-500/20 bg-amber-500/10 text-zinc-300",
} as const;

export function InfoPanel({
  title,
  children,
  tone = "neutral",
  className,
}: {
  title?: string;
  children: ReactNode;
  tone?: keyof typeof TONE_CLASSES;
  className?: string;
}) {
  return (
    <div className={cn("rounded-lg border p-3 text-xs", TONE_CLASSES[tone], className)}>
      {title ? <p className="mb-1 font-medium text-zinc-200">{title}</p> : null}
      <div className="leading-relaxed">{children}</div>
    </div>
  );
}
