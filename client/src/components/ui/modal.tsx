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

  // 헤더 바 없이 콘텐츠를 꽉 채우고 닫기 버튼만 띄움 (커버 이미지형 상세 등)
  headerless?: boolean;
};

/** 열린 모달 스택: ESC는 가장 위 모달만 닫는다 */
const modalStack: symbol[] = [];

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
  headerless = false,
}: ModalProps) {
  const mounted = useMounted();
  const restoreRef = React.useRef<null | (() => void)>(null);

  // onClose가 렌더마다 바뀌어도 스택 순서/스크롤 락이 흔들리지 않도록 ref로 보관
  const onCloseRef = React.useRef(onClose);
  onCloseRef.current = onClose;

  // ESC + scroll lock
  React.useEffect(() => {
    if (!open) return;

    const token = Symbol("modal");
    modalStack.push(token);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (modalStack[modalStack.length - 1] !== token) return;
      onCloseRef.current();
    };
    window.addEventListener("keydown", onKeyDown);

    restoreRef.current = lockBodyScroll();

    return () => {
      const idx = modalStack.indexOf(token);
      if (idx >= 0) modalStack.splice(idx, 1);
      window.removeEventListener("keydown", onKeyDown);
      restoreRef.current?.();
      restoreRef.current = null;
    };
  }, [open]);

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
    <div className="fixed inset-0" style={{ zIndex }} data-modal-root>
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
        onMouseDown={e => {
          // 드래그 시작이 backdrop이면 닫기(클릭/터치 안정)
          if (!closeOnBackdrop) return;
          if (e.target === e.currentTarget) onClose();
        }}
        onTouchStart={e => {
          if (!closeOnBackdrop) return;
          if (e.target === e.currentTarget) onClose();
        }}
      />

      {/* dialog */}
      <div className="pointer-events-none absolute inset-0 grid place-items-center p-4 sm:p-6">
        <div
          className={cn(
            "pointer-events-auto relative w-full min-w-0",
            maxWidthClassName,
            "animate-in fade-in zoom-in-[0.97] slide-in-from-bottom-3 duration-300 ease-out"
          )}
        >
          {/* panel */}
          <div
            className={cn(
              "relative rounded-3xl overflow-hidden",
              "bg-[#111114] text-white",
              "border border-white/[0.08]",
              "shadow-[0_40px_120px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.05)]",
              // ✅ 여기서만 스크롤
              "max-h-[88vh] flex flex-col",
              // ✅ 가로 폭 밀림 방지
              "min-w-0 overflow-x-hidden",
              className
            )}
            role="dialog"
            aria-modal="true"
            aria-label={title}
          >
            {headerless ? (
              <button
                ref={closeBtnRef}
                type="button"
                onClick={onClose}
                className="absolute right-3 top-3 z-20 h-9 w-9 rounded-full grid place-items-center bg-black/45 border border-white/15 backdrop-blur-md text-white/80 hover:bg-black/70 hover:text-white transition-colors"
                aria-label="닫기"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              /* header (fixed) */
              <div className="relative shrink-0 flex items-center justify-between pl-5 pr-3 h-14 border-b border-white/[0.07]">
                <div className="min-w-0">
                  {title ? (
                    <h2 className="text-[15px] font-semibold text-white/90 truncate font-sans tracking-[-0.01em]">
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
                  className="h-9 w-9 rounded-xl grid place-items-center text-white/60 hover:bg-white/[0.07] hover:text-white transition-colors"
                  aria-label="닫기"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* body (scroll only here) */}
            <div className="relative flex-1 min-h-0 overflow-y-auto overscroll-contain scroll-dark">
              {children}
            </div>

            {/* footer (fixed, optional) */}
            {footer ? (
              <div className="relative shrink-0 px-5 py-4 border-t border-white/[0.07] bg-white/[0.015]">
                {footer}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
