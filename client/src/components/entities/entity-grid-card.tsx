import React, { memo, useCallback, useMemo } from "react";
import { useResolvedImage } from "@/hooks/useResolvedImage";
import { Pencil, Trash2 } from "lucide-react";
import { usePortfolioContext } from "@/contexts/PortfolioContext";
import { resolveFrameStack } from "@/lib/frameStack";
import type { FramePresetId, ID } from "@/types";
import { OUTER_PRESETS } from "@/lib/framePresets";

function isOuterPreset(id: FramePresetId) {
  return OUTER_PRESETS.has(id);
}

type Props = {
  id: string;
  name: string;
  subCategories: string[];
  image: string;
  symbolColors?: { hex: string; name?: string }[];
  selected: boolean;
  editMode: boolean;

  // ✅ NEW
  rankId?: ID;

  onSelect: (id: string) => void;
  onOpen: (id: string) => void;

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
  rankId,
  onSelect,
  onOpen,
  onEdit,
  onDelete,
}: Props) {
  const resolved = useResolvedImage(image);
  const { data } = usePortfolioContext();

  const colors = (symbolColors || []).map(c => c.hex).filter(Boolean);
  const c1 = colors[0] || "#444444";
  const c2 = colors[1] || c1;

  // ✅ 프레임 (characters 화면 기준: frameSettings.characters)
  const effectiveRankId =
    rankId ||
    data.settings?.rankSets?.characters?.defaultTierId ||
    (data.settings?.rankSets?.characters?.tiers?.[0]?.id as ID) ||
    ("rank_default" as ID);

  const stack = useMemo(() => {
    return resolveFrameStack(
      data.settings?.frameSettings?.characters,
      effectiveRankId as ID,
      selected
    );
  }, [data.settings?.frameSettings?.characters, effectiveRankId, selected]);

  /** ✅ presets 그대로 사용 (클래스로 미리 변환하지 않음) */
  const presets = useMemo<FramePresetId[]>(() => {
    if (!selected) return []; // ✅ 선택 아닐 땐 프레임 없음
    return (stack.presets || []).filter(Boolean) as FramePresetId[];
  }, [stack.presets, selected]);

  const outerPresets = useMemo(
    () => presets.filter(p => isOuterPreset(p)),
    [presets]
  );
  const innerPresets = useMemo(
    () => presets.filter(p => !isOuterPreset(p) && p !== "none"),
    [presets]
  );

  // ✅ 클릭 UX:
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
        // vars are inherited by children
        ["--frame-thickness" as any]: `${stack.thickness ?? 1}px`,
        ["--frame-intensity" as any]: `${stack.intensity ?? 1}`,
        ["--c1" as any]: c1,
        ["--c2" as any]: c2,
      }}
      className={[
        "group relative aspect-square",
        "transition-all duration-300",
        "overflow-visible",
        selected ? "is-selected" : "",
      ].join(" ")}
    >
      {/* ✅ OUTER FX: 카드 밖으로 퍼지는 프리셋만 */}
      {outerPresets.length > 0 && (
        <div className="pointer-events-none absolute inset-0 z-50 rounded-2xl">
          {outerPresets.map((p, i) => (
            <div
              key={p + i}
              className={[
                "frame-layer",
                "frame-outer",
                `frame-preset-${p}`,
              ].join(" ")}
            />
          ))}
        </div>
      )}

      {/* ✅ INNER CLIP: 내용(이미지/텍스트)은 여기서만 클립 */}
      <div
        className={[
          "relative z-20 h-full w-full rounded-2xl overflow-hidden",
          "bg-zinc-900 shadow-sm group-hover:shadow-xl",
        ].join(" ")}
      >
        {/* ✅ INNER FX: 안쪽에 붙는 프리셋만 */}
        {innerPresets.length > 0 && (
          <div className="pointer-events-none absolute inset-0 z-20">
            {innerPresets.map((p, i) => (
              <div
                key={p + "_in_" + i}
                className={[
                  "frame-layer",
                  "frame-inner",
                  `frame-preset-${p}`,
                ].join(" ")}
              />
            ))}
          </div>
        )}

        {/* 기존 rune-border 유지 */}
        {selected && <div className="rune-border pointer-events-none z-30" />}

        {/* image */}
        <div className="absolute inset-0 bg-zinc-900 z-0">
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
        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent z-40">
          <div className="text-white text-sm font-semibold tracking-tight">
            {name}
          </div>
          <div className="text-zinc-400 text-[11px] mt-1">
            {(subCategories || []).join(", ")}
          </div>
        </div>

        {/* selected ring */}
        {selected && (
          <div className="absolute inset-0 ring-2 ring-white/20 pointer-events-none z-50" />
        )}

        {/* edit overlay buttons */}
        {editMode && (
          <div className="absolute top-2 right-2 flex gap-1 z-50">
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
    </div>
  );
});

export default EntityGridCard;
