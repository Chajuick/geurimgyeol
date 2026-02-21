// src/components/ui/modal.tsx
import * as React from "react";
import { createPortal } from "react-dom";
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

  // z-index 커스터마이즈(기본 10000)
  zIndex?: number;
};

function useMounted() {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  return mounted;
}

/** ✅ 더 안전한 스크롤 락 (모바일/사파리 대응) */
function lockBodyScroll() {
  const body = document.body;
  const html = document.documentElement;

  const scrollY = window.scrollY || window.pageYOffset;

  const prev = {
    bodyPosition: body.style.position,
    bodyTop: body.style.top,
    bodyLeft: body.style.left,
    bodyRight: body.style.right,
    bodyWidth: body.style.width,
    bodyOverflow: body.style.overflow,
    htmlOverflow: html.style.overflow,
  };

  // iOS에서 overflow:hidden만으로는 배경 스크롤이 남는 경우가 많아서 fixed로 잠금
  body.style.position = "fixed";
  body.style.top = `-${scrollY}px`;
  body.style.left = "0";
  body.style.right = "0";
  body.style.width = "100%";
  body.style.overflow = "hidden";
  html.style.overflow = "hidden";

  return () => {
    // restore
    body.style.position = prev.bodyPosition;
    body.style.top = prev.bodyTop;
    body.style.left = prev.bodyLeft;
    body.style.right = prev.bodyRight;
    body.style.width = prev.bodyWidth;
    body.style.overflow = prev.bodyOverflow;
    html.style.overflow = prev.htmlOverflow;

    // restore scroll
    const y = Math.abs(parseInt(prev.bodyTop || "0", 10)) || scrollY;
    window.scrollTo(0, y);
  };
}

export default function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  maxWidthClassName = "max-w-md",
  className,
  closeOnBackdrop = true,
  zIndex = 10000,
}: ModalProps) {
  const mounted = useMounted();
  const restoreRef = React.useRef<null | (() => void)>(null);

  // ESC + scroll lock
  React.useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);

    restoreRef.current = lockBodyScroll();

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      restoreRef.current?.();
      restoreRef.current = null;
    };
  }, [open, onClose]);

  // 포커스: 열린 순간 닫기 버튼에 포커스(선택)
  const closeBtnRef = React.useRef<HTMLButtonElement | null>(null);
  React.useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => closeBtnRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [open]);

  if (!open) return null;
  if (!mounted) return null;

  // Portal로 body에 직접 붙여서 stacking context(사이드바 토글 등) 이슈 제거
  return createPortal(
    <div
      className="fixed inset-0"
      style={{ zIndex }}
      data-modal-root
    >
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
        onMouseDown={(e) => {
          // 드래그 시작이 backdrop이면 닫기(클릭/터치 안정)
          if (!closeOnBackdrop) return;
          if (e.target === e.currentTarget) onClose();
        }}
        onTouchStart={(e) => {
          if (!closeOnBackdrop) return;
          if (e.target === e.currentTarget) onClose();
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0
                   bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.10),rgba(0,0,0,0.55))]"
      />

      {/* dialog */}
      <div className="absolute inset-0 grid place-items-center p-4 sm:p-6">
        <div className={cn("relative w-full", maxWidthClassName, "min-w-0")}>
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
                // ✅ 여기서만 스크롤
                "max-h-[85vh] flex flex-col",
                // ✅ 가로 폭 밀림 방지
                "min-w-0 overflow-x-hidden",
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
              <div className="relative shrink-0 flex items-center justify-between px-4 py-2 border-b border-white/10">
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
                  ref={closeBtnRef}
                  type="button"
                  onClick={onClose}
                  className="h-9 w-9 rounded-xl grid place-items-center text-white/70 hover:bg-white/10 transition"
                  aria-label="닫기"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* body (scroll only here) */}
              <div className="relative flex-1 min-h-0 overflow-y-auto overscroll-contain scroll-dark">
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
    </div>,
    document.body
  );
}