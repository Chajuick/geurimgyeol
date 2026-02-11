import { Upload, X, Image as ImageIcon } from "lucide-react";
import { useRef } from "react";

interface ImageUploadProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function ImageUpload({
  value,
  onChange,
  placeholder = "Paste image URL…",
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => onChange(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files?.[0]);
  };

  const handleClear = () => {
    onChange("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-4">
      {/* ✅ Preview Area (항상 표시) */}
      <div className="relative rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden">
        <div className="aspect-video w-full">
          {value ? (
            <img
              src={value}
              alt="preview"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full flex flex-col items-center justify-center gap-2 bg-zinc-50 dark:bg-zinc-900/40">
              <div className="h-10 w-10 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-center justify-center">
                <ImageIcon className="h-5 w-5 text-zinc-600 dark:text-zinc-300" />
              </div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                미리보기 영역
              </p>
            </div>
          )}
        </div>

        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute top-3 right-3 h-9 w-9 rounded-lg bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
            aria-label="이미지 제거"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* ✅ Dropzone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="
          rounded-2xl
          border border-dashed border-zinc-300 dark:border-zinc-700
          bg-zinc-50 dark:bg-zinc-900/40
          hover:bg-zinc-100 dark:hover:bg-zinc-900
          transition
          px-6 py-8
          text-center
        "
      >
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-zinc-950 shadow border border-zinc-200 dark:border-zinc-800">
          <Upload className="h-5 w-5 text-zinc-700 dark:text-zinc-200" />
        </div>

        <p className="mt-3 text-sm font-medium text-zinc-900 dark:text-zinc-100">
          이미지를 이곳에 드래그하거나 클릭하여 선택하세요
        </p>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          JPG, PNG, WebP 형식을 지원합니다
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleFile(e.target.files?.[0])}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="
            mt-4 inline-flex items-center justify-center
            rounded-lg border border-zinc-200 dark:border-zinc-800
            bg-white dark:bg-zinc-950
            px-4 h-9 text-sm font-medium
            text-zinc-900 dark:text-zinc-100
            hover:bg-zinc-50 dark:hover:bg-zinc-900
          "
        >
          파일 선택
        </button>
      </div>

      {/* (선택) URL 입력도 유지하고 싶으면 */}
      <input
        type="text"
        value={value.startsWith("data:") ? "" : value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="
          w-full h-10 rounded-lg px-3 text-sm
          border border-zinc-200 bg-white text-zinc-900
          placeholder:text-zinc-400
          focus:outline-none focus:ring-2 focus:ring-zinc-900/10
          dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100
          dark:placeholder:text-zinc-500 dark:focus:ring-white/10
        "
      />
    </div>
  );
}