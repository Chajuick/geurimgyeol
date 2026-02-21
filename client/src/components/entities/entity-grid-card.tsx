import React, { memo, useCallback, useMemo } from "react";
import { useResolvedImage } from "@/hooks/useResolvedImage";
import { Pencil, Trash2 } from "lucide-react";
import { resolveFrameStack } from "@/lib/frameStack";
import type { FramePresetId, ID } from "@/types";
import { OUTER_PRESETS } from "@/lib/framePresets";
import OverflowMarquee from "../ui/overflow-marquee";

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

  /** ✅ 부모에서 내려주는 최소 데이터 */
  frameSettings: any; // data.settings?.frameSettings?.characters
  defaultRankId: ID;  // rank default (resolved)

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
  frameSettings,
  defaultRankId,
  rankId,
  onSelect,
  onOpen,
  onEdit,
  onDelete,
}: Props) {
  const resolved = useResolvedImage(image);

  // ✅ 색상 2개만 빠르게 추출 (카드 많을 때 누적 비용 줄임)
  const { c1, c2 } = useMemo(() => {
    let a = "#444444";
    let b = "";

    for (const c of symbolColors || []) {
      const hex = c?.hex;
      if (!hex) continue;
      if (a === "#444444") a = hex;
      else {
        b = hex;
        break;
      }
    }
    return { c1: a, c2: b || a };
  }, [symbolColors]);

  const effectiveRankId = (rankId || defaultRankId || ("rank_default" as ID)) as ID;

  const stack = useMemo(() => {
    // ✅ selected=false면 내부에서 프레임 거의 비게 나올 테지만
    // 그래도 계산 자체를 최소화하려면 여기서 빠르게 처리
    return resolveFrameStack(frameSettings, effectiveRankId, selected);
  }, [frameSettings, effectiveRankId, selected]);

  // ✅ 선택된 카드에서만 프리셋 렌더
  const { outerPresets, innerPresets } = useMemo(() => {
    if (!selected) return { outerPresets: [] as FramePresetId[], innerPresets: [] as FramePresetId[] };

    const ps = (stack.presets || []).filter(Boolean) as FramePresetId[];
    const outer: FramePresetId[] = [];
    const inner: FramePresetId[] = [];

    for (const p of ps) {
      if (p === "none") continue;
      if (isOuterPreset(p)) outer.push(p);
      else inner.push(p);
    }

    return { outerPresets: outer, innerPresets: inner };
  }, [selected, stack.presets]);

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
        ["--frame-thickness" as any]: `${stack.thickness ?? 1}px`,
        ["--frame-intensity" as any]: `${stack.intensity ?? 1}`,
        ["--c1" as any]: c1,
        ["--c2" as any]: c2,
      }}
      className={[
        "group relative aspect-square",
        "transition-[transform,box-shadow] duration-300",
        "overflow-visible",
        selected ? "is-selected" : "",
      ].join(" ")}
    >
      {/* ✅ OUTER FX */}
      {outerPresets.length > 0 && (
        <div className="pointer-events-none absolute inset-0 z-50 rounded-2xl">
          {outerPresets.map((p, i) => (
            <div
              key={p + i}
              className={["frame-layer", "frame-outer", `frame-preset-${p}`].join(" ")}
            />
          ))}
        </div>
      )}

      {/* ✅ INNER CLIP */}
      <div
        className={[
          "relative z-20 h-full w-full rounded-2xl overflow-hidden",
          "bg-zinc-900 shadow-sm group-hover:shadow-xl",
        ].join(" ")}
      >
        {/* ✅ INNER FX */}
        {innerPresets.length > 0 && (
          <div className="pointer-events-none absolute inset-0 z-20">
            {innerPresets.map((p, i) => (
              <div
                key={p + "_in_" + i}
                className={["frame-layer", "frame-inner", `frame-preset-${p}`].join(" ")}
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
                "h-full w-full object-cover transition-all duration-500",
                selected
                  ? "scale-110 brightness-100 saturate-100 grayscale-0 will-change-transform group-hover:scale-120"
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
        <div className="absolute inset-x-0 bottom-0 px-3 pb-2 z-40">
          {/* ✅ 배경 그라디언트 레이어 (텍스트 뒤) */}
          <div
            className={[
              "pointer-events-none absolute inset-x-0 bottom-0",
              "h-24", // 필요하면 20~32 사이로 조절
              "bg-gradient-to-t from-black/90 via-black/55 to-transparent",
            ].join(" ")}
          />

          {/* ✅ 내용은 위로 */}
          <div className="relative z-10">
            {/* ===== 이름 ===== */}
            <OverflowMarquee active={selected}>
              <span className="marquee-text name text-sm font-bold">{name}</span>
            </OverflowMarquee>

            {/* ===== 태그 ===== */}
            <OverflowMarquee active={selected}>
              <span className="marquee-text tags text-xs">
                {(subCategories || []).join(", ")}
              </span>
            </OverflowMarquee>
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