import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { ChevronLeft, ChevronRight, Plus, Trash2, Edit2 } from "lucide-react";

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
} from "@/types";

import { DEFAULT_WORLD_PROPER_NOUN_KINDS } from "@/lib/defaultData";
import { cn } from "@/lib/utils";

import EntityDetailFullscreen from "@/components/entities/detail/EntityDetailFullscreen";
import type { CharacterData, CreatureData } from "@/types";

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

  const [detailOpen, setDetailOpen] = useState<{
    type: AddTab; // "character" | "creature"
    id: ID;
  } | null>(null);

  const [detailSubIndex, setDetailSubIndex] = useState(0);

  useEffect(() => {
    if (!worlds.length) return;
    setCurrentWorldIndex(i => Math.min(Math.max(i, 0), worlds.length - 1));
  }, [worlds.length]);

  const updateWorldAtIndex = (index: number, patch: Partial<WorldData>) => {
    setData(prev => {
      const nextWorlds = [...(prev.worlds ?? [])];
      const target = nextWorlds[index];
      if (!target) return prev;
      nextWorlds[index] = { ...target, ...patch };
      return { ...prev, worlds: nextWorlds };
    });
  };

  const openBackgroundModal = () => {
    setBackgroundUrl(currentWorld?.backgroundImage ?? "");
    setWorldIconUrl(currentWorld?.iconImage ?? "");
    setIsEditingBackground(true);
  };

  const closeBackgroundModal = () => {
    setIsEditingBackground(false);
    setBackgroundUrl("");
    setWorldIconUrl("");
  };

  const saveBackground = () => {
    if (!currentWorld) return;
    updateWorldAtIndex(currentWorldIndex, {
      backgroundImage: backgroundUrl,
      iconImage: worldIconUrl,
    });
    closeBackgroundModal();
  };

  const resetAddWorldDraft = () => {
    setNewWorldName("");
    setNewWorldDesc("");
    setNewWorldIconImage("");
    setNewWorldBackgroundImage("");
  };

  const handleAddWorld = () => {
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
  };

  const handleDeleteWorld = () => {
    if (worlds.length <= 1) return;

    setData(prev => {
      const nextWorlds = (prev.worlds ?? []).filter(
        (_, i) => i !== currentWorldIndex
      );
      return { ...prev, worlds: nextWorlds };
    });

    setCurrentWorldIndex(i => Math.max(0, i - 1));
  };

  const handleNextWorld = () => {
    if (!worlds.length) return;
    setCurrentWorldIndex(prev => (prev + 1) % worlds.length);
  };

  const handlePrevWorld = () => {
    if (!worlds.length) return;
    setCurrentWorldIndex(prev => (prev - 1 + worlds.length) % worlds.length);
  };

  const handleAddItem = (id: ID) => {
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
  };

  const handleDeleteItemByRefId = (refId: ID, type: AddTab) => {
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
  };

  const displayItems = useMemo(() => {
    if (!currentWorld) return [];

    const chars = (currentWorld.worldCharacters ?? [])
      .map(ref => {
        const found = (data.characters ?? []).find(
          c => c.id === ref.characterId
        );
        if (!found) return null;
        return { type: "character" as const, refId: ref.id, data: found };
      })
      .filter(Boolean) as any[];

    const cres = (currentWorld.worldCreatures ?? [])
      .map(ref => {
        const found = (data.creatures ?? []).find(c => c.id === ref.creatureId);
        if (!found) return null;
        return { type: "creature" as const, refId: ref.id, data: found };
      })
      .filter(Boolean) as any[];

    return [...chars, ...cres];
  }, [currentWorld, data.characters, data.creatures]);

  const q = search.trim().toLowerCase();

  const filteredAddList = useMemo(() => {
    if (!currentWorld) return [];

    const added = new Set<ID>();
    if (addTab === "character") {
      (currentWorld.worldCharacters ?? []).forEach(r =>
        added.add(r.characterId)
      );
      return (data.characters ?? [])
        .filter(c => !added.has(c.id))
        .filter(c => (!q ? true : (c.name ?? "").toLowerCase().includes(q)));
    } else {
      (currentWorld.worldCreatures ?? []).forEach(r => added.add(r.creatureId));
      return (data.creatures ?? [])
        .filter(c => !added.has(c.id))
        .filter(c => (!q ? true : (c.name ?? "").toLowerCase().includes(q)));
    }
  }, [addTab, currentWorld, data.characters, data.creatures, q]);

  const label = addTab === "character" ? "캐릭터" : "크리쳐";
  const isSearching = q.length > 0;

  const stats = useMemo(() => {
    const linked =
      (currentWorld?.worldCharacters?.length ?? 0) +
      (currentWorld?.worldCreatures?.length ?? 0);

    return {
      worlds: worlds.length,
      linked,
      characters: currentWorld?.worldCharacters?.length ?? 0,
      creatures: currentWorld?.worldCreatures?.length ?? 0,
    };
  }, [currentWorld, worlds.length]);

  const detailEntity = useMemo(() => {
    if (!detailOpen) return null;

    if (detailOpen.type === "character") {
      return (data.characters ?? []).find(c => c.id === detailOpen.id) ?? null;
    }
    return (data.creatures ?? []).find(c => c.id === detailOpen.id) ?? null;
  }, [detailOpen, data.characters, data.creatures]);

  const detailTagOptions = useMemo(() => {
    // Worlds에서는 tagOptions가 꼭 필요 없으면 []로 두고,
    // 필요하면 settings의 카테고리에서 뽑는 방식(Characters.tsx처럼)로 확장 가능.
    return [] as string[];
  }, []);

  // Empty state (no worlds)
  if (!currentWorld) {
    return (
      <div className="min-h-screen gyeol-bg text-white p-10 flex items-center justify-center">
        <div className="max-w-xl mx-auto space-y-4 flex flex-col items-center">
          <div className="text-2xl font-bold">세계관이 없습니다</div>
          <div className="text-white/60 text-sm">
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
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.10),rgba(0,0,0,0.60))]" />

      <div className="relative z-10 px-6 md:px-10 lg:px-12 py-10 md:h-full flex flex-col">
        {/* TOP BAR */}
        <div className="flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            {editMode ? (
              <HUDBadge tone="warn">EDIT MODE</HUDBadge>
            ) : (
              <HUDBadge>VIEW MODE</HUDBadge>
            )}
            <HUDBadge>{`WORLDS ${stats.worlds}`}</HUDBadge>
            <HUDBadge>{`LINKED ${stats.linked}`}</HUDBadge>
          </div>
        </div>

        {/* DOSSIER */}
        <HUDPanel className="p-6 mt-6 shrink-0">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="min-w-0 flex-1 max-w-80">
              <div className="text-[11px] tracking-[0.26em] text-white/55">
                WORLDS
              </div>
              <div className="mt-2 flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-xl overflow-hidden bg-white/5 flex items-center justify-center shrink-0">
                  <WorldThumbCard
                    name={currentWorld.name}
                    image={currentWorld.iconImage}
                  />
                </div>

                {editMode ? (
                  <input
                    value={currentWorld.name}
                    onChange={e =>
                      updateWorldAtIndex(currentWorldIndex, {
                        name: e.target.value,
                      })
                    }
                    className="min-w-0 flex-1 bg-white/10 border border-white/0 rounded-xl px-3 py-2 text-white font-normal
                      focus:outline-none focus:ring-2 focus:ring-white/20"
                    placeholder="세계관 이름"
                  />
                ) : (
                  <div className="min-w-0 text-3xl font-extrabold tracking-tight truncate">
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
              <div className="mt-4">
                <div className="text-[12px] tracking-[0.26em] text-white/55">
                  WORLD BRIEF
                </div>

                <div className="mt-3">
                  {editMode ? (
                    <textarea
                      value={currentWorld.description}
                      onChange={e =>
                        updateWorldAtIndex(currentWorldIndex, {
                          description: e.target.value,
                        })
                      }
                      className="w-full min-h-18 p-3 rounded-xl bg-black/25 text-white border border-white/10
                            placeholder:text-white/30 outline-none focus:ring-2 focus:ring-white/15 focus:border-white/20 transition resize-none"
                      placeholder="세계관 설정을 입력하세요"
                    />
                  ) : (
                    <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">
                      {currentWorld.description || "설명이 없습니다"}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between lg:justify-end gap-3">
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

          <div className="mt-6"></div>
        </HUDPanel>

        {/* CONTENT: md+ fixed + internal scroll */}
        <div className="mt-4 flex-1 min-h-0">
          <div className="h-full overflow-hidden">
            <div className="h-full overflow-auto scroll-dark">
              <div className="grid grid-cols-1 lg:grid-cols-[1.25fr_0.95fr] gap-4">
                {/* LEFT: Preview + Description */}
                <HUDPanel className="p-4 md:p-6">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-[11px] tracking-[0.26em] text-white/55">
                        SCENE PREVIEW
                      </div>
                      <div className="mt-1 text-sm text-white/60">전경</div>
                    </div>

                    <GButton
                      variant="primary"
                      text="빠져들기"
                      onClick={() => setLocation(`/worlds/${currentWorld.id}`)}
                    />
                  </div>

                  <div className="mt-4">
                    <div
                      className="w-full aspect-[16/9] rounded-2xl overflow-hidden relative border border-white/10 bg-black/20"
                      style={{
                        backgroundImage: currentWorld.backgroundImage
                          ? `url(${currentWorld.backgroundImage})`
                          : undefined,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    >
                      {!currentWorld.backgroundImage && (
                        <div className="absolute inset-0 gyeol-bg" />
                      )}
                      <div className="absolute inset-0 bg-black/45 pointer-events-none" />

                      {/* subtle scanlines */}
                      <div className="pointer-events-none absolute inset-0 opacity-[0.12] bg-[linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px)] bg-[length:100%_3px]" />
                    </div>
                  </div>
                </HUDPanel>

                {/* RIGHT: Linked items */}
                <HUDPanel className="p-4 md:p-6">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-[11px] tracking-[0.26em] text-white/55">
                        LINKED ENTITIES
                      </div>
                      <div className="mt-1 text-sm text-white/60">
                        캐릭터/크리쳐
                      </div>
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

                  <div className="mt-8">
                    {displayItems.length === 0 ? (
                      <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-xs text-white/45">
                        등록된 항목이 없습니다.
                        {editMode ? " 오른쪽 상단 ‘추가’로 연결해줘." : ""}
                      </div>
                    ) : (
                      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
                        {displayItems.map(it => (
                          <button
                            key={it.refId}
                            type="button"
                            className="text-left"
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
                        ))}
                      </div>
                    )}
                  </div>
                </HUDPanel>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ Modals */}
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
          items={filteredAddList.map(x => ({
            id: x.id,
            name: x.name,
            profileImage: x.profileImage,
          }))}
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
            editable={editMode}
            onDelete={undefined}
            onPatch={undefined}
            tagOptions={detailTagOptions}
          />
        )}
      </div>
    </div>
  );
}
