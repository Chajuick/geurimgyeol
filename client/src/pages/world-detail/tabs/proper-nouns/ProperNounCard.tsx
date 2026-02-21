import * as React from "react";
import { Pencil, Trash2 } from "lucide-react";
import { HUDBadge } from "@/components/ui/hud";
import GButton from "@/components/ui/gyeol-button";
import { useResolvedImage } from "@/hooks/useResolvedImage";
import { cn } from "@/lib/utils";

type Props = {
  entry: any;
  kindLabel: string;
  editMode: boolean;

  // ✅ id 기반으로 호출 (부모에서 함수 새로 생성 최소화)
  onOpen: (id: string) => void;
  onOpenEdit: (id: string) => void;
  onRemove: (id: string) => void;
};

function ProperNounCardInner(props: Props) {
  const { entry: n, kindLabel, editMode, onOpen, onOpenEdit, onRemove } = props;

  const id = String(n?.id ?? "");
  const iconSrc = useResolvedImage(n?.icon || "");
  const hasIcon = !!iconSrc;

  return (
    <div
      className={cn(
        "group relative rounded-2xl border border-white/10 bg-black/20",
        "p-3 sm:p-4",
        "transition will-change-transform cursor-pointer",
        "hover:-translate-y-[2px] hover:bg-black/25 hover:border-white/20",
        "hover:shadow-[0_18px_50px_rgba(0,0,0,0.45)]"
      )}
      onClick={() => onOpen(id)}
    >
      {/* glow */}
      <div
        className={cn(
          "pointer-events-none absolute -inset-[1px] rounded-2xl opacity-0",
          "transition-opacity duration-200 group-hover:opacity-100",
          "bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.12),transparent_55%),radial-gradient(circle_at_80%_30%,rgba(99,102,241,0.18),transparent_55%)]"
        )}
      />

      {/* scanlines */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 rounded-2xl opacity-0",
          "transition-opacity duration-200 group-hover:opacity-[0.12]",
          "bg-[linear-gradient(rgba(255,255,255,0.10)_1px,transparent_1px)] bg-[length:100%_3px]"
        )}
      />

      <div className="relative z-10 grid grid-cols-[56px_minmax(0,1fr)_auto] sm:grid-cols-[80px_minmax(0,1fr)_auto] gap-3 items-start">
        {/* ICON */}
        <div className="shrink-0">
          <div
            className={cn(
              "relative rounded-2xl border border-white/10 bg-black/30 overflow-hidden",
              "flex justify-center items-center",
              "transition group-hover:border-white/20 group-hover:bg-black/35",
              "w-14 h-14 sm:w-20 sm:h-20"
            )}
          >
            {hasIcon ? (
              <img
                src={iconSrc}
                className="block w-full h-full object-contain p-1 transition-transform duration-200 group-hover:scale-[1.04]"
                alt="아이콘 이미지"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div className="text-[10px] sm:text-[11px] text-white/40">NO ICON</div>
            )}
          </div>
        </div>

        {/* TEXT */}
        <div className="min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="min-w-0 flex-1">
              <div className="text-base sm:text-lg font-semibold truncate">
                {n?.title || "제목 없음"}
              </div>
            </div>
            <HUDBadge className="scale-95 shrink-0">{kindLabel}</HUDBadge>
          </div>

          {n?.summary ? (
            <div className="hidden sm:block mt-2 text-sm text-white/70 line-clamp-2 whitespace-pre-wrap">
              {n.summary}
            </div>
          ) : (
            <div className="hidden sm:block mt-2 text-sm text-white/50">요약 없음</div>
          )}
        </div>

        {/* ACTIONS */}
        <div
          className="shrink-0 flex items-center gap-1.5 sm:gap-2 pt-0.5"
          onClick={(e) => e.stopPropagation()}
        >
          {editMode && (
            <>
              <GButton
                variant="neutral"
                size="icon"
                icon={<Pencil className="w-4 h-4" />}
                onClick={() => onOpenEdit(id)}
                title="편집"
              />
              <GButton
                variant="danger"
                size="icon"
                icon={<Trash2 className="w-4 h-4" />}
                onClick={() => onRemove(id)}
                title="삭제"
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ✅ memo: entry 객체가 바뀌지 않는 한 리렌더 최소화
export default React.memo(
  ProperNounCardInner,
  (prev, next) =>
    prev.editMode === next.editMode &&
    prev.kindLabel === next.kindLabel &&
    prev.entry === next.entry &&
    prev.onOpen === next.onOpen &&
    prev.onOpenEdit === next.onOpenEdit &&
    prev.onRemove === next.onRemove
);