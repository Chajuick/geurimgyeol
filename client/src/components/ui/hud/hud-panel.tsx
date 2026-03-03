import * as React from "react";
import { cn } from "@/lib/utils";

type HUDPanelProps = {
  className?: string;
  children: React.ReactNode;

  /** 코너 브래킷 표시 */
  corners?: boolean;

  /** 스캔라인 오버레이 */
  scanline?: boolean;

  /** 그리드 오버레이 */
  grid?: boolean;
};

export default function HUDPanel({
  className,
  children,
  corners = true,
  scanline = true,
  grid = true,
}: HUDPanelProps) {
  return (
    <div
      className={cn(
        "relative rounded-2xl overflow-hidden",
        "border border-white/10 bg-white/[0.04]",
        "shadow-[0_18px_60px_rgba(0,0,0,0.55)]",
        className
      )}
    >
      {/* corner brackets */}
      {corners && (
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute left-3 top-3 w-6 h-6 border-l border-t border-white/25" />
          <div className="absolute right-3 top-3 w-6 h-6 border-r border-t border-white/25" />
          <div className="absolute left-3 bottom-3 w-6 h-6 border-l border-b border-white/20" />
          <div className="absolute right-3 bottom-3 w-6 h-6 border-r border-b border-white/20" />
        </div>
      )}

      {/* scanline */}
      {scanline && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(to bottom, rgba(255,255,255,0.06), rgba(255,255,255,0.00) 30%, rgba(0,0,0,0.20) 70%, rgba(255,255,255,0.04))",
          }}
        />
      )}

      {/* subtle grid */}
      {grid && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.10]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.10) 1px, transparent 1px)",
            backgroundSize: "38px 38px",
          }}
        />
      )}

      {children}
    </div>
  );
}
