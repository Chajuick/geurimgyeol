import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Image as ImageIcon, Plus } from "lucide-react";

import { HUDPanel, HUDSectionTitle, HUDBadge } from "@/components/ui/hud";
import ImageUpload from "@/components/ImageUpload";
import GButton from "@/components/ui/gyeol-button";
import Modal from "@/components/ui/modal";
import WorldThumbCard from "@/components/worlds/WorldThumbCard";
import AddItemCard from "@/components/worlds/AddItemCard";
import { useResolvedImage } from "@/hooks/useResolvedImage";
import { uiTextarea, uiInput, uiScrollDark } from "@/components/ui/form/presets";
import { cn } from "@/lib/utils";

type AddTab = "character" | "creature";

function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

/** ✅ draft를 debounce로 updateWorld에 반영 */
function useDebouncedPatch(
  enabled: boolean,
  value: string,
  delayMs: number,
  onCommit: (v: string) => void
) {
  const lastCommittedRef = useRef<string>(value);

  // NOTE: 최초 commit 기준을 value로 잡기 위해 sync
  useEffect(() => {
    lastCommittedRef.current = value;
  }, [value]);

  useEffect(() => {
    if (!enabled) return;
    const t = window.setTimeout(() => {
      if (value !== lastCommittedRef.current) {
        lastCommittedRef.current = value;
        onCommit(value);
      }
    }, delayMs);
    return () => window.clearTimeout(t);
  }, [enabled, value, delayMs, onCommit]);
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
  const bg = useResolvedImage(world.backgroundImage || "");
  const icon = useResolvedImage(world.iconImage || "");

  // ✅ 입력 드래프트(타이핑마다 setData 안 때림)
  const [descDraft, setDescDraft] = useState(world.description || "");
  const [iconDraft, setIconDraft] = useState(world.iconImage || "");
  const [bgDraft, setBgDraft] = useState(world.backgroundImage || "");

  // ✅ 월드 바뀌면 드래프트 동기화
  useEffect(() => {
    setDescDraft(world.description || "");
    setIconDraft(world.iconImage || "");
    setBgDraft(world.backgroundImage || "");
  }, [world?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ✅ debounce commit
  const commitDesc = useCallback((v: string) => updateWorld({ description: v }), [updateWorld]);
  const commitIcon = useCallback((v: string) => updateWorld({ iconImage: v }), [updateWorld]);
  const commitBg = useCallback((v: string) => updateWorld({ backgroundImage: v }), [updateWorld]);

  useDebouncedPatch(!!editMode, descDraft, 250, commitDesc);
  useDebouncedPatch(!!editMode, iconDraft, 250, commitIcon);
  useDebouncedPatch(!!editMode, bgDraft, 250, commitBg);

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
  const displayItems = useMemo(() => {
    const w = world;
    if (!w) return [];

    const chars =
      (w.worldCharacters ?? [])
        .map((ref: any) => {
          const ent = characterById.get(ref.characterId);
          if (!ent) return null;
          return {
            type: "character" as const,
            refId: ref.id,
            entityId: ref.characterId,
            data: ent,
          };
        })
        .filter(Boolean) ?? [];

    const cres =
      (w.worldCreatures ?? [])
        .map((ref: any) => {
          const ent = creatureById.get(ref.creatureId);
          if (!ent) return null;
          return {
            type: "creature" as const,
            refId: ref.id,
            entityId: ref.creatureId,
            data: ent,
          };
        })
        .filter(Boolean) ?? [];

    return [...chars, ...cres];
  }, [world, characterById, creatureById]);

  const handleDeleteItemByRefId = useCallback(
    (refId: string, type: AddTab) => {
      if (type === "character") {
        const next = (world.worldCharacters || []).filter((r: any) => r.id !== refId);
        updateWorld({ worldCharacters: next });
      } else {
        const next = (world.worldCreatures || []).filter((r: any) => r.id !== refId);
        updateWorld({ worldCreatures: next });
      }
    },
    [updateWorld, world.worldCharacters, world.worldCreatures]
  );

  const handleAddItem = useCallback(
    (characterId?: string, creatureId?: string) => {
      if (characterId) {
        const newRef = { id: makeId(), characterId };
        updateWorld({ worldCharacters: [...(world.worldCharacters || []), newRef] });
      } else if (creatureId) {
        const newRef = { id: makeId(), creatureId };
        updateWorld({ worldCreatures: [...(world.worldCreatures || []), newRef] });
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
    const source = addTab === "character" ? data.characters ?? [] : data.creatures ?? [];
    return source
      .filter((item: any) => !addedIds.has(item.id))
      .filter((item: any) => (!q ? true : (item.name || "").toLowerCase().includes(q)));
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

  return (
    // ✅ 탭 루트: 높이 컨텍스트 제공
    <div className="h-full min-h-0 flex flex-col">
      {/* ✅ 탭 내부에서만 스크롤 */}
      <div
        className={cn(
          "flex-1 min-h-0",
          "overflow-y-scroll",
          "[scrollbar-gutter:stable]",
          "scroll-dark",
          "pr-1"
        )}
      >
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

            <div
              className="
                mt-5 grid grid-cols-1 gap-4
                xl:grid-cols-[minmax(0,1fr)_380px]
                xl:items-stretch
                xl:h-[clamp(260px,28vw,420px)]
              "
            >
              {/* background preview */}
              <div className="rounded-3xl overflow-hidden border border-white/10 bg-black/20 relative h-full min-h-0">
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
                      <div className="text-[11px] tracking-[0.26em] text-white/55">
                        WORLD NAME
                      </div>
                      <div className="text-xl font-bold truncate">{world.name}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* editor / read */}
              <div className="rounded-3xl border border-white/10 bg-black/20 p-4 h-full min-h-0 overflow-auto scroll-dark">
                <div className="text-[11px] tracking-[0.26em] text-white/55">DESCRIPTION</div>

                <div className="mt-3">
                  {editMode ? (
                    <textarea
                      value={descDraft}
                      onChange={(e) => setDescDraft(e.target.value)}
                      className={uiTextarea}
                      placeholder="세계관 설정을 입력하세요"
                    />
                  ) : (
                    <div
                      className={`text-sm text-white/75 whitespace-pre-wrap leading-relaxed pr-1 ${uiScrollDark}`}
                    >
                      {world.description || "설명이 없습니다"}
                    </div>
                  )}
                </div>

                {editMode && (
                  <div className="mt-5 grid grid-cols-1 gap-4">
                    <div>
                      <div className="text-xs text-white/55 mb-2">아이콘</div>
                      <ImageUpload
                        value={iconDraft}
                        onChange={(v) => setIconDraft(v)}
                        aspect="square"
                        kind="profile"
                        allowUrl
                      />
                    </div>

                    <div>
                      <div className="text-xs text-white/55 mb-2">배경</div>
                      <ImageUpload
                        value={bgDraft}
                        onChange={(v) => setBgDraft(v)}
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
                  {displayItems.map((it: any) => {
                    const clickable = !!onOpenEntity; // WorldDetail에서만 열 수 있게
                    return (
                      <button
                        key={it.refId}
                        type="button"
                        className={cn("text-left", clickable ? "cursor-pointer" : "cursor-default")}
                        onClick={() => clickable && handleOpenLinked(it.type, it.entityId)}
                      >
                        <WorldThumbCard
                          name={it.data?.name}
                          image={it.data?.profileImage}
                          editMode={editMode}
                          onDelete={() => {
                            // (가능하면) 삭제 클릭이 카드 클릭으로 버블링 되는 걸 방지하고 싶지만
                            // WorldThumbCard 내부에서 stopPropagation을 해야 완벽해.
                            handleDeleteItemByRefId(it.refId, it.type);
                          }}
                        />
                      </button>
                    );
                  })}
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
      </div>
    </div>
  );
}