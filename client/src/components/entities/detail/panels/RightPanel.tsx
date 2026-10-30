// src/components/entities/detail/panels/RightPanel.tsx
import React from "react";
import type { EntityBase } from "@/types";
import { FileText, Images, Palette } from "lucide-react";
import SubThumbInner from "../parts/SubThumbInner";
import type {
  SymbolColorDraft,
  SubImageDraft,
} from "../EntityDetailFullscreen";

function EditIconButton({
  title,
  onClick,
  children,
}: {
  title: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      className="h-8 w-8 rounded-full bg-white/[0.06] border border-white/10 text-white/70 hover:bg-white/[0.12] hover:text-white transition-colors grid place-items-center"
    >
      {children}
    </button>
  );
}

export default function RightPanel<T extends EntityBase>(props: {
  entity: T;
  editable: boolean;

  /** 상징색 기반 포인트 색 */
  accent?: string;

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
    accent = "#818cf8",
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
        "h-full w-full relative overflow-hidden",
        "bg-[#0e0e12]/70 backdrop-blur-2xl",
        "border border-white/[0.09]",
        "shadow-[0_24px_80px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.05)]",
        "rounded-t-[28px] lg:rounded-3xl",
        // ✅ 스크롤 1개만
        "flex flex-col",
      ].join(" ")}
    >
      {/* 상징색 하이라이트 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-40"
        style={{
          background: `radial-gradient(80% 100% at 50% 0%, color-mix(in oklab, ${accent} 18%, transparent), transparent)`,
        }}
      />

      {/* ✅ Header (fixed) */}
      <div className="relative px-5 pt-5 pb-4">
        <div className="flex items-center justify-between gap-3">
          {/* symbol colors */}
          <div className="min-w-0 flex-1 overflow-x-auto scrollbar-none">
            {symbolColors.length === 0 ? (
              <span className="text-xs text-white/35">상징색 없음</span>
            ) : (
              <div className="flex gap-1.5 min-w-max">
                {symbolColors.map(c => (
                  <span
                    key={c.id}
                    className="inline-flex items-center gap-1.5 h-7 pl-1 pr-2.5 rounded-full bg-black/30 border border-white/10"
                    title={c.name ? `${c.name} (${c.hex})` : c.hex}
                  >
                    <span
                      className="h-5 w-5 rounded-full border border-white/20 shadow-[0_0_12px_var(--sc)]"
                      style={
                        {
                          backgroundColor: c.hex,
                          ["--sc" as string]: `${c.hex}88`,
                        } as React.CSSProperties
                      }
                    />
                    <span className="text-[11px] text-white/80 whitespace-nowrap">
                      {c.name || c.hex}
                    </span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {editable && (
            <div className="flex items-center gap-1.5 shrink-0">
              <EditIconButton title="상징색 편집" onClick={onOpenSymbolColors}>
                <Palette className="w-3.5 h-3.5" />
              </EditIconButton>
              <EditIconButton title="기본 정보 편집" onClick={onOpenBasic}>
                <FileText className="w-3.5 h-3.5" />
              </EditIconButton>
              <EditIconButton
                title="서브 이미지 편집"
                onClick={onOpenSubImages}
              >
                <Images className="w-3.5 h-3.5" />
              </EditIconButton>
            </div>
          )}
        </div>
      </div>

      {/* ✅ Content (ONLY scroll area) */}
      <div className="relative flex-1 overflow-y-auto scroll-dark px-5 pb-6">
        {/* SUMMARY / DESCRIPTION */}
        <section>
          <h2 className="font-display text-2xl font-semibold tracking-[-0.02em] leading-snug text-white/95 break-keep whitespace-pre-wrap">
            {entity.summary || (
              <span className="text-white/35 text-lg">요약이 없습니다</span>
            )}
          </h2>

          <p className="mt-4 text-[14px] text-white/70 leading-[1.85] whitespace-pre-wrap break-keep">
            {entity.description || (
              <span className="text-white/35">설명이 없습니다</span>
            )}
          </p>
        </section>

        {/* SUB IMAGES */}
        <section className="mt-8 pt-6 border-t border-white/[0.07]">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white/85">
              서브 이미지
              <span className="ml-1.5 font-normal text-white/35">
                {subImages.length}
              </span>
            </h3>
          </div>

          {hasSubs ? (
            <>
              <div className="overflow-x-auto scrollbar-none mt-2 -mx-1 px-1 py-1">
                <div className="flex gap-2.5 min-w-max">
                  {subImages.map((s, idx) => {
                    const active = idx === viewSubIndex;
                    return (
                      <button
                        key={s.image || String(idx)}
                        type="button"
                        onClick={() => onPickSubImage(idx)}
                        className={[
                          "w-24 rounded-2xl overflow-hidden border-2 transition-[border-color,box-shadow] flex-shrink-0",
                          active
                            ? "border-[var(--acc)] shadow-[0_0_16px_color-mix(in_oklab,var(--acc)_45%,transparent)]"
                            : "border-white/[0.08] hover:border-white/25",
                        ].join(" ")}
                        style={
                          { ["--acc" as string]: accent } as React.CSSProperties
                        }
                        title="클릭: 메인에 표시"
                      >
                        <div className="aspect-square bg-black/30 flex items-center justify-center">
                          <SubThumbInner image={s.image} alt={`sub-${idx}`} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {(activeSub?.summary || activeSub?.description) && (
                <div className="mt-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] p-4">
                  {activeSub?.summary && (
                    <p className="text-base font-semibold text-white/90 leading-snug whitespace-pre-wrap break-keep">
                      {activeSub.summary}
                    </p>
                  )}
                  {activeSub?.description && (
                    <p className="mt-2 text-[13px] text-white/65 leading-[1.8] whitespace-pre-wrap break-keep">
                      {activeSub.description}
                    </p>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-white/40 text-sm mt-3">
              서브 이미지가 없어요.
            </div>
          )}
        </section>

        {/* ✅ bottom safe spacing */}
        <div className="h-10" />
      </div>
    </div>
  );
}
