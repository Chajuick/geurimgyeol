import React, { useEffect, useState, useCallback } from "react";

import Modal from "@/components/ui/modal";
import GButton from "@/components/ui/gyeol-button";
import { HUDPanel } from "@/components/ui/hud";

import type { FramePresetId } from "@/types";
import { INNER_OPTIONS, OUTER_OPTIONS } from "@/lib/framePresets";

type FrameDraft = {
  outer: FramePresetId; // "none" 포함
  inner: FramePresetId; // "none" 포함
};

type Props = {
  open: boolean;
  value: FrameDraft;
  onChange: (next: FrameDraft) => void;

  onClose: () => void;
  onSave: () => void;
};

export default function EntityFrameSettingsModal({
  open,
  value,
  onChange,
  onClose,
  onSave,
}: Props) {
  // ✅ 프리뷰는 모달 열린 직후 살짝 딜레이 (레이아웃 안정화)
  const [showFramePreviews, setShowFramePreviews] = useState(false);

  useEffect(() => {
    if (!open) {
      setShowFramePreviews(false);
      return;
    }
    let raf = 0;
    const t = window.setTimeout(() => {
      raf = window.requestAnimationFrame(() => setShowFramePreviews(true));
    }, 60);
    return () => {
      window.clearTimeout(t);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [open]);

  const setOuter = useCallback(
    (id: FramePresetId) => onChange({ ...value, outer: id }),
    [onChange, value]
  );

  const setInner = useCallback(
    (id: FramePresetId) => onChange({ ...value, inner: id }),
    [onChange, value]
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="선택 프레임 효과"
      maxWidthClassName="max-w-5xl"
      className="p-0"
      footer={
        <div className="flex items-center justify-end gap-2">
          <GButton variant="ghost" text="닫기" onClick={onClose} />
          <GButton variant="primary" text="저장" onClick={onSave} />
        </div>
      }
    >
      <div className="p-4 sm:p-6">
        <div className="text-[11px] tracking-[0.26em] text-white/55">
          CHARACTER FRAME SETTINGS
        </div>
        <div className="mt-2 text-sm text-white/60">
          캐릭터 선택 프레임(외곽/내부)을 각각 1개씩 고르세요.
        </div>

        <div className="mt-4 sm:mt-6 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {/* OUTER */}
          <HUDPanel className="p-4">
            <div className="text-[11px] tracking-[0.26em] text-white/55">OUTER</div>
            <div className="mt-1 text-sm text-white/70">외곽 효과</div>

            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {OUTER_OPTIONS.map((opt) => {
                const selected = value.outer === opt.id;

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setOuter(opt.id)}
                    className={[
                      "rounded-2xl border p-3 text-left transition",
                      "bg-black/20 border-white/20 hover:border-white/30",
                      selected ? "ring-2 ring-white/20 is-selected" : "",
                    ].join(" ")}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm font-semibold px-2">{opt.label}</div>

                      <div
                        className={[
                          "w-5 h-5 rounded-full border flex items-center justify-center",
                          selected
                            ? "border-white/70 bg-white/15"
                            : "border-white/25 bg-transparent",
                        ].join(" ")}
                      >
                        {selected && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="relative aspect-square overflow-visible rounded-xl border border-white/10 bg-black/25">
                        {showFramePreviews && opt.id !== "none" && (
                          <div
                            className={[
                              "frame-layer",
                              "frame-outer",
                              `frame-preset-${opt.id}`,
                            ].join(" ")}
                            style={{
                              ["--frame-thickness" as any]: `2px`,
                              ["--frame-intensity" as any]: `0.9`,
                              ["--c1" as any]: "#6b7280",
                              ["--c2" as any]: "#6b7280",
                            }}
                          />
                        )}
                        <div className="relative h-full w-full overflow-hidden rounded-xl" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </HUDPanel>

          {/* INNER */}
          <HUDPanel className="p-4">
            <div className="text-[11px] tracking-[0.26em] text-white/55">INNER</div>
            <div className="mt-1 text-sm text-white/70">내부 효과</div>

            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {INNER_OPTIONS.map((opt) => {
                const selected = value.inner === opt.id;

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setInner(opt.id)}
                    className={[
                      "rounded-2xl border p-3 text-left transition",
                      "bg-black/20 border-white/20 hover:border-white/30",
                      selected ? "ring-2 ring-white/20 is-selected" : "",
                    ].join(" ")}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm font-semibold px-2">{opt.label}</div>

                      <div
                        className={[
                          "w-5 h-5 rounded-full border flex items-center justify-center",
                          selected
                            ? "border-white/70 bg-white/15"
                            : "border-white/25 bg-transparent",
                        ].join(" ")}
                      >
                        {selected && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="relative aspect-square overflow-visible rounded-xl border border-white/10 bg-black/25">
                        <div className="relative h-full w-full overflow-hidden rounded-xl">
                          {showFramePreviews && opt.id !== "none" && (
                            <div
                              className={[
                                "frame-layer",
                                "frame-inner",
                                `frame-preset-${opt.id}`,
                              ].join(" ")}
                              style={{
                                ["--frame-thickness" as any]: `1px`,
                                ["--frame-intensity" as any]: `1`,
                                ["--c1" as any]: "#6b7280",
                                ["--c2" as any]: "#6b7280",
                              }}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </HUDPanel>
        </div>

        <div className="mt-4 text-xs text-white/55">
          OUTER: <span className="text-white/80">{value.outer}</span> · INNER:{" "}
          <span className="text-white/80">{value.inner}</span>
        </div>
      </div>
    </Modal>
  );
}