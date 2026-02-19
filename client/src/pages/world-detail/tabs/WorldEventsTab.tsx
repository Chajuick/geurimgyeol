import { useMemo, useState } from "react";
import { Image as ImageIcon, Plus } from "lucide-react";

import { HUDPanel, HUDSectionTitle, HUDBadge } from "@/components/ui/hud";
import ImageUpload from "@/components/ImageUpload";
import GButton from "@/components/ui/gyeol-button";
import Modal from "@/components/ui/modal";
import WorldThumbCard from "@/components/worlds/WorldThumbCard";
import AddItemCard from "@/components/worlds/AddItemCard";
import { useResolvedImage } from "@/hooks/useResolvedImage";
import { uiTextarea, uiInput, uiScrollDark } from "@/components/ui/form/presets";

export default function WorldOverviewTab({
  world,
  editMode,
  updateWorld,
  data,
}: any) {
  const bg = useResolvedImage(world.backgroundImage || "");
  const icon = useResolvedImage(world.iconImage || "");

  // add item modal
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [addTab, setAddTab] = useState<"character" | "creature">("character");
  const [search, setSearch] = useState("");

  const displayItems = useMemo(() => {
    const w = world;
    if (!w) return [];
    return [
      ...(w?.worldCharacters?.map((ref: any) => ({
        type: "character" as const,
        id: ref.id,
        refId: ref.id,
        entityId: ref.characterId,
        data: data.characters.find((c: any) => c.id === ref.characterId),
      })) || []),
      ...(w?.worldCreatures?.map((ref: any) => ({
        type: "creature" as const,
        id: ref.id,
        refId: ref.id,
        entityId: ref.creatureId,
        data: data.creatures.find((c: any) => c.id === ref.creatureId),
      })) || []),
    ].filter((it) => !!it.data);
  }, [world, data.characters, data.creatures]);

  const handleDeleteItemByRefId = (refId: string, type: "character" | "creature") => {
    if (type === "character") {
      const next = (world.worldCharacters || []).filter((r: any) => r.id !== refId);
      updateWorld({ worldCharacters: next });
    } else {
      const next = (world.worldCreatures || []).filter((r: any) => r.id !== refId);
      updateWorld({ worldCreatures: next });
    }
  };

  const handleAddItem = (characterId?: string, creatureId?: string) => {
    if (characterId) {
      const newRef = { id: Date.now().toString(), characterId };
      updateWorld({ worldCharacters: [...(world.worldCharacters || []), newRef] });
    } else if (creatureId) {
      const newRef = { id: Date.now().toString(), creatureId };
      updateWorld({ worldCreatures: [...(world.worldCreatures || []), newRef] });
    }
    setIsAddingItem(false);
    setSearch("");
  };

  // add list
  const addSource = addTab === "character" ? data.characters : data.creatures;
  const q = search.trim().toLowerCase();
  const filteredAddList = (addSource || []).filter((item: any) => {
    if (!q) return true;
    return (item.name || "").toLowerCase().includes(q);
  });
  const label = addTab === "character" ? "캐릭터" : "크리쳐";
  const isSearching = search.trim().length > 0;

  return (
    <div className="grid gap-4">
      {/* HERO PREVIEW */}
      <HUDPanel className="p-6">
        <HUDSectionTitle
          right={
            <div className="flex gap-2">
              <HUDBadge>OVERVIEW</HUDBadge>
              <HUDBadge tone={editMode ? "warn" : "neutral"}>
                {editMode ? "EDITABLE" : "READONLY"}
              </HUDBadge>
            </div>
          }
        >
          WORLD OVERVIEW
        </HUDSectionTitle>

        <div className="mt-5 grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-4">
          {/* background preview */}
          <div className="rounded-3xl overflow-hidden border border-white/10 bg-black/20 relative">
            {bg ? (
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `url(${bg})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
            ) : (
              <div className="absolute inset-0 grid place-items-center text-xs text-white/45">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 opacity-70" />
                  BACKGROUND PREVIEW
                </div>
              </div>
            )}

            <div className="absolute inset-0 bg-black/45" />
            <div className="relative z-10 p-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl overflow-hidden border border-white/10 bg-black/25 grid place-items-center">
                  {icon ? (
                    <img src={icon} alt="world icon" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[10px] text-white/45">NO ICON</span>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="text-[11px] tracking-[0.26em] text-white/55">WORLD NAME</div>
                  <div className="text-xl font-bold truncate">{world.name}</div>
                </div>
              </div>
            </div>
          </div>

          {/* editor / read */}
          <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
            <div className="text-[11px] tracking-[0.26em] text-white/55">DESCRIPTION</div>

            <div className="mt-3">
              {editMode ? (
                <textarea
                  value={world.description || ""}
                  onChange={(e) => updateWorld({ description: e.target.value })}
                  className={uiTextarea}
                  placeholder="세계관 설정을 입력하세요"
                />
              ) : (
                <div className={`text-sm text-white/75 whitespace-pre-wrap leading-relaxed max-h-[280px] overflow-auto pr-1 ${uiScrollDark}`}>
                  {world.description || "설명이 없습니다"}
                </div>
              )}
            </div>

            {editMode && (
              <div className="mt-5 grid grid-cols-1 gap-4">
                <div>
                  <div className="text-xs text-white/55 mb-2">아이콘</div>
                  <ImageUpload
                    value={world.iconImage || ""}
                    onChange={(v) => updateWorld({ iconImage: v })}
                    aspect="square"
                    kind="profile"
                    allowUrl
                  />
                </div>

                <div>
                  <div className="text-xs text-white/55 mb-2">배경</div>
                  <ImageUpload
                    value={world.backgroundImage || ""}
                    onChange={(v) => updateWorld({ backgroundImage: v })}
                    aspect="video"
                    kind="background"
                    allowUrl
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </HUDPanel>

      {/* LINKED */}
      <HUDPanel className="p-6">
        <HUDSectionTitle
          right={
            editMode ? (
              <GButton
                variant="neutral"
                icon={<Plus className="w-4 h-4" />}
                text="링크 추가"
                onClick={() => {
                  setIsAddingItem(true);
                  setAddTab("character");
                  setSearch("");
                }}
              />
            ) : (
              <HUDBadge>LINKED</HUDBadge>
            )
          }
        >
          LINKED ENTITIES
        </HUDSectionTitle>

        <div className="mt-4">
          {displayItems.length === 0 ? (
            <div className="text-sm text-white/55">등록된 항목이 없습니다.</div>
          ) : (
            <div className="grid gap-3 grid-cols-3 sm:grid-cols-4 md:grid-cols-6 xl:grid-cols-7">
              {displayItems.map((it: any) => (
                <WorldThumbCard
                  key={it.refId}
                  name={it.data?.name}
                  image={it.data?.profileImage}
                  editMode={editMode}
                  onDelete={() => handleDeleteItemByRefId(it.refId, it.type)}
                />
              ))}
            </div>
          )}
        </div>
      </HUDPanel>

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
            onChange={(e) => setSearch(e.target.value)}
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
  );
}