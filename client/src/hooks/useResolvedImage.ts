import { useEffect, useRef, useState } from "react";
import { loadImageBlob } from "@/lib/imageStore";

const IMG_PREFIX = "img:";

export function useResolvedImage(src?: string) {
  const [resolved, setResolved] = useState<string>("");
  const lastObjectUrlRef = useRef<string>("");

  useEffect(() => {
    let cancelled = false;

    // src가 바뀌는 즉시 이전 objectURL 정리
    if (lastObjectUrlRef.current) {
      URL.revokeObjectURL(lastObjectUrlRef.current);
      lastObjectUrlRef.current = "";
    }

    // src 없으면 초기화
    if (!src) {
      setResolved("");
      return;
    }

    // 일반 URL/dataURL이면 그대로
    if (!src.startsWith(IMG_PREFIX)) {
      setResolved(src);
      return;
    }

    (async () => {
      const blob = await loadImageBlob(src);
      if (cancelled) return;

      if (!blob) {
        setResolved("");
        return;
      }

      const objectUrl = URL.createObjectURL(blob);
      lastObjectUrlRef.current = objectUrl;
      setResolved(objectUrl);
    })();

    return () => {
      cancelled = true;
      if (lastObjectUrlRef.current) {
        URL.revokeObjectURL(lastObjectUrlRef.current);
        lastObjectUrlRef.current = "";
      }
    };
  }, [src]);

  return resolved;
}