import React, { memo, useCallback } from "react";
import { useResolvedImage } from "@/hooks/useResolvedImage";
import { Pencil, Trash2 } from "lucide-react";

type Props = {
  id: string;
  name: string;
  subCategories: string[];
  image: string;
  symbolColors?: { hex: string; name?: string }[];
  selected: boolean;
  editMode: boolean;

  onSelect: (id: string) => void;
  onOpen: (id: string) => void;

  // ✅ 추가
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
};

const EntityGridCard = memo(function EntityGridCard({
  id,
  name,
  subCategories,
  image,
  symbolColors,
  selected,
  editMode,
  onSelect,
  onOpen,
  onEdit,
  onDelete,
}: Props) {
  const resolved = useResolvedImage(image);

  const colors = (symbolColors || []).map((c) => c.hex).filter(Boolean);
  const c1 = colors[0] || "#444444";

  // ✅ 클릭 UX:
  // - 선택 안된 카드 클릭: select
  // - 이미 선택된 카드 클릭: open(= 상세)
  const handleClick = useCallback(() => {
    if (selected) onOpen(id);
    else onSelect(id);
  }, [selected, onOpen, onSelect, id]);

  const handleEdit = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onEdit?.(id);
    },
    [onEdit, id]
  );

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onDelete?.(id);
    },
    [onDelete, id]
  );

  return (
    <div
      onClick={handleClick}
      style={{
        boxShadow: selected ? `0 0 8px ${c1}CC, 0 0 12px ${c1}99` : undefined,
      }}
      className="
        group relative aspect-square overflow-hidden rounded-2xl
        transition-all duration-300
        shadow-sm hover:shadow-xl
        hover:scale-[1.02]
      "
    >
      <div className="absolute inset-0 bg-zinc-900">
        {resolved ? (
          <img
            src={resolved}
            alt={name}
            loading="lazy"
            decoding="async"
            className={[
              "h-full w-full object-cover transition-all duration-500 will-change-transform",
              selected
                ? "scale-110 brightness-100 saturate-100 grayscale-0"
                : "grayscale brightness-75 contrast-105 group-hover:grayscale-0 group-hover:brightness-90 group-hover:scale-105",
            ].join(" ")}
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-xs text-zinc-500">
            이미지 없음
          </div>
        )}
      </div>

      {/* bottom info */}
      <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
        <div className="text-white text-sm font-semibold tracking-tight">
          {name}
        </div>
        <div className="text-zinc-400 text-[11px] mt-1">
          {(subCategories || []).join(", ")}
        </div>
      </div>

      {/* selected ring */}
      {selected && (
        <div className="absolute inset-0 ring-2 ring-white/20 pointer-events-none" />
      )}

      {/* ✅ edit overlay buttons */}
      {editMode && (
        <div className="absolute top-2 right-2 flex gap-1">
          <button
            type="button"
            onClick={handleEdit}
            className="h-9 w-9 rounded-xl bg-black/45 border border-white/10 hover:bg-black/55 transition grid place-items-center"
            title="편집"
            aria-label="편집"
          >
            <Pencil className="w-4 h-4 text-white/85" />
          </button>

          <button
            type="button"
            onClick={handleDelete}
            className="h-9 w-9 rounded-xl bg-red-500/15 border border-red-500/25 hover:bg-red-500/20 transition grid place-items-center"
            title="삭제"
            aria-label="삭제"
          >
            <Trash2 className="w-4 h-4 text-white/85" />
          </button>
        </div>
      )}
    </div>
  );
});

export default EntityGridCard;