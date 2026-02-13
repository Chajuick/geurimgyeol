import GButton from "@/components/ui/gyeol-button";
import { Trash2 } from "lucide-react";
import { useResolvedImage } from "@/hooks/useResolvedImage";

type Props = {
  name?: string;
  image?: string;
  active?: boolean;
  editMode?: boolean;
  onClick?: () => void;
  onDelete?: (e: React.MouseEvent) => void;
  className?: string;
};

export default function WorldThumbCard({
  name,
  image,
  active,
  editMode,
  onClick,
  onDelete,
  className = "",
}: Props) {
  const resolved = useResolvedImage(image || "");

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={onClick}
        className={[
          "w-full aspect-square overflow-hidden transition rounded-xl",
          "min-w-[64px] max-w-[120px]",
          "bg-white/5",
          active ? "ring-2 ring-white/30" : "hover:ring-2 hover:ring-white/20",
        ].join(" ")}
        title={name || ""}
        type="button"
      >
        {resolved ? (
          <img src={resolved} alt={name || ""} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full grid place-items-center text-[10px] text-white/40">
            NO
          </div>
        )}
      </button>

      {editMode && onDelete && (
        <GButton
          variant="danger"
          icon={<Trash2 className="w-3.5 h-3.5" />}
          onClick={(e: any) => {
            e.stopPropagation();
            onDelete(e);
          }}
          title="삭제"
          className="absolute -top-2 -right-2 shadow"
        />
      )}
    </div>
  );
}