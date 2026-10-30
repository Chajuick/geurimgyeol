import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Plus, Pencil, SlidersHorizontal } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { usePortfolioContext } from "@/contexts/PortfolioContext";

import GButton from "@/components/ui/gyeol-button";
import StoredImage from "@/components/StoredImage";
import { cn } from "@/lib/utils";
import EntityGridCard from "@/components/entities/entity-grid-card";
import EntityDetailFullscreen from "@/components/entities/detail/EntityDetailFullscreen";
import EntityCategoryBar from "@/components/entities/entity-category-bar";
import ConfirmModal from "@/components/ui/confirm-modal";
import CategoryGroupEditModal, {
  CategoryGroup,
} from "@/components/entities/category-group-edit-modal";

import type { EntityBase, ID, CategoryItem, FramePresetId } from "@/types";

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

export type EntityCollectionKind = "characters" | "creatures";

type KindConfig = {
  label: string;
  eyebrow: string;
  description: string;
  categoriesKey: "characterCategories" | "creatureCategories";
};

const KIND_CONFIG: Record<EntityCollectionKind, KindConfig> = {
  characters: {
    label: "캐릭터",
    eyebrow: "Characters",
    description: "기록된 인물 정보와 특성을 열람할 수 있습니다.",
    categoriesKey: "characterCategories",
  },
  creatures: {
    label: "크리쳐",
    eyebrow: "Creatures",
    description: "세계 각지에서 확인된 생명체 기록입니다.",
    categoriesKey: "creatureCategories",
  },
};

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

