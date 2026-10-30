import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useDeferredValue,
} from "react";
import { useLocation } from "wouter";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  Plus,
  Sparkles,
  Trash2,
  UserRound,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import EditableText from "@/components/ui/editable-text";
import GButton from "@/components/ui/gyeol-button";
import WorldThumbCard from "@/components/worlds/WorldThumbCard";
import WorldSection from "@/components/worlds/WorldSection";
import LinkedEntityGallery, {
  type LinkedEntityItem as LinkedItem,
} from "@/components/worlds/LinkedEntityGallery";

import AddWorldModal from "@/components/worlds/modals/AddWorldModal";
import EditWorldMediaModal from "@/components/worlds/modals/EditWorldMediaModal";
import AddWorldItemModal from "@/components/worlds/modals/AddWorldItemModal";

import { usePortfolioContext } from "@/contexts/PortfolioContext";
import { useDiveTransition } from "@/contexts/DiveTransitionContext";
import type {
  ID,
  WorldCharacterRef,
  WorldCreatureRef,
  WorldData,
  CharacterData,
  CreatureData,
} from "@/types";

import { DEFAULT_WORLD_PROPER_NOUN_KINDS } from "@/lib/defaultData";
import { cn } from "@/lib/utils";

import EntityDetailFullscreen from "@/components/entities/detail/EntityDetailFullscreen";
import { useResolvedImage } from "@/hooks/useResolvedImage";

function makeId(): ID {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID() as ID;
  }
  return `${Date.now()}_${Math.random().toString(16).slice(2)}` as ID;
}

type AddTab = "character" | "creature";

