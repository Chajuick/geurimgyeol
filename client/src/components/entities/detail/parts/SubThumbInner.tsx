import React from "react";
import { useResolvedImage } from "@/hooks/useResolvedImage";

export default function SubThumbInner(props: { image: string; alt?: string }) {
  const { image, alt = "sub" } = props;
  const resolved = useResolvedImage(image || "");

  if (!resolved) {
    return (
      <div className="w-full h-full grid place-items-center text-white/30 text-xs">
        NO IMAGE
      </div>
    );
  }

  return (
    <img
      src={resolved}
      alt={alt}
      loading="lazy"
      decoding="async"
      className="w-full h-full object-contain"
    />
  );
}
