import * as React from "react";
import { Pencil, Trash2 } from "lucide-react";
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
      role="button"
      tabIndex={0}
      className={cn(
        "group relative rounded-2xl border border-white/[0.07] bg-white/[0.02]",
        "p-3 sm:p-4 cursor-pointer outline-none",
        "transition-[transform,background-color,border-color] duration-300",
        "hover:-translate-y-0.5 hover:bg-white/[0.05] hover:border-white/15",
        "focus-visible:ring-2 focus-visible:ring-brand/50"
      )}
      onClick={() => onOpen(id)}
      onKeyDown={e => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(id);
        }
      }}
    >
      <div className="relative grid grid-cols-[56px_minmax(0,1fr)] sm:grid-cols-[72px_minmax(0,1fr)] gap-3 sm:gap-4 items-center">
        {/* ICON */}
        <div className="grid place-items-center w-14 h-14 sm:w-[72px] sm:h-[72px] rounded-2xl bg-black/30 border border-white/[0.07] overflow-hidden">
          {hasIcon ? (
            <img
              src={iconSrc}
              className="block w-full h-full object-contain p-1 transition-transform duration-300 group-hover:scale-[1.06]"
              alt=""
              loading="lazy"
              decoding="async"
            />
          ) : null}
        </div>

        {/* TEXT */}
        <div className="min-w-0">
          <div className="text-[11px] font-medium text-brand/90">
            {kindLabel}
          </div>
          <div className="mt-0.5 text-base sm:text-lg font-semibold truncate">
            {n?.title || "제목 없음"}
          </div>
          {n?.summary ? (
            <div className="mt-1 text-sm text-white/55 line-clamp-1 whitespace-pre-wrap">
              {n.summary}
            </div>
          ) : null}
        </div>
      </div>

      {/* ACTIONS (hover) */}
      {editMode && (
        <div
          className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity"
          onClick={e => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => onOpenEdit(id)}
            title="편집"
            aria-label="편집"
            className="grid h-8 w-8 place-items-center rounded-full bg-black/50 border border-white/15 text-white/75 hover:bg-white/15 hover:text-white transition-colors"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onRemove(id)}
            title="삭제"
            aria-label="삭제"
            className="grid h-8 w-8 place-items-center rounded-full bg-black/50 border border-white/15 text-white/75 hover:bg-red-500/80 hover:text-white hover:border-transparent transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
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
