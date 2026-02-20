// Character.tsx (or Characters.tsx) — full file
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Pencil, SlidersHorizontal } from "lucide-react";

import { usePortfolioContext } from "@/contexts/PortfolioContext";

import GButton from "@/components/ui/gyeol-button";
import EntityGridCard from "@/components/entities/entity-grid-card";
import EntityDetailFullscreen from "@/components/entities/detail/EntityDetailFullscreen";
import EntityCategoryBar from "@/components/entities/entity-category-bar";
import ConfirmModal from "@/components/ui/confirm-modal";
import { HUDPanel, HUDBadge } from "@/components/ui/hud";
import CategoryGroupEditModal, {
  CategoryGroup,
} from "@/components/entities/category-group-edit-modal";

import type {
  CharacterData,
  ID,
  SubImage,
  SymbolColor,
  CategoryItem,
  FramePresetId,
} from "@/types";

import { cn } from "@/lib/utils";
import { INNER_OPTIONS, OUTER_OPTIONS, OUTER_PRESETS } from "@/lib/framePresets";

const ALL = "전체";

function isOuterPreset(id: FramePresetId) {
  return OUTER_PRESETS.has(id);
}

function makeId(): ID {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID() as ID;
  }
  return `${Date.now()}_${Math.random().toString(16).slice(2)}` as ID;
}

/** SettingsData(CategoryItem[]) -> UI(CategoryGroup[]) 어댑터 */
function toCategoryGroups(items: CategoryItem[] = []): CategoryGroup[] {
  return items.map(x => ({ main: x.main, subs: x.subs || [] }));
}
/** UI(CategoryGroup[]) -> SettingsData(CategoryItem[]) 어댑터 */
function toCategoryItems(groups: CategoryGroup[] = []): CategoryItem[] {
  return groups.map(g => ({ main: g.main, subs: g.subs || [] }));
}

/** ✅ 프레임 draft: OUTER 1개 + INNER 1개 */
type FrameDraft = {
  outer: FramePresetId; // "none" 포함
  inner: FramePresetId; // "none" 포함
};

