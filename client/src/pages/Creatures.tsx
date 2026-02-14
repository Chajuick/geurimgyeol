// Creatures.tsx
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePortfolioContext } from "@/contexts/PortfolioContext";
import { Plus, X, Pencil } from "lucide-react";
import GButton from "@/components/ui/gyeol-button";
import { useResolvedImage } from "@/hooks/useResolvedImage";
import ProfileCard from "@/components/ui/profile-card";
import EntityEditModal from "@/components/entities/entity-edit-modal";
import CategoryGroupEditModal, { CategoryGroup } from "@/components/entities/category-group-edit-modal";
import CreatureEditForm, {
  CreatureDraft,
} from "@/components/CreatureEditForm";
import EntityGridCard from "@/components/entities/entity-grid-card";
import EntityDetailFullscreen from "@/components/DetailViewFullscreen";

type SubImage = { image: string; description: string };

type ColorHex = `#${string}`;

type SymbolColor = {
  id: string; // 로컬 편집용(삭제/정렬 안정)
  name: string; // "심해의 푸른색"
  hex: ColorHex; // "#0A3D91"
};

type Creature = {
  id: string;
  name: string;

  // ✅ 크리쳐는 서브카테고리(태그)만 여러개 보유
  subCategories: string[];

  profileImage: string;
  mainImage: string;
  mainImageDesc?: string;
  subImages: SubImage[];
  tags: string[];
  description: string;
  symbolColors?: SymbolColor[];
};

const ALL = "전체";

const emptyCreatureDraft: CreatureDraft = {
  id: "",
  name: "새 크리쳐",
  subCategories: [],
  profileImage: "",
  mainImage: "",
  mainImageDesc: "",
  subImages: [],
  tags: [],
  description: "",
  symbolColors: [],
};

/** -------------------------------------------
 * Creatures Page
 * ------------------------------------------- */