function arraysShallowEqual(a: any[] = [], b: any[] = []) {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

function entityEqual(a: EntityBase, b: EntityBase) {
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

/** 캐릭터/크리쳐 공용 목록 페이지 */
export default function EntityCollectionPage({
  kind,
}: {
  kind: EntityCollectionKind;
}) {
  const cfg = KIND_CONFIG[kind];
  const { data, setData, editMode } = usePortfolioContext();

  /** ✅ settings 기반 ranks */
  const rankSet = data.settings?.rankSets?.[kind];

  const defaultRankIdResolved: ID = useMemo(() => {
    const tiers = rankSet?.tiers || [];
    return (
      (rankSet?.defaultTierId as ID) ||
      (tiers[0]?.id as ID) ||
      ("rank_default" as ID)
    );
  }, [rankSet]);

  /** ✅ 카드에 내려줄 frameSettings(최소 구독 단위) */
  const frameSettingsForKind = useMemo(() => {
    return (data.settings as any)?.frameSettings?.[kind];
  }, [data.settings, kind]);

  /** ✅ categories */
  const categories: CategoryGroup[] = useMemo(() => {
    return toCategoryGroups(data.settings?.[cfg.categoriesKey] || []);
  }, [data.settings, cfg.categoriesKey]);

  // 현재 kind의 목록만 구독 (다른 데이터 변경 시 재정규화 방지)
  const kindList = data[kind];

  /** normalize cache */
  const normalizedCacheRef = useRef<Map<ID, EntityBase>>(new Map());

  const entitiesNormalized: EntityBase[] = useMemo(() => {
    const list: any[] = (kindList as any[]) || [];
    const nextCache = new Map<ID, EntityBase>();
    const prevCache = normalizedCacheRef.current;

    const normalized = list.map((raw: any) => {
      const id = String(raw?.id ?? makeId()) as ID;

      const rankId: ID =
        (raw?.rankId as ID) || defaultRankIdResolved || ("rank_default" as ID);

      const nextObj: EntityBase = {
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
      const reused =
        prevObj && entityEqual(prevObj, nextObj) ? prevObj : nextObj;

      nextCache.set(id, reused);
      return reused;
    });

    normalizedCacheRef.current = nextCache;
    return normalized;
  }, [kindList, defaultRankIdResolved]);

  const [selectedId, setSelectedId] = useState<ID | null>(
    (entitiesNormalized[0]?.id as ID) || null
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
    const raw = (data.settings as any)?.frameSettings?.[kind]?.selectedExtra;

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
  }, [data.settings, kind]);

  const [frameDraft, setFrameDraft] = useState<FrameDraft>(
    () => currentSelected
  );

  useEffect(() => {
    setFrameDraft(currentSelected);
  }, [currentSelected]);

  const saveFrameSettings = useCallback(() => {
    setData(prev => {
      const prevSettings: any = prev.settings ?? {};
      const prevFrameSettings: any = prevSettings.frameSettings ?? {};
      const prevKindFS: any = prevFrameSettings[kind] ?? {};

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
            [kind]: {
              ...prevKindFS,
              selectedExtra: nextSelectedExtra,
            },
          },
        },
      };
    });

    setIsFrameSettingsOpen(false);
  }, [frameDraft, setData, kind]);

  // categories save handler
  const handleSaveCategories = useCallback(
    (nextGroups: CategoryGroup[]) => {
      setData(prev => ({
        ...prev,
        settings: {
          ...(prev.settings ?? {}),
          [cfg.categoriesKey]: toCategoryItems(nextGroups),
        },
      }));
    },
    [setData, cfg.categoriesKey]
  );

  // category modal state
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [draftCategories, setDraftCategories] = useState<CategoryGroup[]>(
    () => categories
  );

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

  // 엔티티별 subCategories Set 캐시
  const entitySubSet = useMemo(() => {
    const m = new Map<ID, Set<string>>();
    for (const c of entitiesNormalized)
      m.set(c.id, new Set(c.subCategories || []));
    return m;
  }, [entitiesNormalized]);

  const filtered = useMemo(() => {
    const activeMainSubsArr =
      activeMain === ALL
        ? null
        : Array.from(mainToSubsSet.get(activeMain) || []);

    return entitiesNormalized.filter(c => {
      const subs = entitySubSet.get(c.id) || new Set<string>();

      const mainOk =
        activeMain === ALL
          ? true
          : activeMainSubsArr
            ? activeMainSubsArr.some(s => subs.has(s))
            : true;

      const subOk = activeSub === ALL ? true : subs.has(activeSub);

      return mainOk && subOk;
    });
  }, [entitiesNormalized, activeMain, activeSub, mainToSubsSet, entitySubSet]);

  useEffect(() => {
    if (!filtered.length) {
      setSelectedId(null);
      return;
    }
    const stillExists = filtered.some(c => c.id === selectedId);
    if (!stillExists) setSelectedId(filtered[0]?.id || null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, selectedId]);

  const viewModalEntity = useMemo(
    () => entitiesNormalized.find(c => c.id === viewModalId) || null,
    [entitiesNormalized, viewModalId]
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
  const updateEntities = useCallback(
    (next: EntityBase[]) => {
      setData(prev => ({
        ...prev,
        [kind]: next.map(c => ({
          ...c,
          rankId: (c.rankId ||
            defaultRankIdResolved ||
            ("rank_default" as ID)) as ID,
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
    [setData, defaultRankIdResolved, kind]
  );

  const openDetail = useCallback((id: ID) => {
    setViewModalId(id);
    setViewSubIndex(0);
  }, []);

  const addNewEntity = useCallback(() => {
    const payload: EntityBase = {
      id: makeId(),
      name: `새 ${cfg.label}`,
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

    updateEntities([...entitiesNormalized, payload]);
    setSelectedId(payload.id);
    openDetail(payload.id);
  }, [
    entitiesNormalized,
    updateEntities,
    openDetail,
    defaultRankIdResolved,
    cfg.label,
  ]);

  const deleteEntity = useCallback(
    (id: ID) => {
      const next = entitiesNormalized.filter(c => c.id !== id);
      updateEntities(next);

      setSelectedId((next[0]?.id as ID) || null);
      setViewModalId(cur => (cur === id ? null : cur));
      setViewSubIndex(0);
    },
    [entitiesNormalized, updateEntities]
  );

  const patchEntity = useCallback(
    (id: ID, patch: Partial<EntityBase>) => {
      const next = entitiesNormalized.map(c =>
        c.id === id ? ({ ...c, ...patch } as EntityBase) : c
      );
      updateEntities(next);
    },
    [entitiesNormalized, updateEntities]
  );

  const stats = useMemo(() => {
    return {
      total: entitiesNormalized.length,
      showing: filtered.length,
      categories: categories.length,
    };
  }, [entitiesNormalized.length, filtered.length, categories.length]);

  const handleSelectCard = useCallback((id: ID) => setSelectedId(id), []);
  const handleOpenCard = useCallback((id: ID) => openDetail(id), [openDetail]);
  const handleEditCard = useCallback((id: ID) => openDetail(id), [openDetail]);
  const handleAskDelete = useCallback((id: ID) => setConfirmDeleteId(id), []);

  const isFiltered = activeMain !== ALL || activeSub !== ALL;

  // 필터 바 고정 여부 (고정됐을 때만 배경을 깔아 상단 분위기를 가리지 않음)
  const stickySentinelRef = useRef<HTMLDivElement | null>(null);
  const [filtersStuck, setFiltersStuck] = useState(false);
  useEffect(() => {
    const el = stickySentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) =>
      setFiltersStuck(!entry.isIntersecting)
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // 호버(선택) 중인 엔티티의 그림·상징색으로 상단 분위기 연출
  const ambientEntity =
    entitiesNormalized.find(c => c.id === selectedId) ?? null;
  const ambientHex =
    (ambientEntity?.symbolColors || []).find(c => c?.hex)?.hex ?? "#818cf8";

  return (
    <div className="relative min-h-[100svh] w-full max-w-full overflow-x-clip gyeol-bg text-white">
      {/* #region Ambient */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[640px] overflow-hidden [mask-image:linear-gradient(to_bottom,black_30%,transparent)]"
      >
        <AnimatePresence initial={false}>
          <motion.div
            key={ambientEntity?.id ?? "none"}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.4, ease: "easeOut" }}
          >
            {ambientEntity?.mainImage || ambientEntity?.profileImage ? (
              <StoredImage
                src={ambientEntity.mainImage || ambientEntity.profileImage}
                alt=""
                className="absolute right-[-5%] top-[-20%] h-[140%] w-[70%] object-cover opacity-[0.14] blur-3xl saturate-125"
              />
            ) : null}
            <div
              className="absolute inset-0"
              style={{
                background: `radial-gradient(55% 80% at 85% 0%, color-mix(in oklab, ${ambientHex} 18%, transparent), transparent 70%)`,
              }}
            />
          </motion.div>
        </AnimatePresence>
      </div>
      {/* #endregion */}

      {/* #region Header */}
      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 md:px-10 lg:px-12 pt-6 md:pt-10">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <div className="gyeol-eyebrow">{cfg.eyebrow}</div>
            <h1 className="mt-2 text-3xl sm:text-4xl">{cfg.label}</h1>
            <p className="mt-2 text-sm text-white/50">
              {cfg.description}
              <span className="ml-2 text-white/35 tabular-nums">
                {isFiltered
                  ? `${stats.showing} / ${stats.total}`
                  : `총 ${stats.total}`}
              </span>
            </p>
          </div>

          {editMode && (
            <div className="flex flex-wrap items-center gap-2">
              <GButton
                variant="ghost"
                size="sm"
                icon={<SlidersHorizontal className="w-4 h-4" />}
                text="프레임 설정"
                onClick={() => setIsFrameSettingsOpen(true)}
              />
              <GButton
                variant="ghost"
                size="sm"
                icon={<Pencil className="w-4 h-4" />}
                text="카테고리 편집"
                onClick={() => setIsEditingCategory(true)}
              />
              <GButton
                variant="primary"
                icon={<Plus className="w-4 h-4" />}
                text={`${cfg.label} 추가`}
                onClick={addNewEntity}
              />
            </div>
          )}
        </header>
      </div>
      {/* #endregion */}

      {/* #region Sticky Filters */}
      {/* 이 지점이 화면 밖으로 나가면 필터 바가 상단에 붙은 상태 */}
      <div ref={stickySentinelRef} aria-hidden className="h-px mt-6" />
      <div
        className={cn(
          "sticky top-0 z-30 border-b transition-[background-color,border-color,backdrop-filter] duration-300",
          filtersStuck
            ? "bg-background/80 backdrop-blur-xl border-white/[0.06]"
            : "bg-transparent border-transparent"
        )}
      >
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 md:px-10 lg:px-12 py-3">
          <EntityCategoryBar
            categories={categories}
            activeMain={activeMain}
            activeSub={activeSub}
            setActiveMain={setActiveMain}
            setActiveSub={setActiveSub}
          />
        </div>
      </div>
      {/* #endregion */}

      {/* #region Grid */}
      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 md:px-10 lg:px-12 py-6 sm:py-8">
        {filtered.length === 0 ? (
          <div className="grid place-items-center rounded-3xl border border-dashed border-white/10 py-20 text-center">
            <div className="text-sm text-white/50">
              {isFiltered
                ? `이 분류에 해당하는 ${cfg.label}가 없어요`
                : `아직 기록된 ${cfg.label}가 없어요`}
            </div>
            {editMode && (
              <div className="mt-4">
                <GButton
                  variant="neutral"
                  icon={<Plus className="w-4 h-4" />}
                  text={`새 ${cfg.label} 추가`}
                  onClick={addNewEntity}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
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
                defaultRankId={defaultRankIdResolved}
                frameSettings={frameSettingsForKind}
                onSelect={handleSelectCard}
                onOpen={handleOpenCard}
                onEdit={handleEditCard}
                onDelete={handleAskDelete}
              />
            ))}
          </div>
        )}
      </div>
      {/* #endregion */}

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

      {/* Frame settings modal */}
      <EntityFrameSettingsModal
        open={isFrameSettingsOpen}
        value={frameDraft}
        onChange={setFrameDraft}
        onClose={() => setIsFrameSettingsOpen(false)}
        onSave={saveFrameSettings}
      />

      {/* Detail */}
      {viewModalEntity && (
        <EntityDetailFullscreen
          entity={viewModalEntity}
          viewSubIndex={viewSubIndex}
          setViewSubIndex={setViewSubIndex}
          onClose={() => {
            setViewModalId(null);
            setViewSubIndex(0);
          }}
          editable={editMode}
          onDelete={() => setConfirmDeleteId(viewModalEntity.id)}
          onPatch={p => patchEntity(viewModalEntity.id, p as any)}
          tagOptions={subTagOptions}
        />
      )}

      <ConfirmModal
        open={!!confirmDeleteId}
        title={`${cfg.label} 삭제`}
        description={`정말 ${cfg.label}를 삭제하시겠습니까? 삭제 후 되돌릴 수 없습니다.`}
        confirmText="삭제"
        cancelText="취소"
        danger
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={() => {
          if (!confirmDeleteId) return;
          deleteEntity(confirmDeleteId);
          setConfirmDeleteId(null);
        }}
      />
    </div>
  );
}
