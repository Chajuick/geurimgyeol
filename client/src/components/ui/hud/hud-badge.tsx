import * as React from "react";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "warn" | "danger" | "info";

export default function HUDBadge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
}) {
  const toneCls =
    tone === "warn"
      ? "bg-amber-500/10 border-amber-300/30 text-amber-100"
      : tone === "danger"
        ? "bg-red-500/10 border-red-300/30 text-red-100"
        : tone === "info"
          ? "bg-sky-500/10 border-sky-300/30 text-sky-100"
          : "bg-white/5 border-white/15 text-white/70";

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-full",
        "text-[11px] tracking-wide border",
        toneCls,
        className
      )}
    >
      {children}
    </span>
  );
}
