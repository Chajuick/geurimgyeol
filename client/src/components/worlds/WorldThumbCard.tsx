import GButton from "@/components/ui/gyeol-button";
import { Trash2 } from "lucide-react";
import { useResolvedImage } from "@/hooks/useResolvedImage";

type Props = {
  name?: string;
  image?: string;
  editMode?: boolean;
  onClick?: () => void;
  onDelete?: (e: React.MouseEvent) => void;
  className?: string;
};

export default function WorldThumbCard({
  name,
  image,
  editMode,
  onDelete,
  className = "",
}: Props) {
  const resolved = useResolvedImage(image || "");

  return (
    <div className={`relative ${className}`}>
      <div
        className={[
          "relative w-full aspect-square overflow-hidden transition rounded-xl",
          "min-w-[64px]",
          "bg-white/5",
        ].join(" ")}
        title={name || ""}
      >
        {resolved ? (
          <img src={resolved} alt={name || ""} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full grid place-items-center text-[10px] text-white/40">
            NO
          </div>
        )}

        {editMode && onDelete && (
          <GButton
            variant="danger"
            icon={<Trash2 className="w-3.5 h-3.5" />}
            onClick={(e: any) => {
              e.stopPropagation();
              onDelete(e);
            }}
            title="삭제"
            className="absolute top-1 right-1 shadow w-4"
          />
        )}
      </div>
    </div>
  );
}