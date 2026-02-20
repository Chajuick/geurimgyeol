import React from "react";
import type { EntityBase } from "@/types";
import { Check, Plus, Search, Tags, Trash2, X } from "lucide-react";
import ImageUpload from "@/components/ImageUpload";

import TagMultiSelect from "../parts/TagMultiSelect";
import SubThumbInner from "../parts/SubThumbInner";
import { clamp255, hexToRgb, isHex6, rgbToHex } from "../utils/color";
import type {
  EditPanel,
  Rarity,
  SymbolColorDraft,
  SubImageDraft,
} from "../EntityDetailFullscreen";

export default function RightSlideSheet<T extends EntityBase>(props: {
  open: boolean;
  sheetOpen: boolean;
  editPanel: EditPanel;
  onClose: () => void;

  titleMap: Partial<Record<Exclude<EditPanel, null>, string>>;

  entity: T;
  patch: (p: Partial<T>) => void;

  // basic drafts
  nameDraft: string;
  setNameDraft: (v: string) => void;
  summaryDraft: string;
  setSummaryDraft: (v: string) => void;
  descDraft: string;
  setDescDraft: (v: string) => void;
  rarityDraft: Rarity;
  setRarityDraft: (v: Rarity) => void;

  tagDraft: string[];
  setTagDraft: (v: string[]) => void;
  tagOptions: string[];

  mainImageDraft: string;
  setMainImageDraft: (v: string) => void;

  // symbol colors
  symbolColors: SymbolColorDraft[];
  addSymbolColor: () => void;
  updateSymbolColor: (id: string, p: Partial<SymbolColorDraft>) => void;
  removeSymbolColor: (id: string) => void;

  // sub images
  subImages: SubImageDraft[];
  viewSubIndex: number;
  setViewSubIndex: React.Dispatch<React.SetStateAction<number>>;
  addSubImage: () => void;
  updateSubImage: (idx: number, p: Partial<SubImageDraft>) => void;
  removeSubImage: (idx: number) => void;
}) {
  const {
    open,
    sheetOpen,
    editPanel,
    onClose,
    titleMap,
    entity,
    patch,

    nameDraft,
    setNameDraft,
    summaryDraft,
    setSummaryDraft,
    descDraft,
    setDescDraft,
    // rarityDraft,
    // setRarityDraft,

    tagDraft,
    setTagDraft,
    tagOptions,

    mainImageDraft,
    setMainImageDraft,

    symbolColors,
    addSymbolColor,
    updateSymbolColor,
    removeSymbolColor,

    subImages,
    viewSubIndex,
    setViewSubIndex,
    addSubImage,
    updateSubImage,
    removeSubImage,
  } = props;

  if (!open || !editPanel) return null;

  return (
    <div className="fixed inset-0 z-[10000]">
      <div
        className={[
          "absolute inset-0 bg-black/55 transition-opacity duration-300",
          sheetOpen ? "opacity-100" : "opacity-0",
        ].join(" ")}
        onClick={onClose}
      />

      <div
        className={[
          "absolute right-0 top-0 h-full w-[420px] max-w-[92vw]",
          "bg-zinc-950/95 border-l border-white/10",
          "shadow-[0_0_0_1px_rgba(255,255,255,0.06),-20px_0_80px_rgba(0,0,0,0.55)]",
          "transform-gpu transition-all duration-300 ease-out will-change-transform",
          sheetOpen
            ? "translate-x-0 opacity-100"
            : "translate-x-[24px] opacity-0",
        ].join(" ")}
        style={{ transitionDelay: sheetOpen ? "40ms" : "0ms" }}
        onClick={e => e.stopPropagation()}
      >
        {/* header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-white/10">
          <div className="text-sm font-semibold text-white">
            {titleMap[editPanel] ?? "편집"}
          </div>
          <button
            className="h-10 w-10 rounded-xl bg-white/10 border border-white/10 hover:bg-white/15 transition grid place-items-center"
            onClick={onClose}
            title="닫기"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* body */}
        <div className="h-[calc(100%-64px)] overflow-y-auto p-2 space-y-6 scroll-dark">
          {/* BASIC */}
          {editPanel === "basic" && (
            <>
              <div className="space-y-3">
                <p className="text-xs text-white/60">이름</p>
                <input
                  value={nameDraft}
                  onChange={e => {
                    const v = e.target.value;
                    setNameDraft(v);
                    patch({ name: v } as any);
                  }}
                  className="w-full h-11 px-4 rounded-xl bg-black/25 border border-white/10 text-white outline-none focus:ring-2 focus:ring-white/20"
                  placeholder="이름"
                />
              </div>

              <div className="space-y-3">
                <p className="text-xs text-white/60">요약</p>
                <textarea
                  value={summaryDraft}
                  onChange={e => {
                    const v = e.target.value;
                    setSummaryDraft(v);
                    patch({ summary: v } as any);
                  }}
                  className="w-full h-28 p-4 rounded-2xl bg-black/25 border border-white/10 text-white outline-none focus:ring-2 focus:ring-white/20 resize-none overflow-y-auto"
                  placeholder="리스트/카드에 보일 짧은 요약"
                />
              </div>

              <div className="space-y-3">
                <p className="text-xs text-white/60">설명</p>
                <textarea
                  value={descDraft}
                  onChange={e => {
                    const v = e.target.value;
                    setDescDraft(v);
                    patch({ description: v } as any);
                  }}
                  className="w-full h-48 p-4 rounded-2xl bg-black/25 border border-white/10 text-white outline-none focus:ring-2 focus:ring-white/20 resize-none overflow-y-auto"
                  placeholder="상세 설명"
                />
              </div>

              <TagMultiSelect
                label="카테고리"
                options={tagOptions}
                value={tagDraft}
                onChange={next => {
                  setTagDraft(next);
                  patch({ subCategories: next } as any);
                }}
              />

              <div className="space-y-3">
                <p className="text-xs text-white/60">프로필 이미지</p>
                <ImageUpload
                  value={(entity as any).profileImage || ""}
                  onChange={v => patch({ profileImage: v } as any)}
                  aspect="video"
                />
              </div>

              <div className="space-y-3">
                <p className="text-xs text-white/60">메인 이미지</p>
                <ImageUpload
                  value={mainImageDraft || ""}
                  onChange={v => {
                    setMainImageDraft(v);
                    patch({ mainImage: v } as any);
                  }}
                  aspect="video"
                />
              </div>
            </>
          )}

          {/* SYMBOL COLORS */}
          {editPanel === "symbolColors" && (
            <div className="space-y-3">
              <button
                type="button"
                onClick={addSymbolColor}
                className="h-10 px-4 rounded-xl bg-white/10 border border-white/10 hover:bg-white/15 transition inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm">상징색 추가</span>
              </button>

              {symbolColors.length === 0 ? (
                <p className="text-sm text-white/40">상징색이 없습니다.</p>
              ) : (
                <div className="space-y-2">
                  {symbolColors.map(c => {
                    const rgb = hexToRgb(c.hex) || { r: 68, g: 68, b: 68 };
                    const safeHex = isHex6(c.hex) ? c.hex : "#444444";

                    return (
                      <div
                        key={c.id}
                        className="rounded-2xl border border-white/10 bg-black/20 p-3 space-y-3"
                      >
                        <div>
                          <p className="text-xs text-white/60 mb-2">이름</p>
                          <input
                            value={c.name}
                            onChange={e =>
                              updateSymbolColor(c.id, { name: e.target.value })
                            }
                            className="w-full h-10 px-3 rounded-xl bg-black/25 border border-white/10 text-white outline-none focus:ring-2 focus:ring-white/20"
                            placeholder="이름"
                          />
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-6 h-6 rounded-full border border-white/20"
                              style={{ backgroundColor: safeHex }}
                            />
                            <input
                              type="color"
                              value={safeHex}
                              onChange={e =>
                                updateSymbolColor(c.id, {
                                  hex: e.target.value.toUpperCase(),
                                })
                              }
                              className="h-10 w-12 rounded-lg bg-transparent border border-white/10"
                              title="팔레트로 선택"
                            />
                          </div>

                          <div className="flex-1">
                            <p className="text-xs text-white/60 mb-2">HEX</p>
                            <input
                              value={c.hex}
                              onChange={e =>
                                updateSymbolColor(c.id, {
                                  hex: e.target.value.toUpperCase(),
                                })
                              }
                              className="w-full h-10 px-3 rounded-xl bg-black/25 border border-white/10 text-white outline-none focus:ring-2 focus:ring-white/20 font-mono text-xs"
                              placeholder="#RRGGBB"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => removeSymbolColor(c.id)}
                            className="h-10 w-10 rounded-xl bg-red-500/15 border border-red-500/25 hover:bg-red-500/20 transition grid place-items-center self-end"
                            title="삭제"
                          >
                            <Trash2 className="w-4 h-4 text-white/80" />
                          </button>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          {(["r", "g", "b"] as const).map(k => (
                            <div key={k}>
                              <p className="text-xs text-white/60 mb-2">
                                {k.toUpperCase()}
                              </p>
                              <input
                                type="number"
                                min={0}
                                max={255}
                                value={rgb[k]}
                                onChange={e => {
                                  const v = clamp255(
                                    Number(e.target.value || 0)
                                  );
                                  const next = { ...rgb, [k]: v };
                                  updateSymbolColor(c.id, {
                                    hex: rgbToHex(next.r, next.g, next.b),
                                  });
                                }}
                                className="w-full h-10 px-3 rounded-xl bg-black/25 border border-white/10 text-white outline-none focus:ring-2 focus:ring-white/20"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* SUB IMAGES */}
          {editPanel === "subImages" && (
            <div className="space-y-4">
              <button
                type="button"
                onClick={addSubImage}
                className="h-10 px-4 rounded-xl bg-white/10 border border-white/10 hover:bg-white/15 transition inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm">서브 이미지 추가</span>
              </button>

              {subImages.length === 0 ? (
                <p className="text-sm text-white/40">서브 이미지가 없습니다.</p>
              ) : (
                <>
                  <div className="overflow-x-auto pb-2 scroll-dark">
                    <div className="flex gap-3 min-w-max">
                      {subImages.map((s, idx) => {
                        const active = idx === viewSubIndex;
                        return (
                          <div
                            key={idx}
                            className={[
                              "w-28 rounded-xl overflow-hidden border transition flex-shrink-0",
                              active
                                ? "border-white/40 bg-white/10"
                                : "border-white/10 bg-white/5 hover:border-white/25",
                            ].join(" ")}
                          >
                            <button
                              type="button"
                              onClick={() => setViewSubIndex(idx)}
                              className="w-full"
                              title="선택"
                            >
                              <div className="aspect-square bg-black/30 flex items-center justify-center">
                                <SubThumbInner
                                  image={s.image}
                                  alt={`sub-${idx}`}
                                />
                              </div>
                            </button>

                            <div className="p-2 border-t border-white/10 bg-black/20">
                              <button
                                type="button"
                                onClick={() => removeSubImage(idx)}
                                className="w-full h-9 rounded-xl bg-red-500/15 border border-red-500/25 hover:bg-red-500/20 transition text-sm"
                              >
                                삭제
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs text-white/60">서브 이미지 업로드</p>
                    <ImageUpload
                      value={subImages[viewSubIndex]?.image || ""}
                      onChange={v => updateSubImage(viewSubIndex, { image: v })}
                      aspect="square"
                    />
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs text-white/60">서브 이미지 요약</p>
                    <textarea
                      value={subImages[viewSubIndex]?.summary || ""}
                      onChange={e =>
                        updateSubImage(viewSubIndex, {
                          summary: e.target.value,
                        })
                      }
                      className="w-full h-28 p-4 rounded-2xl bg-black/25 border border-white/10 text-white outline-none focus:ring-2 focus:ring-white/20 resize-none overflow-y-auto"
                      placeholder="짧은 요약"
                    />
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs text-white/60">서브 이미지 설명</p>
                    <textarea
                      value={subImages[viewSubIndex]?.description || ""}
                      onChange={e =>
                        updateSubImage(viewSubIndex, {
                          description: e.target.value,
                        })
                      }
                      className="w-full h-48 p-4 rounded-2xl bg-black/25 border border-white/10 text-white outline-none focus:ring-2 focus:ring-white/20 resize-none overflow-y-auto"
                      placeholder="상세 설명"
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