export default function Characters() {
  const { data, setData, editMode } = usePortfolioContext();

  /** ✅ settings 기반 ranks */
  const rankSet = data.settings?.rankSets?.characters;
  const defaultRankId: ID | null = useMemo(() => {
    const tiers = rankSet?.tiers || [];
    return (rankSet?.defaultTierId || tiers[0]?.id || null) as ID | null;
  }, [rankSet]);

  /** ✅ categories (SettingsData는 CategoryItem[]) */
  const categories: CategoryGroup[] = useMemo(() => {
    return toCategoryGroups(data.settings?.characterCategories || []);
  }, [data.settings?.characterCategories]);

  /** ✅ normalize */
  const charactersNormalized: CharacterData[] = useMemo(() => {
    const list = data.characters || [];
    return list.map((c: any) => {
      const rankId: ID =
        (c.rankId as ID) || (defaultRankId as ID) || ("rank_default" as ID);

      return {
        id: String(c.id ?? makeId()) as ID,
        name: String(c.name ?? "Unnamed"),

        rankId,

        subCategories: Array.isArray(c.subCategories)
          ? c.subCategories
          : c.subCategory
            ? [c.subCategory]
            : [],

        profileImage: String(c.profileImage ?? ""),
        mainImage: String(c.mainImage ?? ""),

        subImages: Array.isArray(c.subImages)
          ? (c.subImages as SubImage[])
          : [],
        tags: Array.isArray(c.tags) ? c.tags : [],
        symbolColors: Array.isArray(c.symbolColors)
          ? (c.symbolColors as SymbolColor[])
          : [],

        summary: String(c.summary ?? ""),
        description: String(c.description ?? ""),

        meta: c.meta ?? undefined,
      } as CharacterData;
    });
  }, [data.characters, defaultRankId]);

  const [selectedId, setSelectedId] = useState<ID | null>(
    (charactersNormalized[0]?.id as ID) || null
  );

  const [activeMain, setActiveMain] = useState<string>(ALL);
  const [activeSub, setActiveSub] = useState<string>(ALL);

  const [viewModalId, setViewModalId] = useState<ID | null>(null);
  const [viewSubIndex, setViewSubIndex] = useState(0);

  const [confirmDeleteId, setConfirmDeleteId] = useState<ID | null>(null);

  // ✅ selected(선택) 상태 프레임 설정 모달
  const [isFrameSettingsOpen, setIsFrameSettingsOpen] = useState(false);

  // ✅ 현재 저장된 selectedExtra 읽기 (구 버전 {presets:[...]} 호환)
  const currentSelected = useMemo<FrameDraft>(() => {
    const raw = (data.settings as any)?.frameSettings?.characters?.selectedExtra;

    // 새 구조: { outer, inner }
    if (raw && (raw.outer || raw.inner)) {
      return {
        outer: (raw.outer as FramePresetId) ?? "none",
        inner: (raw.inner as FramePresetId) ?? "none",
      };
    }

    // 구 구조: { presets: ["electric"] }
    const presets: FramePresetId[] = raw?.presets ?? [];
    const first = presets[0] ?? "none";

    return {
      outer: isOuterPreset(first) ? first : "none",
      inner: !isOuterPreset(first) && first !== "none" ? first : "none",
    };
  }, [data.settings]);

  const [frameDraft, setFrameDraft] = useState<FrameDraft>(() => currentSelected);

  useEffect(() => {
    setFrameDraft(currentSelected);
  }, [currentSelected]);

  const setOuter = useCallback((id: FramePresetId) => {
    setFrameDraft(prev => ({ ...prev, outer: id }));
  }, []);

  const setInner = useCallback((id: FramePresetId) => {
    setFrameDraft(prev => ({ ...prev, inner: id }));
  }, []);

  const saveFrameSettings = useCallback(() => {
    setData(prev => {
      const prevSettings: any = prev.settings ?? {};
      const prevFrameSettings: any = prevSettings.frameSettings ?? {};
      const prevCharactersFS: any = prevFrameSettings.characters ?? {};

      const isNoneOuter = frameDraft.outer === "none";
      const isNoneInner = frameDraft.inner === "none";

      // ✅ 둘 다 none이면 selectedExtra 제거(=선택 프레임 없음)
      const nextSelectedExtra =
        isNoneOuter && isNoneInner
          ? undefined
          : { outer: frameDraft.outer, inner: frameDraft.inner };

      return {
        ...prev,
        settings: {
          ...prevSettings,
          frameSettings: {
            ...prevFrameSettings,
            characters: {
              ...prevCharactersFS,
              selectedExtra: nextSelectedExtra,
            },
          },
        },
      };
    });

    setIsFrameSettingsOpen(false);
  }, [frameDraft, setData]);

  // ✅ categories save handler
  const handleSaveCategories = useCallback(
    (nextGroups: CategoryGroup[]) => {
      setData({
        ...data,
        settings: {
          ...data.settings,
          characterCategories: toCategoryItems(nextGroups),
        },
      });
    },
    [data, setData]
  );

  // ✅ category edit modal state (IMPORTANT: categories/handleSaveCategories 선언 이후)
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [draftCategories, setDraftCategories] = useState<CategoryGroup[]>(
    () => categories
  );

  useEffect(() => {
    setDraftCategories(categories);
  }, [categories]);

  const saveCategories = useCallback(() => {
    handleSaveCategories(draftCategories);
    setIsEditingCategory(false);
  }, [draftCategories, handleSaveCategories]);

  // maps
  const mainToSubs = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const cg of categories) map.set(cg.main, cg.subs || []);
    return map;
  }, [categories]);

  const filtered = useMemo(() => {
    return charactersNormalized.filter(c => {
      const subs = c.subCategories || [];

      const mainOk =
        activeMain === ALL
          ? true
          : (mainToSubs.get(activeMain) || []).some(sub => subs.includes(sub));

      const subOk = activeSub === ALL ? true : subs.includes(activeSub);

      return mainOk && subOk;
    });
  }, [charactersNormalized, activeMain, activeSub, mainToSubs]);

  useEffect(() => {
    if (!filtered.length) {
      setSelectedId(null);
      return;
    }
    const stillExists = filtered.some(c => c.id === selectedId);
    if (!stillExists) setSelectedId(filtered[0]?.id || null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, selectedId]);

  const viewModalChar = useMemo(
    () => charactersNormalized.find(c => c.id === viewModalId) || null,
    [charactersNormalized, viewModalId]
  );

  // ✅ sub categories only -> tagOptions
  const subTagOptions = useMemo(() => {
    const set = new Set<string>();
    for (const cg of categories) {
      for (const s of cg.subs || []) {
        const v = (s || "").trim();
        if (v) set.add(v);
      }
    }
    return Array.from(set);
  }, [categories]);

  const updateCharacters = useCallback(
    (next: CharacterData[]) => {
      setData({
        ...data,
        characters: next.map(c => ({
          id: c.id,
          name: c.name,

          rankId: c.rankId || (defaultRankId as ID) || ("rank_default" as ID),

          subCategories: c.subCategories || [],

          profileImage: c.profileImage || "",
          mainImage: c.mainImage || "",

          subImages: c.subImages || [],
          tags: c.tags || [],
          symbolColors: c.symbolColors || [],

          summary: c.summary || "",
          description: c.description || "",

          meta: c.meta,
        })),
      });
    },
    [data, setData, defaultRankId]
  );

  const openDetail = useCallback((id: ID) => {
    setViewModalId(id);
    setViewSubIndex(0);
  }, []);

  const addNewCharacter = useCallback(() => {
    const payload: CharacterData = {
      id: makeId(),
      name: "새 캐릭터",

      rankId: (defaultRankId as ID) || ("rank_default" as ID),

      subCategories: [],
      profileImage: "",
      mainImage: "",
      subImages: [],
      tags: [],
      summary: "",
      description: "",
      symbolColors: [],
      meta: { order: 0 },
    };

    updateCharacters([...charactersNormalized, payload]);
    setSelectedId(payload.id);
    openDetail(payload.id);
  }, [charactersNormalized, updateCharacters, openDetail, defaultRankId]);

  const deleteCharacter = useCallback(
    (id: ID) => {
      const next = charactersNormalized.filter(c => c.id !== id);
      updateCharacters(next);

      setSelectedId((next[0]?.id as ID) || null);
      setViewModalId(cur => (cur === id ? null : cur));
      setViewSubIndex(0);
    },
    [charactersNormalized, updateCharacters]
  );

  const patchCharacter = useCallback(
    (id: ID, patch: Partial<CharacterData>) => {
      const next = charactersNormalized.map(c =>
        c.id === id ? ({ ...c, ...patch } as CharacterData) : c
      );
      updateCharacters(next);
    },
    [charactersNormalized, updateCharacters]
  );

  const stats = useMemo(() => {
    return {
      total: charactersNormalized.length,
      showing: filtered.length,
      categories: categories.length,
    };
  }, [charactersNormalized.length, filtered.length, categories.length]);

  return (
    <div
      className={cn(
        "min-h-screen md:h-screen",
        "gyeol-bg text-white relative",
        "md:overflow-hidden"
      )}
    >
      {/* background HUD vignette */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(255,255,255,0.07),transparent_45%),radial-gradient(circle_at_85%_30%,rgba(99,102,241,0.10),transparent_45%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.10),rgba(0,0,0,0.65))]" />

      <div className="relative z-10 px-6 md:px-10 lg:px-12 py-10 md:h-full flex flex-col">
        {/* TOP BAR */}
        <div className="flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            {editMode ? (
              <HUDBadge tone="warn">EDIT MODE</HUDBadge>
            ) : (
              <HUDBadge>VIEW MODE</HUDBadge>
            )}
            <HUDBadge>{`CHARACTERS ${stats.total}`}</HUDBadge>
            <HUDBadge>{`SHOWING ${stats.showing}`}</HUDBadge>
            <HUDBadge>{`CATS ${stats.categories}`}</HUDBadge>
          </div>

          <div className="flex items-center gap-2">
            {editMode && (
              <>
                <GButton
                  variant="ghost"
                  icon={<SlidersHorizontal className="w-4 h-4" />}
                  text="프레임 설정"
                  onClick={() => setIsFrameSettingsOpen(true)}
                />
                <GButton
                  variant="primary"
                  icon={<Plus className="w-4 h-4" />}
                  text="캐릭터 추가"
                  onClick={addNewCharacter}
                />
              </>
            )}
          </div>
        </div>

        {/* DOSSIER HEADER + CATEGORIES */}
        <HUDPanel className="p-4 md:p-6 mt-6 shrink-0">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-4">
              {/* LEFT */}
              <div>
                <div className="text-[11px] tracking-[0.26em] text-white/55">
                  CHARACTERS
                </div>
                <div className="mt-2 text-3xl font-extrabold tracking-tight">
                  캐릭터 소개
                </div>
                <div className="mt-2 text-sm text-white/60">
                  카테고리로 필터링하고, 도감처럼 빠르게 열람하세요.
                </div>
              </div>

              {/* RIGHT */}
              <div className="flex items-center gap-2">
                {editMode && (
                  <GButton
                    variant="ghost"
                    icon={<Pencil className="w-4 h-4" />}
                    text="카테고리 편집"
                    onClick={() => setIsEditingCategory(true)}
                  />
                )}
              </div>
            </div>

            {/* Filter bar */}
            <div className="mt-2">
              <EntityCategoryBar
                categories={categories}
                activeMain={activeMain}
                activeSub={activeSub}
                setActiveMain={setActiveMain}
                setActiveSub={setActiveSub}
              />
            </div>
          </div>
        </HUDPanel>

        {/* CONTENT: internal scroll */}
        <div className="mt-4 flex-1 min-h-0">
          <div className="h-full overflow-hidden">
            <div className="h-full overflow-auto scroll-dark">
              <div className="pb-4">
                <HUDPanel className="p-4 md:p-6">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-[11px] tracking-[0.26em] text-white/55">
                        GRID
                      </div>
                      <div className="mt-1 text-sm text-white/60">
                        선택 / 상세 열기
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <HUDBadge>{activeMain}</HUDBadge>
                      <HUDBadge>{activeSub}</HUDBadge>
                    </div>
                  </div>

                  <div className="mt-6">
                    {filtered.length === 0 ? (
                      <div className="rounded-2xl border border-white/10 bg-black/20 p-8 text-center">
                        <div className="text-sm text-white/55">
                          해당 카테고리에 캐릭터가 없습니다.
                        </div>
                        {editMode && (
                          <div className="mt-4 flex justify-center">
                            <GButton
                              variant="neutral"
                              icon={<Plus className="w-4 h-4" />}
                              text="새 캐릭터 추가"
                              onClick={addNewCharacter}
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-6">
                        {filtered.map(c => (
                          <EntityGridCard
                            key={c.id}
                            id={c.id}
                            name={c.name}
                            subCategories={c.subCategories}
                            image={c.profileImage}
                            symbolColors={c.symbolColors}
                            selected={c.id === selectedId}
                            editMode={editMode}
                            rankId={c.rankId as ID}
                            onSelect={id => setSelectedId(id as ID)}
                            onOpen={id => openDetail(id as ID)}
                            onEdit={id => openDetail(id as ID)}
                            onDelete={id => setConfirmDeleteId(id as ID)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </HUDPanel>

                {/* subtle scanlines */}
                <div className="pointer-events-none mt-4 opacity-[0.10] h-8 rounded-2xl bg-[linear-gradient(rgba(255,255,255,0.18)_1px,transparent_1px)] bg-[length:100%_3px]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Category edit modal */}
      {editMode && isEditingCategory && (
        <CategoryGroupEditModal
          open
          title="카테고리 편집"
          draft={draftCategories}
          setDraft={setDraftCategories}
          onClose={() => setIsEditingCategory(false)}
          onSave={saveCategories}
          mainLabel="메인 카테고리"
          subLabel="서브 카테고리"
        />
      )}

      {/* ✅ Frame settings modal */}
      {isFrameSettingsOpen && (
        <div className="fixed inset-0 z-[80]">
          {/* backdrop */}
          <div
            className="absolute inset-0 bg-black/65 backdrop-blur-sm"
            onClick={() => setIsFrameSettingsOpen(false)}
          />

          {/* modal */}
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <HUDPanel className="w-full max-w-5xl p-5 md:p-6 max-h-[82vh] flex flex-col">
              <div className="flex items-start justify-between gap-4 shrink-0">
                <div>
                  <div className="text-[11px] tracking-[0.26em] text-white/55">
                    CHARACTER FRAME SETTINGS
                  </div>
                  <div className="mt-2 text-2xl font-extrabold tracking-tight">
                    선택 프레임 효과
                  </div>
                  <div className="mt-2 text-sm text-white/60">
                    캐릭터를 선택했을 때(선택 프레임) 적용할 효과를 고르세요.
                    <br />
                    외곽 / 내부를 각각 1개씩 선택할 수 있습니다.
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <GButton
                    variant="ghost"
                    text="닫기"
                    onClick={() => setIsFrameSettingsOpen(false)}
                  />
                  <GButton variant="primary" text="저장" onClick={saveFrameSettings} />
                </div>
              </div>

              {/* ✅ OUTER / INNER split */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0 overflow-auto scroll-dark">
                {/* OUTER */}
                <HUDPanel className="p-4">
                  <div className="text-[11px] tracking-[0.26em] text-white/55">
                    OUTER
                  </div>
                  <div className="mt-1 text-sm text-white/70">
                    외곽 효과
                  </div>

                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {OUTER_OPTIONS.map(opt => {
                      const selected = frameDraft.outer === opt.id;

                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setOuter(opt.id)}
                          className={[
                            "rounded-2xl border p-3 text-left transition",
                            "bg-black/20 border-white/20 hover:border-white/30",
                            selected ? "ring-2 ring-white/20" : "",
                          ].join(" ")}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="text-sm font-semibold px-2">
                              {opt.label}
                            </div>

                            {/* 원형 체크 */}
                            <div
                              className={[
                                "w-5 h-5 rounded-full border flex items-center justify-center",
                                selected
                                  ? "border-white/70 bg-white/15"
                                  : "border-white/25 bg-transparent",
                              ].join(" ")}
                            >
                              {selected && (
                                <div className="w-2.5 h-2.5 rounded-full bg-white" />
                              )}
                            </div>
                          </div>

                          {/* preview */}
                          <div className="mt-3">
                            <div className="relative aspect-square overflow-visible rounded-xl border border-white/10 bg-black/25">
                              {opt.id !== "none" && (
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

                              {/* inner clip only for preview framing */}
                              <div className="relative h-full w-full overflow-hidden rounded-xl is-selected" />
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </HUDPanel>

                {/* INNER */}
                <HUDPanel className="p-4">
                  <div className="text-[11px] tracking-[0.26em] text-white/55">
                    INNER
                  </div>
                  <div className="mt-1 text-sm text-white/70">
                    내부 효과
                  </div>

                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {INNER_OPTIONS.map(opt => {
                      const selected = frameDraft.inner === opt.id;

                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setInner(opt.id)}
                          className={[
                            "rounded-2xl border p-3 text-left transition",
                            "bg-black/20 border-white/20 hover:border-white/30",
                            selected ? "ring-2 ring-white/20" : "",
                          ].join(" ")}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="text-sm font-semibold px-2">
                              {opt.label}
                            </div>

                            {/* 원형 체크 */}
                            <div
                              className={[
                                "w-5 h-5 rounded-full border flex items-center justify-center",
                                selected
                                  ? "border-white/70 bg-white/15"
                                  : "border-white/25 bg-transparent",
                              ].join(" ")}
                            >
                              {selected && (
                                <div className="w-2.5 h-2.5 rounded-full bg-white" />
                              )}
                            </div>
                          </div>

                          {/* preview */}
                          <div className="mt-3">
                            <div className="relative aspect-square overflow-visible rounded-xl border border-white/10 bg-black/25">
                              <div className="relative h-full w-full overflow-hidden rounded-xl is-selected">
                                {opt.id !== "none" && (
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

              {/* 하단 요약 */}
              <div className="mt-5 text-xs text-white/55 shrink-0">
                OUTER:{" "}
                <span className="text-white/80">{frameDraft.outer}</span> · INNER:{" "}
                <span className="text-white/80">{frameDraft.inner}</span>
              </div>
            </HUDPanel>
          </div>
        </div>
      )}

      {/* ✅ Detail */}
      {viewModalChar && (
        <EntityDetailFullscreen
          entity={viewModalChar}
          viewSubIndex={viewSubIndex}
          setViewSubIndex={setViewSubIndex}
          onClose={() => {
            setViewModalId(null);
            setViewSubIndex(0);
          }}
          editable={editMode}
          onDelete={() => setConfirmDeleteId(viewModalChar.id)}
          onPatch={p => patchCharacter(viewModalChar.id, p as any)}
          tagOptions={subTagOptions}
        />
      )}

      <ConfirmModal
        open={!!confirmDeleteId}
        title="캐릭터 삭제"
        description="정말 캐릭터를 삭제하시겠습니까? 삭제 후 되돌릴 수 없습니다."
        confirmText="삭제"
        cancelText="취소"
        danger
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={() => {
          if (!confirmDeleteId) return;
          deleteCharacter(confirmDeleteId);
          setConfirmDeleteId(null);
        }}
      />
    </div>
  );
}