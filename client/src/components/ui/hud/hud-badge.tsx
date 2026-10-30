import * as React from "react";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "warn" | "danger" | "info";

const TONE: Record<Tone, { box: string; dot: string }> = {
  neutral: {
    box: "bg-white/[0.04] border-white/10 text-white/60",
    dot: "bg-white/40",
  },
  warn: {
    box: "bg-amber-400/[0.08] border-amber-300/20 text-amber-200/90",
    dot: "bg-amber-300",
  },
  danger: {
    box: "bg-red-400/[0.08] border-red-300/20 text-red-200/90",
    dot: "bg-red-300",
  },
  info: {
    box: "bg-brand/[0.08] border-brand/25 text-indigo-100/90",
    dot: "bg-brand",
  },
};

export default function HUDBadge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
}) {
  const t = TONE[tone];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full",
        "text-[11px] font-medium tracking-wide border",
        t.box,
        className
      )}
    >
      <span aria-hidden className={cn("h-1.5 w-1.5 rounded-full", t.dot)} />
      {children}
    </span>
  );
}
