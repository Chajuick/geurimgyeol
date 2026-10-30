import * as React from "react";
import { motion } from "framer-motion";
import { Unlink } from "lucide-react";

import { HUDSegmentTabs } from "@/components/ui/hud";
import WorldThumbCard from "@/components/worlds/WorldThumbCard";
import type { CharacterData, CreatureData, ID } from "@/types";

export type LinkedEntityType = "character" | "creature";

export type LinkedEntityItem = {
  type: LinkedEntityType;
  /** 월드 내 연결 ref id */
  refId: ID;
  data: CharacterData | CreatureData;
};

type EntityFilter = "all" | LinkedEntityType;

const ENTITY_FILTERS: { key: EntityFilter; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "character", label: "캐릭터" },
  { key: "creature", label: "크리쳐" },
];

/** 연결된 캐릭터·크리쳐 갤러리 (필터 탭 + 초상 그리드) */
export default function LinkedEntityGallery({
  items,
  editMode,
  onOpen,
  onUnlink,
  resetKey,
  emptyHint = "‘연결 추가’ 버튼으로 캐릭터·크리쳐를 추가하세요",
}: {
  items: LinkedEntityItem[];
  editMode: boolean;
  onOpen: (type: LinkedEntityType, id: ID) => void;
  onUnlink?: (refId: ID, type: LinkedEntityType) => void;
  /** 바뀌면 등장 애니메이션 재생 (예: world id) */
  resetKey?: string;
  emptyHint?: string;
}) {
  const [filter, setFilter] = React.useState<EntityFilter>("all");

  const counts = React.useMemo<Record<EntityFilter, number>>(
    () => ({
      all: items.length,
      character: items.filter(it => it.type === "character").length,
      creature: items.filter(it => it.type === "creature").length,
    }),
    [items]
  );

  const filtered = React.useMemo(
    () => (filter === "all" ? items : items.filter(it => it.type === filter)),
    [items, filter]
  );

  return (
    <div>
      <HUDSegmentTabs<EntityFilter>
        className="w-full sm:w-[380px]"
        value={filter}
        onChange={setFilter}
        items={ENTITY_FILTERS.map(f => ({
          key: f.key,
          label: f.label,
          right: (
            <span className="text-xs tabular-nums text-white/40">
              {counts[f.key]}
            </span>
          ),
        }))}
      />

      <div className="mt-5">
        {filtered.length === 0 ? (
          <div className="grid place-items-center rounded-2xl border border-dashed border-white/10 py-14 text-center">
            <div className="text-sm text-white/50">연결된 항목이 없어요</div>
            {editMode && (
              <div className="mt-1 text-xs text-white/35">{emptyHint}</div>
            )}
          </div>
        ) : (
          <motion.div
            key={`${resetKey ?? ""}:${filter}`}
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.02 } },
            }}
            className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
          >
            {filtered.map(it => (
              <motion.div
                key={it.refId}
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  show: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
                className="relative group"
              >
                <button
                  type="button"
                  className="relative block w-full overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
                  onClick={() => onOpen(it.type, it.data.id)}
                >
                  <WorldThumbCard
                    name={it.data.name}
                    image={it.data.profileImage}
                    className="[&>div]:rounded-none [&_img]:transition-transform [&_img]:duration-500 group-hover:[&_img]:scale-[1.06]"
                  />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-3">
                    <div className="truncate text-sm font-semibold text-white">
                      {it.data.name}
                    </div>
                    {filter === "all" && (
                      <div className="mt-0.5 text-[11px] text-white/50">
                        {it.type === "character" ? "캐릭터" : "크리쳐"}
                      </div>
                    )}
                  </div>
                </button>

                {editMode && onUnlink && (
                  <button
                    type="button"
                    title="연결 해제"
                    onClick={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      onUnlink(it.refId, it.type);
                    }}
                    className="absolute top-2 right-2 z-20 grid place-items-center h-8 w-8 rounded-full bg-black/55 border border-white/15 text-white/70 backdrop-blur opacity-0 group-hover:opacity-100 focus-visible:opacity-100 hover:bg-red-500/80 hover:text-white hover:border-transparent transition-[opacity,background-color,color]"
                  >
                    <Unlink className="h-3.5 w-3.5" />
                  </button>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
