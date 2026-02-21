// src/components/entities/detail/EntityDetailFullscreen.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { EntityBase, SubImage, SymbolColor } from "@/types";
import { useResolvedImage } from "@/hooks/useResolvedImage";

import LeftPanel from "./panels/LeftPanel";
import MiddlePanel from "./panels/MiddlePanel";
import RightPanel from "./panels/RightPanel";
import RightSlideSheet from "./panels/RightSlideSheet";

import { getPrimaryColor } from "./utils/color";

import {
  normalizeSymbolColors,
  normalizeSubImages,
  sanitizeSymbolColors,
  sanitizeSubImages,
} from "@/lib/entityNormalize";

export type SymbolColorDraft = { id: string; name: string; hex: string };
export type SubImageDraft = { image: string; summary: string; description: string };

// (구 코드 호환) RightSlideSheet가 아직 rarityDraft를 요구하는 경우를 위해 남겨둠
export type Rarity = "S" | "A" | "B" | "C" | "D";

export type EditPanel =
  | null
  | "basic"
  | "profileImage"
  | "symbolColors"
  | "subImages";

/** -----------------------------
 * Debounce helper (flush 지원)
 * ------------------------------ */
function useDebounced<T extends (...args: any[]) => void>(fn: T, delay = 120) {
  const fnRef = useRef(fn);
  const tRef = useRef<number | null>(null);
  const lastArgsRef = useRef<Parameters<T> | null>(null);

  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  const cancel = useCallback(() => {
    if (tRef.current) window.clearTimeout(tRef.current);
    tRef.current = null;
  }, []);

  const run = useCallback(
    (...args: Parameters<T>) => {
      lastArgsRef.current = args;
      cancel();
      tRef.current = window.setTimeout(() => {
        tRef.current = null;
        const a = lastArgsRef.current;
        lastArgsRef.current = null;
        if (a) fnRef.current(...a);
      }, delay);
    },
    [cancel, delay]
  );

  const flush = useCallback(() => {
    const a = lastArgsRef.current;
    if (!a) return;
    cancel();
    lastArgsRef.current = null;
    fnRef.current(...a);
  }, [cancel]);

  useEffect(() => () => cancel(), [cancel]);

  return { run, cancel, flush };
}

function toSymbolDrafts(raw: any): SymbolColorDraft[] {
  return normalizeSymbolColors(raw).map((c) => ({
    id: c.id,
    name: c.name,
    hex: c.hex,
  }));
}

function toSubDrafts(raw: any): SubImageDraft[] {
  return normalizeSubImages(raw).map((s) => ({
    image: s.image,
    summary: s.summary,
    description: s.description,
  }));
}

