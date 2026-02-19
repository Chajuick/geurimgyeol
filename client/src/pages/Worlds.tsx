import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { ChevronLeft, ChevronRight, Plus, Trash2, Edit2 } from "lucide-react";

import GButton from "@/components/ui/gyeol-button";
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

function makeId(): ID {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID() as ID;
  }
  return `${Date.now()}_${Math.random().toString(16).slice(2)}` as ID;
}

export default function Worlds() {
  const { data, setData, editMode } = usePortfolioContext();

  const worlds = data.worlds ?? [];
  const [currentWorldIndex, setCurrentWorldIndex] = useState(0);
  const currentWorld = worlds[currentWorldIndex];

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
  const [addTab, setAddTab] = useState<"character" | "creature">("character");
  const [search, setSearch] = useState("");

  // navigation
  const [_, setLocation] = useLocation();

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

  const handleDeleteItemByRefId = (
    refId: ID,
    type: "character" | "creature"
  ) => {
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

  // Empty state
  if (!currentWorld) {
    return (
      <div className="min-h-screen gyeol-bg text-white py-12 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg mb-4">
            {editMode ? "세계관을 추가해주세요" : "세계관이 존재하지 않습니다"}
          </p>
          {editMode && (
            <GButton
              variant="primary"
              onClick={() => setIsAddingWorld(true)}
              text="세계관 추가"
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
    <div className="min-h-screen text-white relative gyeol-bg">
      <div className="relative z-10 px-6 md:px-10 lg:px-12 py-12 min-h-[100dvh] lg:h-[100dvh] lg:overflow-hidden">
        <div className="w-full h-full flex flex-col gap-6 lg:flex-row lg:items-stretch lg:justify-between">
          {/* LEFT */}
          <aside className="shrink-0">
            <div className="space-y-5">
              <div>
                <p className="text-lg text-white/60 mb-2">LORE</p>
                <h1 className="text-4xl font-extrabold tracking-tight">
                  세계관 소개
                </h1>
              </div>

              <div className="flex items-start justify-between gap-3">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/5 flex items-center justify-center">
                  {/* 아이콘은 WorldThumbCard가 resolve 하는 구조라 여기선 단순 표시 */}
                  <WorldThumbCard
                    name={currentWorld.name}
                    image={currentWorld.iconImage}
                  />
                </div>
              </div>
              <GButton
                variant="primary"
                text="월드 디테일"
                onClick={() => setLocation(`/worlds/${currentWorld.id}`)}
              />
            </div>
          </aside>

          {/* CENTER */}
          <main className="w-full lg:flex-1 flex">
            <div className="w-full flex items-center justify-center lg:px-6">
              <div
                className="w-[90%] aspect-[16/9] max-h-[80vh] rounded-2xl overflow-hidden relative"
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
              </div>
            </div>
          </main>

          {/* RIGHT */}
          <aside className="w-full lg:w-[340px] shrink-0 lg:text-right lg:h-full lg:self-stretch">
            <div className="h-full flex flex-col gap-4 lg:min-h-0">
              {/* TOP */}
              <div className="shrink-0 space-y-4">
                {/* name */}
                <div className="flex items-start justify-between gap-3 lg:flex-row-reverse">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      {editMode ? (
                        <>
                          <input
                            value={currentWorld.name}
                            onChange={e =>
                              updateWorldAtIndex(currentWorldIndex, {
                                name: e.target.value,
                              })
                            }
                            className="flex-1 bg-white/10 border border-white/0 rounded-xl px-3 py-2 text-white font-normal
                              focus:outline-none focus:ring-2 focus:ring-white/20"
                            placeholder="세계관 이름"
                          />
                          <GButton
                            variant="ghost"
                            size="icon"
                            icon={<Edit2 className="w-5 h-5" />}
                            onClick={openBackgroundModal}
                            title="배경/아이콘 변경"
                          />
                        </>
                      ) : (
                        <div className="text-3xl font-semibold truncate">
                          {currentWorld.name}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* paging */}
                <div className="flex items-center justify-between lg:justify-start lg:gap-3">
                  <GButton
                    variant="ghost"
                    size="icon"
                    icon={<ChevronLeft className="w-5 h-5" />}
                    onClick={handlePrevWorld}
                    title="이전 세계관"
                  />
                  <div className="text-xs text-white/60">
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

                {/* add/delete world */}
                {editMode && (
                  <div className="grid grid-cols-2 gap-2 lg:justify-end">
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

              {/* DESCRIPTION */}
              <div className="shrink-0 lg:max-h-[250px] lg:min-h-[180px] lg:overflow-auto lg:pr-1 scroll-dark pt-6">
                {editMode && (
                  <div className="text-left text-xs text-white/60 mb-3">
                    설정
                  </div>
                )}
                {editMode ? (
                  <textarea
                    value={currentWorld.description}
                    onChange={e =>
                      updateWorldAtIndex(currentWorldIndex, {
                        description: e.target.value,
                      })
                    }
                    className="w-full min-h-28 p-3 rounded-xl bg-black/25 text-white border border-white/10
                      placeholder:text-white/30 outline-none focus:ring-2 focus:ring-white/15 focus:border-white/20 transition resize-none"
                    placeholder="세계관 설정을 입력하세요"
                  />
                ) : (
                  <p
                    className="text-sm text-white/70 text-left leading-relaxed whitespace-pre-wrap
                    max-h-[180px] lg:max-h-none overflow-auto lg:overflow-visible"
                  >
                    {currentWorld.description || "설명이 없습니다"}
                  </p>
                )}
              </div>

              {/* THUMBNAILS */}
              <div className="flex-1 min-h-0 overflow-hidden">
                <div className="h-full overflow-auto pr-1 scroll-dark">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm text-white/60">
                      캐릭터 / 크리쳐 ({displayItems.length})
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

                  {displayItems.length === 0 ? (
                    <div className="text-xs text-left text-white/40">
                      등록된 항목이 없습니다
                    </div>
                  ) : (
                    <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
                      {displayItems.map(it => (
                        <WorldThumbCard
                          key={it.refId}
                          name={it.data?.name}
                          image={it.data?.profileImage}
                          editMode={editMode}
                          onDelete={() =>
                            handleDeleteItemByRefId(it.refId, it.type)
                          }
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </aside>
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
      </div>
    </div>
  );
}
