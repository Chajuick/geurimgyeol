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
      className={cn(
        "group relative rounded-2xl border border-white/10 bg-black/20 p-4",
        "transition will-change-transform cursor-pointer",
        "hover:-translate-y-[2px] hover:bg-black/25 hover:border-white/20",
        "hover:shadow-[0_18px_50px_rgba(0,0,0,0.45)]"
      )}
      onClick={onOpen} // ✅ 카드 전체 클릭으로 열기
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

      <div className="relative z-10 flex items-stretch justify-between gap-3">
        {/* LEFT */}
        <div className="min-w-0 flex items-stretch gap-3">
          {/* ICON */}
          <div className="shrink-0 self-stretch">
            <div
              className={cn(
                "w-20 h-20 relative rounded-2xl border border-white/10 bg-black/30 overflow-hidden",
                "flex justify-center items-center",
                "transition group-hover:border-white/20 group-hover:bg-black/35"
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
                <div className="text-[11px] text-white/40">NO ICON</div>
              )}
            </div>
          </div>

          {/* TEXT */}
          <div className="min-w-50 flex flex-col">
            <div className="flex items-center gap-2 min-w-0">
              <div className="text-lg font-semibold truncate min-w-0">
                {n.title || "제목 없음"}
              </div>

              <div className="shrink-0">
                <HUDBadge className="scale-95">{kindLabel}</HUDBadge>
              </div>
            </div>

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
        <div
          className="shrink-0 flex items-center gap-2"
          onClick={e => e.stopPropagation()} // ✅ 버튼 클릭 시 카드 열기 방지
        >
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