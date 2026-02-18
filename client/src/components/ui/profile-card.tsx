// ProfileCard.tsx
import React from "react";

type ProfileCardProps = {
  imageUrl?: string;
  name?: string;
  onClick?: () => void;
  selected?: boolean;
  className?: string;
};

export default function ProfileCard({
  imageUrl,
  name,
  selected = false,
  className = "",
}: ProfileCardProps) {
  const hasImage = !!imageUrl;
  const hasName = !!name;

  return (
    <div
      className={[
        "group relative w-full overflow-hidden rounded-2xl",
        "bg-zinc-950/70 text-left",
        "border transition-all duration-200",
        selected
          ? "border-violet-300/40 ring-1 ring-violet-300/25 shadow-[0_0_0_1px_rgba(196,181,253,.18),0_20px_60px_rgba(0,0,0,.55)]"
          : "border-white/10 hover:border-white/20 shadow-[0_20px_60px_rgba(0,0,0,.55)]",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300/35",
        className,
      ].join(" ")}
    >
      <div className="relative aspect-[4/5] w-full">
        {/* ========================= */}
        {/* IMAGE EXISTS */}
        {/* ========================= */}
        {hasImage ? (
          <>
            <img
              src={imageUrl}
              alt={name || "profile"}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />

            {/* vignette */}
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.55)_0%,rgba(0,0,0,.08)_40%,rgba(0,0,0,.82)_100%)]" />

            {/* premium shine */}
            <div className="pointer-events-none absolute -left-1/2 top-0 h-full w-1/2 rotate-12 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,.10),transparent)] opacity-0 group-hover:opacity-100 group-hover:translate-x-[240%] transition-all duration-700" />
          </>
        ) : (
          /* ========================= */
          /* NO IMAGE PLACEHOLDER */
          /* ========================= */
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/60">
            <div className="text-center px-4">
              <div className="text-sm text-white/50 tracking-wide">
                이미지가 없습니다
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}