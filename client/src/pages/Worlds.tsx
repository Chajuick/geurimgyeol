import { usePortfolioContext } from '@/contexts/PortfolioContext';
import { ChevronLeft, ChevronRight, Plus, Trash2, Edit2, X } from 'lucide-react';
import { useState } from 'react';

export default function Worlds() {
  const { data, setData, editMode } = usePortfolioContext();
  const [currentWorldIndex, setCurrentWorldIndex] = useState(0);
  const [currentDisplayIndex, setCurrentDisplayIndex] = useState(0);
  const [isAddingWorld, setIsAddingWorld] = useState(false);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [itemType, setItemType] = useState<'character' | 'creature' | null>(null);
  const [newWorldName, setNewWorldName] = useState('');
  const [isEditingBackground, setIsEditingBackground] = useState(false);
  const [backgroundUrl, setBackgroundUrl] = useState('');

  const worlds = data.worlds || [];
  const currentWorld = worlds[currentWorldIndex];
  const displayItems = [
    ...(currentWorld?.worldCharacters?.map((ref) => ({
      type: 'character' as const,
      id: ref.id,
      characterId: ref.characterId,
      data: data.characters.find((c) => c.id === ref.characterId),
    })) || []),
    ...(currentWorld?.worldCreatures?.map((ref) => ({
      type: 'creature' as const,
      id: ref.id,
      creatureId: ref.creatureId,
      data: data.creatures.find((c) => c.id === ref.creatureId),
    })) || []),
  ];

  const currentDisplay = displayItems[currentDisplayIndex];

  const handleAddWorld = () => {
    if (newWorldName.trim()) {
      const newWorld: any = {
        id: Date.now().toString(),
        name: newWorldName,
        description: '',
        icon: '🌍',
        mainImage: '',
        backgroundImage: '',
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
      setNewWorldName('');
      setIsAddingWorld(false);
      setCurrentWorldIndex(worlds.length);
    }
  };

  const handleDeleteWorld = () => {
    if (worlds.length > 1) {
      const newWorlds = worlds.filter((_, i) => i !== currentWorldIndex);
      setData({
        ...data,
        worlds: newWorlds,
      });
      setCurrentWorldIndex(Math.max(0, currentWorldIndex - 1));
    }
  };

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

  const handleNextWorld = () => {
    setCurrentWorldIndex((prev) => (prev + 1) % worlds.length);
    setCurrentDisplayIndex(0);
  };

  const handlePrevWorld = () => {
    setCurrentWorldIndex((prev) => (prev - 1 + worlds.length) % worlds.length);
    setCurrentDisplayIndex(0);
  };

  const handleAddItem = (characterId?: string, creatureId?: string) => {
    if (characterId) {
      const newRef = {
        id: Date.now().toString(),
        characterId,
      };
      handleUpdateWorld({
        worldCharacters: [...(currentWorld?.worldCharacters || []), newRef],
      });
    } else if (creatureId) {
      const newRef = {
        id: Date.now().toString(),
        creatureId,
      };
      handleUpdateWorld({
        worldCreatures: [...(currentWorld?.worldCreatures || []), newRef],
      });
    }
    setIsAddingItem(false);
    setItemType(null);
  };

  const handleDeleteItem = () => {
    if (!currentDisplay) return;

    if (currentDisplay.type === 'character') {
      const newCharacters = currentWorld.worldCharacters.filter(
        (ref) => ref.id !== currentDisplay.id
      );
      handleUpdateWorld({ worldCharacters: newCharacters });
    } else {
      const newCreatures = currentWorld.worldCreatures.filter(
        (ref) => ref.id !== currentDisplay.id
      );
      handleUpdateWorld({ worldCreatures: newCreatures });
    }

    setCurrentDisplayIndex(Math.max(0, currentDisplayIndex - 1));
  };

  const handleNextDisplay = () => {
    if (displayItems.length > 0) {
      setCurrentDisplayIndex((prev) => (prev + 1) % displayItems.length);
    }
  };

  const handlePrevDisplay = () => {
    if (displayItems.length > 0) {
      setCurrentDisplayIndex(
        (prev) => (prev - 1 + displayItems.length) % displayItems.length
      );
    }
  };

  const saveBackground = () => {
    handleUpdateWorld({
      backgroundImage: backgroundUrl,
    });
    setIsEditingBackground(false);
  };

  if (!currentWorld) {
    return (
      <div className="min-h-screen bg-black text-white py-12 md:ml-64 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg mb-4">세계관을 추가해주세요</p>
          {editMode && (
            <button
              onClick={() => setIsAddingWorld(true)}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
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
      className="min-h-screen bg-black text-white py-12 md:ml-64 relative"
      style={{
        backgroundImage: currentWorld.backgroundImage
          ? `url(${currentWorld.backgroundImage})`
          : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="absolute inset-0 bg-black/60" />

      <div className="relative z-10">
        {/* Header */}
        <div className="container mb-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-sm text-gray-400 mb-2">LORE</p>
              <h1 className="text-4xl font-bold">세계관 소개</h1>
            </div>
            {editMode && (
              <button
                onClick={() => setIsEditingBackground(true)}
                className="p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                title="배경 이미지 변경"
              >
                <Edit2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Left - Central Display */}
            <div className="lg:col-span-2">
              {currentDisplay && currentDisplay.data ? (
                <div className="space-y-4">
                  {/* Main Image */}
                  <div className="aspect-video bg-black/40 rounded-lg overflow-hidden border border-gray-700 flex items-center justify-center">
                    <img
                      src={currentDisplay.data.mainImage}
                      alt={currentDisplay.data.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Title and Navigation */}
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">{currentDisplay.data.name}</h2>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={handlePrevDisplay}
                        className="p-2 hover:bg-white/10 rounded transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <span className="text-sm text-gray-400">
                        {currentDisplayIndex + 1} / {displayItems.length}
                      </span>
                      <button
                        onClick={handleNextDisplay}
                        className="p-2 hover:bg-white/10 rounded transition-colors"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Description */}
                  {currentDisplay.data.description && (
                    <p className="text-sm text-gray-300">
                      {currentDisplay.data.description}
                    </p>
                  )}

                  {/* Sub Images */}
                  {currentDisplay.data.subImages && currentDisplay.data.subImages.length > 0 && (
                    <div className="mt-6">
                      <p className="text-xs text-gray-400 mb-3">서브 이미지</p>
                      <div className="flex gap-3 overflow-x-auto pb-2">
                        {currentDisplay.data.subImages.map((subImg, idx) => (
                          <div
                            key={idx}
                            className="flex-shrink-0 w-24 h-24 bg-black/40 rounded-lg overflow-hidden border border-gray-700"
                          >
                            {subImg.image ? (
                              <img
                                src={subImg.image}
                                alt={`sub-${idx}`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-600">
                                없음
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {editMode && (
                    <button
                      onClick={handleDeleteItem}
                      className="w-full px-3 py-2 bg-red-600 hover:bg-red-700 rounded transition-colors text-sm flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      항목 삭제
                    </button>
                  )}
                </div>
              ) : editMode ? (
                <div className="aspect-video bg-black/40 rounded-lg border-2 border-dashed border-gray-600 flex items-center justify-center">
                  <p className="text-gray-500">항목을 추가해주세요</p>
                </div>
              ) : (
                <div className="aspect-video bg-black/40 rounded-lg border border-gray-700 flex items-center justify-center">
                  <p className="text-gray-500">항목이 없습니다</p>
                </div>
              )}
            </div>

            {/* Right - World Info Panel */}
            <div className="border-2 border-red-600 rounded-lg p-6 bg-black/40">
              {/* World Name */}
              <div className="mb-6">
                {editMode ? (
                  <input
                    type="text"
                    value={currentWorld.name}
                    onChange={(e) =>
                      handleUpdateWorld({ name: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded text-white text-xl font-bold focus:outline-none focus:border-red-600"
                  />
                ) : (
                  <h2 className="text-2xl font-bold text-white">
                    {currentWorld.name}
                  </h2>
                )}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={handlePrevWorld}
                  className="p-2 hover:bg-white/10 rounded transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm text-gray-400">
                  {currentWorldIndex + 1} / {worlds.length}
                </span>
                <button
                  onClick={handleNextWorld}
                  className="p-2 hover:bg-white/10 rounded transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Description */}
              <div className="mb-6">
                {editMode ? (
                  <textarea
                    value={currentWorld.description}
                    onChange={(e) =>
                      handleUpdateWorld({ description: e.target.value })
                    }
                    placeholder="세계관 설명을 입력하세요"
                    className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-red-600 resize-none h-24"
                  />
                ) : (
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {currentWorld.description || '설명이 없습니다'}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              {editMode && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsAddingWorld(true)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    추가
                  </button>
                  <button
                    onClick={handleDeleteWorld}
                    disabled={worlds.length === 1}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded transition-colors text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    삭제
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Add Item Button */}
          {editMode && (
            <div className="border border-blue-600 rounded-lg p-8 bg-black/40 text-center">
              <p className="text-gray-400 mb-4">캐릭터나 크리쳐를 추가해주세요</p>
              <button
                onClick={() => setIsAddingItem(true)}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors flex items-center justify-center gap-2 mx-auto"
              >
                <Plus className="w-4 h-4" />
                항목 추가
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add World Modal */}
      {isAddingWorld && editMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-gray-900 rounded-lg shadow-xl p-6 max-w-md w-full border border-gray-700">
            <h2 className="text-2xl font-bold mb-4 text-white">세계관 추가</h2>
            <input
              type="text"
              value={newWorldName}
              onChange={(e) => setNewWorldName(e.target.value)}
              placeholder="세계관 이름"
              className="w-full px-4 py-2 border border-gray-600 rounded-lg mb-4 focus:outline-none focus:border-blue-600 bg-gray-800 text-white"
              onKeyPress={(e) => e.key === 'Enter' && handleAddWorld()}
            />
            <div className="flex gap-3">
              <button
                onClick={handleAddWorld}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                추가
              </button>
              <button
                onClick={() => {
                  setIsAddingWorld(false);
                  setNewWorldName('');
                }}
                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Background Modal */}
      {isEditingBackground && editMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-gray-900 rounded-lg shadow-xl p-6 max-w-md w-full border border-gray-700">
            <h2 className="text-2xl font-bold mb-4 text-white">배경 이미지 변경</h2>
            <input
              type="text"
              value={backgroundUrl}
              onChange={(e) => setBackgroundUrl(e.target.value)}
              placeholder="이미지 URL"
              className="w-full px-4 py-2 border border-gray-600 rounded-lg mb-4 focus:outline-none focus:border-blue-600 bg-gray-800 text-white"
            />
            <div className="flex gap-3">
              <button
                onClick={saveBackground}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                저장
              </button>
              <button
                onClick={() => {
                  setIsEditingBackground(false);
                  setBackgroundUrl('');
                }}
                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
              >
                취소
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
                  onClick={() => setItemType('character')}
                  className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold transition-colors"
                >
                  캐릭터 추가
                </button>
                <button
                  onClick={() => setItemType('creature')}
                  className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-semibold transition-colors"
                >
                  크리쳐 추가
                </button>
              </div>
            ) : itemType === 'character' ? (
              <div className="space-y-2">
                {data.characters.map((char) => (
                  <button
                    key={char.id}
                    onClick={() => {
                      handleAddItem(char.id);
                    }}
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
                {data.creatures.map((creature) => (
                  <button
                    key={creature.id}
                    onClick={() => {
                      handleAddItem(undefined, creature.id);
                    }}
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
  );
}
