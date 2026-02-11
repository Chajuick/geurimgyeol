import ImageUpload from "@/components/ImageUpload";
import { usePortfolioContext } from "@/contexts/PortfolioContext";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Edit2,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

export default function Worlds() {
  const { data, setData, editMode } = usePortfolioContext();

  const [currentWorldIndex, setCurrentWorldIndex] = useState(0);
  const [currentDisplayIndex, setCurrentDisplayIndex] = useState(0);

  const [isAddingWorld, setIsAddingWorld] = useState(false);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [itemType, setItemType] = useState<"character" | "creature" | null>(
    null
  );

  // ✅ Add World fields
  const [newWorldName, setNewWorldName] = useState("");
  const [newWorldDesc, setNewWorldDesc] = useState("");
  const [newWorldIconImage, setNewWorldIconImage] = useState(""); // ✅ 64x64 icon image

  // ✅ Background edit
  const [isEditingBackground, setIsEditingBackground] = useState(false);
  const [backgroundUrl, setBackgroundUrl] = useState("");

  // ✅ World icon edit (draft)
  const [worldIconUrl, setWorldIconUrl] = useState("");

  const worlds = data.worlds || [];
  const currentWorld = worlds[currentWorldIndex];

  const displayItems = useMemo(() => {
    const w = currentWorld;
    if (!w) return [];
    return [
      ...(w?.worldCharacters?.map(ref => ({
        type: "character" as const,
        id: ref.id,
        characterId: ref.characterId,
        data: data.characters.find(c => c.id === ref.characterId),
      })) || []),
      ...(w?.worldCreatures?.map(ref => ({
        type: "creature" as const,
        id: ref.id,
        creatureId: ref.creatureId,
        data: data.creatures.find(c => c.id === ref.creatureId),
      })) || []),
    ];
  }, [currentWorld, data.characters, data.creatures]);

  const currentDisplay = displayItems[currentDisplayIndex];

  const handleUpdateWorld = (updates: any) => {
    const newWorlds = [...worlds];
    newWorlds[currentWorldIndex] = {
      ...currentWorld,
      ...updates,
    };
    setData({
      ...data,
      worlds: newWorlds,
    });
  };

  const openBackgroundModal = () => {
    setBackgroundUrl(currentWorld?.backgroundImage || "");
    setWorldIconUrl(currentWorld?.iconImage || "");
    setIsEditingBackground(true);
  };

  const saveBackground = () => {
    handleUpdateWorld({
      backgroundImage: backgroundUrl,
      iconImage: worldIconUrl,
    });
    setIsEditingBackground(false);
  };

  const handleAddWorld = () => {
    if (!newWorldName.trim()) return;

    const newWorld: any = {
      id: Date.now().toString(),
      name: newWorldName,
      description: newWorldDesc,
      iconImage: newWorldIconImage, // ✅ 64x64 icon
      mainImage: "",
      backgroundImage: "",
      creatures: [],
      relatedCharacters: [],
      relatedCreatures: [],
      worldCharacters: [],
      worldCreatures: [],
    };

    setData({
      ...data,
      worlds: [...worlds, newWorld],
    });

    setNewWorldName("");
    setNewWorldDesc("");
    setNewWorldIconImage("");

    setIsAddingWorld(false);
    setCurrentWorldIndex(worlds.length);
    setCurrentDisplayIndex(0);
  };

  const handleDeleteWorld = () => {
    if (worlds.length <= 1) return;
    const newWorlds = worlds.filter((_, i) => i !== currentWorldIndex);
    setData({
      ...data,
      worlds: newWorlds,
    });
    setCurrentWorldIndex(Math.max(0, currentWorldIndex - 1));
    setCurrentDisplayIndex(0);
  };

  const handleNextWorld = () => {
    setCurrentWorldIndex(prev => (prev + 1) % worlds.length);
    setCurrentDisplayIndex(0);
  };

  const handlePrevWorld = () => {
    setCurrentWorldIndex(prev => (prev - 1 + worlds.length) % worlds.length);
    setCurrentDisplayIndex(0);
  };

  const handleAddItem = (characterId?: string, creatureId?: string) => {
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
    setItemType(null);
    setCurrentDisplayIndex(displayItems.length); // 새 항목이 끝에 추가되니 끝으로 이동 느낌
  };

  const handleDeleteItem = () => {
    if (!currentDisplay) return;

    if (currentDisplay.type === "character") {
      const newCharacters = currentWorld.worldCharacters.filter(
        ref => ref.id !== currentDisplay.id
      );
      handleUpdateWorld({ worldCharacters: newCharacters });
    } else {
      const newCreatures = currentWorld.worldCreatures.filter(
        ref => ref.id !== currentDisplay.id
      );
      handleUpdateWorld({ worldCreatures: newCreatures });
    }

    setCurrentDisplayIndex(Math.max(0, currentDisplayIndex - 1));
  };

  const handleNextDisplay = () => {
    if (displayItems.length > 0) {
      setCurrentDisplayIndex(prev => (prev + 1) % displayItems.length);
    }
  };

  const handlePrevDisplay = () => {
    if (displayItems.length > 0) {
      setCurrentDisplayIndex(
        prev => (prev - 1 + displayItems.length) % displayItems.length
      );
    }
  };

  // ✅ Empty state
  if (!currentWorld) {
    return (
      <div className="min-h-screen bg-black text-white py-12 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg mb-4">세계관을 추가해주세요</p>
          {editMode && (
            <button
              onClick={() => setIsAddingWorld(true)}
              className="px-6 py-2 bg-white text-black rounded-lg hover:bg-zinc-200 transition-colors"
            >
              세계관 추가
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen text-white relative"
      style={{
        backgroundImage: currentWorld.backgroundImage
          ? `url(${currentWorld.backgroundImage})`
          : "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* dim */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
          radial-gradient(
            circle at center,
            rgba(0,0,0,0.15) 0%,
            rgba(0,0,0,0.35) 55%,
            rgba(0,0,0,0.6) 100%
          )
        `,
        }}
      />

      {/* CONTENT */}
      <div className="relative z-10 px-6 py-12 min-h-[100dvh] lg:h-[100dvh] lg:overflow-hidden">
        {/* 전체 그리드: 좌(LORE) / 중(이미지) / 우(관리패널) */}
        <div className="w-full h-full grid grid-cols-12 gap-6">
          {/* LEFT: LORE + 세계관 소개 + 아이콘 */}
          <aside className="col-span-12 md:col-span-3 lg:col-span-2">
            <div className="space-y-4">
              <div>
                <p className="text-lg text-white/60 mb-2">LORE</p>
                <h1 className="text-4xl font-extrabold tracking-tight">
                  세계관 소개
                </h1>
              </div>

              {/* 세계관 아이콘 영역 */}
              <div className="w-20 h-20 rounded-lg border border-white/10 bg-black/40 overflow-hidden flex items-center justify-center">
                {currentWorld.iconImage ? (
                  <img
                    src={currentWorld.iconImage}
                    alt="world icon"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xs text-white/40">NO ICON</span>
                )}
              </div>
            </div>
          </aside>

          {/* CENTER: 캐릭터/크리쳐 메인 이미지 + 서브 이미지 슬라이드 */}
          <main className="col-span-12 md:col-span-6 lg:col-span-7 lg:h-full">
            <div className="flex flex-col h-full gap-4">
              {/* 메인 이미지 */}
              <div className="flex-1 min-h-0 grid place-items-center">
                {currentDisplay?.data?.mainImage ? (
                  <img
                    src={currentDisplay.data.mainImage}
                    alt={currentDisplay.data.name}
                    className="max-h-[50vh] max-w-full w-auto object-contain"
                  />
                ) : (
                  <div className="h-[40vh] w-full flex items-center justify-center text-sm text-white/40 bg-black/30 rounded-2xl">
                    이미지가 없습니다
                  </div>
                )}
              </div>

              {/* 서브 이미지 */}
              <div className="shrink-0 lg:h-40">
                <div
                  className="
                    flex gap-3 pb-2 snap-x snap-mandatory
                    overflow-x-auto
                    justify-center
                    [&:has(div:nth-child(5))]:justify-start
                  "
                >
                  {(currentDisplay?.data?.subImages || []).length > 0 ? (
                    currentDisplay?.data?.subImages.map(
                      (subImg: any, idx: number) => (
                        <div
                          key={idx}
                          className="snap-start flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border border-white/10 bg-black/30"
                        >
                          {subImg?.image ? (
                            <img
                              src={subImg.image}
                              alt={`sub-${idx}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-white/40">
                              없음
                            </div>
                          )}
                        </div>
                      )
                    )
                  ) : (
                    <div className="text-xs text-white/40"></div>
                  )}
                </div>
              </div>
            </div>
          </main>

          {/* RIGHT: 관리 패널 2개 (World / Item) */}
          <section className="col-span-12 md:col-span-3 lg:col-span-3 space-y-4">
            {/* 세계관 관리 박스 */}
            <div className="rounded-2xl border-none bg-black/0 overflow-hidden">
              {/* 상단: 이름 + 세계관 넘기기 + 편집 버튼 */}
              <div className="border-b border-white/10">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    {editMode ? (
                      <input
                        value={currentWorld.name}
                        onChange={e =>
                          handleUpdateWorld({ name: e.target.value })
                        }
                        className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white font-normal focus:outline-none focus:border-white/30"
                        placeholder="세계관 이름"
                      />
                    ) : (
                      <div className="text-3xl font-normal truncate">
                        {currentWorld.name}
                      </div>
                    )}
                  </div>

                  {editMode && (
                    <button
                      onClick={openBackgroundModal}
                      className="h-10 w-10 rounded-xl bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center"
                      title="배경 변경"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {/* 세계관 이동 */}
                <div className="mt-3 flex items-center justify-between">
                  <button
                    onClick={handlePrevWorld}
                    className="h-9 w-9 rounded-xl bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <div className="text-xs text-white/60">
                    {currentWorldIndex + 1} / {worlds.length}
                  </div>

                  <button
                    onClick={handleNextWorld}
                    className="h-9 w-9 rounded-xl bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                {/* 세계관 추가/삭제 */}
                {editMode && (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setIsAddingWorld(true)}
                      className="h-10 rounded-xl bg-white text-black font-semibold hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" /> 추가
                    </button>
                    <button
                      onClick={handleDeleteWorld}
                      disabled={worlds.length === 1}
                      className="h-10 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 font-semibold"
                    >
                      <Trash2 className="w-4 h-4" /> 삭제
                    </button>
                  </div>
                )}
              </div>

              {/* 하단: 세계관 간단 설명 */}
              <div className="py-4">
                {editMode && (
                  <div className="text-xs text-white/60 mb-2">설정</div>
                )}
                {editMode ? (
                  <textarea
                    value={currentWorld.description}
                    onChange={e =>
                      handleUpdateWorld({ description: e.target.value })
                    }
                    className="w-full bg-white/10 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30 resize-none h-28"
                    placeholder="세계관 설정을 입력하세요"
                  />
                ) : (
                  <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">
                    {currentWorld.description || "설명이 없습니다"}
                  </p>
                )}
              </div>
            </div>

            {/* (BLUE) 캐릭터/크리쳐 관리 박스 */}
            <div className="rounded-2xl border border-none bg-black/0 overflow-hidden">
              {/* 상단: 이름 + 넘기기 */}
              <div className="pt-6 pb-2 border-b border-white/10">
                {editMode && (
                  <div className="text-xs text-white/60 mb-1">ITEM</div>
                )}

                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-2xl font-bold truncate mb-1">
                      {currentDisplay?.data?.name || "항목 없음"}
                    </div>
                    <div className="text-xs text-white/50">
                      {currentDisplay
                        ? `${currentDisplayIndex + 1} / ${displayItems.length}`
                        : "-"}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrevDisplay}
                      className="h-9 w-9 rounded-xl bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleNextDisplay}
                      className="h-9 w-9 rounded-xl bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* 추가/삭제 */}
                {editMode && (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setIsAddingItem(true)}
                      className="h-10 rounded-xl bg-white text-black font-semibold hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" /> 추가
                    </button>

                    <button
                      onClick={handleDeleteItem}
                      disabled={!currentDisplay}
                      className="h-10 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 font-semibold"
                    >
                      <Trash2 className="w-4 h-4" /> 삭제
                    </button>
                  </div>
                )}
              </div>

              {/* 하단: 항목 간단 설명 */}
              <div className="py-2">
                {editMode && (
                  <div className="text-xs text-white/60 mb-2">설명</div>
                )}
                <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">
                  {currentDisplay?.data?.description || "설명이 없습니다"}
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Add World Modal */}
        {isAddingWorld && editMode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <div className="bg-gray-900 rounded-lg shadow-xl p-6 max-w-md w-full border border-gray-700">
              <h2 className="text-2xl font-bold mb-4 text-white">
                세계관 추가
              </h2>

              <div className="mb-4">
                <label className="block text-xs text-gray-300 mb-2">
                  세계관 아이콘 (권장: 64×64)
                </label>
                <ImageUpload
                  value={newWorldIconImage}
                  onChange={setNewWorldIconImage}
                />
              </div>

              <div className="mb-3">
                <label className="block text-xs text-gray-300 mb-1">
                  세계관 이름
                </label>
                <input
                  type="text"
                  value={newWorldName}
                  onChange={e => setNewWorldName(e.target.value)}
                  placeholder="세계관 이름"
                  className="w-full px-4 py-2 border border-gray-600 rounded-lg focus:outline-none focus:border-white/40 bg-gray-800 text-white"
                  onKeyDown={e => e.key === "Enter" && handleAddWorld()}
                />
              </div>

              <div className="mb-4">
                <label className="block text-xs text-gray-300 mb-1">설정</label>
                <textarea
                  value={newWorldDesc}
                  onChange={e => setNewWorldDesc(e.target.value)}
                  placeholder="세계관 설정을 입력하세요"
                  className="w-full px-4 py-2 border border-gray-600 rounded-lg focus:outline-none focus:border-white/40 bg-gray-800 text-white resize-none h-24"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleAddWorld}
                  className="flex-1 px-4 py-2 bg-white text-black rounded-lg font-semibold hover:bg-zinc-200 transition-colors"
                >
                  추가
                </button>
                <button
                  onClick={() => {
                    setIsAddingWorld(false);
                    setNewWorldName("");
                    setNewWorldDesc("");
                    setNewWorldIconImage("");
                  }}
                  className="flex-1 px-4 py-2 bg-zinc-800 text-white rounded-lg font-semibold hover:bg-zinc-700 transition-colors"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Background Modal */}
        {isEditingBackground && editMode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* backdrop */}
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => {
                setIsEditingBackground(false);
                setBackgroundUrl("");
              }}
            />

            {/* panel */}
            <div
              className="
                relative w-full max-w-2xl
                rounded-2xl bg-white dark:bg-zinc-950
                shadow-2xl border border-zinc-200 dark:border-zinc-800
                flex flex-col
                max-h-[100dvh] lg:max-h-[85vh]
              "
            >
              {/* header (고정) */}
              <div className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-zinc-800">
                <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  배경 이미지 변경
                </h2>
                <button
                  onClick={() => {
                    setIsEditingBackground(false);
                    setBackgroundUrl("");
                  }}
                  className="h-8 w-8 flex items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                  aria-label="닫기"
                >
                  ✕
                </button>
              </div>

              {/* body (스크롤 영역) */}
              <div
                className="
                  flex-1 min-h-0
                  overflow-y-auto
                  px-5 py-6
                  flex flex-col gap-6
                  lg:flex-row
                "
              >
                {/* 배경 */}
                <div className="flex-1">
                  <p className="mb-2 text-xs font-medium text-zinc-900 dark:text-zinc-100">
                    배경 이미지
                  </p>
                  <ImageUpload
                    value={backgroundUrl}
                    onChange={setBackgroundUrl}
                  />
                </div>

                {/* 아이콘 */}
                <div className="flex-1">
                  <p className="mb-2 text-xs font-medium text-zinc-900 dark:text-zinc-100">
                    세계관 아이콘 (권장: 64×64)
                  </p>
                  <ImageUpload
                    value={worldIconUrl}
                    onChange={setWorldIconUrl}
                  />
                </div>
              </div>

              {/* footer (고정) */}
              <div className="shrink-0 flex justify-end gap-2 px-5 py-4 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  onClick={() => {
                    setIsEditingBackground(false);
                    setBackgroundUrl("");
                    setWorldIconUrl("");
                  }}
                  className="px-4 h-10 rounded-lg border border-zinc-200 text-black dark:border-zinc-800 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-900"
                >
                  취소
                </button>
                <button
                  onClick={saveBackground}
                  className="
        px-4 h-10 rounded-lg
        bg-black text-white
        text-sm font-semibold
        hover:bg-zinc-800 active:bg-zinc-900
        transition-colors
      "
                >
                  업로드
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Item Modal */}
        {isAddingItem && editMode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <div className="bg-gray-900 rounded-lg shadow-xl p-6 max-w-2xl w-full border border-gray-700 max-h-96 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">항목 추가</h2>
                <button
                  onClick={() => {
                    setIsAddingItem(false);
                    setItemType(null);
                  }}
                  className="p-1 hover:bg-gray-800 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {!itemType ? (
                <div className="space-y-3">
                  <button
                    onClick={() => setItemType("character")}
                    className="w-full px-4 py-3 bg-white text-black hover:bg-zinc-200 rounded-lg font-semibold transition-colors"
                  >
                    캐릭터 추가
                  </button>
                  <button
                    onClick={() => setItemType("creature")}
                    className="w-full px-4 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-white font-semibold transition-colors"
                  >
                    크리쳐 추가
                  </button>
                </div>
              ) : itemType === "character" ? (
                <div className="space-y-2">
                  {data.characters.map(char => (
                    <button
                      key={char.id}
                      onClick={() => handleAddItem(char.id)}
                      className="w-full p-3 text-left bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-3"
                    >
                      {char.profileImage && (
                        <img
                          src={char.profileImage}
                          alt={char.name}
                          className="w-10 h-10 rounded object-cover"
                        />
                      )}
                      <div>
                        <div className="font-semibold">{char.name}</div>
                        <div className="text-xs text-gray-400">
                          {char.mainCategory} / {char.subCategory}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {data.creatures.map(creature => (
                    <button
                      key={creature.id}
                      onClick={() => handleAddItem(undefined, creature.id)}
                      className="w-full p-3 text-left bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-3"
                    >
                      {creature.profileImage && (
                        <img
                          src={creature.profileImage}
                          alt={creature.name}
                          className="w-10 h-10 rounded object-cover"
                        />
                      )}
                      <div>
                        <div className="font-semibold">{creature.name}</div>
                        <div className="text-xs text-gray-400">
                          {creature.mainCategory} / {creature.subCategory}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
