import React, { memo, useCallback } from "react";
import { useResolvedImage } from "@/hooks/useResolvedImage";

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
}: Props) {
  const resolved = useResolvedImage(image);

  const colors = (symbolColors || []).map((c) => c.hex).filter(Boolean);
  const c1 = colors[0] || "#444444";

  const handleClick = useCallback(() => onSelect(id), [onSelect, id]);
  const handleDbl = useCallback(() => {
    if (!editMode) onOpen(id);
  }, [editMode, onOpen, id]);

  return (
    <button
      onClick={handleClick}
      onDoubleClick={handleDbl}
      style={{
        boxShadow: selected ? `0 0 8px ${c1}CC, 0 0 12px ${c1}99` : undefined,
      }}
      className="
        group relative aspect-square overflow-hidden rounded-2xl
        transition-all duration-300
        shadow-sm hover:shadow-xl
        hover:scale-[1.02]
        data-[selected=true]:scale-[1.05]
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

      <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
        <div className="text-white text-sm font-semibold tracking-tight">
          {name}
        </div>
        <div className="text-zinc-400 text-[11px] mt-1">
          {(subCategories || []).join(", ")}
        </div>
      </div>

      {selected && (
        <div className="absolute inset-0 ring-2 ring-white/20 pointer-events-none" />
      )}
    </button>
  );
});

export default EntityGridCard;