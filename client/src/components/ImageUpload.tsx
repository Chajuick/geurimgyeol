import { useEffect, useRef, useState } from "react";
import {
  saveImageBlob,
  loadImageBlob,
  makeImgKey,
  dataUrlToBlob,
  removeImage,
} from "@/lib/imageStore";
import GButton from "@/components/ui/gyeol-button";
import { X } from "lucide-react";

type ImageUploadAspect = "video" | "square";

type ImageUploadProps = {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  accept?: string;
  className?: string;

  /**
   * ✅ 추가: 미리보기 비율 프리셋
   * - 기본값: "video"
   */
  aspect?: ImageUploadAspect;

  /**
   * ✅ 기존 유지: 커스텀 클래스(우선 적용)
   * - aspect보다 우선순위가 높음
   */
  previewClassName?: string;
};

function aspectToClass(aspect: ImageUploadAspect) {
  return aspect === "square" ? "aspect-square" : "aspect-video";
}

export default function ImageUpload({
  value,
  onChange,
  label,
  placeholder = "이미지 URL을 입력하세요",
  accept = "image/*",
  className,

  // ✅ 기본 aspect는 video
  aspect = "video",

  // ✅ 커스텀 프리뷰 클래스 (있으면 이게 우선)
  previewClassName,
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string>("");

  // ✅ preview 생성
  useEffect(() => {
    let url = "";
    let alive = true;

    (async () => {
      if (!value) {
        setPreview("");
        return;
      }

      if (value.startsWith("img:")) {
        const blob = await loadImageBlob(value);
        if (!alive) return;

        if (!blob) {
          setPreview("");
          return;
        }

        url = URL.createObjectURL(blob);
        setPreview(url);
        return;
      }

      setPreview(value);
    })();

    return () => {
      alive = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [value]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const key = makeImgKey();
    await saveImageBlob(key, file);
    onChange(key);
    e.target.value = "";
  };

  const handleUrlChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;

    if (v.startsWith("data:")) {
      const key = makeImgKey();
      await saveImageBlob(key, dataUrlToBlob(v));
      onChange(key);
      return;
    }

    onChange(v);
  };

  const handleClear = async () => {
    if (!value) return;

    if (value.startsWith("img:")) {
      await removeImage(value);
    }

    onChange("");
    setPreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const finalPreviewClassName = previewClassName ?? aspectToClass(aspect);

  return (
    <div className={className}>
      {label && <div className="mb-2 text-xs text-muted-foreground">{label}</div>}

      {/* ✅ Preview Frame */}
      <div
        className={[
          "relative mb-3 rounded-xl border border-border overflow-hidden",
          "bg-secondary/30 p-2",
          finalPreviewClassName,
        ].join(" ")}
      >
        {preview ? (
          <>
            <img src={preview} alt="preview" className="w-full h-full object-contain" />

            <div className="absolute top-2 right-2">
              <GButton
                variant="danger"
                size="icon"
                icon={<X className="w-4 h-4" />}
                onClick={handleClear}
                title="이미지 지우기"
              />
            </div>
          </>
        ) : (
          <div className="w-full h-full grid place-items-center text-xs text-muted-foreground">
            미리보기
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />

      <input
        type="text"
        placeholder={placeholder}
        value={value?.startsWith("img:") ? "" : value}
        onChange={handleUrlChange}
        className="w-full px-3 h-10 rounded-lg border border-border bg-background text-black"
      />

      <GButton
        variant="default"
        text="파일 선택"
        onClick={() => fileInputRef.current?.click()}
        className="w-full mb-2"
      />
    </div>
  );
}