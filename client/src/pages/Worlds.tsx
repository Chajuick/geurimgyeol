import ImageUpload from "@/components/ImageUpload";
import GButton from "@/components/ui/gyeol-button";
import Modal from "@/components/ui/modal";
import { usePortfolioContext } from "@/contexts/PortfolioContext";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Edit2,
} from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { useResolvedImage } from "@/hooks/useResolvedImage";
import WorldThumbCard from "@/components/worlds/WorldThumbCard";
import AddItemCard from "@/components/worlds/AddItemCard";

export default function Worlds() {
  const { data, setData, editMode } = usePortfolioContext();

  const [currentWorldIndex, setCurrentWorldIndex] = useState(0);
  const [currentDisplayIndex, setCurrentDisplayIndex] = useState(0);

  const [isAddingWorld, setIsAddingWorld] = useState(false);
  const [isAddingItem, setIsAddingItem] = useState(false);

  // ✅ Add World fields
  const [newWorldName, setNewWorldName] = useState("");
  const [newWorldDesc, setNewWorldDesc] = useState("");
  const [newWorldIconImage, setNewWorldIconImage] = useState("");
  const [newWorldBackgroundImage, setNewWorldBackgroundImage] = useState("");

  // ✅ Background edit (draft)
  const [isEditingBackground, setIsEditingBackground] = useState(false);
  const [backgroundUrl, setBackgroundUrl] = useState("");
  const [worldIconUrl, setWorldIconUrl] = useState("");

  // ✅ Add Item modal state
  const [addTab, setAddTab] = useState<"character" | "creature">("character");
  const [search, setSearch] = useState("");

  const worlds = data.worlds || [];
  const currentWorld = worlds[currentWorldIndex];

  const displayItems = useMemo(() => {
    const w = currentWorld;
    if (!w) return [];
    return [
      ...(w?.worldCharacters?.map((ref: any) => ({
        type: "character" as const,
        id: ref.id,
        characterId: ref.characterId,
        data: data.characters.find((c) => c.id === ref.characterId),
      })) || []),
      ...(w?.worldCreatures?.map((ref: any) => ({
        type: "creature" as const,
        id: ref.id,
        creatureId: ref.creatureId,
        data: data.creatures.find((c) => c.id === ref.creatureId),
      })) || []),
    ].filter((it) => !!it.data); // 안전: 없는 참조 제거
  }, [currentWorld, data.characters, data.creatures]);

  // ✅ display index 안전장치
  useEffect(() => {
    if (displayItems.length === 0) {
      setCurrentDisplayIndex(0);
      return;
    }
    setCurrentDisplayIndex((prev) =>
      Math.min(Math.max(prev, 0), displayItems.length - 1)
    );
  }, [displayItems.length]);

  useEffect(() => {
    if (!worlds.length) return;
    setCurrentWorldIndex((i) => Math.min(Math.max(i, 0), worlds.length - 1));
  }, [worlds.length]);

  const handleUpdateWorld = (updates: any) => {
    const nextWorlds = [...(data.worlds || [])];
    const target = nextWorlds[currentWorldIndex];
    if (!target) return;

    nextWorlds[currentWorldIndex] = { ...target, ...updates };
    setData({ ...data, worlds: nextWorlds });
  };

  const openBackgroundModal = () => {
    setBackgroundUrl(currentWorld?.backgroundImage || "");
    setWorldIconUrl(currentWorld?.iconImage || "");
    setIsEditingBackground(true);
  };

  const closeBackgroundModal = () => {
    setIsEditingBackground(false);
    setBackgroundUrl("");
    setWorldIconUrl("");
  };

  const saveBackground = () => {
    handleUpdateWorld({
      backgroundImage: backgroundUrl,
      iconImage: worldIconUrl,
    });
    closeBackgroundModal();
  };

  const handleAddWorld = () => {
    if (!newWorldName.trim()) return;

    const newWorld: any = {
      id: Date.now().toString(),
      name: newWorldName,
      description: newWorldDesc,
      iconImage: newWorldIconImage,
      mainImage: "",
      backgroundImage: newWorldBackgroundImage,
      creatures: [],
      relatedCharacters: [],
      relatedCreatures: [],
      worldCharacters: [],
      worldCreatures: [],
    };

    setData({ ...data, worlds: [...worlds, newWorld] });

    setNewWorldName("");
    setNewWorldDesc("");
    setNewWorldIconImage("");
    setNewWorldBackgroundImage("");

    setIsAddingWorld(false);
    setCurrentWorldIndex(worlds.length);
    setCurrentDisplayIndex(0);
  };

  const handleDeleteWorld = () => {
    if (worlds.length <= 1) return;
    const newWorlds = worlds.filter((_, i) => i !== currentWorldIndex);
    setData({ ...data, worlds: newWorlds });
    setCurrentWorldIndex(Math.max(0, currentWorldIndex - 1));
    setCurrentDisplayIndex(0);
  };

  const handleNextWorld = () => {
    setCurrentWorldIndex((prev) => (prev + 1) % worlds.length);
    setCurrentDisplayIndex(0);
  };

  const handlePrevWorld = () => {
    setCurrentWorldIndex((prev) => (prev - 1 + worlds.length) % worlds.length);
    setCurrentDisplayIndex(0);
  };

  const handleAddItem = (characterId?: string, creatureId?: string) => {
    if (!currentWorld) return;

    if (characterId) {
      const newRef = { id: Date.now().toString(), characterId };
      handleUpdateWorld({
        worldCharacters: [...(currentWorld?.worldCharacters || []), newRef],
      });
    } else if (creatureId) {
      const newRef = { id: Date.now().toString(), creatureId };
      handleUpdateWorld({
        worldCreatures: [...(currentWorld?.worldCreatures || []), newRef],
      });
    }

    setIsAddingItem(false);
    setSearch("");
    setCurrentDisplayIndex(displayItems.length);
  };

  const handleDeleteItemByRefId = (
    refId: string,
    type: "character" | "creature"
  ) => {
    if (!currentWorld) return;

    if (type === "character") {
      const newCharacters = (currentWorld.worldCharacters || []).filter(
        (ref: any) => ref.id !== refId
      );
      handleUpdateWorld({ worldCharacters: newCharacters });
    } else {
      const newCreatures = (currentWorld.worldCreatures || []).filter(
        (ref: any) => ref.id !== refId
      );
      handleUpdateWorld({ worldCreatures: newCreatures });
    }

    setCurrentDisplayIndex((prev) => Math.max(0, prev - 1));
  };

  // ✅ img: 키 렌더용 변환
  const resolvedWorldIcon = useResolvedImage(currentWorld?.iconImage || "");
  const resolvedWorldBg = useResolvedImage(currentWorld?.backgroundImage || "");

  // ✅ Empty state
  if (!currentWorld) {
    return (
      <>
        <div className="min-h-screen gyeol-bg text-white py-12 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg mb-4">
              {editMode ? "세계관을 추가해주세요" : "세계관이 존재하지 않습니다"}
            </p>
            {editMode && (
              <GButton
                variant="default"
                onClick={() => setIsAddingWorld(true)}
                text="세계관 추가"
              />
            )}
          </div>
        </div>

        <Modal
          open={isAddingWorld && editMode}
          onClose={() => {
            setIsAddingWorld(false);
            setNewWorldName("");
            setNewWorldDesc("");
            setNewWorldIconImage("");
            setNewWorldBackgroundImage("");
          }}
          title="세계관 추가"
          maxWidthClassName="max-w-md"
          footer={
            <div className="flex justify-end gap-2">
              <GButton
                variant="ghost"
                text="취소"
                onClick={() => {
                  setIsAddingWorld(false);
                  setNewWorldName("");
                  setNewWorldDesc("");
                  setNewWorldIconImage("");
                  setNewWorldBackgroundImage("");
                }}
              />
              <GButton variant="dark" text="추가" onClick={handleAddWorld} />
            </div>
          }
        >
          <div className="space-y-6">
            <div>
              <div className="mb-2 text-xs text-muted-foreground">
                세계관 아이콘 (권장: 64×64)
              </div>
              <ImageUpload
                value={newWorldIconImage}
                onChange={setNewWorldIconImage}
              />
            </div>

            <div>
              <div className="mb-2 text-xs text-muted-foreground">
                세계관 배경 이미지 (권장: 1920×1080)
              </div>
              <ImageUpload
                value={newWorldBackgroundImage}
                onChange={setNewWorldBackgroundImage}
              />
            </div>

            <div>
              <div className="mb-2 text-xs text-muted-foreground">세계관 이름</div>
              <input
                type="text"
                value={newWorldName}
                onChange={(e) => setNewWorldName(e.target.value)}
                placeholder="세계관 이름"
                className="w-full h-10 px-3 rounded-xl border border-border bg-background text-foreground
                  focus:outline-none focus:ring-2 focus:ring-white/20 transition"
                onKeyDown={(e) => e.key === "Enter" && handleAddWorld()}
              />
            </div>

            <div>
              <div className="mb-2 text-xs text-muted-foreground">설정</div>
              <textarea
                value={newWorldDesc}
                onChange={(e) => setNewWorldDesc(e.target.value)}
                placeholder="세계관 설정을 입력하세요"
                className="w-full min-h-28 p-3 rounded-xl border border-border bg-background text-foreground resize-none
                  focus:outline-none focus:ring-2 focus:ring-white/20 transition"
              />
            </div>
          </div>
        </Modal>
      </>
    );
  }

  // ✅ AddItem 리스트 + 빈상태 처리
  const addSource = addTab === "character" ? data.characters : data.creatures;
  const q = search.trim().toLowerCase();
  const filteredAddList = (addSource || []).filter((item) => {
    if (!q) return true;
    return (item.name || "").toLowerCase().includes(q);
  });
  const label = addTab === "character" ? "캐릭터" : "크리쳐";
  const isSearching = search.trim().length > 0;

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
                  {resolvedWorldIcon ? (
                    <img
                      src={resolvedWorldIcon}
                      alt="world icon"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs text-white/40">NO ICON</span>
                  )}
                </div>
              </div>
            </div>
          </aside>

          {/* CENTER */}
          <main className="w-full lg:flex-1 flex">
            <div className="w-full flex items-center justify-center lg:px-6">
              <div
                className="w-[90%] aspect-[16/9] max-h-[80vh] rounded-2xl overflow-hidden relative"
                style={{
                  backgroundImage: resolvedWorldBg ? `url(${resolvedWorldBg})` : undefined,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                {!resolvedWorldBg && <div className="absolute inset-0 gyeol-bg" />}
                <div className="absolute inset-0 bg-black/45 pointer-events-none" />
              </div>
            </div>
          </main>

          {/* RIGHT */}
          <aside className="w-full lg:w-[340px] shrink-0 lg:text-right lg:h-full lg:self-stretch">
            {/* ✅ space-y 대신 flex-col: 스크롤 영역 분배를 위해 */}
            <div className="h-full flex flex-col gap-4 lg:min-h-0">
              {/* ✅ TOP: 고정 영역 */}
              <div className="shrink-0 space-y-4">
                {/* name */}
                <div className="flex items-start justify-between gap-3 lg:flex-row-reverse">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      {editMode ? (
                        <>
                          <input
                            value={currentWorld.name}
                            onChange={(e) => handleUpdateWorld({ name: e.target.value })}
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
                        <div className="text-3xl font-semibold truncate">{currentWorld.name}</div>
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
                      variant="ghost"
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

              {/* ✅ DESCRIPTION: 일정 높이 + 스크롤 (lg 이상) */}
              <div className="shrink-0 lg:max-h-[240px] lg:min-h-[180px] lg:overflow-auto lg:pr-1 scroll-dark">
                {editMode && <div className="text-left text-xs text-white/60 mb-3">설정</div>}
                {editMode ? (
                  <textarea
                    value={currentWorld.description}
                    onChange={(e) => handleUpdateWorld({ description: e.target.value })}
                    className="w-full bg-white/10 border border-white/0 rounded-xl px-3 py-2 text-sm text-white
            focus:outline-none focus:ring-2 focus:ring-white/20 resize-none
            h-[180px] lg:h-full"
                    placeholder="세계관 설정을 입력하세요"
                  />
                ) : (
                  <p className="text-sm text-white/70 text-left leading-relaxed whitespace-pre-wrap
          max-h-[180px] lg:max-h-none overflow-auto lg:overflow-visible">
                    {currentWorld.description || "설명이 없습니다"}
                  </p>
                )}
              </div>

              {/* ✅ THUMBNAILS: 남는 공간 전부 + 내부 스크롤 */}
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
                      {displayItems.map((it, idx) => (
                        <WorldThumbCard
                          key={it.id}
                          name={it.data?.name}
                          image={it.data?.profileImage}
                          active={idx === currentDisplayIndex}
                          editMode={editMode}
                          onClick={() => setCurrentDisplayIndex(idx)}
                          onDelete={() => handleDeleteItemByRefId(it.id, it.type)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Add World Modal */}
        <Modal
          open={isAddingWorld && editMode}
          onClose={() => {
            setIsAddingWorld(false);
            setNewWorldName("");
            setNewWorldDesc("");
            setNewWorldIconImage("");
            setNewWorldBackgroundImage("");
          }}
          title="세계관 추가"
          maxWidthClassName="max-w-md"
          footer={
            <div className="flex justify-end gap-2">
              <GButton
                variant="default"
                text="취소"
                onClick={() => {
                  setIsAddingWorld(false);
                  setNewWorldName("");
                  setNewWorldDesc("");
                  setNewWorldIconImage("");
                  setNewWorldBackgroundImage("");
                }}
              />
              <GButton variant="dark" text="추가" onClick={handleAddWorld} />
            </div>
          }
        >
          <div className="space-y-6">
            <div>
              <div className="mb-2 text-xs text-muted-foreground">
                세계관 아이콘 (권장: 64×64)
              </div>
              <ImageUpload
                value={newWorldIconImage}
                onChange={setNewWorldIconImage}
              />
            </div>

            <div>
              <div className="mb-2 text-xs text-muted-foreground">
                세계관 배경 이미지 (권장: 1920×1080)
              </div>
              <ImageUpload
                value={newWorldBackgroundImage}
                onChange={setNewWorldBackgroundImage}
              />
            </div>

            <div>
              <div className="mb-2 text-xs text-muted-foreground">세계관 이름</div>
              <input
                type="text"
                value={newWorldName}
                onChange={(e) => setNewWorldName(e.target.value)}
                placeholder="세계관 이름"
                className="w-full h-10 px-3 rounded-xl border border-border bg-background text-foreground
                  focus:outline-none focus:ring-2 focus:ring-white/20 transition"
                onKeyDown={(e) => e.key === "Enter" && handleAddWorld()}
              />
            </div>

            <div>
              <div className="mb-2 text-xs text-muted-foreground">설정</div>
              <textarea
                value={newWorldDesc}
                onChange={(e) => setNewWorldDesc(e.target.value)}
                placeholder="세계관 설정을 입력하세요"
                className="w-full min-h-28 p-3 rounded-xl border border-border bg-background text-foreground resize-none
                  focus:outline-none focus:ring-2 focus:ring-white/20 transition"
              />
            </div>
          </div>
        </Modal>

        {/* Edit Background Modal */}
        <Modal
          open={isEditingBackground && editMode}
          onClose={closeBackgroundModal}
          title="배경/아이콘 변경"
          maxWidthClassName="max-w-2xl"
          footer={
            <div className="flex justify-end gap-2">
              <GButton variant="ghost" text="취소" onClick={closeBackgroundModal} />
              <GButton variant="dark" text="저장" onClick={saveBackground} />
            </div>
          }
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <p className="mb-2 text-xs font-medium text-foreground">
                배경 이미지
              </p>
              <ImageUpload value={backgroundUrl} onChange={setBackgroundUrl} />
            </div>

            <div>
              <p className="mb-2 text-xs font-medium text-foreground">
                세계관 아이콘 (권장: 64×64)
              </p>
              <ImageUpload value={worldIconUrl} onChange={setWorldIconUrl} />
            </div>
          </div>
        </Modal>

        {/* Add Item Modal */}
        <Modal
          open={isAddingItem && editMode}
          onClose={() => {
            setIsAddingItem(false);
            setSearch("");
          }}
          title="항목 추가"
          maxWidthClassName="max-w-3xl"
          footer={
            <div className="flex justify-end gap-2">
              <GButton
                variant="dark"
                text="닫기"
                onClick={() => {
                  setIsAddingItem(false);
                  setSearch("");
                }}
              />
            </div>
          }
        >
          {/* Tabs */}
          <div className="flex items-center gap-2 mb-4">
            <GButton
              variant={addTab === "character" ? "dark" : "default"}
              text="캐릭터"
              onClick={() => setAddTab("character")}
              className="flex-1"
            />
            <GButton
              variant={addTab === "creature" ? "dark" : "default"}
              text="크리쳐"
              onClick={() => setAddTab("creature")}
              className="flex-1"
            />
          </div>

          {/* Search */}
          <div className="mb-4">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`${label} 이름 검색`}
              className="w-full h-10 px-3 rounded-xl border border-border bg-background text-foreground
                focus:outline-none focus:ring-2 focus:ring-white/20 transition"
            />
          </div>

          {/* Grid / Empty */}
          {filteredAddList.length === 0 ? (
            <div className="rounded-2xl border border-border bg-secondary/20 p-6 text-center">
              <p className="text-sm font-medium text-foreground">
                {isSearching ? "검색 결과가 없습니다." : `${label}가 없습니다.`}
              </p>
              {!isSearching && (
                <p className="mt-2 text-xs text-muted-foreground">
                  좌측의 <b>{label}</b> 탭에서 {label}를 추가해주세요!
                </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {filteredAddList.map((item) => (
                <AddItemCard
                  key={item.id}
                  name={item.name}
                  image={item.profileImage}
                  onPick={() =>
                    addTab === "character"
                      ? handleAddItem(item.id)
                      : handleAddItem(undefined, item.id)
                  }
                />
              ))}
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}