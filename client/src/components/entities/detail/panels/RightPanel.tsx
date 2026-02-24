// src/components/entities/detail/panels/RightPanel.tsx
import React from "react";
import type { EntityBase } from "@/types";
import { FileText, Palette, Tags } from "lucide-react";
import SubThumbInner from "../parts/SubThumbInner";
import type { SymbolColorDraft, SubImageDraft } from "../EntityDetailFullscreen";

export default function RightPanel<T extends EntityBase>(props: {
  entity: T;
  editable: boolean;

  symbolColors: SymbolColorDraft[];
  subImages: SubImageDraft[];

  viewSubIndex: number;

  onOpenSymbolColors: () => void;
  onOpenBasic: () => void;
  onOpenSubImages: () => void;

  onPickSubImage: (idx: number) => void;
}) {
  const {
    entity,
    editable,
    symbolColors,
    subImages,
    viewSubIndex,
    onOpenSymbolColors,
    onOpenBasic,
    onOpenSubImages,
    onPickSubImage,
  } = props;

  const hasSubs = subImages.length > 0;
  const activeSub = hasSubs ? subImages[viewSubIndex] : null;

  return (
    <div
      className={[
        "h-full w-full relative",
        // ✅ bottom sheet 느낌 + desktop 카드
        "bg-zinc-950/45 backdrop-blur-2xl",
        "border border-white/10 ring-1 ring-white/5",
        "shadow-[0_18px_70px_rgba(0,0,0,0.65)]",
        "lg:rounded-t-[28px] lg:rounded-3xl",
        // ✅ 스크롤 1개만
        "flex flex-col",
      ].join(" ")}
    >
      {/* ✅ Header (fixed) */}
      <div className="px-4 pt-5 pb-3 border-b border-white/10">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm text-white/80">정보</div>
            <div className="mt-1 text-[11px] text-white/45">
              상징색 · 설명 · 서브 이미지
            </div>
          </div>

          {/* 모바일에서 손가락으로 스크롤하기 전에 버튼이 딱 보이게 */}
          <div className="flex items-center gap-2">
            {editable && (
              <>
                <button
                  type="button"
                  onClick={onOpenSymbolColors}
                  className="h-9 w-9 rounded-xl bg-white/10 border border-white/10 hover:bg-white/15 transition grid place-items-center"
                  title="상징색 편집"
                >
                  <Palette className="w-4 h-4 text-white/80" />
                </button>
                <button
                  type="button"
                  onClick={onOpenBasic}
                  className="h-9 w-9 rounded-xl bg-white/10 border border-white/10 hover:bg-white/15 transition grid place-items-center"
                  title="기본 정보 편집"
                >
                  <FileText className="w-4 h-4 text-white/80" />
                </button>
                <button
                  type="button"
                  onClick={onOpenSubImages}
                  className="h-9 w-9 rounded-xl bg-white/10 border border-white/10 hover:bg-white/15 transition grid place-items-center"
                  title="서브 이미지 편집"
                >
                  <Tags className="w-4 h-4 text-white/80" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ✅ Content (ONLY scroll area) */}
      <div className="flex-1 overflow-y-auto scroll-dark px-4 pb-6">
        {/* =========================
            1) SYMBOL COLORS
           ========================= */}
        <section className="mt-3">
          {symbolColors.length === 0 ? (
            <p className="text-sm text-white/35 mt-3">상징색이 없습니다.</p>
          ) : (
            <div className="overflow-x-auto pb-2 scroll-dark mt-3">
              <div className="flex gap-2 min-w-max flex-nowrap">
                {symbolColors.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 h-9 flex-shrink-0"
                    title={c.name ? `${c.name} (${c.hex})` : c.hex}
                  >
                    <span
                      className="w-4 h-4 rounded-full border border-white/20"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span className="text-xs text-white/85 whitespace-nowrap">
                      {c.name || "이름 없음"}
                    </span>
                    <span className="text-[11px] text-white/35 font-mono whitespace-nowrap">
                      {c.hex}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* =========================
            2) SUMMARY / DESCRIPTION
           ========================= */}
        <section className="mt-2">
          <div>
            <p className="text-lg text-white/85 text-left leading-relaxed whitespace-pre-wrap">
              {entity.summary || "요약이 없습니다"}
            </p>
          </div>

          {/* ✅ 내부 스크롤 금지: 한 패널에서만 스크롤 */}
          <p className="mt-3 text-sm text-white/70 text-left leading-relaxed whitespace-pre-wrap">
            {entity.description || "설명이 없습니다"}
          </p>
        </section>

        {/* =========================
            3) SUB IMAGES
           ========================= */}
        <section className="mt-5">
          <div className="flex items-center justify-between">
            <p className="text-xs text-white/60">서브 이미지</p>
            {!editable && (
              <span className="text-[11px] text-white/35">
                {subImages.length}개
              </span>
            )}
          </div>

          {hasSubs ? (
            <>
              <div className="overflow-x-auto pb-2 scroll-dark mt-3">
                <div className="flex gap-3 min-w-max">
                  {subImages.map((s, idx) => {
                    const active = idx === viewSubIndex;
                    return (
                      <button
                        key={s.image || String(idx)}
                        type="button"
                        onClick={() => onPickSubImage(idx)}
                        className={[
                          "w-28 rounded-xl overflow-hidden border transition flex-shrink-0",
                          active
                            ? "border-white/40 bg-white/10"
                            : "border-white/10 bg-white/5 hover:border-white/25",
                        ].join(" ")}
                        title="클릭: 메인에 표시"
                      >
                        <div className="aspect-[4/4] bg-black/30 flex items-center justify-center">
                          <SubThumbInner image={s.image} alt={`sub-${idx}`} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4">
                <p className="text-lg text-white/85 text-left leading-relaxed whitespace-pre-wrap">
                  {activeSub?.summary || "요약이 없습니다"}
                </p>
              </div>

              {/* ✅ 내부 스크롤 금지 */}
              <p className="mt-3 text-sm text-white/70 text-left leading-relaxed whitespace-pre-wrap">
                {activeSub?.description || "설명이 없습니다"}
              </p>
            </>
          ) : (
            <div className="text-white/40 text-sm mt-3">
              서브 이미지가 없습니다.
            </div>
          )}
        </section>

        {/* ✅ bottom safe spacing */}
        <div className="h-12" />
      </div>
    </div>
  );
}