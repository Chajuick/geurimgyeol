import { cn } from "@/lib/utils";

export function LoadingOverlay({ show, title, text }: { show: boolean; title?: string, text?: string; }) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 z-[80]",
        "transition-opacity duration-300 ease-out",
        show ? "opacity-100" : "opacity-0"
      )}
      aria-hidden={!show}
    >
      <div className="absolute inset-0 bg-black" />

      <div className="absolute inset-0 flex items-center justify-center px-4">
        <div
          className={cn(
            "rounded-2xl border border-white/10 bg-black/40",
            "px-5 sm:px-6 py-4 shadow-[0_18px_45px_rgba(0,0,0,0.45)]"
          )}
        >
          <div className="flex items-center gap-3">
            <div className="h-4 w-4 rounded-full border border-white/30 border-t-white/80 animate-spin" />
            <div className="text-[11px] tracking-[0.26em] text-white/70">
              {title || "NOW LOADING"}
              <span className="inline-block w-6 align-baseline">
                <span className="animate-[gyeolDots_1.2s_infinite]">...</span>
              </span>
            </div>
          </div>
          <div className="mt-1 text-xs text-white/45 text-center">{text || "로딩 중입니다."}</div>
        </div>
      </div>

      <style>{`
        @keyframes gyeolDots {
          0% { opacity: .2 }
          50% { opacity: 1 }
          100% { opacity: .2 }
        }
      `}</style>
    </div>
  );
}