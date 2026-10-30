import { cn } from "@/lib/utils";
import LOGO_IMG from "@/assets/logo/logo.png";

export function LoadingOverlay({
  show,
  title,
  text,
}: {
  show: boolean;
  title?: string;
  text?: string;
}) {
  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-0 z-[80]",
        "transition-[opacity,visibility] duration-500 ease-out",
        show ? "opacity-100 visible" : "opacity-0 invisible"
      )}
      aria-hidden={!show}
    >
      <div className="absolute inset-0 bg-background" />

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-4">
        <img
          src={LOGO_IMG}
          alt=""
          draggable={false}
          className="w-14 h-auto opacity-90 animate-pulse"
        />
        <div className="flex flex-col items-center gap-3">
          <div className="h-0.5 w-32 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-transparent via-brand to-transparent animate-[gyeolBar_1.2s_ease-in-out_infinite]" />
          </div>
          <div className="text-xs text-white/45">
            {title ? <span className="text-white/70">{title} · </span> : null}
            {text || "불러오는 중"}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes gyeolBar {
          0% { transform: translateX(-100%) }
          100% { transform: translateX(300%) }
        }
      `}</style>
    </div>
  );
}
