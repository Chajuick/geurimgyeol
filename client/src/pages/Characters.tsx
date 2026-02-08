import { usePortfolioContext } from '@/contexts/PortfolioContext';
import { Plus, Trash2, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useState } from 'react';
import ImageUpload from '@/components/ImageUpload';

export default function Characters() {
  const { data, setData, editMode } = usePortfolioContext();
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(
    data.characters[0]?.id || null
  );
  const [currentSubImageIndex, setCurrentSubImageIndex] = useState(0);
  const [isAddingCharacter, setIsAddingCharacter] = useState(false);
  const [newCharacterName, setNewCharacterName] = useState('');
  const [selectedModalCharacterId, setSelectedModalCharacterId] = useState<string | null>(null);
  const [modalSubImageIndex, setModalSubImageIndex] = useState(0);

  const characters = data.characters || [];
  const selectedCharacter = characters.find((c) => c.id === selectedCharacterId);
  const modalCharacter = characters.find((c) => c.id === selectedModalCharacterId);

  const handleAddCharacter = () => {
    if (newCharacterName.trim()) {
      const newCharacter: any = {
        id: Date.now().toString(),
        name: newCharacterName,
        mainCategory: data.settings.characterCategories[0]?.main || '미분류',
        subCategory: data.settings.characterCategories[0]?.subs[0] || '미분류',
        profileImage: '',
        mainImage: '',
        subImages: [],
        tags: [],
        description: '',
      };
      setData({
        ...data,
        characters: [...characters, newCharacter],
      });
      setSelectedCharacterId(newCharacter.id);
      setNewCharacterName('');
      setIsAddingCharacter(false);
    }
  };

  const handleDeleteCharacter = () => {
    if (selectedCharacter && characters.length > 1) {
      const newCharacters = characters.filter((c) => c.id !== selectedCharacterId);
      setData({
        ...data,
        characters: newCharacters,
      });
      setSelectedCharacterId(newCharacters[0]?.id || null);
    }
  };

  const handleUpdateCharacter = (updates: any) => {
    if (!selectedCharacter) return;
    const newCharacters = characters.map((c) =>
      c.id === selectedCharacterId ? { ...c, ...updates } : c
    );
    setData({
      ...data,
      characters: newCharacters,
    });
  };

  const handleAddSubImage = () => {
    const newSubImages = [...(selectedCharacter?.subImages || [])];
    newSubImages.push({ image: '', description: '' });
    handleUpdateCharacter({ subImages: newSubImages });
  };

  const handleUpdateSubImage = (index: number, updates: any) => {
    const newSubImages = [...(selectedCharacter?.subImages || [])];
    newSubImages[index] = { ...newSubImages[index], ...updates };
    handleUpdateCharacter({ subImages: newSubImages });
  };

  const handleDeleteSubImage = (index: number) => {
    const newSubImages = selectedCharacter?.subImages?.filter(
      (_, i) => i !== index
    ) || [];
    handleUpdateCharacter({ subImages: newSubImages });
    setCurrentSubImageIndex(Math.max(0, currentSubImageIndex - 1));
  };

  // 감상 모드 렌더링
  if (!editMode) {
    return (
      <div className="min-h-screen bg-background py-12 md:ml-64">
        <div className="container">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-2">캐릭터</h1>
            <p className="text-muted-foreground">
              캐릭터 갤러리
            </p>
          </div>

          {/* Grid Gallery */}
          {characters.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {characters.map((char) => (
                <button
                  key={char.id}
                  onClick={() => {
                    setSelectedModalCharacterId(char.id);
                    setModalSubImageIndex(0);
                  }}
                  className="group relative aspect-square rounded-lg overflow-hidden border border-border hover:border-foreground transition-all duration-300 cursor-pointer"
                >
                  {/* Profile Image */}
                  <div className="w-full h-full bg-secondary">
                    {char.profileImage ? (
                      <img
                        src={char.profileImage}
                        alt={char.name}
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
                      <p className="text-white font-semibold text-sm">{char.name}</p>
                      <p className="text-gray-300 text-xs">
                        {char.mainCategory} / {char.subCategory}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">캐릭터가 없습니다</p>
            </div>
          )}

          {/* Detail Modal */}
          {modalCharacter && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
              <div className="bg-background rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto border border-border">
                {/* Header */}
                <div className="sticky top-0 bg-background border-b border-border p-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold">{modalCharacter.name}</h2>
                  <button
                    onClick={() => {
                      setSelectedModalCharacterId(null);
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
                      {modalCharacter.mainImage ? (
                        <img
                          src={modalCharacter.mainImage}
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
                      <p className="font-semibold">{modalCharacter.mainCategory}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">서브 카테고리</p>
                      <p className="font-semibold">{modalCharacter.subCategory}</p>
                    </div>
                  </div>

                  {/* Description */}
                  {modalCharacter.description && (
                    <div>
                      <p className="text-sm font-medium mb-2">설명</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {modalCharacter.description}
                      </p>
                    </div>
                  )}

                  {/* Sub Images */}
                  {modalCharacter.subImages && modalCharacter.subImages.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-medium">서브 이미지</p>
                        <span className="text-xs text-muted-foreground">
                          {modalSubImageIndex + 1} / {modalCharacter.subImages.length}
                        </span>
                      </div>

                      {/* Main Sub Image Display */}
                      <div className="aspect-video bg-secondary rounded-lg overflow-hidden border border-border mb-4">
                        {modalCharacter.subImages[modalSubImageIndex]?.image ? (
                          <img
                            src={modalCharacter.subImages[modalSubImageIndex].image}
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
                      {modalCharacter.subImages[modalSubImageIndex]?.description && (
                        <p className="text-sm text-muted-foreground mb-4">
                          {modalCharacter.subImages[modalSubImageIndex].description}
                        </p>
                      )}

                      {/* Navigation */}
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() =>
                            setModalSubImageIndex(
                              (prev) =>
                                (prev - 1 + modalCharacter.subImages.length) %
                                modalCharacter.subImages.length
                            )
                          }
                          className="p-2 hover:bg-secondary rounded transition-colors"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>

                        {/* Thumbnail Strip */}
                        <div className="flex gap-2 overflow-x-auto flex-1 mx-4 pb-2">
                          {modalCharacter.subImages.map((subImg, idx) => (
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
                                (prev + 1) % modalCharacter.subImages.length
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
  if (!selectedCharacter) {
    return (
      <div className="min-h-screen bg-background py-12 md:ml-64 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg mb-4">캐릭터를 추가해주세요</p>
          {editMode && (
            <button
              onClick={() => setIsAddingCharacter(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              캐릭터 추가
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
          <h1 className="text-4xl font-bold mb-2">캐릭터</h1>
          <p className="text-muted-foreground">
            캐릭터 목록을 관리하고 상세 정보를 편집합니다
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left - Character List */}
          <div className="lg:col-span-1">
            <div className="space-y-2 mb-4">
              <h2 className="text-lg font-bold">캐릭터 목록</h2>
              {editMode && (
                <button
                  onClick={() => setIsAddingCharacter(true)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm"
                >
                  <Plus className="w-4 h-4" />
                  추가
                </button>
              )}
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {characters.map((char) => (
                <button
                  key={char.id}
                  onClick={() => {
                    setSelectedCharacterId(char.id);
                    setCurrentSubImageIndex(0);
                  }}
                  className={`w-full p-3 rounded-lg text-left transition-colors ${
                    selectedCharacterId === char.id
                      ? 'bg-foreground text-background'
                      : 'bg-secondary hover:bg-border'
                  }`}
                >
                  <div className="font-semibold text-sm">{char.name}</div>
                  <div className="text-xs opacity-70">
                    {char.mainCategory} / {char.subCategory}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right - Character Details */}
          <div className="lg:col-span-3 space-y-8">
            {/* Profile Image */}
            <div className="border border-border rounded-lg p-6 bg-secondary/50">
              <h3 className="text-lg font-bold mb-4">프로필 이미지</h3>
              {editMode ? (
                <ImageUpload
                  value={selectedCharacter.profileImage}
                  onChange={(value) =>
                    handleUpdateCharacter({ profileImage: value })
                  }
                  label="프로필 이미지"
                />
              ) : (
                <div className="w-32 h-32 bg-gray-900 rounded-lg overflow-hidden border border-border">
                  {selectedCharacter.profileImage ? (
                    <img
                      src={selectedCharacter.profileImage}
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
                      value={selectedCharacter.name}
                      onChange={(e) =>
                        handleUpdateCharacter({ name: e.target.value })
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
                        value={selectedCharacter.mainCategory}
                        onChange={(e) =>
                          handleUpdateCharacter({ mainCategory: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground"
                      >
                        {data.settings.characterCategories.map((cat) => (
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
                        value={selectedCharacter.subCategory}
                        onChange={(e) =>
                          handleUpdateCharacter({ subCategory: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground"
                      >
                        {data.settings.characterCategories
                          .find((cat) => cat.main === selectedCharacter.mainCategory)
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
                      value={selectedCharacter.description}
                      onChange={(e) =>
                        handleUpdateCharacter({ description: e.target.value })
                      }
                      placeholder="캐릭터 설명"
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground resize-none h-24"
                    />
                  </div>

                  <button
                    onClick={handleDeleteCharacter}
                    disabled={characters.length === 1}
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
                    <div className="font-semibold">{selectedCharacter.name}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">
                        메인 카테고리
                      </div>
                      <div className="font-semibold">
                        {selectedCharacter.mainCategory}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">
                        서브 카테고리
                      </div>
                      <div className="font-semibold">
                        {selectedCharacter.subCategory}
                      </div>
                    </div>
                  </div>
                  {selectedCharacter.description && (
                    <div>
                      <div className="text-sm text-muted-foreground">설명</div>
                      <div className="text-sm">{selectedCharacter.description}</div>
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
                  value={selectedCharacter.mainImage}
                  onChange={(value) =>
                    handleUpdateCharacter({ mainImage: value })
                  }
                  label="메인 이미지"
                />
              ) : (
                <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden border border-border">
                  {selectedCharacter.mainImage ? (
                    <img
                      src={selectedCharacter.mainImage}
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

              {selectedCharacter.subImages && selectedCharacter.subImages.length > 0 ? (
                <div className="space-y-4">
                  {/* Sub Image Carousel */}
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() =>
                        setCurrentSubImageIndex(
                          (prev) =>
                            (prev - 1 + selectedCharacter.subImages.length) %
                            selectedCharacter.subImages.length
                        )
                      }
                      className="p-2 hover:bg-border rounded transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    <div className="flex-1 aspect-video bg-gray-900 rounded-lg overflow-hidden border border-border">
                      {selectedCharacter.subImages[currentSubImageIndex]?.image ? (
                        <img
                          src={selectedCharacter.subImages[currentSubImageIndex].image}
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
                            (prev + 1) % selectedCharacter.subImages.length
                        )
                      }
                      className="p-2 hover:bg-border rounded transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="text-center text-sm text-muted-foreground">
                    {currentSubImageIndex + 1} / {selectedCharacter.subImages.length}
                  </div>

                  {/* Current Sub Image Edit */}
                  {editMode && (
                    <div className="space-y-4 border-t border-border pt-4">
                      <ImageUpload
                        value={
                          selectedCharacter.subImages[currentSubImageIndex]?.image || ''
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
                            selectedCharacter.subImages[currentSubImageIndex]
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

      {/* Add Character Modal */}
      {isAddingCharacter && editMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background rounded-lg shadow-xl p-6 max-w-md w-full border border-border">
            <h2 className="text-2xl font-bold mb-4">캐릭터 추가</h2>
            <input
              type="text"
              value={newCharacterName}
              onChange={(e) => setNewCharacterName(e.target.value)}
              placeholder="캐릭터 이름"
              className="w-full px-4 py-2 border border-border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-foreground bg-secondary"
              onKeyPress={(e) => e.key === 'Enter' && handleAddCharacter()}
            />
            <div className="flex gap-3">
              <button
                onClick={handleAddCharacter}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                추가
              </button>
              <button
                onClick={() => {
                  setIsAddingCharacter(false);
                  setNewCharacterName('');
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
