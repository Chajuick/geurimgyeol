import { Pencil, Trash2, Eye } from "lucide-react";
import { HUDBadge } from "@/components/ui/hud";
import GButton from "@/components/ui/gyeol-button";
import { useResolvedImage } from "@/hooks/useResolvedImage";
import { cn } from "@/lib/utils";

export default function ProperNounCard(props: {
  entry: any;
  kindLabel: string;
  editMode: boolean;
  onOpen: () => void;
  onOpenEdit: () => void;
  onRemove: () => void;
}) {
  const { entry: n, kindLabel, editMode, onOpen, onOpenEdit, onRemove } = props;

  const iconSrc = useResolvedImage(n.icon || "");
  const hasIcon = !!iconSrc;

  return (
    <div
      className="rounded-2xl border border-white/10 bg-black/20 p-4 hover:bg-black/25 transition"
      onDoubleClick={onOpen}
    >
      <div className="flex items-stretch justify-between gap-3">
        {/* LEFT */}
        <div className="min-w-0 flex items-stretch gap-3">
          {/* ICON */}
          <div className="shrink-0 self-stretch">
            <div
              className={cn(
                "h-full aspect-square",
                "rounded-2xl border border-white/10 bg-black/30 overflow-hidden",
                "grid place-items-center"
              )}
              style={{ maxHeight: 96 }} // 카드 높이 안정용 (원하면 120)
            >
              {hasIcon ? (
                <img
                  src={iconSrc}
                  className="w-full h-full object-cover"
                  alt=""
                />
              ) : (
                <div className="text-[11px] text-white/40">NO ICON</div>
              )}
            </div>
          </div>

          {/* TEXT */}
          <div className="min-w-50 flex flex-col">
            {/* ✅ 제목 + 분류(분류) 한 줄 */}
            <div className="flex items-center gap-2 min-w-0">
              <div className="text-lg font-semibold truncate min-w-0">
                {n.title || "제목 없음"}
              </div>

              <div className="shrink-0">
                <HUDBadge className="scale-95">{kindLabel}</HUDBadge>
              </div>
            </div>

            {/* ✅ 요약 */}
            {n.summary ? (
              <div className="mt-2 text-sm text-white/70 line-clamp-2 whitespace-pre-wrap">
                {n.summary}
              </div>
            ) : (
              <div className="mt-2 text-sm text-white/50">요약 없음</div>
            )}
          </div>
        </div>

        {/* ACTIONS */}
        <div className="shrink-0 flex items-center gap-2">
          {!editMode && (
            <GButton
              variant="neutral"
              size="icon"
              icon={<Eye className="w-4 h-4" />}
              onClick={onOpen}
              title="보기"
            />
          )}
          {editMode && (
            <>
              <GButton
                variant="neutral"
                size="icon"
                icon={<Pencil className="w-4 h-4" />}
                onClick={onOpenEdit}
                title="편집"
              />
              <GButton
                variant="danger"
                size="icon"
                icon={<Trash2 className="w-4 h-4" />}
                onClick={onRemove}
                title="삭제"
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
