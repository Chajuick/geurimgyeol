// Characters.tsx
import { usePortfolioContext } from "@/contexts/PortfolioContext";
import {
  Plus,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  Pencil,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import ImageUpload from "@/components/ImageUpload";
import Modal from "@/components/ui/modal";
import GButton from "@/components/ui/gyeol-button";
import { useResolvedImage } from "@/hooks/useResolvedImage";

type SubImage = { image: string; description: string };

type Character = {
  id: string;
  name: string;

  // ✅ 캐릭터는 서브카테고리(태그)만 여러개 보유
  subCategories: string[];

  profileImage: string;
  mainImage: string;
  mainImageDesc?: string;
  subImages: SubImage[];
  tags: string[];
  description: string;
};

type CategoryGroup = { main: string; subs: string[] };

const ALL = "전체";

export default function Characters() {
  const { data, setData, editMode } = usePortfolioContext();

  // ✅ Categories
  const categories: CategoryGroup[] = data.settings?.characterCategories || [];

  // ✅ 기존 데이터 호환
  const charactersNormalized: Character[] = (data.characters || []).map((c: any) => ({
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
  }));

  const [selectedId, setSelectedId] = useState<string | null>(
    charactersNormalized[0]?.id || null
  );

  // ✅ 필터
  const [activeMain, setActiveMain] = useState<string>(ALL);
  const [activeSub, setActiveSub] = useState<string>(ALL);

  // ✅ 카테고리 편집
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [draftCategories, setDraftCategories] = useState<CategoryGroup[]>(categories);

  // ✅ 캐릭터 추가/수정 모달
  const [editingTarget, setEditingTarget] = useState<"new" | string | null>(null);

  // ✅ 감상 모드 상세 모달
  const [viewModalId, setViewModalId] = useState<string | null>(null);
  const [viewSubIndex, setViewSubIndex] = useState(0);

  useEffect(() => {
    setDraftCategories(categories);

    // 메인 카테고리 유효성 체크 (전체는 항상 유효)
    if (activeMain !== ALL && !categories.find((c) => c.main === activeMain)) {
      setActiveMain(ALL);
      setActiveSub(ALL);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.settings?.characterCategories]);

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
    return charactersNormalized.filter((c) => {
      const characterSubs = c.subCategories || [];

      const mainOk =
        activeMain === ALL
          ? true
          : (mainToSubs.get(activeMain) || []).some((sub) =>
            characterSubs.includes(sub)
          );

      const subOk = activeSub === ALL ? true : characterSubs.includes(activeSub);

      return mainOk && subOk;
    });
  }, [charactersNormalized, activeMain, activeSub, mainToSubs]);

  // ✅ 선택 캐릭터가 필터/삭제로 사라졌으면 보정
  useEffect(() => {
    if (!filtered.length) {
      setSelectedId(null);
      return;
    }
    const stillExists = filtered.some((c) => c.id === selectedId);
    if (!stillExists) setSelectedId(filtered[0]?.id || null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered.length, selectedId]);

  const selected = charactersNormalized.find((c) => c.id === selectedId) || null;
  const viewModalChar = charactersNormalized.find((c) => c.id === viewModalId) || null;

  const updateCharacters = (next: Character[]) =>
    setData({
      ...data,
      characters: next.map((c) => ({
        id: c.id,
        name: c.name,
        subCategories: c.subCategories || [],
        profileImage: c.profileImage || "",
        mainImage: c.mainImage || "",
        mainImageDesc: c.mainImageDesc || "",
        subImages: c.subImages || [],
        tags: c.tags || [],
        description: c.description || "",
      })),
    });

  const openNewModal = () => setEditingTarget("new");
  const openEditModal = (id: string) => setEditingTarget(id);

  const upsertCharacter = (payload: Character) => {
    const exists = charactersNormalized.some((c) => c.id === payload.id);
    const next = exists
      ? charactersNormalized.map((c) => (c.id === payload.id ? payload : c))
      : [...charactersNormalized, payload];

    updateCharacters(next);
    setSelectedId(payload.id);
  };

  const deleteCharacter = (id: string) => {
    const next = charactersNormalized.filter((c) => c.id !== id);
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
  // quick toggle for selected (edit panel)
  // ----------------------------
  const toggleSelectedSub = (sub: string) => {
    if (!selected) return;
    const next = charactersNormalized.map((c) => {
      if (c.id !== selected.id) return c;
      const has = (c.subCategories || []).includes(sub);
      const subCategories = has
        ? (c.subCategories || []).filter((x) => x !== sub)
        : [...(c.subCategories || []), sub];
      return { ...c, subCategories };
    });
    updateCharacters(next);
  };

  return (
    <div className="min-h-screen gyeol-bg text-white">
      {/* ✅ HERO / HEADER */}
      <div className="relative overflow-hidden">
        <div className="relative px-12 py-12">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="text-lg text-white/60 mb-2">CHARACTERS</p>
              <h1 className="text-4xl text-white font-extrabold tracking-tight">
                캐릭터 소개
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
                  text="캐릭터 추가"
                  onClick={openNewModal}
                />
              </div>
            )}
          </div>

          {/* ✅ 필터 바 */}
          {!isEditingCategory ? (
            <div className="mt-12 space-y-6">
              {/* 메인 */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => {
                    setActiveMain(ALL);
                    setActiveSub(ALL);
                  }}
                  className={[
                    "px-5 h-10 rounded-full text-sm font-medium transition-all duration-200",
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
                        "px-5 h-10 rounded-full text-sm font-medium transition-all duration-200",
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

              {/* 서브 */}
              <div className="flex flex-wrap gap-2">
                {subsOfActiveMain.map((s) => {
                  const active = s === activeSub;
                  return (
                    <button
                      key={s}
                      onClick={() => setActiveSub(s)}
                      className={[
                        "px-4 h-8 rounded-full text-xs transition-all duration-200",
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
          ) : (
            <div className="mt-14 rounded-2xl border border-zinc-800 bg-zinc-900/80 backdrop-blur p-6 space-y-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
              <div className="flex items-center justify-between">
                <p className="text-xl font-semibold text-white tracking-tight">
                  카테고리 편집
                </p>

                <div className="flex gap-2">
                  <GButton
                    variant="ghost"
                    text="취소"
                    onClick={() => {
                      setDraftCategories(categories);
                      setIsEditingCategory(false);
                    }}
                  />
                  <GButton variant="primary" text="저장" onClick={saveCategories} />
                </div>
              </div>

              <div className="space-y-6">
                {draftCategories.map((cg, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-6 space-y-4"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        value={cg.main}
                        onChange={(e) => {
                          const next = [...draftCategories];
                          next[idx] = { ...next[idx], main: e.target.value };
                          setDraftCategories(next);
                        }}
                        className="h-10 px-4 rounded-xl bg-zinc-950 border border-zinc-800 text-white w-56
                          focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                        placeholder="메인 카테고리"
                      />

                      <GButton
                        variant="danger"
                        text="삭제"
                        onClick={() => {
                          const next = draftCategories.filter((_, i) => i !== idx);
                          setDraftCategories(next);
                        }}
                      />
                    </div>

                    <div className="space-y-3">
                      {cg.subs.map((s, sidx) => (
                        <div key={sidx} className="flex items-center gap-3">
                          <input
                            value={s}
                            onChange={(e) => {
                              const next = [...draftCategories];
                              const subs = [...next[idx].subs];
                              subs[sidx] = e.target.value;
                              next[idx] = { ...next[idx], subs };
                              setDraftCategories(next);
                            }}
                            className="h-9 px-4 rounded-xl bg-zinc-950 border border-zinc-800 text-white w-72
                              focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                            placeholder="서브 카테고리"
                          />

                          <GButton
                            variant="ghost"
                            text="제거"
                            onClick={() => {
                              const next = [...draftCategories];
                              next[idx] = {
                                ...next[idx],
                                subs: next[idx].subs.filter((_, i) => i !== sidx),
                              };
                              setDraftCategories(next);
                            }}
                          />
                        </div>
                      ))}

                      <button
                        onClick={() => {
                          const next = [...draftCategories];
                          next[idx] = { ...next[idx], subs: [...next[idx].subs, ""] };
                          setDraftCategories(next);
                        }}
                        className="h-9 px-4 rounded-xl border border-dashed border-zinc-700 text-zinc-400
                          hover:bg-zinc-800 hover:text-white transition-all"
                      >
                        + 서브 추가
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  onClick={() =>
                    setDraftCategories([...draftCategories, { main: "", subs: [""] }])
                  }
                  className="h-11 px-6 rounded-2xl border border-dashed border-zinc-700
                    text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all duration-200"
                >
                  + 메인 카테고리 추가
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ✅ GRID */}
      <div className="px-14 py-10 min-h-screen">
        {filtered.length === 0 ? (
          <div className="py-32 text-center text-zinc-500 text-sm tracking-wide">
            해당 카테고리에 캐릭터가 없습니다.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            {filtered.map((c) => (
              <CharacterGridCard
                key={c.id}
                id={c.id}
                name={c.name}
                subCategories={c.subCategories}
                image={c.profileImage}
                selected={c.id === selectedId}
                onClick={() => setSelectedId(c.id)}
                onOpen={() => !editMode && setViewModalId(c.id)}
                editMode={editMode}
              />
            ))}
          </div>
        )}

        {/* ✅ 선택 캐릭터 편집 패널 */}
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
                <p className="text-xs text-zinc-500 mb-2">서브 카테고리(복수)</p>

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
                  value={selected.description}
                  onChange={(e) => {
                    const next = charactersNormalized.map((x) =>
                      x.id === selected.id
                        ? { ...x, description: e.target.value }
                        : x
                    );
                    updateCharacters(next);
                  }}
                  className="w-full min-h-28 p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-white resize-none
                    focus:outline-none focus:ring-2 focus:ring-white/20 transition"
                  placeholder="캐릭터 설명"
                />
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
                text="캐릭터 삭제"
                onClick={() => deleteCharacter(selected.id)}
                disabled={charactersNormalized.length <= 1}
                className="w-full"
              />
            </div>
          </div>
        )}
      </div>

      {/* ✅ 감상 모드 상세 모달(더블클릭) */}
      <Modal
        open={!editMode && !!viewModalChar}
        onClose={() => {
          setViewModalId(null);
          setViewSubIndex(0);
        }}
        title={viewModalChar ? viewModalChar.name : "상세"}
        maxWidthClassName="max-w-3xl"
        footer={
          <div className="flex justify-end">
            <GButton
              variant="dark"
              text="닫기"
              onClick={() => {
                setViewModalId(null);
                setViewSubIndex(0);
              }}
            />
          </div>
        }
      >
        {viewModalChar && (
          <ViewCharacterContent
            char={viewModalChar}
            viewSubIndex={viewSubIndex}
            setViewSubIndex={setViewSubIndex}
          />
        )}
      </Modal>

      {/* ✅ 추가/수정 모달 (editMode) */}
      {editMode && editingTarget && (
        <CharacterEditModal
          key={editingTarget}
          target={editingTarget}
          allSubs={allSubs}
          Characters={charactersNormalized}
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

/* -------------------------------------------
 * Grid Card (Hook 안전: 컴포넌트 분리)
 * ------------------------------------------- */
function CharacterGridCard(props: {
  id: string;
  name: string;
  subCategories: string[];
  image: string;
  selected: boolean;
  editMode: boolean;
  onClick: () => void;
  onOpen: () => void;
}) {
  const { name, subCategories, image, selected, editMode, onClick, onOpen } =
    props;

  const resolved = useResolvedImage(image);

  return (
    <button
      onClick={onClick}
      onDoubleClick={() => !editMode && onOpen()}
      className={[
        "group relative aspect-square overflow-hidden rounded-2xl",
        "transition-all duration-300 hover:shadow-xl shadow-sm",
        selected ? "scale-[1.02]" : "hover:scale-[1.02]",
      ].join(" ")}
      title={editMode ? "클릭: 선택 / (편집은 아래 패널)" : "더블클릭: 상세 보기"}
    >
      <div className="absolute inset-0 bg-zinc-900">
        {resolved ? (
          <img
            src={resolved}
            alt={name}
            className={[
              "h-full w-full object-cover transition-all duration-500 will-change-transform",
              selected
                ? "scale-110 brightness-100 saturate-100 grayscale-0"
                : "grayscale brightness-75 contrast-105 group-hover:grayscale-0 group-hover:brightness-90 group-hover:scale-105",
            ].join(" ")}
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-xs text-zinc-500">
            이미지 없음
          </div>
        )}
      </div>

      <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
        <div className="text-white text-sm font-semibold tracking-tight">
          {name}
        </div>
        <div className="text-zinc-400 text-[11px] mt-1">
          {(subCategories || []).join(", ")}
        </div>
      </div>

      {selected && (
        <div className="absolute inset-0 ring-2 ring-white/20 pointer-events-none" />
      )}
    </button>
  );
}

/* -------------------------------------------
 * View Content (감상 모달 내부)
 * ------------------------------------------- */
function ViewCharacterContent(props: {
  char: Character;
  viewSubIndex: number;
  setViewSubIndex: React.Dispatch<React.SetStateAction<number>>;
}) {
  const { char, viewSubIndex, setViewSubIndex } = props;

  const main = useResolvedImage(char.mainImage || "");
  const sub = useResolvedImage(char.subImages?.[viewSubIndex]?.image || "");

  return (
    <div className="space-y-6">
      {/* Main */}
      <div className="space-y-2 text-black">
        <p className="text-sm font-semibold">메인 이미지</p>
        <div className="aspect-video rounded-xl border border-border overflow-hidden bg-white/10">
          {main ? (
            <img
              src={main}
              className="w-full h-full object-contain"
              alt="main"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              이미지 없음
            </div>
          )}
        </div>
        {!!char.mainImageDesc && (
          <p className="text-sm text-muted-foreground">{char.mainImageDesc}</p>
        )}
      </div>

      {!!char.description && (
        <div>
          <p className="text-sm font-semibold mb-2">설명</p>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {char.description}
          </p>
        </div>
      )}

      {/* Subs */}
      {char.subImages?.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">서브 이미지</p>
            <p className="text-xs text-muted-foreground">
              {viewSubIndex + 1} / {char.subImages.length}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <GButton
              variant="default"
              size="icon"
              icon={<ChevronLeft className="w-5 h-5" />}
              onClick={() =>
                setViewSubIndex(
                  (p) => (p - 1 + char.subImages.length) % char.subImages.length
                )
              }
              title="이전"
            />

            <div className="flex-1 aspect-video rounded-xl border border-border overflow-hidden bg-secondary/10">
              {sub ? (
                <img
                  src={sub}
                  className="w-full h-full object-contain"
                  alt="sub"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  이미지 없음
                </div>
              )}
            </div>

            <GButton
              variant="default"
              size="icon"
              icon={<ChevronRight className="w-5 h-5" />}
              onClick={() => setViewSubIndex((p) => (p + 1) % char.subImages.length)}
              title="다음"
            />
          </div>

          {!!char.subImages[viewSubIndex]?.description && (
            <p className="text-sm text-muted-foreground">
              {char.subImages[viewSubIndex].description}
            </p>
          )}

          <div className="flex gap-2 overflow-x-auto pb-2">
            {char.subImages.map((s, idx) => (
              <SubThumb
                key={idx}
                image={s.image}
                active={idx === viewSubIndex}
                onClick={() => setViewSubIndex(idx)}
                alt={`thumb-${idx}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------
 * Edit Modal (Modal + GButton 통일)
 * ------------------------------------------- */
function CharacterEditModal(props: {
  target: "new" | string;
  allSubs: string[];
  Characters: Character[];
  onClose: () => void;
  onSave: (c: Character) => void;
  onDelete: (id: string) => void;
}) {
  const { target, allSubs, Characters, onClose, onSave, onDelete } = props;

  const original =
    target === "new" ? null : Characters.find((c) => c.id === target) || null;

  const [draft, setDraft] = useState<Character>(() => {
    if (original) return original;
    return {
      id: Date.now().toString(),
      name: "새 캐릭터",
      subCategories: [],
      profileImage: "",
      mainImage: "",
      mainImageDesc: "",
      subImages: [],
      tags: [],
      description: "",
    };
  });

  const toggleSub = (s: string) => {
    setDraft((d) => {
      const has = (d.subCategories || []).includes(s);
      const next = has
        ? (d.subCategories || []).filter((x) => x !== s)
        : [...(d.subCategories || []), s];
      return { ...d, subCategories: next };
    });
  };

  const addSubImage = () =>
    setDraft((d) => ({
      ...d,
      subImages: [...d.subImages, { image: "", description: "" }],
    }));

  const updateSubImage = (idx: number, patch: Partial<SubImage>) =>
    setDraft((d) => {
      const next = [...d.subImages];
      next[idx] = { ...next[idx], ...patch };
      return { ...d, subImages: next };
    });

  const removeSubImage = (idx: number) =>
    setDraft((d) => ({
      ...d,
      subImages: d.subImages.filter((_, i) => i !== idx),
    }));

  return (
    <Modal
      open
      onClose={onClose}
      title={target === "new" ? "캐릭터 추가" : "캐릭터 수정"}
      maxWidthClassName="max-w-3xl"
      footer={
        <div className="flex items-center gap-2 w-full">
          <GButton
            variant="dark"
            text="저장"
            onClick={() => onSave(draft)}
            className="flex-1"
          />
          {target !== "new" && (
            <GButton
              variant="danger"
              icon={<Trash2 className="w-4 h-4" />}
              text="삭제"
              onClick={() => onDelete(draft.id)}
            />
          )}
        </div>
      }
    >
      <div className="space-y-8 text-black">
        {/* 기본 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-semibold mb-2">이름</p>
            <input
              value={draft.name}
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
              className="w-full h-10 px-3 rounded-xl border border-border bg-background"
            />
          </div>
        </div>

        {/* 서브 태그 */}
        <div>
          <p className="text-sm font-semibold mb-2">서브 카테고리 (복수 선택)</p>
          <div className="flex flex-wrap gap-2">
            {allSubs.map((s) => {
              const active = (draft.subCategories || []).includes(s);
              return (
                <button
                  type="button"
                  key={s}
                  onClick={() => toggleSub(s)}
                  className={[
                    "px-3 h-8 rounded-full text-xs border transition",
                    active
                      ? "bg-foreground text-background border-foreground"
                      : "bg-zinc-950 text-zinc-300 border-zinc-800 hover:bg-zinc-900",
                  ].join(" ")}
                >
                  {s}
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {(draft.subCategories || []).length === 0 ? (
              <p className="text-xs text-muted-foreground">
                서브 카테고리를 1개 이상 선택해주세요.
              </p>
            ) : (
              (draft.subCategories || []).map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-2 px-3 h-8 rounded-full bg-foreground/10 text-foreground text-xs border border-foreground/15"
                >
                  {t}
                  <button
                    type="button"
                    onClick={() => toggleSub(t)}
                    className="opacity-70 hover:opacity-100"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))
            )}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold mb-2">캐릭터 설명</p>
          <textarea
            value={draft.description}
            onChange={(e) =>
              setDraft((d) => ({ ...d, description: e.target.value }))
            }
            className="w-full min-h-24 p-3 rounded-xl border border-border bg-background resize-none"
            placeholder="세계관/성격/능력 등"
          />
        </div>

        {/* 프로필 */}
        <div className="rounded-2xl border border-border bg-secondary/30 p-5 space-y-3">
          <p className="font-semibold">프로필 이미지</p>
          <ImageUpload
            value={draft.profileImage}
            onChange={(v) => setDraft((d) => ({ ...d, profileImage: v }))}
          />
        </div>

        {/* 메인 */}
        <div className="rounded-2xl border border-border bg-secondary/30 p-5 space-y-3">
          <p className="font-semibold">메인 이미지</p>
          <ImageUpload
            value={draft.mainImage}
            onChange={(v) => setDraft((d) => ({ ...d, mainImage: v }))}
          />
          <textarea
            value={draft.mainImageDesc || ""}
            onChange={(e) =>
              setDraft((d) => ({ ...d, mainImageDesc: e.target.value }))
            }
            className="w-full min-h-20 p-3 rounded-xl border border-border bg-background resize-none"
            placeholder="메인 이미지 설명"
          />
        </div>

        {/* 서브 */}
        <div className="rounded-2xl border border-border bg-secondary/30 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-semibold">서브 이미지</p>
            <GButton
              variant="dark"
              icon={<Plus className="w-4 h-4" />}
              text="추가"
              onClick={addSubImage}
            />
          </div>

          {draft.subImages.length === 0 ? (
            <p className="text-sm text-muted-foreground">서브 이미지를 추가해주세요.</p>
          ) : (
            <div className="space-y-6">
              {draft.subImages.map((s, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-border bg-background/40 p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">서브 #{idx + 1}</p>
                    <GButton
                      variant="danger"
                      text="삭제"
                      onClick={() => removeSubImage(idx)}
                    />
                  </div>

                  <ImageUpload
                    value={s.image}
                    onChange={(v) => updateSubImage(idx, { image: v })}
                  />
                  <textarea
                    value={s.description}
                    onChange={(e) =>
                      updateSubImage(idx, { description: e.target.value })
                    }
                    className="w-full min-h-20 p-3 rounded-xl border border-border bg-background resize-none"
                    placeholder="서브 이미지 설명"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}


function SubThumb(props: {
  image: string;
  alt?: string;
  active: boolean;
  onClick: () => void;
}) {
  const { image, active, onClick, alt = "thumb" } = props;
  const thumb = useResolvedImage(image || "");

  return (
    <button
      onClick={onClick}
      className={[
        "w-14 h-14 rounded-xl overflow-hidden border-2 flex-shrink-0 transition",
        active ? "border-foreground" : "border-border hover:border-muted-foreground",
      ].join(" ")}
    >
      {thumb ? (
        <img src={thumb} className="w-full h-full object-cover" alt={alt} />
      ) : (
        <div className="w-full h-full bg-secondary" />
      )}
    </button>
  );
}