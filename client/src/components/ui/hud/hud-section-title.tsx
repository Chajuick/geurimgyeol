import * as React from "react";
import { cn } from "@/lib/utils";

export default function HUDSectionTitle({
  children,
  right,
  className,
}: {
  children: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      <div className="text-[12px] tracking-[0.26em] text-white/55">
        {children}
      </div>
      {right}
    </div>
  );
}