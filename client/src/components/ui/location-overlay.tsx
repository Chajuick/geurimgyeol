import { cn } from "@/lib/utils";

export default function LocatingOverlay({ show, text }: { show: boolean; text?: string }) {
    return (
        <div
            className={cn(
                "pointer-events-none absolute inset-0 z-[80]",
                "transition-opacity duration-300 ease-out",
                show ? "opacity-100" : "opacity-0"
            )}
            aria-hidden={!show}
        >
            {/* 얇은 어둠 + 블러 */}
            <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />

            {/* 중앙 HUD */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div
                    className={cn(
                        "rounded-2xl border border-white/10 bg-black/40",
                        "px-6 py-4 shadow-[0_18px_45px_rgba(0,0,0,0.45)]"
                    )}
                >
                    <div className="flex items-center gap-3">
                        {/* 스피너 */}
                        <div className="h-4 w-4 rounded-full border border-white/30 border-t-white/80 animate-spin" />
                        <div className="text-[11px] tracking-[0.26em] text-white/70">
                            {text ?? "LOCATING"}
                            <span className="inline-block w-6">
                                <span className="animate-[gyeolDots_1.2s_infinite]">...</span>
                            </span>
                        </div>
                    </div>
                    <div className="mt-1 text-xs text-white/45">
                        길을 찾는 중입니다.
                    </div>
                </div>
            </div>

            {/* dots keyframes (tailwind 임시) */}
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