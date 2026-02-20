import React, { useEffect, useMemo, useState } from "react";
import type { EntityBase } from "@/types";
import { useResolvedImage } from "@/hooks/useResolvedImage";

import LeftPanel from "./panels/LeftPanel";
import MiddlePanel from "./panels/MiddlePanel";
import RightPanel from "./panels/RightPanel";
import RightSlideSheet from "./panels/RightSlideSheet";

import { getPrimaryColor } from "./utils/color";

export type SymbolColorDraft = { id: string; name: string; hex: string };
export type SubImageDraft = { image: string; summary: string; description: string };
export type Rarity = "S" | "A" | "B" | "C" | "D";
export type EditPanel = null | "basic" | "profileImage" | "symbolColors" | "subImages";

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

  const patch = (p: Partial<T>) => onPatch?.(p);

  // images
  const main = useResolvedImage((entity as any).mainImage || "");
  const sub = useResolvedImage((entity as any).subImages?.[viewSubIndex]?.image || "");
  const profile = useResolvedImage((entity as any).profileImage || "");

  const primaryHex = getPrimaryColor((entity as any).symbolColors);

  const [showSubOnMain, setShowSubOnMain] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [imgAnimKey, setImgAnimKey] = useState(0);
  const [shadowOn, setShadowOn] = useState(false);

  const displayed = showSubOnMain && sub ? sub : main;

  // right slide sheet
  const [editPanel, setEditPanel] = useState<EditPanel>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  // drafts
  const [nameDraft, setNameDraft] = useState(entity.name || "");
  const [summaryDraft, setSummaryDraft] = useState((entity as any).summary || "");
  const [descDraft, setDescDraft] = useState((entity as any).description || "");
  const [rarityDraft, setRarityDraft] = useState<Rarity>(((entity as any).rank as Rarity) || "S");
  const [mainImageDraft, setMainImageDraft] = useState((entity as any).mainImage || "");

  const [tagDraft, setTagDraft] = useState<string[]>(
    ((((entity as any).subCategories || []) as string[]) ?? []) as string[]
  );

  // normalize symbol colors
  const symbolColors = useMemo<SymbolColorDraft[]>(() => {
    const raw: any = (entity as any).symbolColors;
    if (!raw) return [];
    const arr = Array.isArray(raw) ? raw : raw?.hex ? [raw] : [];
    return arr
      .filter((c) => c?.hex)
      .map((c, idx) => ({
        id: c.id || `${c.hex}-${idx}-${Math.random().toString(16).slice(2)}`,
        name: c.name || "",
        hex: (c.hex || "#444444").toUpperCase(),
      }));
  }, [entity]);

  const subImages = useMemo<SubImageDraft[]>(() => {
    const raw = (entity as any).subImages;
    if (!Array.isArray(raw)) return [];
    return raw.map((s: any) => ({
      image: s?.image || "",
      summary: s?.summary || "",
      description: s?.description || "",
    }));
  }, [entity]);

  // entity change => close sheet & refresh drafts
  useEffect(() => {
    setEditPanel(null);
    setNameDraft(entity.name || "");
    setSummaryDraft((entity as any).summary || "");
    setDescDraft((entity as any).description || "");
    setRarityDraft(((entity as any).rank as Rarity) || "S");
    setMainImageDraft((entity as any).mainImage || "");
    setTagDraft((((entity as any).subCategories || []) as string[]) ?? []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entity.id]);

  // mount anim
  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

  // image glow anim trigger
  useEffect(() => {
    if (!displayed) return;
    setShadowOn(false);
    setImgAnimKey((k) => k + 1);
    const t = window.setTimeout(() => setShadowOn(true), 260);
    return () => window.clearTimeout(t);
  }, [displayed]);

  useEffect(() => {
    if (!(entity as any).subImages?.length) setShowSubOnMain(false);
  }, [(entity as any).subImages?.length]);

  // ESC close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // sheet open -> body lock
  useEffect(() => {
    if (!editPanel) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [editPanel]);

  // sheet open animation
  useEffect(() => {
    if (!editPanel) {
      setSheetOpen(false);
      return;
    }
    setSheetOpen(false);
    const t = requestAnimationFrame(() => setSheetOpen(true));
    return () => cancelAnimationFrame(t);
  }, [editPanel]);

  const closeSheet = () => {
    setSheetOpen(false);
    window.setTimeout(() => setEditPanel(null), 220);
  };

  const onClickProfile = () => {
    if (!(entity as any).subImages?.length) return;
    setShowSubOnMain((v) => !v);
  };

  // symbol helpers
  const addSymbolColor = () => {
    const next = [...symbolColors, { id: `sc-${Date.now()}`, name: "", hex: "#444444" }];
    patch({ symbolColors: next } as any);
  };
  const updateSymbolColor = (id: string, p: Partial<SymbolColorDraft>) => {
    const next = symbolColors.map((c) => (c.id === id ? { ...c, ...p } : c));
    patch({ symbolColors: next } as any);
  };
  const removeSymbolColor = (id: string) => {
    patch({ symbolColors: symbolColors.filter((c) => c.id !== id) } as any);
  };

  // sub image helpers
  const addSubImage = () => {
    const next = [...subImages, { image: "", summary: "", description: "" }];
    patch({ subImages: next } as any);
    setViewSubIndex(next.length - 1);
    setShowSubOnMain(true);
  };
  const updateSubImage = (idx: number, p: Partial<SubImageDraft>) => {
    const next = subImages.map((s, i) => (i === idx ? { ...s, ...p } : s));
    patch({ subImages: next } as any);
  };
  const removeSubImage = (idx: number) => {
    const next = subImages.filter((_, i) => i !== idx);
    patch({ subImages: next } as any);

    const nextIndex = Math.max(0, Math.min(viewSubIndex, next.length - 1));
    setViewSubIndex(nextIndex);
    if (!next.length) setShowSubOnMain(false);
  };

  const subCategories: string[] = ((entity as any).subCategories || []) as string[];

  return (
    <div className="fixed inset-0 z-[9999]">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      {/* content */}
      <div className="absolute inset-0 text-white overflow-hidden" onClick={(e) => e.stopPropagation()}>
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
          className={["relative z-10 transition-all duration-700", mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"].join(" ")}
          style={{ transitionDelay: "520ms" }}
        >
          {/* bottom gradient */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div
              className="absolute bottom-0 left-0 right-0 h-[45%]"
              style={{
                background: "linear-gradient(to top, rgba(0,0,0,0.95), rgba(0,0,0,0.6), transparent)",
              }}
            />
          </div>

          {/* top bar */}
          <div className="px-6 h-[60px] flex items-end justify-end relative gap-2">
            {editable && (
              <button
                type="button"
                onClick={onDelete}
                className="h-10 px-4 rounded-xl bg-red-500/15 border border-red-500/25 hover:bg-red-500/20 transition inline-flex items-center gap-2"
              >
                <span className="text-sm">삭제</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="h-10 w-10 rounded-xl bg-white/10 border border-white/10 hover:bg-white/15 transition grid place-items-center"
              aria-label="닫기"
              title="닫기"
            >
              ✕
            </button>
          </div>

          {/* body */}
          <div className="relative h-[calc(100vh-60px)] py-6">
            <div className="h-full max-h-[100vh] grid grid-cols-12 gap-6">
              <div className="col-span-1 hidden lg:block" />

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
              />

              <MiddlePanel
                entity={entity}
                profileUrl={profile}
                onClickProfile={onClickProfile}
              />

              <RightPanel
                entity={entity}
                editable={editable}
                symbolColors={symbolColors}
                subImages={subImages}
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

            <div
              className="absolute left-1/2 -translate-x-1/2 top-[-12px] text-xs text-white transition-opacity duration-700 cursor-pointer opacity-40 hover:opacity-80"
              onClick={onClose}
            >
              ESC를 누르거나 상단 X를 눌러 돌아가기
            </div>
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
          patch={patch}
          // symbol colors
          symbolColors={symbolColors}
          addSymbolColor={addSymbolColor}
          updateSymbolColor={updateSymbolColor}
          removeSymbolColor={removeSymbolColor}
          // sub images
          subImages={subImages}
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