export default function Worlds() {
  const { data, setData, editMode } = usePortfolioContext();
  const worlds = data.worlds ?? [];

  // navigation
  const [_, setLocation] = useLocation();
  const { dive } = useDiveTransition();
  const heroRef = useRef<HTMLElement | null>(null);

  const [currentWorldIndex, setCurrentWorldIndex] = useState(0);
  const currentWorld = worlds[currentWorldIndex] ?? null;

  // ✅ background resolve (img: 키 포함 대응)
  const resolvedWorldBg = useResolvedImage(currentWorld?.backgroundImage ?? "");

  // ✅ entity lookup maps (O(1))
  const characterById = useMemo(() => {
    const m = new Map<ID, CharacterData>();
    (data.characters ?? []).forEach(c => m.set(c.id, c));
    return m;
  }, [data.characters]);

  const creatureById = useMemo(() => {
    const m = new Map<ID, CreatureData>();
    (data.creatures ?? []).forEach(c => m.set(c.id, c));
    return m;
  }, [data.creatures]);

  // modals
  const [isAddingWorld, setIsAddingWorld] = useState(false);
  const [isAddingItem, setIsAddingItem] = useState(false);

  // Add World draft
  const [newWorldName, setNewWorldName] = useState("");
  const [newWorldDesc, setNewWorldDesc] = useState("");
  const [newWorldIconImage, setNewWorldIconImage] = useState("");
  const [newWorldBackgroundImage, setNewWorldBackgroundImage] = useState("");

  // Edit media draft
  const [isEditingBackground, setIsEditingBackground] = useState(false);
  const [backgroundUrl, setBackgroundUrl] = useState("");
  const [worldIconUrl, setWorldIconUrl] = useState("");

  // Add item modal
  const [addTab, setAddTab] = useState<AddTab>("character");
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);

  const [detailOpen, setDetailOpen] = useState<{ type: AddTab; id: ID } | null>(
    null
  );
  const [detailSubIndex, setDetailSubIndex] = useState(0);

  useEffect(() => {
    if (!worlds.length) return;
    setCurrentWorldIndex(i => Math.min(Math.max(i, 0), worlds.length - 1));
  }, [worlds.length]);

  const updateWorldAtIndex = useCallback(
    (index: number, patch: Partial<WorldData>) => {
      setData(prev => {
        const nextWorlds = [...(prev.worlds ?? [])];
        const target = nextWorlds[index];
        if (!target) return prev;
        nextWorlds[index] = { ...target, ...patch };
        return { ...prev, worlds: nextWorlds };
      });
    },
    [setData]
  );

  const openBackgroundModal = useCallback(() => {
    setBackgroundUrl(currentWorld?.backgroundImage ?? "");
    setWorldIconUrl(currentWorld?.iconImage ?? "");
    setIsEditingBackground(true);
  }, [currentWorld]);

  const closeBackgroundModal = useCallback(() => {
    setIsEditingBackground(false);
    setBackgroundUrl("");
    setWorldIconUrl("");
  }, []);

  const saveBackground = useCallback(() => {
    if (!currentWorld) return;
    updateWorldAtIndex(currentWorldIndex, {
      backgroundImage: backgroundUrl,
      iconImage: worldIconUrl,
    });
    closeBackgroundModal();
  }, [
    currentWorld,
    currentWorldIndex,
    backgroundUrl,
    worldIconUrl,
    updateWorldAtIndex,
    closeBackgroundModal,
  ]);

  const resetAddWorldDraft = useCallback(() => {
    setNewWorldName("");
    setNewWorldDesc("");
    setNewWorldIconImage("");
    setNewWorldBackgroundImage("");
  }, []);

  const handleAddWorld = useCallback(() => {
    if (!newWorldName.trim()) return;

    const newWorld: WorldData = {
      id: makeId(),
      name: newWorldName.trim(),
      description: newWorldDesc ?? "",

      iconImage: newWorldIconImage ?? "",
      mainImage: "",
      backgroundImage: newWorldBackgroundImage ?? "",

      worldCharacters: [],
      worldCreatures: [],

      properNounKinds: DEFAULT_WORLD_PROPER_NOUN_KINDS.map(k => ({
        ...k,
        meta: { ...(k as any).meta },
      })) as any,
      defaultProperNounKindId: "concept",

      properNouns: [],
      events: [],
    };

    setData(prev => ({ ...prev, worlds: [...(prev.worlds ?? []), newWorld] }));

    setIsAddingWorld(false);
    resetAddWorldDraft();
    setCurrentWorldIndex(worlds.length);
  }, [
    newWorldName,
    newWorldDesc,
    newWorldIconImage,
    newWorldBackgroundImage,
    setData,
    resetAddWorldDraft,
    worlds.length,
  ]);

  const handleDeleteWorld = useCallback(() => {
    if (worlds.length <= 1) return;

    setData(prev => {
      const nextWorlds = (prev.worlds ?? []).filter(
        (_, i) => i !== currentWorldIndex
      );
      return { ...prev, worlds: nextWorlds };
    });

    setCurrentWorldIndex(i => Math.max(0, i - 1));
  }, [worlds.length, setData, currentWorldIndex]);

  const handleNextWorld = useCallback(() => {
    if (!worlds.length) return;
    setCurrentWorldIndex(prev => (prev + 1) % worlds.length);
  }, [worlds.length]);

  const handlePrevWorld = useCallback(() => {
    if (!worlds.length) return;
    setCurrentWorldIndex(prev => (prev - 1 + worlds.length) % worlds.length);
  }, [worlds.length]);

  const handleAddItem = useCallback(
    (id: ID) => {
      if (!currentWorld) return;

      if (addTab === "character") {
        const newRef: WorldCharacterRef = { id: makeId(), characterId: id };
        updateWorldAtIndex(currentWorldIndex, {
          worldCharacters: [...(currentWorld.worldCharacters ?? []), newRef],
        });
      } else {
        const newRef: WorldCreatureRef = { id: makeId(), creatureId: id };
        updateWorldAtIndex(currentWorldIndex, {
          worldCreatures: [...(currentWorld.worldCreatures ?? []), newRef],
        });
      }

      setIsAddingItem(false);
      setSearch("");
    },
    [addTab, currentWorld, currentWorldIndex, updateWorldAtIndex]
  );

  const handleUnlinkItem = useCallback(
    (refId: ID, type: AddTab) => {
      if (!currentWorld) return;

      if (type === "character") {
        updateWorldAtIndex(currentWorldIndex, {
          worldCharacters: (currentWorld.worldCharacters ?? []).filter(
            r => r.id !== refId
          ),
        });
      } else {
        updateWorldAtIndex(currentWorldIndex, {
          worldCreatures: (currentWorld.worldCreatures ?? []).filter(
            r => r.id !== refId
          ),
        });
      }
    },
    [currentWorld, currentWorldIndex, updateWorldAtIndex]
  );

  const displayItems = useMemo<LinkedItem[]>(() => {
    if (!currentWorld) return [];

    const chars = (currentWorld.worldCharacters ?? [])
      .map(ref => {
        const found = characterById.get(ref.characterId);
        if (!found) return null;
        const item: LinkedItem = {
          type: "character",
          refId: ref.id,
          data: found,
        };
        return item;
      })
      .filter((x): x is LinkedItem => x !== null);

    const cres = (currentWorld.worldCreatures ?? [])
      .map(ref => {
        const found = creatureById.get(ref.creatureId);
        if (!found) return null;
        const item: LinkedItem = {
          type: "creature",
          refId: ref.id,
          data: found,
        };
        return item;
      })
      .filter((x): x is LinkedItem => x !== null);

    return [...chars, ...cres];
  }, [currentWorld, characterById, creatureById]);

  const q = deferredSearch.trim().toLowerCase();

  const addModalItems = useMemo(() => {
    if (!currentWorld) return [];

    if (addTab === "character") {
      const added = new Set<ID>();
      (currentWorld.worldCharacters ?? []).forEach(r =>
        added.add(r.characterId)
      );

      return (data.characters ?? [])
        .filter(c => !added.has(c.id))
        .filter(c => (!q ? true : (c.name ?? "").toLowerCase().includes(q)))
        .map(c => ({
          id: c.id,
          name: c.name,
          profileImage: c.profileImage,
        }));
    } else {
      const added = new Set<ID>();
      (currentWorld.worldCreatures ?? []).forEach(r => added.add(r.creatureId));

      return (data.creatures ?? [])
        .filter(c => !added.has(c.id))
        .filter(c => (!q ? true : (c.name ?? "").toLowerCase().includes(q)))
        .map(c => ({
          id: c.id,
          name: c.name,
          profileImage: c.profileImage,
        }));
    }
  }, [addTab, currentWorld, data.characters, data.creatures, q]);

  const label = addTab === "character" ? "캐릭터" : "크리쳐";
  const isSearching = q.length > 0;

  const detailEntity = useMemo(() => {
    if (!detailOpen) return null;
    if (detailOpen.type === "character")
      return characterById.get(detailOpen.id) ?? null;
    return creatureById.get(detailOpen.id) ?? null;
  }, [detailOpen, characterById, creatureById]);

  const detailTagOptions = useMemo(() => [] as string[], []);

  // Empty state (no worlds)
  if (!currentWorld) {
    return (
      <div className="min-h-[100svh] gyeol-bg text-white p-6 md:p-10 flex items-center justify-center">
        <div className="max-w-xl mx-auto space-y-4 flex flex-col items-center">
          <div className="text-2xl font-display font-semibold">
            세계관이 없습니다
          </div>
          <div className="text-white/60 text-sm text-center">
            {editMode
              ? "편집 모드에서 세계관을 추가할 수 있어요."
              : "잠시 후 찾아와주세요."}
          </div>

          {editMode && (
            <GButton
              variant="primary"
              text="세계관 추가"
              onClick={() => setIsAddingWorld(true)}
            />
          )}

          <AddWorldModal
            open={isAddingWorld && editMode}
            onClose={() => {
              setIsAddingWorld(false);
              resetAddWorldDraft();
            }}
            name={newWorldName}
            setName={setNewWorldName}
            desc={newWorldDesc}
            setDesc={setNewWorldDesc}
            iconImage={newWorldIconImage}
            setIconImage={setNewWorldIconImage}
            bgImage={newWorldBackgroundImage}
            setBgImage={setNewWorldBackgroundImage}
            onSubmit={handleAddWorld}
          />
        </div>
      </div>
    );
  }

  // 실제로 표시되는(삭제되지 않은) 항목 기준 카운트
  const entityCounts = {
    all: displayItems.length,
    character: displayItems.filter(it => it.type === "character").length,
    creature: displayItems.filter(it => it.type === "creature").length,
  };

  return (
    <div className="relative min-h-[100svh] gyeol-bg text-white overflow-x-hidden">
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 md:px-10 lg:px-12 py-6 md:py-10">
        {/* #region Page Header */}
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="gyeol-eyebrow">Worlds</div>
            <h1 className="mt-2 text-3xl sm:text-4xl">세계관</h1>
          </div>

          {editMode && (
            <div className="flex items-center gap-2">
              <GButton
                variant="danger"
                icon={<Trash2 className="w-4 h-4" />}
                text="삭제"
                onClick={handleDeleteWorld}
                disabled={worlds.length === 1}
                title={
                  worlds.length === 1
                    ? "세계관이 하나뿐이라 삭제할 수 없어요"
                    : "현재 세계관 삭제"
                }
              />
              <GButton
                variant="primary"
                icon={<Plus className="w-4 h-4" />}
                text="세계관 추가"
                onClick={() => setIsAddingWorld(true)}
              />
            </div>
          )}
        </header>
        {/* #endregion */}

        {/* #region Hero */}
        <section
          ref={heroRef}
          className="relative mt-6 overflow-hidden rounded-[28px] border border-white/[0.08] bg-black min-h-[440px] sm:min-h-[520px] flex"
        >
          <AnimatePresence initial={false}>
            <motion.div
              key={currentWorld.id}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
            >
              {resolvedWorldBg ? (
                <img
                  src={resolvedWorldBg}
                  alt=""
                  draggable={false}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full gyeol-bg" />
              )}
            </motion.div>
          </AnimatePresence>

          {/* readability overlays */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/5" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/70 via-black/10 to-transparent" />

          {/* top controls */}
          <div className="absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-3 p-4 sm:p-5">
            {editMode ? (
              <button
                type="button"
                onClick={openBackgroundModal}
                className="inline-flex items-center gap-2 h-9 px-3.5 rounded-full bg-black/45 border border-white/15 backdrop-blur-md text-xs font-medium text-white/85 hover:bg-black/60 hover:text-white transition-colors"
              >
                <ImageIcon className="h-3.5 w-3.5" />
                아이콘 · 배경 변경
              </button>
            ) : (
              <span />
            )}

            {worlds.length > 1 && (
              <div className="flex items-center gap-1 rounded-full bg-black/45 border border-white/15 backdrop-blur-md p-1">
                <button
                  type="button"
                  onClick={handlePrevWorld}
                  title="이전 세계관"
                  className="grid place-items-center h-8 w-8 rounded-full text-white/75 hover:bg-white/15 hover:text-white transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="px-1.5 text-xs tabular-nums text-white/70">
                  {currentWorldIndex + 1} / {worlds.length}
                </span>
                <button
                  type="button"
                  onClick={handleNextWorld}
                  title="다음 세계관"
                  className="grid place-items-center h-8 w-8 rounded-full text-white/75 hover:bg-white/15 hover:text-white transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* content */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={currentWorld.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
              className="relative z-10 mt-auto w-full p-6 sm:p-10"
            >
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 sm:h-14 sm:w-14 shrink-0 overflow-hidden rounded-2xl border border-white/15 bg-black/40 shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
                  <WorldThumbCard
                    name={currentWorld.name}
                    image={currentWorld.iconImage}
                    className="[&>div]:rounded-none"
                  />
                </div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">
                  World {String(currentWorldIndex + 1).padStart(2, "0")}
                </div>
              </div>

              <EditableText
                as="h2"
                align="left"
                editable={editMode}
                value={currentWorld.name ?? ""}
                onChange={v =>
                  updateWorldAtIndex(currentWorldIndex, { name: v })
                }
                placeholder="세계관 이름"
                maxLength={60}
                className="mt-4 w-fit max-w-full font-display text-4xl sm:text-5xl md:text-6xl font-semibold tracking-[-0.03em] leading-[1.1] break-keep drop-shadow-[0_4px_24px_rgba(0,0,0,0.6)]"
              />

              <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-white/75">
                <span className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full bg-white/10 border border-white/10 backdrop-blur">
                  <UserRound className="h-3.5 w-3.5" />
                  캐릭터 {entityCounts.character}
                </span>
                <span className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full bg-white/10 border border-white/10 backdrop-blur">
                  <Sparkles className="h-3.5 w-3.5" />
                  크리쳐 {entityCounts.creature}
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  const to = `/worlds/${currentWorld.id}`;
                  const rect = heroRef.current?.getBoundingClientRect();
                  if (!rect) return setLocation(to);
                  dive({ rect, image: currentWorld.backgroundImage ?? "", to });
                }}
                className="group mt-7 inline-flex items-center gap-2 h-12 pl-6 pr-5 rounded-full border border-white/20 bg-white/10 text-white text-sm font-semibold backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_10px_40px_rgba(0,0,0,0.35)] transition-[background-color,border-color,transform] hover:bg-white/[0.18] hover:border-white/30 active:scale-[0.98]"
              >
                세계관 빠져들기
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </motion.div>
          </AnimatePresence>
        </section>
        {/* #endregion */}

        {/* #region World Switcher */}
        {worlds.length > 1 && (
          <nav
            aria-label="세계관 목록"
            className="mt-4 flex gap-2 overflow-x-auto scrollbar-none pb-1"
          >
            {worlds.map((w, i) => {
              const active = i === currentWorldIndex;
              return (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => setCurrentWorldIndex(i)}
                  className={cn(
                    "flex items-center gap-2.5 shrink-0 h-12 pl-1.5 pr-4 rounded-2xl border transition-colors",
                    active
                      ? "bg-white/[0.09] border-white/15 text-white"
                      : "bg-white/[0.02] border-white/[0.06] text-white/55 hover:bg-white/[0.05] hover:text-white/85"
                  )}
                >
                  <span className="h-9 w-9 overflow-hidden rounded-xl bg-white/5">
                    <WorldThumbCard name={w.name} image={w.iconImage} />
                  </span>
                  <span className="text-sm font-medium whitespace-nowrap">
                    {w.name || "이름 없음"}
                  </span>
                </button>
              );
            })}
          </nav>
        )}
        {/* #endregion */}

        {/* #region Body */}
        <div className="mt-10 sm:mt-12 space-y-10 sm:space-y-12">
          {/* Brief */}
          <WorldSection title="세계관 소개">
            {editMode ? (
              <EditableText
                as="p"
                multiline
                align="left"
                editable
                value={currentWorld.description ?? ""}
                onChange={v =>
                  updateWorldAtIndex(currentWorldIndex, { description: v })
                }
                placeholder="세계관 설정을 입력하세요 (Ctrl+Enter로 저장)"
                className="w-full max-w-3xl text-base leading-[1.9] text-white/75 break-keep"
              />
            ) : currentWorld.description ? (
              <p className="max-w-3xl text-base leading-[1.9] text-white/75 whitespace-pre-line break-keep">
                {currentWorld.description}
              </p>
            ) : (
              <p className="text-sm text-white/40">
                아직 소개가 작성되지 않았어요.
              </p>
            )}
          </WorldSection>

          {/* Linked entities */}
          <WorldSection
            title="등장 인물 · 존재"
            caption={`캐릭터 ${entityCounts.character} · 크리쳐 ${entityCounts.creature}`}
            action={
              editMode ? (
                <GButton
                  variant="neutral"
                  size="sm"
                  icon={<Plus className="w-4 h-4" />}
                  text="연결 추가"
                  onClick={() => {
                    setIsAddingItem(true);
                    setAddTab("character");
                    setSearch("");
                  }}
                />
              ) : undefined
            }
          >
            <LinkedEntityGallery
              items={displayItems}
              editMode={editMode}
              resetKey={currentWorld.id}
              onOpen={(type, id) => {
                setDetailOpen({ type, id });
                setDetailSubIndex(0);
              }}
              onUnlink={handleUnlinkItem}
            />
          </WorldSection>
        </div>
        {/* #endregion */}
      </div>
      {/* Modals */}
      <AddWorldModal
        open={isAddingWorld && editMode}
        onClose={() => {
          setIsAddingWorld(false);
          resetAddWorldDraft();
        }}
        name={newWorldName}
        setName={setNewWorldName}
        desc={newWorldDesc}
        setDesc={setNewWorldDesc}
        iconImage={newWorldIconImage}
        setIconImage={setNewWorldIconImage}
        bgImage={newWorldBackgroundImage}
        setBgImage={setNewWorldBackgroundImage}
        onSubmit={handleAddWorld}
      />

      <EditWorldMediaModal
        open={isEditingBackground && editMode}
        onClose={closeBackgroundModal}
        onSave={saveBackground}
        backgroundUrl={backgroundUrl}
        setBackgroundUrl={setBackgroundUrl}
        iconUrl={worldIconUrl}
        setIconUrl={setWorldIconUrl}
      />

      <AddWorldItemModal
        open={isAddingItem && editMode}
        onClose={() => {
          setIsAddingItem(false);
          setSearch("");
        }}
        addTab={addTab}
        setAddTab={setAddTab}
        search={search}
        setSearch={setSearch}
        label={label}
        isSearching={isSearching}
        items={addModalItems}
        onPick={handleAddItem}
      />
      {detailEntity && (
        <EntityDetailFullscreen
          entity={detailEntity as any}
          viewSubIndex={detailSubIndex}
          setViewSubIndex={setDetailSubIndex}
          onClose={() => {
            setDetailOpen(null);
            setDetailSubIndex(0);
          }}
          editable={false}
          onDelete={undefined}
          onPatch={undefined}
          tagOptions={detailTagOptions}
        />
      )}
    </div>
  );
}
