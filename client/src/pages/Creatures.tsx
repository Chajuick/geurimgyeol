import { usePortfolioContext } from '@/contexts/PortfolioContext';
import { Plus, Trash2, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useState } from 'react';
import ImageUpload from '@/components/ImageUpload';

export default function Creatures() {
  const { data, setData, editMode } = usePortfolioContext();
  const [selectedCreatureId, setSelectedCreatureId] = useState<string | null>(
    data.creatures[0]?.id || null
  );
  const [currentSubImageIndex, setCurrentSubImageIndex] = useState(0);
  const [isAddingCreature, setIsAddingCreature] = useState(false);
  const [newCreatureName, setNewCreatureName] = useState('');
  const [selectedModalCreatureId, setSelectedModalCreatureId] = useState<string | null>(null);
  const [modalSubImageIndex, setModalSubImageIndex] = useState(0);

  const creatures = data.creatures || [];
  const selectedCreature = creatures.find((c) => c.id === selectedCreatureId);
  const modalCreature = creatures.find((c) => c.id === selectedModalCreatureId);

  const handleAddCreature = () => {
    if (newCreatureName.trim()) {
      const newCreature: any = {
        id: Date.now().toString(),
        name: newCreatureName,
        mainCategory: data.settings.creatureCategories[0]?.main || '미분류',
        subCategory: data.settings.creatureCategories[0]?.subs[0] || '미분류',
        profileImage: '',
        mainImage: '',
        subImages: [],
        tags: [],
        description: '',
      };
      setData({
        ...data,
        creatures: [...creatures, newCreature],
      });
      setSelectedCreatureId(newCreature.id);
      setNewCreatureName('');
      setIsAddingCreature(false);
    }
  };

  const handleDeleteCreature = () => {
    if (selectedCreature && creatures.length > 1) {
      const newCreatures = creatures.filter((c) => c.id !== selectedCreatureId);
      setData({
        ...data,
        creatures: newCreatures,
      });
      setSelectedCreatureId(newCreatures[0]?.id || null);
    }
  };

  const handleUpdateCreature = (updates: any) => {
    if (!selectedCreature) return;
    const newCreatures = creatures.map((c) =>
      c.id === selectedCreatureId ? { ...c, ...updates } : c
    );
    setData({
      ...data,
      creatures: newCreatures,
    });
  };

  const handleAddSubImage = () => {
    const newSubImages = [...(selectedCreature?.subImages || [])];
    newSubImages.push({ image: '', description: '' });
    handleUpdateCreature({ subImages: newSubImages });
  };

  const handleUpdateSubImage = (index: number, updates: any) => {
    const newSubImages = [...(selectedCreature?.subImages || [])];
    newSubImages[index] = { ...newSubImages[index], ...updates };
    handleUpdateCreature({ subImages: newSubImages });
  };

  const handleDeleteSubImage = (index: number) => {
    const newSubImages = selectedCreature?.subImages?.filter(
      (_, i) => i !== index
    ) || [];
    handleUpdateCreature({ subImages: newSubImages });
    setCurrentSubImageIndex(Math.max(0, currentSubImageIndex - 1));
  };

  // 감상 모드 렌더링
  if (!editMode) {
    return (
      <div className="min-h-screen bg-background py-12 md:ml-64">
        <div className="container">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-2">크리쳐</h1>
            <p className="text-muted-foreground">
              크리쳐 갤러리
            </p>
          </div>

          {/* Grid Gallery */}
          {creatures.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {creatures.map((creature) => (
                <button
                  key={creature.id}
                  onClick={() => {
                    setSelectedModalCreatureId(creature.id);
                    setModalSubImageIndex(0);
                  }}
                  className="group relative aspect-square rounded-lg overflow-hidden border border-border hover:border-foreground transition-all duration-300 cursor-pointer"
                >
                  {/* Profile Image */}
                  <div className="w-full h-full bg-secondary">
                    {creature.profileImage ? (
                      <img
                        src={creature.profileImage}
                        alt={creature.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        이미지 없음
                      </div>
                    )}
                  </div>

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-end justify-start p-3">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <p className="text-white font-semibold text-sm">{creature.name}</p>
                      <p className="text-gray-300 text-xs">
                        {creature.mainCategory} / {creature.subCategory}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">크리쳐가 없습니다</p>
            </div>
          )}

          {/* Detail Modal */}
          {modalCreature && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
              <div className="bg-background rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto border border-border">
                {/* Header */}
                <div className="sticky top-0 bg-background border-b border-border p-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold">{modalCreature.name}</h2>
                  <button
                    onClick={() => {
                      setSelectedModalCreatureId(null);
                      setModalSubImageIndex(0);
                    }}
                    className="p-1 hover:bg-secondary rounded transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                  {/* Main Image */}
                  <div>
                    <p className="text-sm font-medium mb-3">메인 이미지</p>
                    <div className="aspect-video bg-secondary rounded-lg overflow-hidden border border-border">
                      {modalCreature.mainImage ? (
                        <img
                          src={modalCreature.mainImage}
                          alt="main"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          이미지 없음
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">메인 카테고리</p>
                      <p className="font-semibold">{modalCreature.mainCategory}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">서브 카테고리</p>
                      <p className="font-semibold">{modalCreature.subCategory}</p>
                    </div>
                  </div>

                  {/* Description */}
                  {modalCreature.description && (
                    <div>
                      <p className="text-sm font-medium mb-2">설명</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {modalCreature.description}
                      </p>
                    </div>
                  )}

                  {/* Sub Images */}
                  {modalCreature.subImages && modalCreature.subImages.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-medium">서브 이미지</p>
                        <span className="text-xs text-muted-foreground">
                          {modalSubImageIndex + 1} / {modalCreature.subImages.length}
                        </span>
                      </div>

                      {/* Main Sub Image Display */}
                      <div className="aspect-video bg-secondary rounded-lg overflow-hidden border border-border mb-4">
                        {modalCreature.subImages[modalSubImageIndex]?.image ? (
                          <img
                            src={modalCreature.subImages[modalSubImageIndex].image}
                            alt="sub"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            이미지 없음
                          </div>
                        )}
                      </div>

                      {/* Sub Image Description */}
                      {modalCreature.subImages[modalSubImageIndex]?.description && (
                        <p className="text-sm text-muted-foreground mb-4">
                          {modalCreature.subImages[modalSubImageIndex].description}
                        </p>
                      )}

                      {/* Navigation */}
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() =>
                            setModalSubImageIndex(
                              (prev) =>
                                (prev - 1 + modalCreature.subImages.length) %
                                modalCreature.subImages.length
                            )
                          }
                          className="p-2 hover:bg-secondary rounded transition-colors"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>

                        {/* Thumbnail Strip */}
                        <div className="flex gap-2 overflow-x-auto flex-1 mx-4 pb-2">
                          {modalCreature.subImages.map((subImg, idx) => (
                            <button
                              key={idx}
                              onClick={() => setModalSubImageIndex(idx)}
                              className={`flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-colors ${
                                idx === modalSubImageIndex
                                  ? 'border-foreground'
                                  : 'border-border hover:border-muted-foreground'
                              }`}
                            >
                              {subImg.image ? (
                                <img
                                  src={subImg.image}
                                  alt={`sub-${idx}`}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-secondary" />
                              )}
                            </button>
                          ))}
                        </div>

                        <button
                          onClick={() =>
                            setModalSubImageIndex(
                              (prev) =>
                                (prev + 1) % modalCreature.subImages.length
                            )
                          }
                          className="p-2 hover:bg-secondary rounded transition-colors"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 편집 모드 렌더링
  if (!selectedCreature) {
    return (
      <div className="min-h-screen bg-background py-12 md:ml-64 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg mb-4">크리쳐를 추가해주세요</p>
          {editMode && (
            <button
              onClick={() => setIsAddingCreature(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              크리쳐 추가
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 md:ml-64">
      <div className="container">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">크리쳐</h1>
          <p className="text-muted-foreground">
            크리쳐 목록을 관리하고 상세 정보를 편집합니다
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left - Creature List */}
          <div className="lg:col-span-1">
            <div className="space-y-2 mb-4">
              <h2 className="text-lg font-bold">크리쳐 목록</h2>
              {editMode && (
                <button
                  onClick={() => setIsAddingCreature(true)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm"
                >
                  <Plus className="w-4 h-4" />
                  추가
                </button>
              )}
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {creatures.map((creature) => (
                <button
                  key={creature.id}
                  onClick={() => {
                    setSelectedCreatureId(creature.id);
                    setCurrentSubImageIndex(0);
                  }}
                  className={`w-full p-3 rounded-lg text-left transition-colors ${
                    selectedCreatureId === creature.id
                      ? 'bg-foreground text-background'
                      : 'bg-secondary hover:bg-border'
                  }`}
                >
                  <div className="font-semibold text-sm">{creature.name}</div>
                  <div className="text-xs opacity-70">
                    {creature.mainCategory} / {creature.subCategory}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right - Creature Details */}
          <div className="lg:col-span-3 space-y-8">
            {/* Profile Image */}
            <div className="border border-border rounded-lg p-6 bg-secondary/50">
              <h3 className="text-lg font-bold mb-4">프로필 이미지</h3>
              {editMode ? (
                <ImageUpload
                  value={selectedCreature.profileImage}
                  onChange={(value) =>
                    handleUpdateCreature({ profileImage: value })
                  }
                  label="프로필 이미지"
                />
              ) : (
                <div className="w-32 h-32 bg-gray-900 rounded-lg overflow-hidden border border-border">
                  {selectedCreature.profileImage ? (
                    <img
                      src={selectedCreature.profileImage}
                      alt="profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      없음
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Basic Info */}
            <div className="border border-border rounded-lg p-6 bg-secondary/50 space-y-4">
              <h3 className="text-lg font-bold">기본 정보</h3>

              {editMode ? (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      이름
                    </label>
                    <input
                      type="text"
                      value={selectedCreature.name}
                      onChange={(e) =>
                        handleUpdateCreature({ name: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        메인 카테고리
                      </label>
                      <select
                        value={selectedCreature.mainCategory}
                        onChange={(e) =>
                          handleUpdateCreature({ mainCategory: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground"
                      >
                        {data.settings.creatureCategories.map((cat) => (
                          <option key={cat.main} value={cat.main}>
                            {cat.main}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        서브 카테고리
                      </label>
                      <select
                        value={selectedCreature.subCategory}
                        onChange={(e) =>
                          handleUpdateCreature({ subCategory: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground"
                      >
                        {data.settings.creatureCategories
                          .find((cat) => cat.main === selectedCreature.mainCategory)
                          ?.subs.map((sub) => (
                            <option key={sub} value={sub}>
                              {sub}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      설명
                    </label>
                    <textarea
                      value={selectedCreature.description}
                      onChange={(e) =>
                        handleUpdateCreature({ description: e.target.value })
                      }
                      placeholder="크리쳐 설명"
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground resize-none h-24"
                    />
                  </div>

                  <button
                    onClick={handleDeleteCreature}
                    disabled={creatures.length === 1}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-lg transition-colors text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    삭제
                  </button>
                </>
              ) : (
                <>
                  <div>
                    <div className="text-sm text-muted-foreground">이름</div>
                    <div className="font-semibold">{selectedCreature.name}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">
                        메인 카테고리
                      </div>
                      <div className="font-semibold">
                        {selectedCreature.mainCategory}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">
                        서브 카테고리
                      </div>
                      <div className="font-semibold">
                        {selectedCreature.subCategory}
                      </div>
                    </div>
                  </div>
                  {selectedCreature.description && (
                    <div>
                      <div className="text-sm text-muted-foreground">설명</div>
                      <div className="text-sm">{selectedCreature.description}</div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Main Image */}
            <div className="border border-border rounded-lg p-6 bg-secondary/50">
              <h3 className="text-lg font-bold mb-4">메인 이미지</h3>
              {editMode ? (
                <ImageUpload
                  value={selectedCreature.mainImage}
                  onChange={(value) =>
                    handleUpdateCreature({ mainImage: value })
                  }
                  label="메인 이미지"
                />
              ) : (
                <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden border border-border">
                  {selectedCreature.mainImage ? (
                    <img
                      src={selectedCreature.mainImage}
                      alt="main"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      없음
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sub Images */}
            <div className="border border-border rounded-lg p-6 bg-secondary/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">서브 이미지</h3>
                {editMode && (
                  <button
                    onClick={handleAddSubImage}
                    className="flex items-center gap-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    추가
                  </button>
                )}
              </div>

              {selectedCreature.subImages && selectedCreature.subImages.length > 0 ? (
                <div className="space-y-4">
                  {/* Sub Image Carousel */}
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() =>
                        setCurrentSubImageIndex(
                          (prev) =>
                            (prev - 1 + selectedCreature.subImages.length) %
                            selectedCreature.subImages.length
                        )
                      }
                      className="p-2 hover:bg-border rounded transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    <div className="flex-1 aspect-video bg-gray-900 rounded-lg overflow-hidden border border-border">
                      {selectedCreature.subImages[currentSubImageIndex]?.image ? (
                        <img
                          src={selectedCreature.subImages[currentSubImageIndex].image}
                          alt="sub"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          없음
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() =>
                        setCurrentSubImageIndex(
                          (prev) =>
                            (prev + 1) % selectedCreature.subImages.length
                        )
                      }
                      className="p-2 hover:bg-border rounded transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="text-center text-sm text-muted-foreground">
                    {currentSubImageIndex + 1} / {selectedCreature.subImages.length}
                  </div>

                  {/* Current Sub Image Edit */}
                  {editMode && (
                    <div className="space-y-4 border-t border-border pt-4">
                      <ImageUpload
                        value={
                          selectedCreature.subImages[currentSubImageIndex]?.image || ''
                        }
                        onChange={(value) =>
                          handleUpdateSubImage(currentSubImageIndex, {
                            image: value,
                          })
                        }
                        label="이미지"
                      />

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          설명
                        </label>
                        <textarea
                          value={
                            selectedCreature.subImages[currentSubImageIndex]
                              ?.description || ''
                          }
                          onChange={(e) =>
                            handleUpdateSubImage(currentSubImageIndex, {
                              description: e.target.value,
                            })
                          }
                          placeholder="이미지 설명"
                          className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground resize-none h-20"
                        />
                      </div>

                      <button
                        onClick={() => handleDeleteSubImage(currentSubImageIndex)}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                        삭제
                      </button>
                    </div>
                  )}
                </div>
              ) : editMode ? (
                <p className="text-muted-foreground text-sm">
                  서브 이미지를 추가해주세요
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Add Creature Modal */}
      {isAddingCreature && editMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background rounded-lg shadow-xl p-6 max-w-md w-full border border-border">
            <h2 className="text-2xl font-bold mb-4">크리쳐 추가</h2>
            <input
              type="text"
              value={newCreatureName}
              onChange={(e) => setNewCreatureName(e.target.value)}
              placeholder="크리쳐 이름"
              className="w-full px-4 py-2 border border-border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-foreground bg-secondary"
              onKeyPress={(e) => e.key === 'Enter' && handleAddCreature()}
            />
            <div className="flex gap-3">
              <button
                onClick={handleAddCreature}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                추가
              </button>
              <button
                onClick={() => {
                  setIsAddingCreature(false);
                  setNewCreatureName('');
                }}
                className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg font-semibold hover:bg-border transition-colors"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
