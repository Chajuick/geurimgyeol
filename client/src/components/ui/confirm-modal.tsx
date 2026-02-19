import GButton from "@/components/ui/gyeol-button";

export default function ConfirmModal(props: {
  open: boolean;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const {
    open,
    title = "확인",
    description = "정말 진행할까요?",
    confirmText = "확인",
    cancelText = "취소",
    danger = true,
    onConfirm,
    onClose,
  } = props;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[99999]">
      {/* backdrop: 너무 어둡지 않게 + 살짝 비네팅 */}
      <div
        className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.10),rgba(0,0,0,0.55))]" />

      {/* dialog */}
      <div className="absolute inset-0 grid place-items-center p-6">
        {/* 외곽 글로우(배경보다 확실히 분리) */}
        <div className="relative w-full max-w-md">
          <div
            aria-hidden
            className="absolute -inset-2 rounded-[28px] blur-xl opacity-80
                       bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.14),rgba(99,102,241,0.12),rgba(0,0,0,0))]"
          />

          {/* 2겹 보더(그라데이션 느낌) */}
          <div className="relative rounded-3xl p-[1px] bg-[linear-gradient(135deg,rgba(255,255,255,0.22),rgba(255,255,255,0.06),rgba(99,102,241,0.14))]">
            <div className="rounded-3xl bg-zinc-950/92 overflow-hidden shadow-[0_30px_120px_rgba(0,0,0,.75)]">
              {/* 상단 라이트 레이어 */}
              <div
                aria-hidden
                className="absolute inset-x-0 top-0 h-24
                           bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.10),rgba(255,255,255,0))]"
              />

              <div className="relative px-6 py-5 flex flex-col items-center gap-4">
                <p className="text-lg font-semibold text-white text-center drop-shadow-[0_1px_0_rgba(0,0,0,0.6)]">
                  {title}
                </p>

                <p className="mt-1 text-sm text-white/70 leading-relaxed text-center whitespace-pre-line max-w-prose mx-auto break-words">
                  {description}
                </p>
              </div>

              <div className="relative px-6 pt-2 pb-5 flex items-center justify-center gap-2">
                <GButton
                  variant="ghost"
                  text={cancelText}
                  onClick={onClose}
                  className="px-6"
                />
                <GButton
                  variant={danger ? "danger" : "primary"}
                  text={confirmText}
                  onClick={onConfirm}
                  className="px-6"
                />
              </div>

              {/* 하단 구분선(미세) */}
              <div aria-hidden className="h-px bg-white/5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}