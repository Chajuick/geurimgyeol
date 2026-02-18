import React, { useEffect, useMemo, useState } from "react";
import ProfileCard from "@/components/ui/profile-card";
import { useResolvedImage } from "@/hooks/useResolvedImage";
import type { EntityBase } from "@/types";
import {
  X,
  Pencil,
  Plus,
  Trash2,
  Palette,
  Tags,
  FileText,
  Check,
  Search,
} from "lucide-react";
import ImageUpload from "@/components/ImageUpload";

function getPrimaryColor(symbolColors: any): string | null {
  if (!symbolColors) return null;
  if (Array.isArray(symbolColors)) {
    const c = symbolColors.find((v) => v?.hex);
    return c?.hex ?? null;
  }
  if (typeof symbolColors === "object") {
    if ("hex" in symbolColors) return (symbolColors as any).hex ?? null;
  }
  return null;
}

type SymbolColorDraft = { id: string; name: string; hex: string };
type SubImageDraft = { image: string; summary: string; description: string };
type Rarity = "S" | "A" | "B" | "C" | "D";

// ✅ rgb helpers
function clamp255(n: number) {
  return Math.max(0, Math.min(255, n));
}
function hexToRgb(hex: string) {
  const m = hex.trim().match(/^#?([0-9a-f]{6})$/i);
  if (!m) return null;
  const v = m[1];
  const r = parseInt(v.slice(0, 2), 16);
  const g = parseInt(v.slice(2, 4), 16);
  const b = parseInt(v.slice(4, 6), 16);
  return { r, g, b };
}
function rgbToHex(r: number, g: number, b: number) {
  const rr = clamp255(r).toString(16).padStart(2, "0");
  const gg = clamp255(g).toString(16).padStart(2, "0");
  const bb = clamp255(b).toString(16).padStart(2, "0");
  return `#${rr}${gg}${bb}`.toUpperCase();
}
function isHex6(v: string) {
  return /^#([0-9a-f]{6})$/i.test(v.trim());
}

type EditPanel = null | "basic" | "profileImage" | "symbolColors" | "subImages";

export default function EntityDetailFullscreen<T extends EntityBase>(props: {
  entity: T;
  viewSubIndex: number;
  setViewSubIndex: React.Dispatch<React.SetStateAction<number>>;
  onClose: () => void;

  editable?: boolean;
  onDelete?: () => void;

  // ✅ 부모가 실제 저장 반영
  onPatch?: (patch: Partial<T>) => void;

  // ✅ 태그 데이터(서브태그들) 전달
  tagOptions?: string[]; // ex) ["불", "얼음", "근접", "원거리", ...]
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

  const main = useResolvedImage((entity as any).mainImage || "");
  const sub = useResolvedImage((entity as any).subImages?.[viewSubIndex]?.image || "");
  const profile = useResolvedImage((entity as any).profileImage || "");

  const primaryHex = getPrimaryColor((entity as any).symbolColors);

  const [showSubOnMain, setShowSubOnMain] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [imgAnimKey, setImgAnimKey] = useState(0);
  const [shadowOn, setShadowOn] = useState(false);

  const displayed = showSubOnMain && sub ? sub : main;

  // ✅ right sheet
  const [editPanel, setEditPanel] = useState<EditPanel>(null);

  // entity change -> close sheet
  useEffect(() => {
    setEditPanel(null);
  }, [entity.id]);

  // ✅ helper patch
  const patch = (p: Partial<T>) => onPatch?.(p);

  // drafts
  const [nameDraft, setNameDraft] = useState(entity.name || "");
  const [summaryDraft, setSummaryDraft] = useState((entity as any).summary || "");
  const [descDraft, setDescDraft] = useState((entity as any).description || "");
  const [rarityDraft, setRarityDraft] = useState<Rarity>(
    (((entity as any).rank as Rarity) || "S")
  );
  const [mainImageDraft, setMainImageDraft] = useState((entity as any).mainImage || "");

  // tags draft (subCategories)
  const [tagDraft, setTagDraft] = useState<string[]>(
    (((entity as any).subCategories || []) as string[]) ?? []
  );

  useEffect(() => {
    setNameDraft(entity.name || "");
    setSummaryDraft((entity as any).summary || "");
    setDescDraft((entity as any).description || "");
    setRarityDraft((((entity as any).rank as Rarity) || "S"));
    setMainImageDraft((entity as any).mainImage || "");
    setTagDraft((((entity as any).subCategories || []) as string[]) ?? []);
  }, [entity.id]);

  // symbol colors normalize
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
    // 구형 데이터 호환: description만 있던 경우 summary=""로 보정
    return raw.map((s: any) => ({
      image: s?.image || "",
      summary: s?.summary || "",
      description: s?.description || "",
    }));
  }, [entity]);

  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
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

  const [sheetOpen, setSheetOpen] = useState(false);
  const closeSheet = () => {
  setSheetOpen(false);
  window.setTimeout(() => setEditPanel(null), 220);
};

  useEffect(() => {
    if (!editPanel) {
      setSheetOpen(false);
      return;
    }
    // 열릴 때 애니메이션 트리거
    setSheetOpen(false);
    const t = requestAnimationFrame(() => setSheetOpen(true));
    return () => cancelAnimationFrame(t);
  }, [editPanel]);

  // tags
  const subCategories: string[] = ((entity as any).subCategories || []) as string[];

  return (
    <div className="fixed inset-0 z-[9999]">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

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
                onClick={onDelete}
                className="h-10 px-4 rounded-xl bg-red-500/15 border border-red-500/25 hover:bg-red-500/20 transition inline-flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
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
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* body */}
          <div className="relative h-[calc(100vh-60px)] py-6">
            <div className="h-full max-h-[100vh] grid grid-cols-12 gap-6">
              <div className="col-span-1 hidden lg:block" />

              {/* LEFT */}
              <div className="h-full col-span-12 lg:col-span-5 flex flex-col justify-start">
                <div className="relative">
                  <div
                    className="w-full flex items-center justify-center h-[calc(100vh-120px)]"
                    key={displayed}
                  >
                    {displayed ? (
                      <div
                        key={imgAnimKey}
                        className="entityFxWrap"
                        style={
                          primaryHex
                            ? ({ ["--glow" as any]: `${primaryHex}55` } as React.CSSProperties)
                            : undefined
                        }
                      >
                        <div className="entityInner">
                          <div
                            className={["entityGlow", shadowOn ? "entityGlow--on" : ""].join(" ")}
                            style={{
                              WebkitMaskImage: `url("${displayed}")`,
                              maskImage: `url("${displayed}")`,
                            }}
                          />
                          <img
                            src={displayed}
                            alt="main"
                            loading="eager"
                            decoding="async"
                            className="entityImg"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-white/40">이미지 없음</div>
                    )}

                    <div
                      className="absolute left-1/2 bottom-6 -translate-x-1/2 w-[420px] h-[80px] rounded-full blur-2xl opacity-60"
                      style={{
                        background: "radial-gradient(ellipse at center, rgba(0,0,0,0.8), transparent)",
                      }}
                    />
                  </div>

                  <div className="absolute left-0 bottom-0 p-4 space-y-3 translate-x-[20%] w-[520px] max-w-[80vw]">
                    <div className="flex items-center gap-2">
                      <div className="text-3xl font-semibold tracking-tight">{entity.name}</div>

                      {/* ✅ 이름 옆 수정: 기본정보(이름/요약/설명/태그/이미지/레어리티) */}
                      {editable && (
                        <button
                          type="button"
                          onClick={() => setEditPanel("basic")}
                          className="h-9 w-9 rounded-xl bg-white/10 border border-white/10 hover:bg-white/15 transition grid place-items-center"
                          title="기본 정보 편집"
                        >
                          <Pencil className="w-4 h-4 text-white/80" />
                        </button>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {(subCategories || []).map((t: string) => (
                        <span
                          key={t}
                          className="px-3 h-7 inline-flex items-center rounded-full bg-white/10 border border-white/10 text-xs text-white/80"
                        >
                          {t}
                        </span>
                      ))}
                      {(subCategories || []).length === 0 && (
                        <span className="text-xs text-white/35">태그 없음</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* MIDDLE */}
              <div className="col-span-12 lg:col-span-2 flex flex-col justify-end">
                <div className="relative mb-12 max-w-45">
                  <button
                    type="button"
                    onClick={onClickProfile}
                    className="text-left w-full"
                    title={(entity as any).subImages?.length ? "클릭: 메인/서브 토글" : ""}
                  >
                    {/* ✅ 등급은 아직 노출 안 함 (rank prop 넣지 않음) */}
                    <ProfileCard name={entity.name} imageUrl={profile} />
                  </button>
                </div>
              </div>

              {/* RIGHT */}
              <div
                className={[
                  "col-span-12 lg:col-span-4 mr-6 mb-12",
                  "relative overflow-hidden rounded-3xl",
                  "bg-zinc-950/35 backdrop-blur-2xl",
                  "border border-white/10 ring-1 ring-white/5",
                  "shadow-[0_18px_70px_rgba(0,0,0,0.65)]",
                ].join(" ")}
              >
                {/* ✅ symbol colors */}
                <div className="px-4 mt-6">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-white/60">상징색</p>
                    {editable && (
                      <button
                        type="button"
                        onClick={() => setEditPanel("symbolColors")}
                        className="h-9 w-9 rounded-xl bg-white/10 border border-white/10 hover:bg-white/15 transition grid place-items-center"
                        title="상징색 편집"
                      >
                        <Palette className="w-4 h-4 text-white/80" />
                      </button>
                    )}
                  </div>

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
                </div>

                {/* ✅ summary + description */}
                <div className="px-4 pt-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-white/60">설명</p>
                    {editable && (
                      <button
                        type="button"
                        onClick={() => setEditPanel("basic")}
                        className="h-9 w-9 rounded-xl bg-white/10 border border-white/10 hover:bg-white/15 transition grid place-items-center"
                        title="기본 정보 편집"
                      >
                        <FileText className="w-4 h-4 text-white/80" />
                      </button>
                    )}
                  </div>

                  {/* summary */}
                  <div className="mt-3">
                    <p className="text-lg text-white/85 text-left leading-relaxed whitespace-pre-wrap">
                      {(entity as any).summary || "요약이 없습니다"}
                    </p>
                  </div>

                  {/* description scroll */}
                  <div className="mt-3 max-h-[150px] overflow-y-auto scroll-dark">
                    <p className="text-sm text-white/70 text-left leading-relaxed whitespace-pre-wrap">
                      {(entity as any).description || "설명이 없습니다"}
                    </p>
                  </div>
                </div>

                {/* ✅ sub images + summary/description */}
                <div className="px-4 mt-4 pb-6">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-white/60">서브 이미지</p>
                    {editable && (
                      <button
                        type="button"
                        onClick={() => setEditPanel("subImages")}
                        className="h-9 w-9 rounded-xl bg-white/10 border border-white/10 hover:bg-white/15 transition grid place-items-center"
                        title="서브 이미지 편집"
                      >
                        <Tags className="w-4 h-4 text-white/80" />
                      </button>
                    )}
                  </div>

                  {subImages.length > 0 ? (
                    <>
                      <div className="overflow-x-auto pb-2 scroll-dark mt-3">
                        <div className="flex gap-3 min-w-max">
                          {subImages.map((s, idx) => {
                            const active = idx === viewSubIndex;
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                  setViewSubIndex(idx);
                                  setShowSubOnMain(true);
                                }}
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

                      {/* sub summary */}
                      <div className="mt-4">
                        <p className="text-lg text-white/85 text-left leading-relaxed whitespace-pre-wrap">
                          {subImages[viewSubIndex]?.summary || "요약이 없습니다"}
                        </p>
                      </div>

                      {/* sub description scroll */}
                      <div className="mt-3 max-h-[180px] overflow-y-auto scroll-dark">
                        <p className="text-sm text-white/70 text-left leading-relaxed whitespace-pre-wrap">
                          {subImages[viewSubIndex]?.description || "설명이 없습니다"}
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="text-white/40 text-sm mt-3">서브 이미지가 없습니다.</div>
                  )}
                </div>
              </div>
            </div>

            <div
              className="absolute left-1/2 -translate-x-1/2 top-[-12px] text-xs text-white transition-opacity duration-700 cursor-pointer opacity-40 hover:opacity-80"
              onClick={onClose}
            >
              ESC를 누르거나 상단 X를 눌러 돌아가기
            </div>
          </div>
        </div>

        {/* ✅ RIGHT SLIDE SHEET */}
        {editable && editPanel && (
          <div className="fixed inset-0 z-[10000]">
            <div
              className={[
                "absolute inset-0 bg-black/55 backdrop-blur-sm transition-opacity duration-300",
                sheetOpen ? "opacity-100" : "opacity-0",
              ].join(" ")}
              onClick={closeSheet}
            />
            <div
              className={[
                "absolute right-0 top-0 h-full w-[420px] max-w-[92vw]",
                "bg-zinc-950/95 border-l border-white/10",
                "shadow-[0_0_0_1px_rgba(255,255,255,0.06),-20px_0_80px_rgba(0,0,0,0.55)]",
                "backdrop-blur-2xl",
                "transform-gpu transition-all duration-300 ease-out will-change-transform",
                sheetOpen ? "translate-x-0 opacity-100" : "translate-x-[24px] opacity-0",
              ].join(" ")}
              style={{ transitionDelay: sheetOpen ? "40ms" : "0ms" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* header */}
              <div className="h-16 px-5 flex items-center justify-between border-b border-white/10">
                <div className="text-sm font-semibold text-white">
                  {editPanel === "basic" && "기본 정보"}
                  {editPanel === "profileImage" && "프로필 이미지"}
                  {editPanel === "symbolColors" && "상징색 편집"}
                  {editPanel === "subImages" && "서브 이미지 편집"}
                </div>
                <button
                  className="h-10 w-10 rounded-xl bg-white/10 border border-white/10 hover:bg-white/15 transition grid place-items-center"
                  onClick={closeSheet}
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
                        onChange={(e) => {
                          const v = e.target.value;
                          setNameDraft(v);
                          patch({ name: v } as any);
                        }}
                        className="w-full h-11 px-4 rounded-xl bg-black/25 border border-white/10 text-white outline-none focus:ring-2 focus:ring-white/20"
                        placeholder="이름"
                      />
                    </div>

                    {/* ✅ RARITY (저장만 / 노출X) */}
                    {/*<div className="space-y-3">
                      <p className="text-xs text-white/60">레어리티</p>
                      <select
                        value={rarityDraft}
                        onChange={(e) => {
                          const v = e.target.value as Rarity;
                          setRarityDraft(v);
                          patch({ rank: v } as any);
                        }}
                        className="w-full h-11 px-4 rounded-xl bg-black/25 border border-white/10 text-white outline-none focus:ring-2 focus:ring-white/20"
                      >
                        {(["S", "A", "B", "C", "D"] as Rarity[]).map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                      <p className="text-[11px] text-white/35 leading-relaxed">
                        * 현재는 사용자 화면에 표시하지 않고 저장만 합니다.
                      </p>
                    </div>*/}

                    {/* ✅ SUMMARY */}
                    <div className="space-y-3">
                      <p className="text-xs text-white/60">요약</p>
                      <textarea
                        value={summaryDraft}
                        onChange={(e) => {
                          const v = e.target.value;
                          setSummaryDraft(v);
                          patch({ summary: v } as any);
                        }}
                        className="w-full h-28 p-4 rounded-2xl bg-black/25 border border-white/10 text-white outline-none focus:ring-2 focus:ring-white/20 resize-none overflow-y-auto"
                        placeholder="리스트/카드에 보일 짧은 요약"
                      />
                    </div>

                    {/* ✅ DESCRIPTION */}
                    <div className="space-y-3">
                      <p className="text-xs text-white/60">설명</p>
                      <textarea
                        value={descDraft}
                        onChange={(e) => {
                          const v = e.target.value;
                          setDescDraft(v);
                          patch({ description: v } as any);
                        }}
                        className="w-full h-48 p-4 rounded-2xl bg-black/25 border border-white/10 text-white outline-none focus:ring-2 focus:ring-white/20 resize-none overflow-y-auto"
                        placeholder="상세 설명"
                      />
                    </div>

                    {/* ✅ TAGS SELECTOR */}
                    <TagMultiSelect
                      label="카테고리"
                      options={tagOptions}
                      value={tagDraft}
                      onChange={(next) => {
                        setTagDraft(next);
                        patch({ subCategories: next } as any);
                      }}
                    />

                    <div className="space-y-3">
                      <p className="text-xs text-white/60">프로필 이미지</p>
                      <ImageUpload
                        value={(entity as any).profileImage || ""}
                        onChange={(v) => patch({ profileImage: v } as any)}
                        aspect="video"
                      />
                    </div>

                    {/* ✅ MAIN IMAGE */}
                    <div className="space-y-3">
                      <p className="text-xs text-white/60">메인 이미지</p>
                      <ImageUpload
                        value={mainImageDraft || ""}
                        onChange={(v) => {
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
                        {symbolColors.map((c) => {
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
                                  onChange={(e) =>
                                    updateSymbolColor(c.id, { name: e.target.value })
                                  }
                                  className="w-full h-10 px-3 rounded-xl bg-black/25 border border-white/10 text-white outline-none focus:ring-2 focus:ring-white/20"
                                  placeholder="이름"
                                />
                              </div>

                              {/* palette + hex */}
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                  <span
                                    className="w-6 h-6 rounded-full border border-white/20"
                                    style={{ backgroundColor: safeHex }}
                                    title={safeHex}
                                  />
                                  <input
                                    type="color"
                                    value={safeHex}
                                    onChange={(e) =>
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
                                    onChange={(e) =>
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

                              {/* rgb */}
                              <div className="grid grid-cols-3 gap-2">
                                {(["r", "g", "b"] as const).map((k) => (
                                  <div key={k}>
                                    <p className="text-xs text-white/60 mb-2">
                                      {k.toUpperCase()}
                                    </p>
                                    <input
                                      type="number"
                                      min={0}
                                      max={255}
                                      value={rgb[k]}
                                      onChange={(e) => {
                                        const v = clamp255(Number(e.target.value || 0));
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
                                      <SubThumbInner image={s.image} alt={`sub-${idx}`} />
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
                            onChange={(v) => updateSubImage(viewSubIndex, { image: v })}
                            aspect="square"
                          />
                        </div>

                        {/* ✅ SUB SUMMARY */}
                        <div className="space-y-3">
                          <p className="text-xs text-white/60">서브 이미지 요약</p>
                          <textarea
                            value={subImages[viewSubIndex]?.summary || ""}
                            onChange={(e) =>
                              updateSubImage(viewSubIndex, { summary: e.target.value })
                            }
                            className="w-full h-28 p-4 rounded-2xl bg-black/25 border border-white/10 text-white outline-none focus:ring-2 focus:ring-white/20 resize-none overflow-y-auto"
                            placeholder="짧은 요약"
                          />
                        </div>

                        {/* ✅ SUB DESCRIPTION */}
                        <div className="space-y-3">
                          <p className="text-xs text-white/60">서브 이미지 설명</p>
                          <textarea
                            value={subImages[viewSubIndex]?.description || ""}
                            onChange={(e) =>
                              updateSubImage(viewSubIndex, { description: e.target.value })
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
        )}
      </div>
    </div>
  );
}

function SubThumbInner(props: { image: string; alt?: string }) {
  const { image, alt = "sub" } = props;
  const resolved = useResolvedImage(image || "");

  if (!resolved) {
    return (
      <div className="w-full h-full grid place-items-center text-white/30 text-xs">
        NO IMAGE
      </div>
    );
  }

  return (
    <img
      src={resolved}
      alt={alt}
      loading="lazy"
      decoding="async"
      className="w-full h-full object-contain"
    />
  );
}

/** ✅ 태그 데이터에서 선택(검색/체크/멀티) */
function TagMultiSelect(props: {
  label?: string;
  options: string[];
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const { label = "태그", options, value, onChange } = props;
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    const base = (options || []).filter(Boolean);
    if (!qq) return base.slice(0, 200);
    return base.filter((t) => t.toLowerCase().includes(qq)).slice(0, 200);
  }, [options, q]);

  const toggle = (t: string) => {
    const has = value.includes(t);
    const next = has ? value.filter((x) => x !== t) : [...value, t];
    onChange(next);
  };

  const remove = (t: string) => onChange(value.filter((x) => x !== t));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-white/60">{label}</p>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="h-9 px-3 rounded-xl bg-white/10 border border-white/10 hover:bg-white/15 transition text-xs inline-flex items-center gap-2"
          title="태그 선택"
        >
          <Tags className="w-4 h-4" />
          {open ? "닫기" : "선택"}
        </button>
      </div>

      {/* selected chips */}
      <div className="flex flex-wrap gap-2">
        {value.length === 0 ? (
          <span className="text-xs text-white/35">선택된 태그 없음</span>
        ) : (
          value.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => remove(t)}
              className="px-3 h-8 rounded-full bg-white/10 border border-white/10 hover:bg-white/15 transition inline-flex items-center gap-2 text-xs"
              title="클릭: 제거"
            >
              <span className="text-white/85">{t}</span>
              <X className="w-3.5 h-3.5 text-white/60" />
            </button>
          ))
        )}
      </div>

      {open && (
        <div className="mt-2 rounded-2xl border border-white/10 bg-black/25 overflow-hidden">
          <div className="p-3 border-b border-white/10 flex items-center gap-2">
            <Search className="w-4 h-4 text-white/50" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-black/25 border border-white/10 text-white outline-none focus:ring-2 focus:ring-white/20"
              placeholder="카테고리 검색"
            />
          </div>

          {options.length === 0 ? (
            <div className="p-4 text-sm text-white/40">
              카테고리가 존재 하지 않습니다! 서브 카테고리를 추가해주세요.
            </div>
          ) : (
            <div className="max-h-[260px] overflow-y-auto p-2 scroll-dark">
              {filtered.length === 0 ? (
                <div className="p-4 text-sm text-white/40">검색 결과 없음</div>
              ) : (
                <div className="space-y-1">
                  {filtered.map((t) => {
                    const checked = value.includes(t);
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => toggle(t)}
                        className={[
                          "w-full h-11 px-3 rounded-xl",
                          "flex items-center justify-between",
                          "border transition",
                          checked
                            ? "bg-white/10 border-white/25"
                            : "bg-black/20 border-white/10 hover:border-white/20 hover:bg-white/5",
                        ].join(" ")}
                      >
                        <span className="text-sm text-white/85">{t}</span>
                        <span
                          className={[
                            "h-6 w-6 rounded-lg grid place-items-center border",
                            checked ? "border-white/30 bg-white/10" : "border-white/10 bg-black/20",
                          ].join(" ")}
                        >
                          {checked && <Check className="w-4 h-4 text-white/85" />}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}