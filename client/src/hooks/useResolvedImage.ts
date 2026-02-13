import { useEffect, useState } from "react";
import { loadImageBlob } from "@/lib/imageStore";

/**
 * src가
 * - "img:..."면 IndexedDB에서 blob 로드 → objectURL 반환
 * - 일반 URL/dataURL이면 그대로 반환
 * - 없으면 "" 반환
 */
export function useResolvedImage(src?: string) {
  const [resolved, setResolved] = useState<string>("");

  useEffect(() => {
    let url = "";

    (async () => {
      if (!src) {
        setResolved("");
        return;
      }

      if (src.startsWith("img:")) {
        const blob = await loadImageBlob(src);
        if (!blob) {
          setResolved("");
          return;
        }
        url = URL.createObjectURL(blob);
        setResolved(url);
        return;
      }

      setResolved(src);
    })();

    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [src]);

  return resolved;
}