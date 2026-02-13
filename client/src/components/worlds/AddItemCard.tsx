import { useResolvedImage } from "@/hooks/useResolvedImage";

type Props = {
  name?: string;
  image?: string;
  onPick: () => void;
};

export default function AddItemCard({ name, image, onPick }: Props) {
  const thumb = useResolvedImage(image || "");

  return (
    <button
      type="button"
      onClick={onPick}
      className="group overflow-hidden transition text-left rounded-xl border border-border hover:bg-secondary/30"
    >
      <div className="aspect-square bg-black/10 overflow-hidden rounded-t-xl">
        {thumb ? (
          <img
            src={thumb}
            alt={name || ""}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
            이미지 없음
          </div>
        )}
      </div>

      <div className="p-2">
        <div className="text-sm text-foreground text-center font-medium truncate">
          {name || "이름 없음"}
        </div>
      </div>
    </button>
  );
}