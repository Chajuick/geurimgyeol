import React from "react";
import { X } from "lucide-react";
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
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* dialog */}
      <div className="absolute inset-0 grid place-items-center p-6">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-zinc-950/95 shadow-[0_20px_80px_rgba(0,0,0,.65)] overflow-hidden">
          <div className="px-6 py-5 flex flex-col items-center gap-4">
            <p className="text-lg font-semibold text-white">{title}</p>
            <p className="mt-1 text-sm text-white/60 leading-relaxed">
              {description}
            </p>
          </div>

          <div className="px-6 pt-2 pb-4 flex items-center justify-center gap-2">
            <GButton variant="ghost" text={cancelText} onClick={onClose} className="px-6" />
            <GButton
              variant={danger ? "danger" : "primary"}
              text={confirmText}
              onClick={onConfirm}
              className="px-6"
            />
          </div>
        </div>
      </div>
    </div>
  );
}