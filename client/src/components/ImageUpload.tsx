import { useEffect, useMemo, useRef, useState } from "react";
import {
  saveImageBlob,
  loadImageBlob,
  makeImgKey,
  dataUrlToBlob,
  removeImage,
} from "@/lib/imageStore";
import GButton from "@/components/ui/gyeol-button";
import { X, Image as ImageIcon, Link2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

type ImageUploadAspect = "video" | "square" | "free";

/** ✅ 이미지 용도에 따라 압축/리사이즈 정책 적용 */
export type ImageKind = "profile" | "illustration" | "background";

type ImageUploadProps = {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  accept?: string;
  className?: string;

  aspect?: ImageUploadAspect;
  previewClassName?: string;

  /** ✅ 추가: 이미지 종류 (압축 정책 선택) */
  kind?: ImageKind;

  /** ✅ 추가: URL 입력란 표시 여부 */
  allowUrl?: boolean;
};

function aspectToClass(aspect: ImageUploadAspect) {
  if (aspect === "square") return "aspect-square";
  if (aspect === "video") return "aspect-video";
  return ""; // free
}

/** ✅ kind별 목표 리사이즈/압축 정책 */
function getCompressPolicy(kind: ImageKind) {
  switch (kind) {
    case "profile":
      return {
        maxDim: 640,          // 긴 변 기준
        quality: 0.82,        // webp 품질
        maxBytes: 220_000,    // 목표 용량(대략)
      };
    case "illustration":
      return {
        maxDim: 1600,
        quality: 0.84,
        maxBytes: 900_000,
      };
    case "background":
      return {
        maxDim: 2200,
        quality: 0.82,
        maxBytes: 1_200_000,
      };
  }
}

/** ✅ 파일/블롭 -> 압축된 Blob(webp)로 변환 */
async function compressToWebp(input: Blob, kind: ImageKind): Promise<Blob> {
  const policy = getCompressPolicy(kind);

  // 이미 충분히 작은 경우는 그대로 저장(불필요 변환 방지)
  // (그래도 압축을 "항상" 하고 싶으면 이 early return 지우면 됨)
  if (input.size <= policy.maxBytes) return input;

  const bitmap = await createImageBitmap(input);
  const { width, height } = bitmap;

  const long = Math.max(width, height);
  const scale = long > policy.maxDim ? policy.maxDim / long : 1;

  const outW = Math.max(1, Math.round(width * scale));
  const outH = Math.max(1, Math.round(height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;

  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return input;

  // 리사이즈 품질
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  ctx.clearRect(0, 0, outW, outH);
  ctx.drawImage(bitmap, 0, 0, outW, outH);

  // toBlob은 비동기
  const blob: Blob | null = await new Promise((resolve) => {
    canvas.toBlob(
      (b) => resolve(b),
      "image/webp",
      policy.quality
    );
  });

  // webp 변환 실패 시 원본
  if (!blob) return input;

  // 변환 결과가 원본보다 커지는 케이스 방지
  if (blob.size >= input.size) return input;

  return blob;
}

export default function ImageUpload({
  value,
  onChange,
  label,
  accept = "image/*",
  className,
  aspect = "video",
  previewClassName,
  kind = "illustration",
  allowUrl = true,
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string>("");
  const [busy, setBusy] = useState(false);

  // preview resolve
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

      // 외부 URL은 그대로
      setPreview(value);
    })();

    return () => {
      alive = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [value]);

  const finalPreviewClassName = useMemo(() => {
    const base = previewClassName ?? aspectToClass(aspect);
    return [
      "relative rounded-2xl overflow-hidden",
      "border border-white/10",
      "bg-black/25",
      "p-2",
      base,
    ].join(" ");
  }, [previewClassName, aspect]);

  const inputCls = useMemo(
    () =>
      [
        "w-full h-11 px-3 rounded-xl",
        "bg-black/25 text-white",
        "border border-white/10",
        "placeholder:text-white/30",
        "outline-none",
        "focus:ring-2 focus:ring-white/15 focus:border-white/20",
        "transition",
      ].join(" "),
    []
  );

  const panelCls = useMemo(
    () =>
      [
        "rounded-2xl border border-white/10 bg-white/5",
        "shadow-[0_18px_60px_rgba(0,0,0,.45)]",
      ].join(" "),
    []
  );

  const badgeText = useMemo(() => {
    if (kind === "profile") return "프로필 이미지";
    if (kind === "background") return "배경 이미지";
    return "일러스트 이미지";
  }, [kind]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBusy(true);
    try {
      const key = makeImgKey();

      // ✅ 종류별 압축 후 저장
      const compressed = await compressToWebp(file, kind);
      await saveImageBlob(key, compressed);

      onChange(key);
      e.target.value = "";
    } finally {
      setBusy(false);
    }
  };

  const handleUrlChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;

    // dataURL은 저장/압축 가능
    if (v.startsWith("data:")) {
      setBusy(true);
      try {
        const key = makeImgKey();
        const raw = dataUrlToBlob(v);
        const compressed = await compressToWebp(raw, kind);
        await saveImageBlob(key, compressed);
        onChange(key);
      } finally {
        setBusy(false);
      }
      return;
    }

    // 외부 URL은 그냥 문자열로 보관(크로스 오리진 fetch/압축은 여기서 안 함)
    onChange(v);
  };

  const handleClear = async () => {
    if (!value) return;

    setBusy(true);
    try {
      if (value.startsWith("img:")) {
        await removeImage(value);
      }
      onChange("");
      setPreview("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={className}>
      {label && (
        <div className="mb-2 flex items-center justify-between">
          <div className="text-xs text-white/60">{label}</div>
          <div className="text-[11px] text-white/35">{badgeText}</div>
        </div>
      )}

      {/* Preview */}
      <div className={finalPreviewClassName}>
        {preview ? (
          <>
            <img
              src={preview}
              alt="preview"
              className="w-full h-full object-contain rounded-xl"
            />

            <div className="absolute top-2 right-2">
              <GButton
                variant="danger"
                size="icon"
                icon={<X className="w-4 h-4" />}
                onClick={handleClear}
                title="이미지 지우기"
                disabled={busy}
              />
            </div>
          </>
        ) : (
          <div className="w-full h-full grid place-items-center text-xs text-white/35">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 opacity-70" />
              미리보기
            </div>
          </div>
        )}

        {/* 로딩 오버레이 */}
        {busy && (
          <div className="absolute inset-0 grid place-items-center bg-black/45 backdrop-blur-[1px]">
            <div className="text-xs text-white/70">처리 중…</div>
          </div>
        )}
      </div>

      {/* hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* 파일 선택 버튼 (GButton className 덧칠 없이, 래퍼로 톤 맞추기) */}
      <div className={cn("mt-3 p-2", panelCls)}>
        <GButton
          variant="neutral"
          text={busy ? "처리 중..." : "파일 선택"}
          icon={<Upload className="w-4 h-4" />}
          onClick={() => fileInputRef.current?.click()}
          disabled={busy}
          className="w-full" // ✅ 레이아웃용(색/톤 덧칠 X)
        />
      </div>
    </div>
  );
}