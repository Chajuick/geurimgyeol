// Character.tsx
import { usePortfolioContext } from "@/contexts/PortfolioContext";
import { Plus, Trash2, X, ChevronLeft, ChevronRight, Pencil } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import ImageUpload from "@/components/ImageUpload";

type SubImage = { image: string; description: string };
type Character = {
  id: string;
  name: string;
  mainCategory: string;
  subCategory: string;
  profileImage: string;
  mainImage: string;
  mainImageDesc?: string;
  subImages: SubImage[];
  tags: string[];
  description: string;
};

type CategoryGroup = { main: string; subs: string[] };

export default function Characters() {
  const { data, setData, editMode } = usePortfolioContext();

  const characters: Character[] = data.characters || [];
  const categories: CategoryGroup[] = data.settings.characterCategories || [];

  const [selectedId, setSelectedId] = useState<string | null>(characters[0]?.id || null);

  // ✅ 필터(상단 카테고리)
  const [activeMain, setActiveMain] = useState(categories[0]?.main || "전체");
  const [activeSub, setActiveSub] = useState<string>(categories[0]?.subs?.[0] || "전체");

  // ✅ 카테고리 편집 모드
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [draftCategories, setDraftCategories] = useState<CategoryGroup[]>(categories);

  // ✅ 캐릭터 추가/수정 모달
  const [editingTarget, setEditingTarget] = useState<"new" | string | null>(null);

  // ✅ 감상 모드 상세 모달(네 기존 유지용)
  const [viewModalId, setViewModalId] = useState<string | null>(null);
  const [viewSubIndex, setViewSubIndex] = useState(0);

  useEffect(() => {
    // data.settings 변경 시 드래프트 동기화
    setDraftCategories(categories);
    if (!categories.find((c) => c.main === activeMain)) {
      setActiveMain(categories[0]?.main || "전체");
      setActiveSub(categories[0]?.subs?.[0] || "전체");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.settings.characterCategories]);

  const selected = characters.find((c) => c.id === selectedId) || null;
  const viewModalChar = characters.find((c) => c.id === viewModalId) || null;

  const subsOfActiveMain = useMemo(() => {
    const found = categories.find((c) => c.main === activeMain);
    return found?.subs || [];
  }, [categories, activeMain]);

  const filtered = useMemo(() => {
    // "전체" 옵션은 원하면 넣을 수 있는데, 지금은 카테고리 기반으로만 필터
    return characters.filter((c) => {
      const mainOk = activeMain ? c.mainCategory === activeMain : true;
      const subOk = activeSub ? c.subCategory === activeSub : true;
      return mainOk && subOk;
    });
  }, [characters, activeMain, activeSub]);

  const updateCharacters = (next: Character[]) => setData({ ...data, characters: next });

  const openNewModal = () => setEditingTarget("new");
  const openEditModal = (id: string) => setEditingTarget(id);

  const upsertCharacter = (payload: Character) => {
    const exists = characters.some((c) => c.id === payload.id);
    const next = exists
      ? characters.map((c) => (c.id === payload.id ? payload : c))
      : [...characters, payload];

    updateCharacters(next);
    setSelectedId(payload.id);
  };

  const deleteCharacter = (id: string) => {
    const next = characters.filter((c) => c.id !== id);
    updateCharacters(next);
    setSelectedId(next[0]?.id || null);
  };

  // ----------------------------
  // Category Editor
  // ----------------------------
  const saveCategories = () => {
    setData({
      ...data,
      settings: {
        ...data.settings,
        characterCategories: draftCategories,
      },
    });
    setIsEditingCategory(false);
  };

  // ----------------------------
  // RENDER
  // ----------------------------
  return (
    <div className="min-h-screen bg-background md:ml-64">
      {/* ✅ HERO / HEADER (이미지 느낌) */}
      <div className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-background" />
        <div className="container relative py-14">
          <div className="flex items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight">CHARACTER</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                캐릭터를 카테고리로 분류하고, 프로필 썸네일로 빠르게 선택하세요.
              </p>
            </div>

            {editMode && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditingCategory((v) => !v)}
                  className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-border bg-secondary/50 hover:bg-secondary transition"
                >
                  <Pencil className="w-4 h-4" />
                  카테고리 편집
                </button>

                <button
                  onClick={openNewModal}
                  className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                >
                  <Plus className="w-4 h-4" />
                  캐릭터 추가
                </button>
              </div>
            )}
          </div>

          {/* ✅ 필터 바 (메인/서브 카테고리) */}
          {!isEditingCategory ? (
            <div className="mt-10 space-y-4">
              {/* 메인 */}
              <div className="flex flex-wrap items-center gap-2">
                {categories.map((c) => {
                  const active = c.main === activeMain;
                  return (
                    <button
                      key={c.main}
                      onClick={() => {
                        setActiveMain(c.main);
                        setActiveSub(c.subs?.[0] || "");
                      }}
                      className={[
                        "h-9 px-4 rounded-full border transition",
                        active
                          ? "bg-foreground text-background border-foreground"
                          : "bg-background/40 border-border hover:bg-secondary/60",
                      ].join(" ")}
                    >
                      {c.main}
                    </button>
                  );
                })}
              </div>

              {/* 서브 */}
              <div className="flex flex-wrap items-center gap-2">
                {subsOfActiveMain.map((s) => {
                  const active = s === activeSub;
                  return (
                    <button
                      key={s}
                      onClick={() => setActiveSub(s)}
                      className={[
                        "h-8 px-3 rounded-full border text-sm transition",
                        active
                          ? "bg-secondary border-foreground/40"
                          : "bg-background/40 border-border hover:bg-secondary/50",
                      ].join(" ")}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            // ✅ 카테고리 편집 UI (간단 버전)
            <div className="mt-10 rounded-2xl border border-border bg-secondary/30 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold">카테고리 편집</p>
                <div className="flex gap-2">
                  <button
                    onClick={saveCategories}
                    className="h-9 px-4 rounded-lg bg-foreground text-background hover:opacity-90 transition"
                  >
                    저장
                  </button>
                  <button
                    onClick={() => {
                      setDraftCategories(categories);
                      setIsEditingCategory(false);
                    }}
                    className="h-9 px-4 rounded-lg border border-border hover:bg-secondary transition"
                  >
                    취소
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {draftCategories.map((cg, idx) => (
                  <div key={idx} className="rounded-xl border border-border bg-background/40 p-4">
                    <div className="flex items-center gap-3">
                      <input
                        value={cg.main}
                        onChange={(e) => {
                          const next = [...draftCategories];
                          next[idx] = { ...next[idx], main: e.target.value };
                          setDraftCategories(next);
                        }}
                        className="h-9 px-3 rounded-lg border border-border bg-background w-48"
                        placeholder="메인 카테고리"
                      />
                      <button
                        onClick={() => {
                          const next = draftCategories.filter((_, i) => i !== idx);
                          setDraftCategories(next);
                        }}
                        className="h-9 px-3 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
                      >
                        삭제
                      </button>
                    </div>

                    <div className="mt-3 space-y-2">
                      {cg.subs.map((s, sidx) => (
                        <div key={sidx} className="flex items-center gap-2">
                          <input
                            value={s}
                            onChange={(e) => {
                              const next = [...draftCategories];
                              const subs = [...next[idx].subs];
                              subs[sidx] = e.target.value;
                              next[idx] = { ...next[idx], subs };
                              setDraftCategories(next);
                            }}
                            className="h-9 px-3 rounded-lg border border-border bg-background w-64"
                            placeholder="서브 카테고리"
                          />
                          <button
                            onClick={() => {
                              const next = [...draftCategories];
                              next[idx] = { ...next[idx], subs: next[idx].subs.filter((_, i) => i !== sidx) };
                              setDraftCategories(next);
                            }}
                            className="h-9 px-3 rounded-lg border border-border hover:bg-secondary transition"
                          >
                            제거
                          </button>
                        </div>
                      ))}

                      <button
                        onClick={() => {
                          const next = [...draftCategories];
                          next[idx] = { ...next[idx], subs: [...next[idx].subs, "새 서브"] };
                          setDraftCategories(next);
                        }}
                        className="h-9 px-3 rounded-lg border border-border hover:bg-secondary transition"
                      >
                        + 서브 추가
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => setDraftCategories([...draftCategories, { main: "새 메인", subs: ["새 서브"] }])}
                  className="h-10 px-4 rounded-lg border border-border hover:bg-secondary transition"
                >
                  + 메인 카테고리 추가
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ✅ GRID (프로필 썸네일 나열 / 선택 효과) */}
      <div className="container py-10">
        {filtered.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">해당 카테고리에 캐릭터가 없습니다.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {filtered.map((c) => {
              const isSelected = c.id === selectedId;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  onDoubleClick={() => !editMode && setViewModalId(c.id)}
                  className={[
                    "group relative aspect-square overflow-hidden rounded-xl border transition",
                    isSelected ? "border-foreground" : "border-border hover:border-muted-foreground",
                  ].join(" ")}
                  title={editMode ? "클릭: 선택 / (편집은 우측 패널)" : "더블클릭: 상세 보기"}
                >
                  {/* 이미지 */}
                  <div className="absolute inset-0 bg-secondary">
                    {c.profileImage ? (
                      <img
                        src={c.profileImage}
                        alt={c.name}
                        className={[
                          "h-full w-full object-cover transition duration-300",
                          isSelected ? "scale-[1.06] grayscale-0 opacity-100 brightness-100" : "scale-100 grayscale opacity-70 brightness-75",
                        ].join(" ")}
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">
                        이미지 없음
                      </div>
                    )}
                  </div>

                  {/* 하단 라벨 */}
                  <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
                    <div className="text-white text-sm font-semibold">{c.name}</div>
                    <div className="text-white/70 text-[11px]">
                      {c.mainCategory} / {c.subCategory}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* ✅ 선택 캐릭터 편집 패널 (editMode에서만) */}
        {editMode && selected && (
          <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 rounded-2xl border border-border bg-secondary/30 p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">선택됨</p>
                  <p className="text-2xl font-bold">{selected.name}</p>
                </div>
                <button
                  onClick={() => openEditModal(selected.id)}
                  className="h-10 px-4 rounded-lg bg-foreground text-background hover:opacity-90 transition"
                >
                  상세 편집(모달)
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-2">메인 카테고리</p>
                  <select
                    value={selected.mainCategory}
                    onChange={(e) => {
                      const next = characters.map((x) =>
                        x.id === selected.id ? { ...x, mainCategory: e.target.value, subCategory: (categories.find((c) => c.main === e.target.value)?.subs?.[0] || "") } : x
                      );
                      updateCharacters(next);
                      setActiveMain(e.target.value);
                      setActiveSub(categories.find((c) => c.main === e.target.value)?.subs?.[0] || "");
                    }}
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background"
                  >
                    {categories.map((c) => (
                      <option key={c.main} value={c.main}>
                        {c.main}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-2">서브 카테고리</p>
                  <select
                    value={selected.subCategory}
                    onChange={(e) => {
                      const next = characters.map((x) => (x.id === selected.id ? { ...x, subCategory: e.target.value } : x));
                      updateCharacters(next);
                      setActiveSub(e.target.value);
                    }}
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background"
                  >
                    {(categories.find((c) => c.main === selected.mainCategory)?.subs || []).map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-2">설명</p>
                <textarea
                  value={selected.description}
                  onChange={(e) => {
                    const next = characters.map((x) => (x.id === selected.id ? { ...x, description: e.target.value } : x));
                    updateCharacters(next);
                  }}
                  className="w-full min-h-24 p-3 rounded-lg border border-border bg-background resize-none"
                  placeholder="캐릭터 설명"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-secondary/30 p-6 space-y-4">
              <p className="font-semibold">빠른 작업</p>
              <button
                onClick={() => openEditModal(selected.id)}
                className="w-full h-10 rounded-lg border border-border hover:bg-secondary transition"
              >
                이미지/서브 상세 편집
              </button>
              <button
                onClick={() => deleteCharacter(selected.id)}
                disabled={characters.length <= 1}
                className="w-full h-10 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition"
              >
                <span className="inline-flex items-center gap-2 justify-center">
                  <Trash2 className="w-4 h-4" />
                  캐릭터 삭제
                </span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ✅ 감상 모드 상세 모달(더블클릭) */}
      {!editMode && viewModalChar && (
        <div className="fixed inset-0 z-50 bg-black/80 p-4 flex items-center justify-center">
          <div className="w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-2xl border border-border bg-background">
            <div className="sticky top-0 bg-background border-b border-border p-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">
                  {viewModalChar.mainCategory} / {viewModalChar.subCategory}
                </p>
                <h2 className="text-2xl font-bold">{viewModalChar.name}</h2>
              </div>
              <button
                onClick={() => {
                  setViewModalId(null);
                  setViewSubIndex(0);
                }}
                className="h-9 w-9 rounded-lg hover:bg-secondary transition flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Main */}
              <div className="space-y-2">
                <p className="text-sm font-semibold">메인 이미지</p>
                <div className="aspect-video rounded-xl border border-border overflow-hidden bg-secondary">
                  {viewModalChar.mainImage ? (
                    <img src={viewModalChar.mainImage} className="w-full h-full object-cover" alt="main" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">이미지 없음</div>
                  )}
                </div>
                {viewModalChar.mainImageDesc && (
                  <p className="text-sm text-muted-foreground">{viewModalChar.mainImageDesc}</p>
                )}
              </div>

              {/* Desc */}
              {viewModalChar.description && (
                <div>
                  <p className="text-sm font-semibold mb-2">설명</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{viewModalChar.description}</p>
                </div>
              )}

              {/* Subs */}
              {viewModalChar.subImages?.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">서브 이미지</p>
                    <p className="text-xs text-muted-foreground">
                      {viewSubIndex + 1} / {viewModalChar.subImages.length}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      className="h-10 w-10 rounded-lg hover:bg-secondary transition flex items-center justify-center"
                      onClick={() => setViewSubIndex((p) => (p - 1 + viewModalChar.subImages.length) % viewModalChar.subImages.length)}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    <div className="flex-1 aspect-video rounded-xl border border-border overflow-hidden bg-secondary">
                      {viewModalChar.subImages[viewSubIndex]?.image ? (
                        <img src={viewModalChar.subImages[viewSubIndex].image} className="w-full h-full object-cover" alt="sub" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">이미지 없음</div>
                      )}
                    </div>

                    <button
                      className="h-10 w-10 rounded-lg hover:bg-secondary transition flex items-center justify-center"
                      onClick={() => setViewSubIndex((p) => (p + 1) % viewModalChar.subImages.length)}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>

                  {viewModalChar.subImages[viewSubIndex]?.description && (
                    <p className="text-sm text-muted-foreground">{viewModalChar.subImages[viewSubIndex].description}</p>
                  )}

                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {viewModalChar.subImages.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => setViewSubIndex(idx)}
                        className={[
                          "w-14 h-14 rounded-xl overflow-hidden border-2 flex-shrink-0 transition",
                          idx === viewSubIndex ? "border-foreground" : "border-border hover:border-muted-foreground",
                        ].join(" ")}
                      >
                        {s.image ? <img src={s.image} className="w-full h-full object-cover" alt={`thumb-${idx}`} /> : <div className="w-full h-full bg-secondary" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ✅ 추가/수정 모달 (editMode) */}
      {editMode && editingTarget && (
        <CharacterEditModal
          key={editingTarget} // target 바뀔 때 초기화
          target={editingTarget}
          categories={categories}
          characters={characters}
          onClose={() => setEditingTarget(null)}
          onSave={(c) => {
            upsertCharacter(c);
            setEditingTarget(null);
          }}
          onDelete={(id) => {
            deleteCharacter(id);
            setEditingTarget(null);
          }}
        />
      )}
    </div>
  );
}

// ----------------------------
// Modal Component
// ----------------------------
function CharacterEditModal(props: {
  target: "new" | string;
  categories: { main: string; subs: string[] }[];
  characters: Character[];
  onClose: () => void;
  onSave: (c: Character) => void;
  onDelete: (id: string) => void;
}) {
  const { target, categories, characters, onClose, onSave, onDelete } = props;

  const original = target === "new" ? null : characters.find((c) => c.id === target) || null;
  const fallbackMain = categories[0]?.main || "미분류";
  const fallbackSub = categories[0]?.subs?.[0] || "미분류";

  const [draft, setDraft] = useState<Character>(() => {
    if (original) return original;
    return {
      id: Date.now().toString(),
      name: "새 캐릭터",
      mainCategory: fallbackMain,
      subCategory: fallbackSub,
      profileImage: "",
      mainImage: "",
      mainImageDesc: "",
      subImages: [],
      tags: [],
      description: "",
    };
  });

  const subs = categories.find((c) => c.main === draft.mainCategory)?.subs || [];

  const addSubImage = () => setDraft((d) => ({ ...d, subImages: [...d.subImages, { image: "", description: "" }] }));
  const updateSubImage = (idx: number, patch: Partial<SubImage>) =>
    setDraft((d) => {
      const next = [...d.subImages];
      next[idx] = { ...next[idx], ...patch };
      return { ...d, subImages: next };
    });

  const removeSubImage = (idx: number) =>
    setDraft((d) => ({ ...d, subImages: d.subImages.filter((_, i) => i !== idx) }));

  return (
    <div className="fixed inset-0 z-50 bg-black/60 p-4 flex items-center justify-center">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-background">
        <div className="sticky top-0 bg-background border-b border-border p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">{target === "new" ? "캐릭터 추가" : "캐릭터 수정"}</p>
            <h3 className="text-2xl font-bold">{draft.name}</h3>
          </div>
          <button onClick={onClose} className="h-9 w-9 rounded-lg hover:bg-secondary transition flex items-center justify-center">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* 기본 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-semibold mb-2">이름</p>
              <input
                value={draft.name}
                onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                className="w-full h-10 px-3 rounded-lg border border-border bg-background"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-sm font-semibold mb-2">메인</p>
                <select
                  value={draft.mainCategory}
                  onChange={(e) => {
                    const main = e.target.value;
                    const firstSub = categories.find((c) => c.main === main)?.subs?.[0] || "";
                    setDraft((d) => ({ ...d, mainCategory: main, subCategory: firstSub }));
                  }}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background"
                >
                  {categories.map((c) => (
                    <option key={c.main} value={c.main}>
                      {c.main}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <p className="text-sm font-semibold mb-2">서브</p>
                <select
                  value={draft.subCategory}
                  onChange={(e) => setDraft((d) => ({ ...d, subCategory: e.target.value }))}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background"
                >
                  {subs.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold mb-2">캐릭터 설명</p>
            <textarea
              value={draft.description}
              onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
              className="w-full min-h-24 p-3 rounded-lg border border-border bg-background resize-none"
              placeholder="세계관/성격/능력 등"
            />
          </div>

          {/* 프로필 */}
          <div className="rounded-2xl border border-border bg-secondary/30 p-5 space-y-3">
            <p className="font-semibold">프로필 이미지</p>
            <ImageUpload value={draft.profileImage} onChange={(v) => setDraft((d) => ({ ...d, profileImage: v }))} />
          </div>

          {/* 메인 */}
          <div className="rounded-2xl border border-border bg-secondary/30 p-5 space-y-3">
            <p className="font-semibold">메인 이미지</p>
            <ImageUpload value={draft.mainImage} onChange={(v) => setDraft((d) => ({ ...d, mainImage: v }))} />
            <textarea
              value={draft.mainImageDesc || ""}
              onChange={(e) => setDraft((d) => ({ ...d, mainImageDesc: e.target.value }))}
              className="w-full min-h-20 p-3 rounded-lg border border-border bg-background resize-none"
              placeholder="메인 이미지 설명"
            />
          </div>

          {/* 서브 */}
          <div className="rounded-2xl border border-border bg-secondary/30 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <p className="font-semibold">서브 이미지</p>
              <button
                onClick={addSubImage}
                className="h-9 px-4 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                추가
              </button>
            </div>

            {draft.subImages.length === 0 ? (
              <p className="text-sm text-muted-foreground">서브 이미지를 추가해주세요.</p>
            ) : (
              <div className="space-y-6">
                {draft.subImages.map((s, idx) => (
                  <div key={idx} className="rounded-xl border border-border bg-background/40 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">서브 #{idx + 1}</p>
                      <button
                        onClick={() => removeSubImage(idx)}
                        className="h-9 px-3 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
                      >
                        삭제
                      </button>
                    </div>

                    <ImageUpload value={s.image} onChange={(v) => updateSubImage(idx, { image: v })} />
                    <textarea
                      value={s.description}
                      onChange={(e) => updateSubImage(idx, { description: e.target.value })}
                      className="w-full min-h-20 p-3 rounded-lg border border-border bg-background resize-none"
                      placeholder="서브 이미지 설명"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pb-4">
            <button
              onClick={() => onSave(draft)}
              className="flex-1 h-11 rounded-lg bg-foreground text-background hover:opacity-90 transition"
            >
              저장
            </button>

            {target !== "new" && (
              <button
                onClick={() => onDelete(draft.id)}
                className="h-11 px-4 rounded-lg bg-red-600 text-white hover:bg-red-700 transition inline-flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                삭제
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}