export default function Creatures() {
  const { data, setData, editMode } = usePortfolioContext();

  // ✅ Categories (memoize to avoid recreating arrays)
  const categories: CategoryGroup[] = useMemo(
    () => data.settings?.creatureCategories || [],
    [data.settings?.creatureCategories]
  );

  // ✅ 기존 데이터 호환 + normalize (memoize)
  const creaturesNormalized: Creature[] = useMemo(() => {
    return (data.creatures || []).map((c: any) => ({
      ...c,
      subCategories: Array.isArray(c.subCategories)
        ? c.subCategories
        : c.subCategory
          ? [c.subCategory]
          : [],
      profileImage: c.profileImage || "",
      mainImage: c.mainImage || "",
      mainImageDesc: c.mainImageDesc || "",
      subImages: Array.isArray(c.subImages) ? c.subImages : [],
      tags: Array.isArray(c.tags) ? c.tags : [],
      description: c.description || "",
      symbolColors: Array.isArray(c.symbolColors) ? c.symbolColors : [],
    }));
  }, [data.creatures]);

  const [selectedId, setSelectedId] = useState<string | null>(
    creaturesNormalized[0]?.id || null
  );

  // ✅ 필터
  const [activeMain, setActiveMain] = useState<string>(ALL);
  const [activeSub, setActiveSub] = useState<string>(ALL);

  // ✅ 카테고리 편집
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [draftCategories, setDraftCategories] =
    useState<CategoryGroup[]>(categories);

  // ✅ 크리쳐 추가/수정 모달
  const [editingTarget, setEditingTarget] = useState<"new" | string | null>(
    null
  );

  // ✅ 감상 모드 상세 모달
  const [viewModalId, setViewModalId] = useState<string | null>(null);
  const [viewSubIndex, setViewSubIndex] = useState(0);

  // ✅ stable handlers for memo children
  const handleSelect = useCallback((id: string) => setSelectedId(id), []);
  const handleOpen = useCallback((id: string) => setViewModalId(id), []);
  const openNewModal = useCallback(() => setEditingTarget("new"), []);
  const openEditModal = useCallback((id: string) => setEditingTarget(id), []);

  useEffect(() => {
    setDraftCategories(categories);

    // 메인 카테고리 유효성 체크 (전체는 항상 유효)
    if (activeMain !== ALL && !categories.find((c) => c.main === activeMain)) {
      setActiveMain(ALL);
      setActiveSub(ALL);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories]);

  // ✅ 전체 sub 목록(태그 선택용)
  const allSubs = useMemo(() => {
    const all = categories.flatMap((c) => c.subs || []);
    return Array.from(new Set(all));
  }, [categories]);

  // ✅ main -> subs map
  const mainToSubs = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const cg of categories) map.set(cg.main, cg.subs || []);
    return map;
  }, [categories]);

  // ✅ 서브 필터 버튼 목록
  const subsOfActiveMain = useMemo(() => {
    if (activeMain === ALL) return [ALL, ...allSubs];
    return [ALL, ...(mainToSubs.get(activeMain) || [])];
  }, [activeMain, mainToSubs, allSubs]);

  // ✅ 필터링
  const filtered = useMemo(() => {
    return creaturesNormalized.filter((c) => {
      const creatureSubs = c.subCategories || [];

      const mainOk =
        activeMain === ALL
          ? true
          : (mainToSubs.get(activeMain) || []).some((sub) =>
            creatureSubs.includes(sub)
          );

      const subOk = activeSub === ALL ? true : creatureSubs.includes(activeSub);

      return mainOk && subOk;
    });
  }, [creaturesNormalized, activeMain, activeSub, mainToSubs]);

  // ✅ 선택 크리쳐가 필터/삭제로 사라졌으면 보정
  useEffect(() => {
    if (!filtered.length) {
      setSelectedId(null);
      return;
    }
    const stillExists = filtered.some((c) => c.id === selectedId);
    if (!stillExists) setSelectedId(filtered[0]?.id || null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, selectedId]);

  const selected = useMemo(
    () => creaturesNormalized.find((c) => c.id === selectedId) || null,
    [creaturesNormalized, selectedId]
  );

  const viewModalChar = useMemo(
    () => creaturesNormalized.find((c) => c.id === viewModalId) || null,
    [creaturesNormalized, viewModalId]
  );

  // ✅ IMPORTANT: updateCreatures는 호출될 때만 (렌더에서 생성 최소화)
  const updateCreatures = useCallback(
    (next: Creature[]) => {
      setData({
        ...data,
        creatures: next.map((c) => ({
          id: c.id,
          name: c.name,
          subCategories: c.subCategories || [],
          profileImage: c.profileImage || "",
          mainImage: c.mainImage || "",
          mainImageDesc: c.mainImageDesc || "",
          subImages: c.subImages || [],
          tags: c.tags || [],
          description: c.description || "",
          symbolColors: c.symbolColors || [],
        })),
      });
    },
    [data, setData]
  );

  const upsertCreature = useCallback(
    (payload: Creature) => {
      const exists = creaturesNormalized.some((c) => c.id === payload.id);
      const next = exists
        ? creaturesNormalized.map((c) => (c.id === payload.id ? payload : c))
        : [...creaturesNormalized, payload];

      updateCreatures(next);
      setSelectedId(payload.id);
    },
    [creaturesNormalized, updateCreatures]
  );

  const deleteCreature = useCallback(
    (id: string) => {
      const next = creaturesNormalized.filter((c) => c.id !== id);
      updateCreatures(next);
      setSelectedId(next[0]?.id || null);
    },
    [creaturesNormalized, updateCreatures]
  );

  // ----------------------------
  // Category Editor
  // ----------------------------
  const saveCategories = useCallback(() => {
    setData({
      ...data,
      settings: {
        ...data.settings,
        creatureCategories: draftCategories,
      },
    });
    setIsEditingCategory(false);
  }, [data, draftCategories, setData]);

  // ----------------------------
  // quick toggle for selected (edit panel)
  // ----------------------------
  const toggleSelectedSub = useCallback(
    (sub: string) => {
      if (!selected) return;

      const next = creaturesNormalized.map((c) => {
        if (c.id !== selected.id) return c;
        const has = (c.subCategories || []).includes(sub);
        const subCategories = has
          ? (c.subCategories || []).filter((x) => x !== sub)
          : [...(c.subCategories || []), sub];
        return { ...c, subCategories };
      });

      updateCreatures(next);
    },
    [selected, creaturesNormalized, updateCreatures]
  );

  // ----------------------------
  // ✅ TEXTAREA PERF: local draft + debounce commit
  // ----------------------------
  const [descDraft, setDescDraft] = useState<string>("");

  // 선택 바뀔 때만 로컬 draft 동기화
  useEffect(() => {
    setDescDraft(selected?.description ?? "");
  }, [selectedId]); // 의도: 선택 변경 시에만

  // 디바운스 커밋 (타이핑 렉 방지)
  const lastCommittedRef = useRef<string>("");
  useEffect(() => {
    if (!selected) return;

    // 값이 동일하면 skip
    if (descDraft === (selected.description ?? "")) return;

    const t = window.setTimeout(() => {
      // 마지막 커밋과 동일하면 skip
      if (lastCommittedRef.current === descDraft) return;
      lastCommittedRef.current = descDraft;

      const next = creaturesNormalized.map((x) =>
        x.id === selected.id ? { ...x, description: descDraft } : x
      );
      updateCreatures(next);
    }, 300);

    return () => window.clearTimeout(t);
  }, [descDraft, selectedId, selected, creaturesNormalized, updateCreatures]);

  // editingTarget이 바뀔 때만 draft 초기화되게 key를 그대로 유지
  const original =
    editingTarget === "new"
      ? null
      : creaturesNormalized.find((c) => c.id === editingTarget) || null;

  const [draft, setDraft] = useState<CreatureDraft>(emptyCreatureDraft);

  useEffect(() => {
    if (!editingTarget) return;

    if (original) {
      setDraft(original as any);
      return;
    }

    // new
    setDraft({
      id: Date.now().toString(),
      name: "새 크리쳐",
      subCategories: [],
      profileImage: "",
      mainImage: "",
      mainImageDesc: "",
      subImages: [],
      tags: [],
      description: "",
      symbolColors: [],
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingTarget]);

  return (
    <div
      className={[
        "min-h-screen gyeol-bg text-white",
        !editMode && viewModalChar ? "max-h-[100vh] overflow-hidden" : "",
      ].join(" ")}
    >
      {/* ✅ FIXED HEADER + FILTER BAR */}
      <div className="fixed top-0 inset-x-0 z-20 gyeol-bg backdrop-blur border-b border-white/5 ml-0 md:ml-20 opacity-95">
        <div className="px-12 pt-12 pb-8">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="text-lg text-white/60 mb-2">CHARACTERS</p>
              <h1 className="text-4xl text-white font-extrabold tracking-tight">
                크리쳐 소개
              </h1>
            </div>

            {editMode && (
              <div className="flex items-center gap-2">
                <GButton
                  variant="ghost"
                  icon={<Pencil className="w-4 h-4" />}
                  text="카테고리 편집"
                  onClick={() => setIsEditingCategory((v) => !v)}
                />
                <GButton
                  variant="primary"
                  icon={<Plus className="w-4 h-4" />}
                  text="크리쳐 추가"
                  onClick={openNewModal}
                />
              </div>
            )}
          </div>

          {/* ✅ 필터 바 (항상 한 줄 가로 스크롤) */}
          {!isEditingCategory && (
            <div className="mt-8 space-y-4">
              {/* 메인 */}
              <div className="overflow-x-auto whitespace-nowrap no-scrollbar scroll-dark pb-2">
                <div className="flex flex-nowrap gap-3 min-w-max">
                  <button
                    onClick={() => {
                      setActiveMain(ALL);
                      setActiveSub(ALL);
                    }}
                    className={[
                      "px-5 h-10 rounded-full text-sm font-medium transition-all duration-200 flex-shrink-0",
                      activeMain === ALL
                        ? "bg-white/10 text-white border border-white/20 shadow-md"
                        : "bg-zinc-900 text-zinc-300 border border-zinc-600 hover:bg-zinc-800 hover:text-white",
                    ].join(" ")}
                  >
                    전체
                  </button>

                  {categories.map((c) => {
                    const active = c.main === activeMain;
                    return (
                      <button
                        key={c.main}
                        onClick={() => {
                          setActiveMain(c.main);
                          setActiveSub(ALL);
                        }}
                        className={[
                          "px-5 h-10 rounded-full text-sm font-medium transition-all duration-200 flex-shrink-0",
                          active
                            ? "bg-white/10 text-white border border-white/20 shadow-md"
                            : "bg-zinc-900 text-zinc-300 border border-zinc-600 hover:bg-zinc-800 hover:text-white",
                        ].join(" ")}
                      >
                        {c.main}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 서브 */}
              <div className="overflow-x-auto whitespace-nowrap no-scrollbar scroll-dark pb-2">
                <div className="flex flex-nowrap gap-2 min-w-max">
                  {subsOfActiveMain.map((s) => {
                    const active = s === activeSub;
                    return (
                      <button
                        key={s}
                        onClick={() => setActiveSub(s)}
                        className={[
                          "px-4 h-8 rounded-full text-xs transition-all duration-200 flex-shrink-0",
                          active
                            ? "bg-zinc-700 text-white"
                            : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:bg-zinc-800 hover:text-white",
                        ].join(" ")}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ✅ 카테고리 편집 모달 */}
      {editMode && isEditingCategory && (
        <CategoryGroupEditModal
          open
          title="크리쳐 카테고리 편집"
          draft={draftCategories}
          setDraft={setDraftCategories}
          onClose={() => setIsEditingCategory(false)}
          onSave={saveCategories}
          mainLabel="메인"
          subLabel="서브"
        />
      )}

      {/* ✅ GRID */}
      <div className="px-14 py-10 min-h-screen pt-[340px]">
        {filtered.length === 0 ? (
          <div className="py-32 text-center text-zinc-500 text-sm tracking-wide">
            해당 카테고리에 크리쳐가 없습니다.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-6">
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
                onSelect={handleSelect}
                onOpen={handleOpen}
              />
            ))}
          </div>
        )}

        {/* ✅ 선택 크리쳐 편집 패널 */}
        {editMode && selected && (
          <div className="mt-14 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 rounded-3xl border border-zinc-800 bg-zinc-900/70 backdrop-blur p-8 space-y-8 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider">
                    선택됨
                  </p>
                  <p className="text-2xl font-semibold text-white tracking-tight mt-1">
                    {selected.name}
                  </p>
                </div>

                <GButton
                  variant="dark"
                  text="상세 편집"
                  onClick={() => openEditModal(selected.id)}
                />
              </div>

              <div>
                <p className="text-xs text-zinc-500 mb-2">
                  서브 카테고리(복수)
                </p>

                <div className="flex flex-wrap gap-2">
                  {allSubs.map((s) => {
                    const active = (selected.subCategories || []).includes(s);
                    return (
                      <button
                        type="button"
                        key={s}
                        onClick={() => toggleSelectedSub(s)}
                        className={[
                          "px-3 h-8 rounded-full text-xs border transition",
                          active
                            ? "bg-white text-black border-white"
                            : "bg-zinc-950 text-zinc-300 border-zinc-800 hover:bg-zinc-900",
                        ].join(" ")}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {(selected.subCategories || []).map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-2 px-3 h-8 rounded-full bg-white/10 text-white text-xs border border-white/10"
                    >
                      {t}
                      <button
                        type="button"
                        onClick={() => toggleSelectedSub(t)}
                        className="opacity-70 hover:opacity-100"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {(selected.subCategories || []).length === 0 && (
                    <p className="text-xs text-zinc-500">
                      서브 카테고리를 선택해주세요.
                    </p>
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs text-zinc-500 mb-2">설명</p>
                <textarea
                  value={descDraft}
                  onChange={(e) => setDescDraft(e.target.value)}
                  className="w-full min-h-28 p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-white resize-none
                    focus:outline-none focus:ring-2 focus:ring-white/20 transition"
                  placeholder="크리쳐 설명"
                />
                <p className="mt-2 text-[11px] text-white/35">
                  입력 내용은 자동 저장됩니다(약 0.3초 디바운스).
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 backdrop-blur p-8 space-y-4">
              <p className="text-lg font-semibold text-white">빠른 작업</p>

              <GButton
                variant="ghost"
                text="이미지 / 서브 상세 편집"
                onClick={() => openEditModal(selected.id)}
                className="w-full"
              />

              <GButton
                variant="danger"
                text="크리쳐 삭제"
                onClick={() => deleteCreature(selected.id)}
                disabled={creaturesNormalized.length <= 1}
                className="w-full"
              />
            </div>
          </div>
        )}
      </div>

      {/* ✅ 감상 모드 상세 모달(더블클릭) */}
      {!editMode && viewModalChar && (
        <EntityDetailFullscreen
          entity={viewModalChar}
          viewSubIndex={viewSubIndex}
          setViewSubIndex={setViewSubIndex}
          onClose={() => {
            setViewModalId(null);
            setViewSubIndex(0);
          }}
        />
      )}

      {/* ✅ 추가/수정 모달 (editMode) */}
      {editMode && editingTarget && draft && (
        <EntityEditModal
          open
          title={editingTarget === "new" ? "크리쳐 추가" : "크리쳐 수정"}
          draft={draft}
          setDraft={setDraft}
          onClose={() => setEditingTarget(null)}
          onSave={(nextDraft) => {
            upsertCreature(nextDraft as any);
            setEditingTarget(null);
          }}
          onDelete={
            editingTarget !== "new"
              ? () => {
                deleteCreature(draft.id);
                setEditingTarget(null);
              }
              : undefined
          }
          renderBody={({ draft, setDraft }) => (
            <CreatureEditForm draft={draft as any} setDraft={setDraft as any} allSubs={allSubs} />
          )}
        />
      )}
    </div>
  );
}