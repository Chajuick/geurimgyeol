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
  className = "",
}: Props) {
  const resolved = useResolvedImage(image || "");

  return (
    <div className={`relative ${className}`}>
      <div
        className={[
          "relative w-full aspect-square overflow-hidden transition rounded-xl",
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
      </div>
    </div>
  );
}