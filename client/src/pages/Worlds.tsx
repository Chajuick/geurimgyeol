import React, { useCallback, useEffect, useMemo, useState, useDeferredValue } from "react";
import { useLocation } from "wouter";
import { ChevronLeft, ChevronRight, Plus, Trash2, Edit2, Unlink } from "lucide-react";

import GButton from "@/components/ui/gyeol-button";
import { HUDPanel, HUDBadge } from "@/components/ui/hud";
import WorldThumbCard from "@/components/worlds/WorldThumbCard";

import AddWorldModal from "@/components/worlds/modals/AddWorldModal";
import EditWorldMediaModal from "@/components/worlds/modals/EditWorldMediaModal";
import AddWorldItemModal from "@/components/worlds/modals/AddWorldItemModal";

import { usePortfolioContext } from "@/contexts/PortfolioContext";
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

  const [currentWorldIndex, setCurrentWorldIndex] = useState(0);
  const currentWorld = worlds[currentWorldIndex] ?? null;

  // ✅ background resolve (img: 키 포함 대응)
  const resolvedWorldBg = useResolvedImage(currentWorld?.backgroundImage ?? "");

  // ✅ entity lookup maps (O(1))
  const characterById = useMemo(() => {
    const m = new Map<ID, CharacterData>();
    (data.characters ?? []).forEach((c) => m.set(c.id, c));
    return m;
  }, [data.characters]);

  const creatureById = useMemo(() => {
    const m = new Map<ID, CreatureData>();
    (data.creatures ?? []).forEach((c) => m.set(c.id, c));
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

  const [detailOpen, setDetailOpen] = useState<{ type: AddTab; id: ID } | null>(null);
  const [detailSubIndex, setDetailSubIndex] = useState(0);

  // ✅ edit drafts (avoid setData on every keystroke)
  const [nameDraft, setNameDraft] = useState("");
  const [descDraft, setDescDraft] = useState("");

  useEffect(() => {
    if (!worlds.length) return;
    setCurrentWorldIndex((i) => Math.min(Math.max(i, 0), worlds.length - 1));
  }, [worlds.length]);

  const updateWorldAtIndex = useCallback(
    (index: number, patch: Partial<WorldData>) => {
      setData((prev) => {
        const nextWorlds = [...(prev.worlds ?? [])];
        const target = nextWorlds[index];
        if (!target) return prev;
        nextWorlds[index] = { ...target, ...patch };
        return { ...prev, worlds: nextWorlds };
      });
    },
    [setData]
  );

  // ✅ keep drafts in sync when switching worlds
  useEffect(() => {
    if (!currentWorld) return;
    setNameDraft(currentWorld.name ?? "");
    setDescDraft(currentWorld.description ?? "");
  }, [currentWorld?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ✅ debounce patch (name/desc)
  useEffect(() => {
    if (!editMode || !currentWorld) return;

    const t = window.setTimeout(() => {
      const nextName = nameDraft ?? "";
      if ((currentWorld.name ?? "") !== nextName) {
        updateWorldAtIndex(currentWorldIndex, { name: nextName });
      }
    }, 250);

    return () => window.clearTimeout(t);
  }, [nameDraft, editMode, currentWorld, currentWorldIndex, updateWorldAtIndex]);

  useEffect(() => {
    if (!editMode || !currentWorld) return;

    const t = window.setTimeout(() => {
      const nextDesc = descDraft ?? "";
      if ((currentWorld.description ?? "") !== nextDesc) {
        updateWorldAtIndex(currentWorldIndex, { description: nextDesc });
      }
    }, 250);

    return () => window.clearTimeout(t);
  }, [descDraft, editMode, currentWorld, currentWorldIndex, updateWorldAtIndex]);

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

      properNounKinds: DEFAULT_WORLD_PROPER_NOUN_KINDS.map((k) => ({
        ...k,
        meta: { ...(k as any).meta },
      })) as any,
      defaultProperNounKindId: "concept",

      properNouns: [],
      events: [],
    };

    setData((prev) => ({ ...prev, worlds: [...(prev.worlds ?? []), newWorld] }));

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

    setData((prev) => {
      const nextWorlds = (prev.worlds ?? []).filter((_, i) => i !== currentWorldIndex);
      return { ...prev, worlds: nextWorlds };
    });

    setCurrentWorldIndex((i) => Math.max(0, i - 1));
  }, [worlds.length, setData, currentWorldIndex]);

  const handleNextWorld = useCallback(() => {
    if (!worlds.length) return;
    setCurrentWorldIndex((prev) => (prev + 1) % worlds.length);
  }, [worlds.length]);

  const handlePrevWorld = useCallback(() => {
    if (!worlds.length) return;
    setCurrentWorldIndex((prev) => (prev - 1 + worlds.length) % worlds.length);
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
          worldCharacters: (currentWorld.worldCharacters ?? []).filter((r) => r.id !== refId),
        });
      } else {
        updateWorldAtIndex(currentWorldIndex, {
          worldCreatures: (currentWorld.worldCreatures ?? []).filter((r) => r.id !== refId),
        });
      }
    },
    [currentWorld, currentWorldIndex, updateWorldAtIndex]
  );

  const displayItems = useMemo(() => {
    if (!currentWorld) return [];

    const chars = (currentWorld.worldCharacters ?? [])
      .map((ref) => {
        const found = characterById.get(ref.characterId);
        if (!found) return null;
        return { type: "character" as const, refId: ref.id, data: found };
      })
      .filter(Boolean) as any[];

    const cres = (currentWorld.worldCreatures ?? [])
      .map((ref) => {
        const found = creatureById.get(ref.creatureId);
        if (!found) return null;
        return { type: "creature" as const, refId: ref.id, data: found };
      })
      .filter(Boolean) as any[];

    return [...chars, ...cres];
  }, [currentWorld, characterById, creatureById]);

  const q = deferredSearch.trim().toLowerCase();

  const addModalItems = useMemo(() => {
    if (!currentWorld) return [];

    if (addTab === "character") {
      const added = new Set<ID>();
      (currentWorld.worldCharacters ?? []).forEach((r) => added.add(r.characterId));

      return (data.characters ?? [])
        .filter((c) => !added.has(c.id))
        .filter((c) => (!q ? true : (c.name ?? "").toLowerCase().includes(q)))
        .map((c) => ({
          id: c.id,
          name: c.name,
          profileImage: c.profileImage,
        }));
    } else {
      const added = new Set<ID>();
      (currentWorld.worldCreatures ?? []).forEach((r) => added.add(r.creatureId));

      return (data.creatures ?? [])
        .filter((c) => !added.has(c.id))
        .filter((c) => (!q ? true : (c.name ?? "").toLowerCase().includes(q)))
        .map((c) => ({
          id: c.id,
          name: c.name,
          profileImage: c.profileImage,
        }));
    }
  }, [addTab, currentWorld, data.characters, data.creatures, q]);

  const label = addTab === "character" ? "캐릭터" : "크리쳐";
  const isSearching = q.length > 0;

  const stats = useMemo(() => {
    const linked =
      (currentWorld?.worldCharacters?.length ?? 0) + (currentWorld?.worldCreatures?.length ?? 0);

    return {
      worlds: worlds.length,
      linked,
      characters: currentWorld?.worldCharacters?.length ?? 0,
      creatures: currentWorld?.worldCreatures?.length ?? 0,
    };
  }, [currentWorld, worlds.length]);

  const detailEntity = useMemo(() => {
    if (!detailOpen) return null;
    if (detailOpen.type === "character") return characterById.get(detailOpen.id) ?? null;
    return creatureById.get(detailOpen.id) ?? null;
  }, [detailOpen, characterById, creatureById]);

  const detailTagOptions = useMemo(() => [] as string[], []);

  // Empty state (no worlds)
  if (!currentWorld) {
    return (
      <div className="min-h-[100svh] gyeol-bg text-white p-6 md:p-10 flex items-center justify-center">
        <div className="max-w-xl mx-auto space-y-4 flex flex-col items-center">
          <div className="text-2xl font-bold">세계관이 없습니다</div>
          <div className="text-white/60 text-sm text-center">
            {editMode ? "편집 모드에서 세계관을 추가할 수 있어요." : "잠시 후 찾아와주세요."}
          </div>

          {editMode && (
            <GButton variant="primary" text="세계관 추가" onClick={() => setIsAddingWorld(true)} />
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

  return (
    <div
      className={cn(
        "min-h-[100svh] gyeol-bg text-white relative overflow-x-hidden",
        "md:h-[100svh] md:overflow-hidden",
        // ✅ 높이 짧으면(md 폭이어도) 고정 해제 → 자연 스크롤
        "[@media(max-height:973px)]:md:h-auto",
        "[@media(max-height:973px)]:md:overflow-visible"
      )}
    >
      {/* background HUD vignette */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(255,255,255,0.07),transparent_45%),radial-gradient(circle_at_85%_30%,rgba(99,102,241,0.10),transparent_45%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.10),rgba(0,0,0,0.60))]" />

      {/* ✅ md 이상: h-full + flex-col + min-h-0 체계 필수 */}
      <div
        className={cn(
          "relative z-10 px-4 sm:px-6 md:px-10 lg:px-12 py-6 md:py-10 flex flex-col",
          "md:h-full",
          "[@media(max-height:973px)]:md:h-auto"
        )}
      >
        {/* TOP BAR */}
        <div className="flex items-center justify-between gap-3 shrink-0 h-10">
          <div className="flex items-center gap-2 flex-wrap">
            {editMode ? <HUDBadge tone="warn">EDIT</HUDBadge> : <HUDBadge>VIEW</HUDBadge>}
          </div>
        </div>

        {/* DOSSIER */}
        <HUDPanel className="p-6 mt-4 sm:mt-6 shrink-0">
          <div className="flex flex-col">
            <div className="text-[11px] tracking-[0.26em] text-white/55 pb-4">WORLDS</div>
            {/* ✅ 모바일에서 버튼 줄바꿈/정렬 안정화 */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="min-w-0 flex-1">

                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-xl overflow-hidden bg-white/5 flex items-center justify-center shrink-0">
                    <WorldThumbCard name={currentWorld.name} image={currentWorld.iconImage} />
                  </div>

                  {editMode ? (
                    <input
                      value={nameDraft}
                      onChange={(e) => setNameDraft(e.target.value)}
                      className="min-w-0 flex-1 bg-white/10 border border-white/0 rounded-xl px-3 py-2 text-white font-normal
                      focus:outline-none focus:ring-2 focus:ring-white/20"
                      placeholder="세계관 이름"
                    />
                  ) : (
                    <div className="min-w-0 text-2xl sm:text-3xl font-extrabold tracking-tight truncate">
                      {currentWorld.name}
                    </div>
                  )}

                  {editMode && (
                    <GButton
                      variant="ghost"
                      size="icon"
                      icon={<Edit2 className="w-5 h-5" />}
                      onClick={openBackgroundModal}
                      title="아이콘/배경 변경"
                    />
                  )}
                </div>
              </div>

              {/* ✅ 우측 컨트롤: 모바일에선 왼쪽 정렬 + 줄바꿈 */}
              <div className="flex items-center justify-between lg:justify-end gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <GButton
                    variant="ghost"
                    size="icon"
                    icon={<ChevronLeft className="w-5 h-5" />}
                    onClick={handlePrevWorld}
                    title="이전 세계관"
                  />
                  <div className="text-xs text-white/60 min-w-[64px] text-center">
                    {currentWorldIndex + 1} / {worlds.length}
                  </div>
                  <GButton
                    variant="ghost"
                    size="icon"
                    icon={<ChevronRight className="w-5 h-5" />}
                    onClick={handleNextWorld}
                    title="다음 세계관"
                  />
                </div>

                {editMode && (
                  <div className="flex items-center gap-2">
                    <GButton
                      variant="neutral"
                      icon={<Plus className="w-4 h-4" />}
                      text="추가"
                      onClick={() => setIsAddingWorld(true)}
                    />
                    <GButton
                      variant="danger"
                      icon={<Trash2 className="w-4 h-4" />}
                      text="삭제"
                      onClick={handleDeleteWorld}
                      disabled={worlds.length === 1}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* brief */}
            <div className="mt-4">
              <div className="text-[12px] tracking-[0.26em] text-white/55">WORLD BRIEF</div>

              <div className="mt-3">
                {editMode ? (
                  <textarea
                    value={descDraft}
                    onChange={(e) => setDescDraft(e.target.value)}
                    className="w-full min-h-24 p-3 rounded-xl bg-black/25 text-white border border-white/10
                            placeholder:text-white/30 outline-none focus:ring-2 focus:ring-white/15 focus:border-white/20 transition resize-none scroll-dark"
                    placeholder="세계관 설정을 입력하세요"
                  />
                ) : (
                  <p className="min-h-0 max-h-28 md:max-h-24 overflow-y-auto scroll-dark text-sm text-white/70 leading-relaxed whitespace-pre-wrap">
                    {currentWorld.description || "설명이 없습니다"}
                  </p>
                )}
              </div>
            </div>
          </div>
        </HUDPanel>

        {/* CONTENT */}
        {/* ✅ 모바일: 자연스럽게 아래로 늘어남 / md+: 남은 영역 flex-1로 고정 */}
        <div className="mt-4 md:mt-6 flex-1 min-h-0">
          {/* md 이상에선 내부 높이 고정이 필요 */}
          <div className={cn(
            "md:h-full md:overflow-hidden",
            "[@media(max-height:973px)]:md:h-auto",
            "[@media(max-height:973px)]:md:overflow-visible"
          )}>
            <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-4 md:h-full md:min-h-0 items-stretch">
              {/* LEFT */}
              <HUDPanel className="p-6 md:h-full md:min-h-0 flex flex-col overflow-hidden">
                {/* header */}
                <div className="flex items-center justify-between gap-3 shrink-0">
                  <div>
                    <div className="text-[11px] tracking-[0.26em] text-white/55">SCENE PREVIEW</div>
                    <div className="mt-1 text-sm text-white/60">전경</div>
                  </div>

                  <GButton
                    variant="primary"
                    text="빠져들기"
                    onClick={() => setLocation(`/worlds/${currentWorld.id}`)}
                  />
                </div>

                {/* preview */}
                <div className="mt-4 flex-1 min-h-[240px]">
                  <div
                    className="w-full h-full rounded-2xl overflow-hidden relative border border-white/10 bg-black/10"
                    style={{
                      backgroundImage: resolvedWorldBg ? `url(${resolvedWorldBg})` : undefined,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    {!resolvedWorldBg && <div className="absolute inset-0 gyeol-bg" />}
                    <div className="absolute inset-0 bg-black/10 pointer-events-none" />
                    <div className="pointer-events-none absolute inset-0 opacity-[0.12] bg-[linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px)] bg-[length:100%_3px]" />
                  </div>
                </div>
              </HUDPanel>

              {/* RIGHT */}
              <HUDPanel className="p-6 md:h-full md:min-h-0 flex flex-col min-h-0 md:max-h-[40vw] md:overflow-y-scroll">
                <div className="flex items-center justify-between gap-3 shrink-0">
                  <div>
                    <div className="text-[11px] tracking-[0.26em] text-white/55">LINKED ENTITIES</div>
                    <div className="mt-1 text-sm text-white/60">캐릭터/크리쳐</div>
                  </div>

                  {editMode && (
                    <GButton
                      variant="ghost"
                      icon={<Plus className="w-4 h-4" />}
                      text="추가"
                      onClick={() => {
                        setIsAddingItem(true);
                        setAddTab("character");
                        setSearch("");
                      }}
                    />
                  )}
                </div>

                {/* body */}
                {/* ✅ 모바일: 그냥 늘어나되, 너무 길면 자연 스크롤(페이지 스크롤) */}
                {/* ✅ md 이상: 이 영역만 스크롤 */}
                <div className={cn(
                  "mt-4 flex-1 min-h-0 scroll-dark pr-1",
                  "md:overflow-y-auto",
                  "[@media(max-height:973px)]:md:overflow-visible",
                  "[@media(max-height:973px)]:md:flex-none"
                )}>
                  {displayItems.length === 0 ? (
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-xs text-white/45">
                      등록된 항목이 없습니다.
                      {editMode ? " 오른쪽 상단 ‘추가’로 연결해줘." : ""}
                    </div>
                  ) : (
                    <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
                      {displayItems.map((it) => (
                        <div key={it.refId} className="relative group">
                          {/* 썸네일 클릭 = 상세 */}
                          <button
                            type="button"
                            className="w-full text-left"
                            onClick={() => {
                              setDetailOpen({ type: it.type, id: it.data.id });
                              setDetailSubIndex(0);
                            }}
                          >
                            <WorldThumbCard
                              name={it.data?.name}
                              image={it.data?.profileImage}
                              editMode={editMode}
                            />
                          </button>

                          {/* ✅ editMode일 때만 연결 해제 버튼 */}
                          {/* ✅ GButton danger unlink */}
                          {editMode && (
                            <GButton
                              variant="danger"
                              size="icon"
                              icon={<Unlink className="w-4 h-4" />}
                              title="연결 해제"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleUnlinkItem(it.refId, it.type);
                              }}
                              className={cn(
                                "absolute top-2 right-2 z-20",
                              )}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </HUDPanel>
            </div>
          </div>
        </div>


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