import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  CreatureData,
  ID,
  CategoryItem,
  FramePresetId,
} from "@/types";

import { cn } from "@/lib/utils";
import { OUTER_PRESETS } from "@/lib/framePresets";

import {
  normalizeSymbolColors,
  normalizeSubImages,
  sanitizeSymbolColors,
  sanitizeSubImages,
  symbolColorsEqual,
  subImagesEqual,
} from "@/lib/entityNormalize";
import EntityFrameSettingsModal from "@/components/entities/frame-setting-modal";

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
  return items.map((x) => ({ main: x.main, subs: x.subs || [] }));
}
/** UI(CategoryGroup[]) -> SettingsData(CategoryItem[]) 어댑터 */
function toCategoryItems(groups: CategoryGroup[] = []): CategoryItem[] {
  return groups.map((g) => ({ main: g.main, subs: g.subs || [] }));
}

/** ✅ 프레임 draft: OUTER 1개 + INNER 1개 */
type FrameDraft = {
  outer: FramePresetId; // "none" 포함
  inner: FramePresetId; // "none" 포함
};

function arraysShallowEqual(a: any[] = [], b: any[] = []) {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

function creatureEqual(a: CreatureData, b: CreatureData) {
  return (
    a.name === b.name &&
    a.rankId === b.rankId &&
    arraysShallowEqual(a.subCategories || [], b.subCategories || []) &&
    a.profileImage === b.profileImage &&
    a.mainImage === b.mainImage &&
    subImagesEqual(a.subImages || [], b.subImages || []) &&
    arraysShallowEqual(a.tags || [], b.tags || []) &&
    symbolColorsEqual(a.symbolColors || [], b.symbolColors || []) &&
    a.summary === b.summary &&
    a.description === b.description &&
    a.meta === b.meta
  );
}

export default function Creatures() {
  const { data, setData, editMode } = usePortfolioContext();

  /** ✅ settings 기반 ranks */
  const rankSet = data.settings?.rankSets?.creatures;

  const defaultRankIdResolved: ID = useMemo(() => {
    const tiers = rankSet?.tiers || [];
    return (
      (rankSet?.defaultTierId as ID) ||
      (tiers[0]?.id as ID) ||
      ("rank_default" as ID)
    );
  }, [rankSet]);

  /** ✅ 카드에 내려줄 frameSettings(최소 구독 단위) */
  const frameSettingsCreatures = useMemo(() => {
    return (data.settings as any)?.frameSettings?.creatures;
  }, [data.settings]);

  /** ✅ categories */
  const categories: CategoryGroup[] = useMemo(() => {
    return toCategoryGroups(data.settings?.creatureCategories || []);
  }, [data.settings?.creatureCategories]);

  /** normalize cache */
  const normalizedCacheRef = useRef<Map<ID, CreatureData>>(new Map());

  const creaturesNormalized: CreatureData[] = useMemo(() => {
    const list: any[] = (data.creatures as any[]) || [];
    const nextCache = new Map<ID, CreatureData>();
    const prevCache = normalizedCacheRef.current;

    const normalized = list.map((raw: any) => {
      const id = String(raw?.id ?? makeId()) as ID;

      const rankId: ID =
        (raw?.rankId as ID) || defaultRankIdResolved || ("rank_default" as ID);

      const nextObj: CreatureData = {
        id,
        name: String(raw?.name ?? "Unnamed"),
        rankId,
        subCategories: Array.isArray(raw?.subCategories)
          ? raw.subCategories
          : raw?.subCategory
            ? [raw.subCategory]
            : [],
        profileImage: String(raw?.profileImage ?? ""),
        mainImage: String(raw?.mainImage ?? ""),

        subImages: normalizeSubImages(raw?.subImages) as any,
        tags: Array.isArray(raw?.tags) ? raw.tags : [],
        symbolColors: normalizeSymbolColors(raw?.symbolColors) as any,

        summary: String(raw?.summary ?? ""),
        description: String(raw?.description ?? ""),
        meta: raw?.meta ?? undefined,
      };

      const prevObj = prevCache.get(id);
      const reused = prevObj && creatureEqual(prevObj, nextObj) ? prevObj : nextObj;

      nextCache.set(id, reused);
      return reused;
    });

    normalizedCacheRef.current = nextCache;
    return normalized;
  }, [data.creatures, defaultRankIdResolved]);

  const [selectedId, setSelectedId] = useState<ID | null>(
    (creaturesNormalized[0]?.id as ID) || null
  );

  const [activeMain, setActiveMain] = useState<string>(ALL);
  const [activeSub, setActiveSub] = useState<string>(ALL);

  const [viewModalId, setViewModalId] = useState<ID | null>(null);
  const [viewSubIndex, setViewSubIndex] = useState(0);

  const [confirmDeleteId, setConfirmDeleteId] = useState<ID | null>(null);

  // frame settings modal
  const [isFrameSettingsOpen, setIsFrameSettingsOpen] = useState(false);

  // selectedExtra (compat)
  const currentSelected = useMemo<FrameDraft>(() => {
    const raw = (data.settings as any)?.frameSettings?.creatures?.selectedExtra;

    if (raw && (raw.outer || raw.inner)) {
      return {
        outer: (raw.outer as FramePresetId) ?? "none",
        inner: (raw.inner as FramePresetId) ?? "none",
      };
    }

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
    setFrameDraft((prev) => ({ ...prev, outer: id }));
  }, []);

  const setInner = useCallback((id: FramePresetId) => {
    setFrameDraft((prev) => ({ ...prev, inner: id }));
  }, []);

  const saveFrameSettings = useCallback(() => {
    setData((prev) => {
      const prevSettings: any = prev.settings ?? {};
      const prevFrameSettings: any = prevSettings.frameSettings ?? {};
      const prevCreaturesFS: any = prevFrameSettings.creatures ?? {};

      const isNoneOuter = frameDraft.outer === "none";
      const isNoneInner = frameDraft.inner === "none";

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
            creatures: {
              ...prevCreaturesFS,
              selectedExtra: nextSelectedExtra,
            },
          },
        },
      };
    });

    setIsFrameSettingsOpen(false);
  }, [frameDraft, setData]);

  // categories save handler
  const handleSaveCategories = useCallback(
    (nextGroups: CategoryGroup[]) => {
      setData((prev) => ({
        ...prev,
        settings: {
          ...(prev.settings ?? {}),
          creatureCategories: toCategoryItems(nextGroups),
        },
      }));
    },
    [setData]
  );

  // category modal state
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [draftCategories, setDraftCategories] = useState<CategoryGroup[]>(() => categories);

  useEffect(() => {
    if (isEditingCategory) setDraftCategories(categories);
  }, [isEditingCategory, categories]);

  const saveCategories = useCallback(() => {
    handleSaveCategories(draftCategories);
    setIsEditingCategory(false);
  }, [draftCategories, handleSaveCategories]);

  // maps (main -> subs set)
  const mainToSubsSet = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const cg of categories) map.set(cg.main, new Set(cg.subs || []));
    return map;
  }, [categories]);

  // 크리쳐별 subCategories Set 캐시
  const charSubSet = useMemo(() => {
    const m = new Map<ID, Set<string>>();
    for (const c of creaturesNormalized) m.set(c.id, new Set(c.subCategories || []));
    return m;
  }, [creaturesNormalized]);

  const filtered = useMemo(() => {
    const activeMainSubsArr =
      activeMain === ALL ? null : Array.from(mainToSubsSet.get(activeMain) || []);

    return creaturesNormalized.filter((c) => {
      const subs = charSubSet.get(c.id) || new Set<string>();

      const mainOk =
        activeMain === ALL
          ? true
          : activeMainSubsArr
            ? activeMainSubsArr.some((s) => subs.has(s))
            : true;

      const subOk = activeSub === ALL ? true : subs.has(activeSub);

      return mainOk && subOk;
    });
  }, [creaturesNormalized, activeMain, activeSub, mainToSubsSet, charSubSet]);

  useEffect(() => {
    if (!filtered.length) {
      setSelectedId(null);
      return;
    }
    const stillExists = filtered.some((c) => c.id === selectedId);
    if (!stillExists) setSelectedId(filtered[0]?.id || null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, selectedId]);

  const viewModalChar = useMemo(
    () => creaturesNormalized.find((c) => c.id === viewModalId) || null,
    [creaturesNormalized, viewModalId]
  );

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

  /** ✅ 저장 시에도 신 스키마로 고정(sanitize) */
  const updateCreatures = useCallback(
    (next: CreatureData[]) => {
      setData((prev) => ({
        ...prev,
        creatures: next.map((c) => ({
          ...c,
          rankId: (c.rankId || defaultRankIdResolved || ("rank_default" as ID)) as ID,
          subCategories: c.subCategories || [],

          subImages: sanitizeSubImages(c.subImages) as any,
          symbolColors: sanitizeSymbolColors(c.symbolColors) as any,

          tags: c.tags || [],
          profileImage: c.profileImage || "",
          mainImage: c.mainImage || "",
          summary: c.summary || "",
          description: c.description || "",
        })),
      }));
    },
    [setData, defaultRankIdResolved]
  );

  const openDetail = useCallback((id: ID) => {
    setViewModalId(id);
    setViewSubIndex(0);
  }, []);

  const addNewCreature = useCallback(() => {
    const payload: CreatureData = {
      id: makeId(),
      name: "새 크리쳐",
      rankId: defaultRankIdResolved,
      subCategories: [],
      profileImage: "",
      mainImage: "",
      subImages: [] as any,
      tags: [],
      summary: "",
      description: "",
      symbolColors: [] as any,
      meta: { order: 0 },
    };

    updateCreatures([...creaturesNormalized, payload]);
    setSelectedId(payload.id);
    openDetail(payload.id);
  }, [creaturesNormalized, updateCreatures, openDetail, defaultRankIdResolved]);

  const deleteCreature = useCallback(
    (id: ID) => {
      const next = creaturesNormalized.filter((c) => c.id !== id);
      updateCreatures(next);

      setSelectedId((next[0]?.id as ID) || null);
      setViewModalId((cur) => (cur === id ? null : cur));
      setViewSubIndex(0);
    },
    [creaturesNormalized, updateCreatures]
  );

  const patchCreature = useCallback(
    (id: ID, patch: Partial<CreatureData>) => {
      const next = creaturesNormalized.map((c) =>
        c.id === id ? ({ ...c, ...patch } as CreatureData) : c
      );
      updateCreatures(next);
    },
    [creaturesNormalized, updateCreatures]
  );

  const stats = useMemo(() => {
    return {
      total: creaturesNormalized.length,
      showing: filtered.length,
      categories: categories.length,
    };
  }, [creaturesNormalized.length, filtered.length, categories.length]);

  const handleSelectCard = useCallback((id: ID) => setSelectedId(id), []);
  const handleOpenCard = useCallback((id: ID) => openDetail(id), [openDetail]);
  const handleEditCard = useCallback((id: ID) => openDetail(id), [openDetail]);
  const handleAskDelete = useCallback((id: ID) => setConfirmDeleteId(id), []);

  return (
    <div
      className={cn(
        "min-h-[100svh] md:h-[100svh] w-full max-w-full overflow-x-hidden",
        "gyeol-bg text-white relative",
        "md:overflow-hidden"
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(255,255,255,0.07),transparent_45%),radial-gradient(circle_at_85%_30%,rgba(99,102,241,0.10),transparent_45%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.10),rgba(0,0,0,0.65))]" />

      <div
        className={cn(
          "relative z-10",
          "px-4 sm:px-6 md:px-10 lg:px-12 py-6 md:py-10",
          "md:h-full flex flex-col min-w-0"
        )}
      >
        {/* TOP BAR (✅ 모바일: 줄바꿈/스크롤 자연스럽게) */}
        <div className="shrink-0">
          <div className="flex flex-row items-center md:justify-between gap-3">
            {/* badges */}
            <div
              className={cn(
                "flex items-center gap-2",
                "flex-wrap",
                "max-w-full"
              )}
            >
              {editMode ? <HUDBadge tone="warn">EDIT</HUDBadge> : <HUDBadge>VIEW</HUDBadge>}
            </div>

            {/* actions */}
            {editMode && (
              <div className="flex items-center justify-end gap-2 flex-wrap">
                <GButton
                  variant="ghost"
                  icon={<SlidersHorizontal className="w-4 h-4" />}
                  text="프레임 설정"
                  onClick={() => setIsFrameSettingsOpen(true)}
                />
                <GButton
                  variant="primary"
                  icon={<Plus className="w-4 h-4" />}
                  text="크리쳐 추가"
                  onClick={addNewCreature}
                />
              </div>
            )}
          </div>
        </div>

        {/* HEADER + CATEGORIES */}
        <HUDPanel className="p-6 mt-4 sm:mt-6 shrink-0 w-full max-w-full min-w-0 overflow-x-hidden">
          <div className="flex flex-col gap-3 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 min-w-0">
              <div className="min-w-0">
                <div className="text-[11px] tracking-[0.26em] text-white/55">CREATURES</div>
                <div className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight">크리쳐 소개</div>
                <div className="mt-2 text-sm text-white/60">
                  세계관의 크리쳐들을 살펴보세요.
                </div>
              </div>

              {editMode && (
                <div className="flex items-center gap-2 shrink-0">
                  <GButton
                    variant="ghost"
                    icon={<Pencil className="w-4 h-4" />}
                    text="카테고리 편집"
                    onClick={() => setIsEditingCategory(true)}
                  />
                </div>
              )}
            </div>

            <div className="mt-1 w-full max-w-full min-w-0">
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

        {/* CONTENT (✅ 여기만 세로 스크롤) */}
        <div className="mt-4 flex-1 min-h-0">
          <div className="h-full min-h-0 overflow-y-auto overscroll-contain scroll-dark pr-1">
            <div className="pb-6">
              <HUDPanel className="p-6">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <div className="text-[11px] tracking-[0.26em] text-white/55">GRID</div>
                    <div className="mt-1 text-sm text-white/60">선택 / 상세 열기</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <HUDBadge>{activeMain}</HUDBadge>
                    <HUDBadge>{activeSub}</HUDBadge>
                  </div>
                </div>

                <div className="mt-5 sm:mt-6">
                  {filtered.length === 0 ? (
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-6 sm:p-8 text-center">
                      <div className="text-sm text-white/55">해당 카테고리에 크리쳐가 없습니다.</div>
                      {editMode && (
                        <div className="mt-4 flex justify-center">
                          <GButton
                            variant="neutral"
                            icon={<Plus className="w-4 h-4" />}
                            text="새 크리쳐 추가"
                            onClick={addNewCreature}
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div
                      className={cn(
                        // ✅ 모바일 2열 스타트 (카드가 너무 커보이면 2열 추천)
                        "grid gap-4 sm:gap-5 md:gap-6",
                        "grid-cols-2",
                        "sm:grid-cols-3",
                        "md:grid-cols-4",
                        "lg:grid-cols-5",
                        "xl:grid-cols-7"
                      )}
                    >
                      {filtered.map((c) => (
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
                          defaultRankId={defaultRankIdResolved}
                          frameSettings={frameSettingsCreatures}
                          onSelect={handleSelectCard}
                          onOpen={handleOpenCard}
                          onEdit={handleEditCard}
                          onDelete={handleAskDelete}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </HUDPanel>

              <div className="pointer-events-none mt-4 opacity-[0.10] h-8 rounded-2xl bg-[linear-gradient(rgba(255,255,255,0.18)_1px,transparent_1px)] bg-[length:100%_3px]" />
            </div>
          </div>
        </div>
      </div>

      {/* Category edit modal */}
      {editMode && isEditingCategory && (
        <CategoryGroupEditModal
          open
          title="카테고리 편집"
          draft={draftCategories}
          setDraft={setDraftCategories}
          onClose={() => {
            setDraftCategories(categories); // ✅ 원복
            setIsEditingCategory(false);
          }}
          onSave={saveCategories}
          mainLabel="메인 카테고리"
          subLabel="서브 카테고리"
        />
      )}

      {/* Frame settings modal (✅ 모바일 반응형 강화) */}
      <EntityFrameSettingsModal
        open={isFrameSettingsOpen}
        value={frameDraft}
        onChange={setFrameDraft}
        onClose={() => setIsFrameSettingsOpen(false)}
        onSave={saveFrameSettings}
      />

      {/* Detail */}
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
          onPatch={(p) => patchCreature(viewModalChar.id, p as any)}
          tagOptions={subTagOptions}
        />
      )}

      <ConfirmModal
        open={!!confirmDeleteId}
        title="크리쳐 삭제"
        description="정말 크리쳐를 삭제하시겠습니까? 삭제 후 되돌릴 수 없습니다."
        confirmText="삭제"
        cancelText="취소"
        danger
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={() => {
          if (!confirmDeleteId) return;
          deleteCreature(confirmDeleteId);
          setConfirmDeleteId(null);
        }}
      />
    </div>
  );
}