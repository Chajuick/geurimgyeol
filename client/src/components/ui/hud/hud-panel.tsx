import * as React from "react";
import { cn } from "@/lib/utils";

type HUDPanelProps = {
  className?: string;
  children: React.ReactNode;

  /** 상단 하이라이트 라인 */
  corners?: boolean;

  /** 상단에서 내려오는 은은한 광 */
  scanline?: boolean;

  /** 미세 도트 텍스처 */
  grid?: boolean;
};

export default function HUDPanel({
  className,
  children,
  corners = true,
  scanline = true,
  grid = false,
}: HUDPanelProps) {
  return (
    <div className={cn("gyeol-surface overflow-hidden", className)}>
      {/* top hairline */}
      {corners && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
        />
      )}

      {/* soft top glow */}
      {scanline && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(165,180,252,0.06),transparent)]"
        />
      )}

      {/* dot texture */}
      {grid && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
            maskImage: "linear-gradient(to bottom, black, transparent 70%)",
          }}
        />
      )}

      {children}
    </div>
  );
}
