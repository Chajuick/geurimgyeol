import React, { useCallback, useEffect, useMemo, useState } from "react";
import { usePortfolioContext } from "@/contexts/PortfolioContext";
import { Plus } from "lucide-react";
import GButton from "@/components/ui/gyeol-button";
import EntityGridCard from "@/components/entities/entity-grid-card";
import EntityDetailFullscreen from "@/components/DetailViewFullscreen";
import EntityCategoryBar from "@/components/entities/entity-category-bar";
import ConfirmModal from "@/components/ui/confirm-modal";
import type { CategoryGroup } from "@/components/entities/category-group-edit-modal";

type SubImage = { image: string; description: string };
type ColorHex = `#${string}`;

type SymbolColor = {
  id: string;
  name: string;
  hex: ColorHex;
};

type Character = {
  id: string;
  name: string;
  subCategories: string[];
  profileImage: string;
  mainImage: string;
  mainImageDesc?: string;
  subImages: SubImage[];
  tags: string[];
  description: string;
  symbolColors?: SymbolColor[];
};

const ALL = "전체";

export default function Characters() {
  const { data, setData, editMode } = usePortfolioContext();

  const categories: CategoryGroup[] = useMemo(
    () => data.settings?.characterCategories || [],
    [data.settings?.characterCategories]
  );

  const charactersNormalized: Character[] = useMemo(() => {
    return (data.characters || []).map((c: any) => ({
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
      symbolColors: Array.isArray(c.symbolColors) ? c.symbolColors : [],
    }));
  }, [data.characters]);

  const [selectedId, setSelectedId] = useState<string | null>(
    charactersNormalized[0]?.id || null
  );

  const [activeMain, setActiveMain] = useState<string>(ALL);
  const [activeSub, setActiveSub] = useState<string>(ALL);

  const [viewModalId, setViewModalId] = useState<string | null>(null);
  const [viewSubIndex, setViewSubIndex] = useState(0);

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // maps
  const mainToSubs = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const cg of categories) map.set(cg.main, cg.subs || []);
    return map;
  }, [categories]);

  const filtered = useMemo(() => {
    return charactersNormalized.filter((c) => {
      const subs = c.subCategories || [];

      const mainOk =
        activeMain === ALL
          ? true
          : (mainToSubs.get(activeMain) || []).some((sub) => subs.includes(sub));

      const subOk = activeSub === ALL ? true : subs.includes(activeSub);

      return mainOk && subOk;
    });
  }, [charactersNormalized, activeMain, activeSub, mainToSubs]);

  useEffect(() => {
    if (!filtered.length) {
      setSelectedId(null);
      return;
    }
    const stillExists = filtered.some((c) => c.id === selectedId);
    if (!stillExists) setSelectedId(filtered[0]?.id || null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, selectedId]);

  const viewModalChar = useMemo(
    () => charactersNormalized.find((c) => c.id === viewModalId) || null,
    [charactersNormalized, viewModalId]
  );

  // ✅ sub categories only -> tagOptions
  const subTagOptions = useMemo(() => {
    const set = new Set<string>();
    for (const cg of categories) {
      for (const s of cg.subs || []) {
        const v = (s || "").trim();
        if (v) set.add(v);
      }
    }
    return Array.from(set);
  }, [categories]);

  const updateCharacters = useCallback(
    (next: Character[]) => {
      setData({
        ...data,
        characters: next.map((c) => ({
          id: c.id,
          name: c.name,
          subCategories: c.subCategories || [],
          profileImage: c.profileImage || "",
          mainImage: c.mainImage || "",
          mainImageDesc: c.mainImageDesc || "",
          subImages: c.subImages || [],
          tags: c.tags || [],
          description: c.description || "",
          symbolColors: c.symbolColors || [],
        })),
      });
    },
    [data, setData]
  );

  const openDetail = useCallback((id: string) => {
    setViewModalId(id);
    setViewSubIndex(0);
  }, []);

  const handleSaveCategories = useCallback(
    (next: CategoryGroup[]) => {
      setData({
        ...data,
        settings: {
          ...data.settings,
          characterCategories: next,
        },
      });
    },
    [data, setData]
  );

  const addNewCharacter = useCallback(() => {
    const payload: Character = {
      id: Date.now().toString(),
      name: "새 캐릭터",
      subCategories: [],
      profileImage: "",
      mainImage: "",
      mainImageDesc: "",
      subImages: [],
      tags: [],
      description: "",
      symbolColors: [],
    };
    updateCharacters([...charactersNormalized, payload]);
    setSelectedId(payload.id);
    openDetail(payload.id);
  }, [charactersNormalized, updateCharacters, openDetail]);

  const deleteCharacter = useCallback(
    (id: string) => {
      const next = charactersNormalized.filter((c) => c.id !== id);
      updateCharacters(next);

      setSelectedId(next[0]?.id || null);
      setViewModalId((cur) => (cur === id ? null : cur));
      setViewSubIndex(0);
    },
    [charactersNormalized, updateCharacters]
  );

  // ✅ Detail patch -> 즉시 저장
  const patchCharacter = useCallback(
    (id: string, patch: Partial<Character>) => {
      const next = charactersNormalized.map((c) =>
        c.id === id ? ({ ...c, ...patch } as Character) : c
      );
      updateCharacters(next);
    },
    [charactersNormalized, updateCharacters]
  );

  return (
    <div
      className={[
        // ✅ 앱 전체 스크롤 막고, 그리드 영역만 스크롤
        "h-screen overflow-hidden gyeol-bg text-white flex flex-col",
        viewModalChar ? "max-h-[100vh]" : "",
      ].join(" ")}
    >
      <EntityCategoryBar
        titleTop="CHARACTERS"
        titleMain="캐릭터 소개"
        editMode={editMode}
        categories={categories}
        activeMain={activeMain}
        activeSub={activeSub}
        setActiveMain={setActiveMain}
        setActiveSub={setActiveSub}
        onSaveCategories={handleSaveCategories}
        rightActions={
          editMode ? (
            <GButton
              variant="primary"
              icon={<Plus className="w-4 h-4" />}
              text="캐릭터 추가"
              onClick={addNewCharacter}
            />
          ) : null
        }
      />

      {/* ✅ 그리드 영역만 스크롤 */}
      <div className="flex-1 min-h-0 overflow-y-auto scroll-dark">
        <div className="px-14 py-10 min-h-full">
          {filtered.length === 0 ? (
            <div className="py-32 text-center text-zinc-500 text-sm tracking-wide">
              해당 카테고리에 캐릭터가 없습니다.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-6">
              {filtered.map((c) => (
                <EntityGridCard
                  key={c.id}
                  id={c.id}
                  name={c.name}
                  subCategories={c.subCategories}
                  image={c.profileImage}
                  symbolColors={c.symbolColors}
                  selected={c.id === selectedId}
                  editMode={editMode}
                  onSelect={(id) => setSelectedId(id)}
                  onOpen={(id) => openDetail(id)}
                  onEdit={(id) => openDetail(id)}
                  onDelete={(id) => setConfirmDeleteId(id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ✅ 상세 */}
      {viewModalChar && (
        <EntityDetailFullscreen
          entity={viewModalChar}
          viewSubIndex={viewSubIndex}
          setViewSubIndex={setViewSubIndex}
          onClose={() => {
            setViewModalId(null);
            setViewSubIndex(0);
          }}
          editable={editMode}
          onDelete={() => setConfirmDeleteId(viewModalChar.id)}
          onPatch={(p) => patchCharacter(viewModalChar.id, p as any)}
          tagOptions={subTagOptions}
        />
      )}

      <ConfirmModal
        open={!!confirmDeleteId}
        title="캐릭터 삭제"
        description="정말 캐릭터를 삭제하시겠습니까? 삭제 후 되돌릴 수 없습니다."
        confirmText="삭제"
        cancelText="취소"
        danger
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={() => {
          if (!confirmDeleteId) return;
          deleteCharacter(confirmDeleteId);
          setConfirmDeleteId(null);
        }}
      />
    </div>
  );
}