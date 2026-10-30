import React, { useCallback, useMemo, useState } from "react";
import { Plus } from "lucide-react";

import EditableText from "@/components/ui/editable-text";
import GButton from "@/components/ui/gyeol-button";
import Modal from "@/components/ui/modal";
import AddItemCard from "@/components/worlds/AddItemCard";
import WorldSection from "@/components/worlds/WorldSection";
import LinkedEntityGallery, {
  type LinkedEntityItem,
} from "@/components/worlds/LinkedEntityGallery";
import { uiInput } from "@/components/ui/form/presets";

type AddTab = "character" | "creature";

function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto)
    return crypto.randomUUID();
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

type Props = {
  world: any;
  editMode: boolean;
  updateWorld: (patch: any) => void;
  data: any;

  /** ✅ WorldDetail이 내려주는 “상세 모달 열기” */
  onOpenEntity?: (type: AddTab, id: string) => void;
};

export default function WorldOverviewTab({
  world,
  editMode,
  updateWorld,
  data,
  onOpenEntity,
}: Props) {
  // add item modal
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [addTab, setAddTab] = useState<AddTab>("character");
  const [search, setSearch] = useState("");

  // ✅ entity map (O(1))
  const characterById = useMemo(() => {
    const m = new Map<string, any>();
    (data.characters ?? []).forEach((c: any) => m.set(c.id, c));
    return m;
  }, [data.characters]);

  const creatureById = useMemo(() => {
    const m = new Map<string, any>();
    (data.creatures ?? []).forEach((c: any) => m.set(c.id, c));
    return m;
  }, [data.creatures]);

  // ✅ linked 표시 (find 반복 제거)
  const displayItems = useMemo<LinkedEntityItem[]>(() => {
    const w = world;
    if (!w) return [];

    const chars =
      (w.worldCharacters ?? [])
        .map((ref: any) => {
          const ent = characterById.get(ref.characterId);
          if (!ent) return null;
          const item: LinkedEntityItem = {
            type: "character",
            refId: ref.id,
            data: ent,
          };
          return item;
        })
        .filter((x: LinkedEntityItem | null): x is LinkedEntityItem => !!x) ??
      [];

    const cres =
      (w.worldCreatures ?? [])
        .map((ref: any) => {
          const ent = creatureById.get(ref.creatureId);
          if (!ent) return null;
          const item: LinkedEntityItem = {
            type: "creature",
            refId: ref.id,
            data: ent,
          };
          return item;
        })
        .filter((x: LinkedEntityItem | null): x is LinkedEntityItem => !!x) ??
      [];

    return [...chars, ...cres];
  }, [world, characterById, creatureById]);

  const handleDeleteItemByRefId = useCallback(
    (refId: string, type: AddTab) => {
      if (type === "character") {
        const next = (world.worldCharacters || []).filter(
          (r: any) => r.id !== refId
        );
        updateWorld({ worldCharacters: next });
      } else {
        const next = (world.worldCreatures || []).filter(
          (r: any) => r.id !== refId
        );
        updateWorld({ worldCreatures: next });
      }
    },
    [updateWorld, world.worldCharacters, world.worldCreatures]
  );

  const handleAddItem = useCallback(
    (characterId?: string, creatureId?: string) => {
      if (characterId) {
        const newRef = { id: makeId(), characterId };
        updateWorld({
          worldCharacters: [...(world.worldCharacters || []), newRef],
        });
      } else if (creatureId) {
        const newRef = { id: makeId(), creatureId };
        updateWorld({
          worldCreatures: [...(world.worldCreatures || []), newRef],
        });
      }
      setIsAddingItem(false);
      setSearch("");
    },
    [updateWorld, world.worldCharacters, world.worldCreatures]
  );

  // ✅ add list: 이미 링크된 엔티티 제외 + memo
  const q = search.trim().toLowerCase();

  const addedIds = useMemo(() => {
    const s = new Set<string>();
    if (addTab === "character") {
      (world.worldCharacters ?? []).forEach((r: any) => s.add(r.characterId));
    } else {
      (world.worldCreatures ?? []).forEach((r: any) => s.add(r.creatureId));
    }
    return s;
  }, [addTab, world.worldCharacters, world.worldCreatures]);

  const filteredAddList = useMemo(() => {
    const source =
      addTab === "character" ? (data.characters ?? []) : (data.creatures ?? []);
    return source
      .filter((item: any) => !addedIds.has(item.id))
      .filter((item: any) =>
        !q ? true : (item.name || "").toLowerCase().includes(q)
      );
  }, [addTab, data.characters, data.creatures, addedIds, q]);

  const label = addTab === "character" ? "캐릭터" : "크리쳐";
  const isSearching = q.length > 0;

  /** ✅ 링크 카드 클릭 → 상세 열기 */
  const handleOpenLinked = useCallback(
    (type: AddTab, id: string) => {
      if (!onOpenEntity) return;
      onOpenEntity(type, id);
    },
    [onOpenEntity]
  );

  const openAddModal = () => {
    setIsAddingItem(true);
    setAddTab("character");
    setSearch("");
  };

  const counts = {
    character: displayItems.filter(it => it.type === "character").length,
    creature: displayItems.filter(it => it.type === "creature").length,
  };

  return (
    <div className="space-y-10 sm:space-y-12 [&>section:first-child]:border-t-0 [&>section:first-child]:pt-0">
      {/* Brief */}
      <WorldSection title="세계관 소개">
        {editMode ? (
          <EditableText
            as="p"
            multiline
            align="left"
            editable
            value={world.description ?? ""}
            onChange={v => updateWorld({ description: v })}
            placeholder="세계관 설정을 입력하세요 (Ctrl+Enter로 저장)"
            className="w-full max-w-3xl text-base sm:text-[17px] leading-[1.95] text-white/80 break-keep"
          />
        ) : world.description ? (
          <p className="max-w-3xl text-base sm:text-[17px] leading-[1.95] text-white/80 whitespace-pre-line break-keep">
            {world.description}
          </p>
        ) : (
          <p className="text-sm text-white/40">
            아직 소개가 작성되지 않았어요.
          </p>
        )}
      </WorldSection>

      {/* Linked */}
      <WorldSection
        title="등장 인물 · 존재"
        caption={`캐릭터 ${counts.character} · 크리쳐 ${counts.creature}`}
        action={
          editMode ? (
            <GButton
              variant="neutral"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
              text="연결 추가"
              onClick={openAddModal}
            />
          ) : undefined
        }
      >
        <LinkedEntityGallery
          items={displayItems}
          editMode={editMode}
          resetKey={world.id}
          onOpen={handleOpenLinked}
          onUnlink={handleDeleteItemByRefId}
        />
      </WorldSection>

      {/* ADD ITEM MODAL */}
      <Modal
        open={isAddingItem && editMode}
        onClose={() => {
          setIsAddingItem(false);
          setSearch("");
        }}
        title="링크 추가"
        maxWidthClassName="max-w-3xl"
        footer={
          <div className="flex justify-end gap-2">
            <GButton
              variant="neutral"
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
            variant={addTab === "character" ? "primary" : "neutral"}
            text="캐릭터"
            onClick={() => setAddTab("character")}
            className="flex-1"
          />
          <GButton
            variant={addTab === "creature" ? "primary" : "neutral"}
            text="크리쳐"
            onClick={() => setAddTab("creature")}
            className="flex-1"
          />
        </div>

        {/* Search */}
        <div className="mb-4">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={`${label} 이름 검색`}
            className={uiInput}
          />
        </div>

        {/* Grid / Empty */}
        {filteredAddList.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-black/20 p-6 text-center">
            <p className="text-sm text-white/80">
              {isSearching ? "검색 결과가 없습니다." : `${label}가 없습니다.`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {filteredAddList.map((item: any) => (
              <AddItemCard
                key={item.id}
                id={item.id}
                name={item.name}
                image={item.profileImage}
                onPick={() =>
                  addTab === "character"
                    ? handleAddItem(item.id, undefined)
                    : handleAddItem(undefined, item.id)
                }
              />
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
