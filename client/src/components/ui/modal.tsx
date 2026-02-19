import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type ModalProps = {
  open: boolean;
  onClose: () => void;

  title?: string;
  children: React.ReactNode;

  footer?: React.ReactNode;
  maxWidthClassName?: string;
  className?: string;

  // backdrop 클릭 닫기 (기본 true)
  closeOnBackdrop?: boolean;
};

export default function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  maxWidthClassName = "max-w-md",
  className,
  closeOnBackdrop = true,
}: ModalProps) {
  React.useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);

    // 스크롤 락
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => closeOnBackdrop && onClose()}
      />

      {/* panel */}
      <div
        className={cn(
          "relative w-full",
          maxWidthClassName,
          "rounded-2xl bg-zinc-950 text-white",
          "shadow-2xl border border-white/10 ring-1 ring-white/5",
          "max-h-[85vh] flex flex-col overflow-hidden",
          className
        )}
        role="dialog"
        aria-modal="true"
      >
        {/* header (fixed) */}
        <div className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-white/10">
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
            type="button"
            onClick={onClose}
            className="h-9 w-9 rounded-lg grid place-items-center text-white/70 hover:bg-white/10 transition"
            aria-label="닫기"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* body (scroll only here) */}
        <div className="flex-1 min-h-0 overflow-y-auto scroll-dark p-3">
          {children}
        </div>

        {/* footer (fixed, optional) */}
        {footer ? (
          <div className="shrink-0 px-5 py-4 border-t border-white/10">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}