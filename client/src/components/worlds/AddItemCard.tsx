// src/components/worlds/AddItemCard.tsx
import React, { memo, useCallback } from "react";
import { useResolvedImage } from "@/hooks/useResolvedImage";
import { cn } from "@/lib/utils";

type Props = {
  id: string;
  name?: string;
  image?: string;
  onPick: (id: string) => void; // ✅ id 기반
};

function AddItemCardBase({ id, name, image, onPick }: Props) {
  const thumb = useResolvedImage(image || "");
  const title = name?.trim() || "이름 없음";

  const handleClick = useCallback(() => onPick(id), [onPick, id]);

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "group relative overflow-hidden text-left",
        "rounded-2xl border border-white/10 bg-black/25",
        "shadow-[0_18px_40px_rgba(0,0,0,0.55)]",
        "transition will-change-transform",
        "hover:-translate-y-0.5 hover:border-white/20 hover:bg-black/30",
        "focus:outline-none focus:ring-2 focus:ring-white/15"
      )}
    >
      {/* subtle top highlight line */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-white/15 opacity-70" />

      {/* hologram sheen */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300",
          "group-hover:opacity-100"
        )}
        style={{
          background:
            "radial-gradient(circle at 30% 15%, rgba(255,255,255,0.10), transparent 45%), radial-gradient(circle at 80% 30%, rgba(99,102,241,0.10), transparent 50%)",
        }}
      />

      {/* scanline */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300",
          "group-hover:opacity-100"
        )}
        style={{
          background:
            "repeating-linear-gradient(to bottom, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 6px)",
          mixBlendMode: "overlay",
        }}
      />

      {/* image area */}
      <div className="relative aspect-square overflow-hidden">
        {thumb ? (
          <img
            src={thumb}
            alt={title}
            className={cn(
              "h-full w-full object-cover",
              "transition-transform duration-300",
              "group-hover:scale-[1.06]"
            )}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="h-full w-full grid place-items-center bg-black/40">
            <div className="text-[11px] tracking-[0.26em] uppercase text-white/45">
              NO IMAGE
            </div>
          </div>
        )}

        {/* vignette + readability gradient */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,transparent_10%,rgba(0,0,0,0.35)_70%,rgba(0,0,0,0.65)_100%)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

        {/* nameplate */}
        <div className="absolute inset-x-0 bottom-0 p-2">
          <div
            className={cn(
              "rounded-xl border border-white/10 bg-black/55 px-2.5 py-2",
              "backdrop-blur-md",
              "shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
            )}
          >
            <div className="flex items-center justify-center">
              <div
                className={cn(
                  "text-sm font-semibold text-white/90 truncate",
                  "drop-shadow-[0_1px_10px_rgba(0,0,0,0.85)]"
                )}
                title={title}
              >
                {title}
              </div>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}

export default memo(AddItemCardBase);