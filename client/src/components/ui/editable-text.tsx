import * as React from "react";
import { Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  value: string;
  onChange: (next: string) => void;

  /** false면 일반 텍스트로만 표시 */
  editable: boolean;

  /** 여러 줄 입력 (Shift+Enter 없이 Enter로 줄바꿈) */
  multiline?: boolean;

  placeholder?: string;
  maxLength?: number;

  /** 표시/입력에 공통으로 적용되는 타이포 클래스 */
  className?: string;
  /** 표시용 래퍼 태그 */
  as?: "h1" | "h2" | "p" | "div" | "span";
  /** 편집 상태 진입 시 표시 텍스트 래퍼 클래스 (그라데이션 등 표시 전용 효과) */
  displayClassName?: string;
  /** 입력창 텍스트 정렬 */
  align?: "center" | "left";
};

/**
 * 편집 모드에서 클릭해 바로 수정하는 텍스트.
 * - Enter(단일행) / Ctrl+Enter(여러 줄) / blur → 저장
 * - Esc → 취소
 */
export default function EditableText({
  value,
  onChange,
  editable,
  multiline = false,
  placeholder = "텍스트를 입력하세요",
  maxLength,
  className,
  as: Tag = "div",
  displayClassName,
  align = "center",
}: Props) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(value);
  const inputRef = React.useRef<HTMLInputElement & HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);

  React.useEffect(() => {
    if (!editable) setEditing(false);
  }, [editable]);

  React.useEffect(() => {
    if (!editing) return;
    skipBlurRef.current = false;
    const el = inputRef.current;
    if (!el) return;
    el.focus();
    el.select();
  }, [editing]);

  // textarea 높이 자동 맞춤
  React.useLayoutEffect(() => {
    if (!editing || !multiline) return;
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [draft, editing, multiline]);

  // Enter/Esc로 입력창이 사라질 때 뒤따르는 blur가 다시 저장하지 않도록
  const skipBlurRef = React.useRef(false);

  const commit = () => {
    if (skipBlurRef.current) return;
    skipBlurRef.current = true;
    const next = multiline ? draft.replace(/\s+$/, "") : draft.trim();
    if (next !== value) onChange(next);
    setEditing(false);
  };

  const cancel = () => {
    skipBlurRef.current = true;
    setDraft(value);
    setEditing(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    // 한글 조합 중 Enter는 음절 확정용이므로 무시
    if (e.nativeEvent.isComposing) return;
    if (e.key === "Escape") {
      e.preventDefault();
      cancel();
      return;
    }
    if (e.key === "Enter" && (!multiline || e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      commit();
    }
  };

  if (!editable) {
    if (!value) return null;
    return (
      <Tag className={cn(className, multiline && "whitespace-pre-line")}>
        <span className={displayClassName}>{value}</span>
      </Tag>
    );
  }

  if (editing) {
    const shared = cn(
      className,
      "block w-full bg-white/[0.04] rounded-2xl outline-none",
      "ring-1 ring-brand/50 focus:ring-2 focus:ring-brand/60",
      "px-3 py-1 resize-none caret-brand placeholder:text-white/25",
      align === "center" ? "text-center" : "text-left"
    );

    return multiline ? (
      <textarea
        ref={inputRef}
        value={draft}
        rows={1}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={onKeyDown}
        className={cn(shared, "overflow-hidden")}
      />
    ) : (
      <input
        ref={inputRef}
        value={draft}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={onKeyDown}
        className={shared}
      />
    );
  }

  return (
    <Tag
      role="button"
      tabIndex={0}
      title="클릭해서 수정"
      onClick={() => setEditing(true)}
      onKeyDown={e => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setEditing(true);
        }
      }}
      className={cn(
        className,
        "group/edit relative cursor-text rounded-2xl px-3",
        // 좌측 정렬은 패딩만큼 당겨 텍스트 시작선을 유지
        align === "left" && "-mx-3",
        "outline-1 outline-dashed outline-transparent outline-offset-4",
        "hover:outline-white/20 focus-visible:outline-brand/60 transition-[outline-color]",
        multiline && "whitespace-pre-line"
      )}
    >
      {value ? (
        <span className={displayClassName}>{value}</span>
      ) : (
        <span className="text-white/25">{placeholder}</span>
      )}
      <span
        aria-hidden
        className={cn(
          "absolute -right-2 -top-2 grid place-items-center h-6 w-6 rounded-full",
          "bg-white text-zinc-950 shadow-lg",
          "opacity-0 scale-90 transition-[opacity,transform] duration-150",
          "group-hover/edit:opacity-100 group-hover/edit:scale-100"
        )}
      >
        <Pencil className="h-3 w-3" />
      </span>
    </Tag>
  );
}