export default function EntityDetailFullscreen<T extends EntityBase>(props: {
  entity: T;
  viewSubIndex: number;
  setViewSubIndex: React.Dispatch<React.SetStateAction<number>>;
  onClose: () => void;

  editable?: boolean;
  onDelete?: () => void;

  /** 부모가 실제 저장 반영 */
  onPatch?: (patch: Partial<T>) => void;

  /** 태그 옵션(서브카테고리 후보들) */
  tagOptions?: string[];
}) {
  const {
    entity,
    viewSubIndex,
    setViewSubIndex,
    onClose,
    editable = false,
    onDelete,
    onPatch,
    tagOptions = [],
  } = props;

  const patch = useCallback((p: Partial<T>) => onPatch?.(p), [onPatch]);

  /** -----------------------------
   * Local drafts (UI는 draft를 본다)
   *  - debounced patch로 저장
   *  - flush로 닫기/전환 전에 강제 저장
   * ------------------------------ */
  const [symbolColorsDraft, setSymbolColorsDraft] = useState<SymbolColorDraft[]>(
    () => toSymbolDrafts((entity as any).symbolColors)
  );
  const [subImagesDraft, setSubImagesDraft] = useState<SubImageDraft[]>(
    () => toSubDrafts((entity as any).subImages)
  );

  const debouncedPatchSymbolColors = useDebounced((next: SymbolColorDraft[]) => {
    // ✅ 저장은 항상 신 스키마로 고정
    patch({ symbolColors: sanitizeSymbolColors(next) as any } as any);
  }, 120);

  const debouncedPatchSubImages = useDebounced((next: SubImageDraft[]) => {
    // ✅ 저장은 항상 신 스키마로 고정
    patch({ subImages: sanitizeSubImages(next) as any } as any);
  }, 120);

  const flushAll = useCallback(() => {
    debouncedPatchSymbolColors.flush();
    debouncedPatchSubImages.flush();
  }, [debouncedPatchSymbolColors, debouncedPatchSubImages]);

  /** -----------------------------
   * Base drafts (기존 방식 유지)
   * ------------------------------ */
  const [showSubOnMain, setShowSubOnMain] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [imgAnimKey, setImgAnimKey] = useState(0);
  const [shadowOn, setShadowOn] = useState(false);

  // right slide sheet
  const [editPanel, setEditPanel] = useState<EditPanel>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const [nameDraft, setNameDraft] = useState(entity.name || "");
  const [summaryDraft, setSummaryDraft] = useState((entity as any).summary || "");
  const [descDraft, setDescDraft] = useState((entity as any).description || "");
  const [rarityDraft, setRarityDraft] = useState<Rarity>(
    (((entity as any).rank as Rarity) || "S") as Rarity
  );

  const [mainImageDraft, setMainImageDraft] = useState((entity as any).mainImage || "");

  const [tagDraft, setTagDraft] = useState<string[]>(
    ((((entity as any).subCategories || []) as string[]) ?? []) as string[]
  );

  /** -----------------------------
   * Entity change:
   * - 남은 debounce 저장 flush
   * - draft 재동기화
   * - sheet 닫기
   * ------------------------------ */
  useEffect(() => {
    // ✅ entity 전환 직전에 남은 입력 저장
    debouncedPatchSymbolColors.flush();
    debouncedPatchSubImages.flush();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entity.id]);

  useEffect(() => {
    setEditPanel(null);

    setNameDraft(entity.name || "");
    setSummaryDraft((entity as any).summary || "");
    setDescDraft((entity as any).description || "");
    setRarityDraft((((entity as any).rank as Rarity) || "S") as Rarity);
    setMainImageDraft((entity as any).mainImage || "");
    setTagDraft((((entity as any).subCategories || []) as string[]) ?? []);

    // ✅ 구/신 스키마 혼재되어도 normalize로 안정화해서 draft 구성
    setSymbolColorsDraft(toSymbolDrafts((entity as any).symbolColors));
    setSubImagesDraft(toSubDrafts((entity as any).subImages));

    // 서브 없으면 sub toggle 꺼짐
    if (!((entity as any).subImages?.length || 0)) setShowSubOnMain(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entity.id]);

  /** -----------------------------
   * Images: 표시/resolve는 draft 기준
   * ------------------------------ */
  const main = useResolvedImage(mainImageDraft || (entity as any).mainImage || "");
  const profile = useResolvedImage((entity as any).profileImage || "");

  const subDraftUrl = subImagesDraft?.[viewSubIndex]?.image || "";
  const sub = useResolvedImage(subDraftUrl);

  const displayed = showSubOnMain && sub ? sub : main;

  const primaryHex = useMemo(() => {
    const normalized: SymbolColor[] = sanitizeSymbolColors(symbolColorsDraft);
    return getPrimaryColor(normalized);
  }, [symbolColorsDraft]);

  /** -----------------------------
   * Mount anim
   * ------------------------------ */
  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

  /** -----------------------------
   * Image glow anim trigger
   * ------------------------------ */
  useEffect(() => {
    if (!displayed) return;
    setShadowOn(false);
    setImgAnimKey((k) => k + 1);
    const t = window.setTimeout(() => setShadowOn(true), 260);
    return () => window.clearTimeout(t);
  }, [displayed]);

  /** -----------------------------
   * subImagesDraft 길이 변화에 따른 showSubOnMain 정리
   * ------------------------------ */
  useEffect(() => {
    if (!subImagesDraft.length) setShowSubOnMain(false);
  }, [subImagesDraft.length]);

  /** -----------------------------
   * Close (ESC / backdrop / X):
   * - 먼저 flush해서 입력 유실 방지
   * ------------------------------ */
  const handleClose = useCallback(() => {
    flushAll();
    onClose();
  }, [flushAll, onClose]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && handleClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleClose]);

  /** -----------------------------
   * sheet open -> body lock
   * ------------------------------ */
  useEffect(() => {
    if (!editPanel) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [editPanel]);

  /** -----------------------------
   * sheet open animation
   * ------------------------------ */
  useEffect(() => {
    if (!editPanel) {
      setSheetOpen(false);
      return;
    }
    setSheetOpen(false);
    const t = requestAnimationFrame(() => setSheetOpen(true));
    return () => cancelAnimationFrame(t);
  }, [editPanel]);

  const closeSheet = useCallback(() => {
    flushAll();
    setSheetOpen(false);
    window.setTimeout(() => setEditPanel(null), 220);
  }, [flushAll]);

  /** -----------------------------
   * Profile click (sub toggle)
   * ------------------------------ */
  const onClickProfile = useCallback(() => {
    if (!subImagesDraft.length) return;
    setShowSubOnMain((v) => !v);
  }, [subImagesDraft.length]);

  /** -----------------------------
   * Symbol draft helpers (UI 즉시 반영 + debounce 저장)
   * ------------------------------ */
  const addSymbolColor = useCallback(() => {
    setSymbolColorsDraft((prev) => {
      const next = [
        ...prev,
        {
          id: `sc-${Date.now()}-${Math.random().toString(16).slice(2)}`,
          name: "",
          hex: "#444444",
        },
      ];
      debouncedPatchSymbolColors.run(next);
      return next;
    });
  }, [debouncedPatchSymbolColors]);

  const updateSymbolColor = useCallback(
    (id: string, p: Partial<SymbolColorDraft>) => {
      setSymbolColorsDraft((prev) => {
        const next = prev.map((c) => (c.id === id ? { ...c, ...p } : c));
        debouncedPatchSymbolColors.run(next);
        return next;
      });
    },
    [debouncedPatchSymbolColors]
  );

  const removeSymbolColor = useCallback(
    (id: string) => {
      setSymbolColorsDraft((prev) => {
        const next = prev.filter((c) => c.id !== id);
        debouncedPatchSymbolColors.run(next);
        return next;
      });
    },
    [debouncedPatchSymbolColors]
  );

  /** -----------------------------
   * SubImages draft helpers (UI 즉시 반영 + debounce 저장)
   * ------------------------------ */
  const addSubImage = useCallback(() => {
    setSubImagesDraft((prev) => {
      const next = [...prev, { image: "", summary: "", description: "" }];
      debouncedPatchSubImages.run(next);

      // ✅ 새로 추가되면 바로 선택
      const idx = next.length - 1;
      setViewSubIndex(idx);
      setShowSubOnMain(true);

      return next;
    });
  }, [debouncedPatchSubImages, setViewSubIndex]);

  const updateSubImage = useCallback(
    (idx: number, p: Partial<SubImageDraft>) => {
      setSubImagesDraft((prev) => {
        const next = prev.map((s, i) => (i === idx ? { ...s, ...p } : s));
        debouncedPatchSubImages.run(next);
        return next;
      });
    },
    [debouncedPatchSubImages]
  );

  const removeSubImage = useCallback(
    (idx: number) => {
      setSubImagesDraft((prev) => {
        const next = prev.filter((_, i) => i !== idx);
        debouncedPatchSubImages.run(next);

        const nextIndex = Math.max(0, Math.min(viewSubIndex, next.length - 1));
        setViewSubIndex(nextIndex);
        if (!next.length) setShowSubOnMain(false);

        return next;
      });
    },
    [debouncedPatchSubImages, setViewSubIndex, viewSubIndex]
  );

  const subCategories: string[] = ((entity as any).subCategories || []) as string[];

  return (
    <div className="fixed inset-0 z-[9999]">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/30" onClick={handleClose} />

      {/* content */}
      <div
        className="absolute inset-0 text-white overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* bg */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-zinc-900" />

          <div
            className={[
              "absolute inset-0 transition-all duration-500 ease-out will-change-transform",
              mounted ? "opacity-100 translate-x-0" : "opacity-0 translate-x-[80px]",
            ].join(" ")}
            style={{
              transitionDelay: "80ms",
              background: "rgba(40,40,40,1)",
              clipPath: "polygon(58% 0, 86% 0, 62% 100%, 35% 100%)",
            }}
          />

          <div
            className={[
              "absolute inset-0 transition-all duration-500 ease-out will-change-transform",
              mounted ? "opacity-100 translate-x-0" : "opacity-0 translate-x-[110px]",
            ].join(" ")}
            style={{
              transitionDelay: "220ms",
              background: "rgba(24,24,24,1)",
              clipPath: "polygon(73% 0, 100% 0, 100% 100%, 50% 100%)",
            }}
          />

          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(0,0,0,0) 35%, rgba(0,0,0,0.25))",
              mixBlendMode: "overlay",
              opacity: 0.6,
            }}
          />
        </div>

        <div
          className={[
            "relative z-10 transition-all duration-700",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
          ].join(" ")}
          style={{ transitionDelay: "520ms" }}
        >
          {/* bottom gradient */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div
              className="absolute bottom-0 left-0 right-0 h-[45%]"
              style={{
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.95), rgba(0,0,0,0.6), transparent)",
              }}
            />
          </div>

          {/* top bar */}
          <div className="px-6 h-[60px] flex items-end justify-end relative gap-2">
            {editable && (
              <button
                type="button"
                onClick={() => {
                  flushAll();
                  onDelete?.();
                }}
                className="h-10 px-4 rounded-xl bg-red-500/15 border border-red-500/25 hover:bg-red-500/20 transition inline-flex items-center gap-2"
              >
                <span className="text-sm">삭제</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleClose}
              className="h-10 w-10 rounded-xl bg-white/10 border border-white/10 hover:bg-white/15 transition grid place-items-center"
              aria-label="닫기"
              title="닫기"
            >
              ✕
            </button>
          </div>

          {/* body */}
          <div className="relative h-[calc(100vh-60px)]">
            {/* ✅ 모바일: 이미지가 전체 배경 / 데스크탑: 좌측 패널 */}
            <div className="absolute inset-0 lg:right-[460px]">
              <LeftPanel
                entity={entity}
                editable={editable}
                subCategories={subCategories}
                displayed={displayed}
                primaryHex={primaryHex}
                imgAnimKey={imgAnimKey}
                shadowOn={shadowOn}
                mounted={mounted}
                onOpenBasic={() => setEditPanel("basic")}
                profileUrl={profile} 
                onClickProfile={onClickProfile}
              />
            </div>

            {/* ✅ Right: 모바일 Bottom Sheet / 데스크탑 Right 카드 */}
            <div className="absolute inset-0 z-20 pointer-events-none">
              <div
                className={[
                  "absolute pointer-events-auto",
                  // 모바일: 하단 시트
                  "left-0 right-0 bottom-0",
                  "h-[40vh] rounded-t-[28px]",
                  // 데스크탑: 우측 카드
                  "lg:left-auto lg:right-6 lg:top-6 lg:bottom-6 lg:h-auto lg:w-[420px] lg:rounded-3xl",
                ].join(" ")}
              >
                <RightPanel
                  entity={entity}
                  editable={editable}
                  symbolColors={symbolColorsDraft}
                  subImages={subImagesDraft}
                  viewSubIndex={viewSubIndex}
                  onOpenSymbolColors={() => setEditPanel("symbolColors")}
                  onOpenBasic={() => setEditPanel("basic")}
                  onOpenSubImages={() => setEditPanel("subImages")}
                  onPickSubImage={(idx) => {
                    setViewSubIndex(idx);
                    setShowSubOnMain(true);
                  }}
                />
              </div>
            </div>
          </div>
          {/* ✅ 안내 문구는 모바일에선 방해될 수 있어 lg에서만 */}
          <div
            className="hidden lg:block absolute left-1/2 -translate-x-1/2 top-8 text-xs text-white/40 hover:text-white/70 transition cursor-pointer z-30"
            onClick={handleClose}
          >
            ESC를 누르거나 상단 X를 눌러 돌아가기
          </div>
        </div>

        {/* RIGHT SLIDE SHEET */}
        <RightSlideSheet
          open={!!(editable && editPanel)}
          sheetOpen={sheetOpen}
          editPanel={editable ? editPanel : null}
          onClose={closeSheet}
          titleMap={{
            basic: "기본 정보",
            profileImage: "프로필 이미지",
            symbolColors: "상징색 편집",
            subImages: "서브 이미지 편집",
          }}
          // basic
          nameDraft={nameDraft}
          setNameDraft={setNameDraft}
          summaryDraft={summaryDraft}
          setSummaryDraft={setSummaryDraft}
          descDraft={descDraft}
          setDescDraft={setDescDraft}
          rarityDraft={rarityDraft}
          setRarityDraft={setRarityDraft}
          tagDraft={tagDraft}
          setTagDraft={setTagDraft}
          tagOptions={tagOptions}
          mainImageDraft={mainImageDraft}
          setMainImageDraft={setMainImageDraft}
          entity={entity}
          patch={(p: Partial<T>) => {
            // ✅ 패치 전에 draft 저장 밀어넣기(입력 유실 방지)
            flushAll();
            patch(p);
          }}
          // symbol colors (✅ draft 기준)
          symbolColors={symbolColorsDraft}
          addSymbolColor={addSymbolColor}
          updateSymbolColor={updateSymbolColor}
          removeSymbolColor={removeSymbolColor}
          // sub images (✅ draft 기준)
          subImages={subImagesDraft}
          viewSubIndex={viewSubIndex}
          setViewSubIndex={setViewSubIndex}
          addSubImage={addSubImage}
          updateSubImage={updateSubImage}
          removeSubImage={removeSubImage}
        />
      </div>
    </div>
  );
}