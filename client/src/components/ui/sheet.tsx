import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type SheetProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  widthClassName?: string; // ex) "w-[520px] max-w-[92vw]"
  className?: string;
  closeOnBackdrop?: boolean;
};

export default function Sheet({
  open,
  onClose,
  title,
  children,
  widthClassName = "w-[520px] max-w-[92vw]",
  className,
  closeOnBackdrop = true,
}: SheetProps) {
  React.useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[10000]">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/55 backdrop-blur-sm"
        onClick={() => closeOnBackdrop && onClose()}
      />

      {/* panel */}
      <div
        className={cn(
          "absolute right-0 top-0 h-full",
          widthClassName,
          "bg-zinc-950/90",
          "border-l border-white/10 ring-1 ring-white/5",
          "shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_40px_120px_rgba(0,0,0,0.75)]",
          "backdrop-blur-2xl",
          "flex flex-col overflow-hidden",
          "animate-in slide-in-from-right duration-200",
          className
        )}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="shrink-0 h-14 px-5 flex items-center justify-between border-b border-white/10">
          <div className="min-w-0">
            {title ? (
              <h2 className="text-sm font-semibold text-white/90 truncate">
                {title}
              </h2>
            ) : (
              <div />
            )}
          </div>

          <button
            onClick={onClose}
            className="h-10 w-10 rounded-xl bg-white/10 border border-white/10 hover:bg-white/15 transition grid place-items-center"
            aria-label="닫기"
          >
            <X className="w-4 h-4 text-white/80" />
          </button>
        </div>

        {/* body */}
        <div className="flex-1 min-h-0 overflow-y-auto px-5 py-5 scroll-dark">
          {children}
        </div>
      </div>
    </div>
  );
}