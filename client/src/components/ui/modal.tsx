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
    <div className="fixed inset-0 z-50">
      {/* backdrop: ConfirmModal 톤 (덜 어둡게 + 비네팅) */}
      <div
        className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
        onClick={() => closeOnBackdrop && onClose()}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0
                   bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.10),rgba(0,0,0,0.55))]"
      />

      {/* dialog */}
      <div className="absolute inset-0 grid place-items-center p-4 sm:p-6">
        <div className={cn("relative w-full", maxWidthClassName)}>
          {/* 외곽 글로우 */}
          <div
            aria-hidden
            className="absolute -inset-2 rounded-[28px] blur-xl opacity-80
                       bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.14),rgba(99,102,241,0.12),rgba(0,0,0,0))]"
          />

          {/* 2겹 보더 (그라데이션) */}
          <div className="relative rounded-3xl p-[1px] bg-[linear-gradient(135deg,rgba(255,255,255,0.22),rgba(255,255,255,0.06),rgba(99,102,241,0.14))]">
            {/* panel */}
            <div
              className={cn(
                "relative rounded-3xl overflow-hidden",
                "bg-zinc-950/92 text-white",
                "shadow-[0_30px_120px_rgba(0,0,0,.75)]",
                "max-h-[85vh] flex flex-col",
                className
              )}
              role="dialog"
              aria-modal="true"
            >
              {/* 상단 라이트 레이어 */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-24
                           bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.10),rgba(255,255,255,0))]"
              />

              {/* header (fixed) */}
              <div className="relative shrink-0 flex items-center justify-between px-5 py-4 border-b border-white/10">
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
                  className="h-9 w-9 rounded-xl grid place-items-center text-white/70 hover:bg-white/10 transition"
                  aria-label="닫기"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* body (scroll only here) */}
              <div className="relative flex-1 min-h-0 overflow-y-auto scroll-dark p-4">
                {children}
              </div>

              {/* footer (fixed, optional) */}
              {footer ? (
                <div className="relative shrink-0 px-5 py-4 border-t border-white/10">
                  {footer}
                </div>
              ) : null}

              {/* 하단 구분선(미세) */}
              <div aria-hidden className="h-px bg-white/5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}