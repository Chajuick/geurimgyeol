// Creatures.tsx
import { usePortfolioContext } from "@/contexts/PortfolioContext";
import {
  Plus,
  Trash2,
  X,
  Pencil,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import ImageUpload from "@/components/ImageUpload";
import Modal from "@/components/ui/modal";
import GButton from "@/components/ui/gyeol-button";
import { useResolvedImage } from "@/hooks/useResolvedImage";
import ProfileCard from "@/components/ui/profile-card";

type SubImage = { image: string; description: string };

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
};

type CategoryGroup = { main: string; subs: string[] };

const ALL = "전체";

export default function Creatures() {
  const { data, setData, editMode } = usePortfolioContext();

  // ✅ Categories
  const categories: CategoryGroup[] = data.settings?.creatureCategories || [];

  // ✅ 기존 데이터 호환
  const creaturesNormalized: Creature[] = (data.creatures || []).map((c: any) => ({
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
    creaturesNormalized[0]?.id || null
  );

  // ✅ 필터
  const [activeMain, setActiveMain] = useState<string>(ALL);
  const [activeSub, setActiveSub] = useState<string>(ALL);

  // ✅ 카테고리 편집
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [draftCategories, setDraftCategories] = useState<CategoryGroup[]>(categories);

  // ✅ 크리쳐 추가/수정 모달
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
  }, [data.settings?.creatureCategories]);

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
  }, [filtered.length, selectedId]);

  const selected = creaturesNormalized.find((c) => c.id === selectedId) || null;
  const viewModalChar = creaturesNormalized.find((c) => c.id === viewModalId) || null;

  const updateCreatures = (next: Creature[]) =>
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
      })),
    });

  const openNewModal = () => setEditingTarget("new");
  const openEditModal = (id: string) => setEditingTarget(id);

  const upsertCreature = (payload: Creature) => {
    const exists = creaturesNormalized.some((c) => c.id === payload.id);
    const next = exists
      ? creaturesNormalized.map((c) => (c.id === payload.id ? payload : c))
      : [...creaturesNormalized, payload];

    updateCreatures(next);
    setSelectedId(payload.id);
  };

  const deleteCreature = (id: string) => {
    const next = creaturesNormalized.filter((c) => c.id !== id);
    updateCreatures(next);
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
        creatureCategories: draftCategories,
      },
    });
    setIsEditingCategory(false);
  };

  // ----------------------------
  // quick toggle for selected (edit panel)
  // ----------------------------
  const toggleSelectedSub = (sub: string) => {
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
  };

  return (
    <div className={`min-h-screen gyeol-bg text-white ${!editMode && viewModalChar && "max-h-[100vh] overflow-hidden"}`}>
      {/* ✅ HERO / HEADER */}
      {/* ✅ FIXED HEADER + FILTER BAR */}
      <div className="fixed top-0 inset-x-0 z-20 bg-zinc-950/80 backdrop-blur border-b border-white/5 ml-0 md:ml-20">
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
        <CategoryEditModal
          draft={draftCategories}
          setDraft={setDraftCategories}
          onClose={() => setIsEditingCategory(false)}
          onSave={saveCategories}
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
              <CreatureGridCard
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
                    const next = creaturesNormalized.map((x) =>
                      x.id === selected.id
                        ? { ...x, description: e.target.value }
                        : x
                    );
                    updateCreatures(next);
                  }}
                  className="w-full min-h-28 p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-white resize-none
                    focus:outline-none focus:ring-2 focus:ring-white/20 transition"
                  placeholder="크리쳐 설명"
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
        <DetailViewFullscreen
          char={viewModalChar}
          viewSubIndex={viewSubIndex}
          setViewSubIndex={setViewSubIndex}
          onClose={() => {
            setViewModalId(null);
            setViewSubIndex(0);
          }}
        />
      )}

      {/* ✅ 추가/수정 모달 (editMode) */}
      {editMode && editingTarget && (
        <CreatureEditModal
          key={editingTarget}
          target={editingTarget}
          allSubs={allSubs}
          Creatures={creaturesNormalized}
          onClose={() => setEditingTarget(null)}
          onSave={(c) => {
            upsertCreature(c);
            setEditingTarget(null);
          }}
          onDelete={(id) => {
            deleteCreature(id);
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
function CreatureGridCard(props: {
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
function DetailViewFullscreen(props: {
  char: Creature;
  viewSubIndex: number;
  setViewSubIndex: React.Dispatch<React.SetStateAction<number>>;
  onClose: () => void;
}) {
  const { char, viewSubIndex, setViewSubIndex, onClose } = props;

  const main = useResolvedImage(char.mainImage || "");
  const sub = useResolvedImage(char.subImages?.[viewSubIndex]?.image || "");
  const profile = useResolvedImage(char.profileImage || "");

  // ✅ 프로필 클릭으로 메인/서브 토글
  const [showSubOnMain, setShowSubOnMain] = useState(false);

  // ✅ 마운트 애니메이션 트리거
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

  // 서브가 없으면 항상 메인
  useEffect(() => {
    if (!char.subImages?.length) setShowSubOnMain(false);
  }, [char.subImages?.length]);

  const displayed = showSubOnMain && sub ? sub : main;

  const onClickProfile = () => {
    if (!char.subImages?.length) return;
    setShowSubOnMain((v) => !v);
  };

  // ✅ (선택) ESC 닫기
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[9999]">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* panel */}
      <div className="absolute inset-0 bg-zinc-950 text-white overflow-hidden">
        {/* ===== Character symbolic background ===== */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* 4) 하단 쉐도우 */}
          <div
            className="absolute bottom-0 left-0 right-0 h-[45%]"
            style={{
              background:
                "linear-gradient(to top, rgba(0,0,0,0.95), rgba(0,0,0,0.6), transparent)",
            }}
          />

        </div>
        {/* header */}
        <div
          className={[
            "px-6 h-[60px] flex items-end justify-end relative",
            "transition-all duration-500",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2",
          ].join(" ")}
        >
          <GButton
            variant="onlyText"
            onClick={onClose}
            text="돌아가기"
            className="text-white/90 hover:text-white/50 text-xl"
          />
        </div>

        {/* body */}
        <div className="relative h-[calc(100vh-60px)] py-6">
          <div className="h-full max-h-[100vh] grid grid-cols-12 gap-6">
            {/* LEFT */}
            <div className="col-span-1 hidden lg:block" />

            <div
              className={[
                "h-full col-span-12 lg:col-span-5 flex flex-col justify-start",
                "transition-all duration-700",
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3",
              ].join(" ")}
              style={{ transitionDelay: "60ms" }}
            >
              <div className="relative overflow-hidden">
                <div
                  className="w-full flex items-center justify-center h-[calc(100vh-120px)]"
                  style={{
                    WebkitMaskImage: `
                      linear-gradient(to bottom, transparent, black 20%, black 80%, transparent),
                      linear-gradient(to right,  transparent, black 20%, black 80%, transparent)
                    `,
                    maskImage: `
                      linear-gradient(to bottom, transparent, black 20%, black 80%, transparent),
                      linear-gradient(to right,  transparent, black 20%, black 80%, transparent)
                    `,
                    WebkitMaskComposite: "destination-in",
                    maskComposite: "intersect",
                  }}
                >
                  {displayed ? (
                    <img
                      src={displayed}
                      alt="main"
                      className={[
                        "w-full h-auto object-contain pb-[40px] max-h-[calc(100vh-160px)]",
                        "transition-all duration-300",
                      ].join(" ")}
                      // ✅ displayed 바뀔 때 살짝 “스왑” 느낌
                      key={displayed}
                    />
                  ) : (
                    <div className="text-sm text-white/40">이미지 없음</div>
                  )}
                  {/* floor shadow */}
                  <div
                    className="
                      absolute left-1/2 bottom-6
                      -translate-x-1/2
                      w-[420px] h-[80px]
                      rounded-full
                      blur-2xl
                      opacity-60
                    "
                    style={{
                      background:
                        "radial-gradient(ellipse at center, rgba(0,0,0,0.8), transparent)",
                    }}
                  />
                </div>

                <div className="absolute left-0 bottom-0 p-4 space-y-3 translate-x-[20%]">
                  <div className="text-3xl font-semibold tracking-tight">
                    {char.name}
                  </div>

                  {/* tags */}
                  <div className="flex flex-wrap gap-2">
                    {(char.subCategories || []).map((t) => (
                      <span
                        key={t}
                        className="px-3 h-7 inline-flex items-center rounded-full
                          bg-white/10 border border-white/10 text-xs text-white/80"
                      >
                        {t}
                      </span>
                    ))}
                    {(char.subCategories || []).length === 0 && (
                      <span className="text-xs text-white/35">태그 없음</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* MIDDLE: profile */}
            <div
              className={[
                "col-span-12 lg:col-span-2 flex flex-col justify-end",
                "transition-all duration-700",
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3",
              ].join(" ")}
              style={{ transitionDelay: "140ms" }}
            >
              <button
                type="button"
                onClick={onClickProfile}
                className="text-left"
                title={char.subImages?.length ? "클릭: 메인/서브 토글" : ""}
              >
                <ProfileCard
                  name={char.name}
                  imageUrl={profile}
                  className="mb-[40px] max-w-50"
                />
              </button>
            </div>

            {/* RIGHT */}
            <div
              className={[
                "col-span-12 lg:col-span-4",
                "transition-all duration-700",
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3",
              ].join(" ")}
              style={{ transitionDelay: "220ms" }}
            >
              <div className="shrink-0 lg:max-h-[240px] lg:min-h-[180px] lg:overflow-auto lg:pr-1 scroll-dark">
                <p
                  className="text-sm text-white/70 text-left leading-relaxed whitespace-pre-wrap
                    max-h-[180px] lg:max-h-none overflow-auto lg:overflow-visible"
                >
                  {char.mainImageDesc || "설명이 없습니다"}
                </p>
              </div>

              {/* subs strip */}
              <div className="mt-6 space-y-4">
                {char.subImages?.length > 0 ? (
                  <>
                    <div className="overflow-x-auto pb-2 scroll-dark">
                      <div className="flex gap-3 min-w-max">
                        {char.subImages.map((s, idx) => {
                          const active = idx === viewSubIndex;
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                // ✅ BUG FIX: 썸네일 누르면 displayed가 즉시 바뀌게
                                setViewSubIndex(idx);
                                setShowSubOnMain(true);
                              }}
                              className={[
                                "w-32 rounded-xl overflow-hidden border transition flex-shrink-0",
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

                    <div className="shrink-0 lg:max-h-[240px] lg:min-h-[180px] lg:overflow-auto lg:pr-1 scroll-dark mt-10">
                      <p
                        className="text-sm text-white/70 text-left leading-relaxed whitespace-pre-wrap
                        max-h-[180px] lg:max-h-none overflow-auto lg:overflow-visible"
                      >
                        {char.subImages[viewSubIndex]?.description || "설명이 없습니다"}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/40 text-sm">
                    서브 이미지가 없습니다.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ✅ bottom hint */}
          <div
            className={[
              "absolute left-1/2 -translate-x-1/2 top-[-12px] text-xs text-white/25",
              "transition-opacity duration-700",
              mounted ? "opacity-100" : "opacity-0",
            ].join(" ")}
          >
            ESC 로 닫기
          </div>
        </div>
      </div>
    </div>
  );
}

/** ✅ 썸네일은 훅 없이(안전), 내부에서 useResolvedImage 쓰지 않음 */
function SubThumbInner(props: { image: string; alt?: string }) {
  const { image, alt = "sub" } = props;
  const resolved = useResolvedImage(image || "");

  if (!resolved) {
    return <div className="w-full h-full grid place-items-center text-white/30 text-xs">NO</div>;
  }

  return <img src={resolved} alt={alt} className="w-full h-full object-contain" />;
}

/* -------------------------------------------
 * Edit Modal (Modal + GButton 통일)
 * ------------------------------------------- */
function CreatureEditModal(props: {
  target: "new" | string;
  allSubs: string[];
  Creatures: Creature[];
  onClose: () => void;
  onSave: (c: Creature) => void;
  onDelete: (id: string) => void;
}) {
  const { target, allSubs, Creatures, onClose, onSave, onDelete } = props;

  const original =
    target === "new" ? null : Creatures.find((c) => c.id === target) || null;

  const [draft, setDraft] = useState<Creature>(() => {
    if (original) return original;
    return {
      id: Date.now().toString(),
      name: "새 크리쳐",
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
      title={target === "new" ? "크리쳐 추가" : "크리쳐 수정"}
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
          <p className="text-sm font-semibold mb-2">크리쳐 설명</p>
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

function CategoryEditModal(props: {
  draft: CategoryGroup[];
  setDraft: React.Dispatch<React.SetStateAction<CategoryGroup[]>>;
  onClose: () => void;
  onSave: () => void;
}) {
  const { draft, setDraft, onClose, onSave } = props;

  const addMain = () => {
    setDraft((d) => [...d, { main: "새 메인", subs: [] }]);
  };

  const renameMain = (idx: number, v: string) => {
    setDraft((d) => d.map((x, i) => (i === idx ? { ...x, main: v } : x)));
  };

  const removeMain = (idx: number) => {
    setDraft((d) => d.filter((_, i) => i !== idx));
  };

  const addSub = (idx: number) => {
    const sub = prompt("추가할 서브 카테고리 이름")?.trim();
    if (!sub) return;
    setDraft((d) =>
      d.map((x, i) => {
        if (i !== idx) return x;
        const subs = Array.from(new Set([...(x.subs || []), sub]));
        return { ...x, subs };
      })
    );
  };

  const removeSub = (mainIdx: number, sub: string) => {
    setDraft((d) =>
      d.map((x, i) => {
        if (i !== mainIdx) return x;
        return { ...x, subs: (x.subs || []).filter((s) => s !== sub) };
      })
    );
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="캐릭터 카테고리 편집"
      maxWidthClassName="max-w-3xl"
      footer={
        <div className="flex items-center gap-2 w-full">
          <GButton
            variant="default"
            text="닫기"
            onClick={onClose}
            className="flex-1"
          />
          <GButton
            variant="dark"
            text="저장"
            onClick={onSave}
            className="flex-1"
          />
        </div>
      }
    >
      <div className="space-y-5 text-black">
        <div className="flex justify-end">
          <GButton variant="dark" icon={<Plus className="w-4 h-4" />} text="메인 추가" onClick={addMain} />
        </div>

        {draft.length === 0 ? (
          <div className="text-sm text-muted-foreground">카테고리가 없습니다. “메인 추가”를 눌러주세요.</div>
        ) : (
          <div className="space-y-4">
            {draft.map((cg, idx) => (
              <div key={idx} className="rounded-2xl border border-border bg-background/50 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    value={cg.main}
                    onChange={(e) => renameMain(idx, e.target.value)}
                    className="flex-1 h-10 px-3 rounded-xl border border-border bg-background"
                    placeholder="메인 카테고리 이름"
                  />
                  <GButton variant="dark" text="서브 추가" onClick={() => addSub(idx)} />
                  <GButton variant="danger" text="메인 삭제" onClick={() => removeMain(idx)} />
                </div>

                <div className="flex flex-wrap gap-2">
                  {(cg.subs || []).length === 0 ? (
                    <span className="text-xs text-muted-foreground">서브 카테고리가 없습니다.</span>
                  ) : (
                    (cg.subs || []).map((s) => (
                      <span
                        key={s}
                        className="inline-flex items-center gap-2 px-3 h-8 rounded-full bg-zinc-950 text-zinc-200 border border-zinc-800 text-xs"
                      >
                        {s}
                        <button
                          type="button"
                          onClick={() => removeSub(idx, s)}
                          className="opacity-70 hover:opacity-100"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}