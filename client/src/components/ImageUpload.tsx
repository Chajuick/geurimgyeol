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

  aspect?: ImageUploadAspect;
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
  aspect = "video",
  previewClassName,
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string>("");

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

  // ✅ 다크 톤 공통 클래스
  const inputCls = [
    "w-full h-11 px-3 rounded-xl",
    "bg-black/25 text-white",
    "border border-white/10",
    "placeholder:text-white/30",
    "outline-none",
    "focus:ring-2 focus:ring-white/15 focus:border-white/20",
    "transition",
  ].join(" ");

  const softBtnWrap = [
    "rounded-xl border border-white/10 bg-white/5",
    "hover:bg-white/10 transition",
  ].join(" ");

  return (
    <div className={className}>
      {label && <div className="mb-2 text-xs text-white/55">{label}</div>}

      {/* ✅ Preview Frame */}
      <div
        className={[
          "relative mb-3 rounded-2xl border border-white/10 overflow-hidden",
          "bg-black/20 p-2",
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
          <div className="w-full h-full grid place-items-center text-xs text-white/35">
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

      {/* ✅ URL 입력 */}
      <input
        type="text"
        placeholder={placeholder}
        value={value?.startsWith("img:") ? "" : value}
        onChange={handleUrlChange}
        className={inputCls}
      />

      {/* ✅ 파일 선택 버튼도 다크톤으로 “박스” 안에 넣어서 튀는 느낌 제거 */}
      <div className={["mt-3 p-2", softBtnWrap].join(" ")}>
        <GButton
          // 가능하면 ghost/secondary가 더 예쁨. 없으면 default 유지해도 래핑으로 톤이 맞음.
          variant="default"
          text="파일 선택"
          onClick={() => fileInputRef.current?.click()}
          className={[
            "w-full",
            // ✅ 버튼 자체도 다크 톤으로 덮어쓰기 (GButton이 className 반영한다는 가정)
            "bg-white/10 hover:bg-white/15 text-white border border-white/10",
          ].join(" ")}
        />
      </div>
    </div>
  );
}