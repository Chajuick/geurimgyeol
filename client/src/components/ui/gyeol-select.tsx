import * as React from "react";
import { cn } from "@/lib/utils";

export type SelectOption = {
  id: string;
  label: string;
  icon?: React.ReactNode;
};

type Props = {
  value: string;
  onChange: (v: string) => void;
  options: SelectOption[];

  placeholder?: string;
  disabled?: boolean;
  className?: string;

  /** 옵션: 드롭다운 최대 높이 */
  maxHeightClassName?: string; // ex) "max-h-72"
};

export default function SelectBox({
  value,
  onChange,
  options,
  placeholder = "선택",
  disabled,
  className,
  maxHeightClassName = "max-h-72",
}: Props) {
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.id === value);

  // ✅ 외부 클릭 시 닫기
  React.useEffect(() => {
    function handleDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleDown);
    return () => document.removeEventListener("mousedown", handleDown);
  }, []);

  // ✅ ESC로 닫기
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      {/* BUTTON */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((v) => !v)}
        className={cn(
          "w-full px-3 py-2 rounded-xl",
          "bg-white/5 border border-white/15",
          "text-left text-white",
          "flex items-center justify-between gap-2",
          "transition-all duration-200",
          // HUD pop
          open ? "bg-white/8 border-white/25 shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_18px_40px_rgba(0,0,0,0.45)]" : "",
          disabled
            ? "opacity-40 cursor-not-allowed"
            : "hover:bg-white/10 hover:border-white/25 active:scale-[0.99]"
        )}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className="flex items-center gap-2 min-w-0 truncate">
          {selected?.icon}
          {selected?.label ? (
            <span className="truncate">{selected.label}</span>
          ) : (
            <span className="text-white/40">{placeholder}</span>
          )}
        </span>

        <span
          className={cn(
            "text-white/60 transition-transform duration-200",
            open && "rotate-180"
          )}
        >
          ▾
        </span>
      </button>

      {/* DROPDOWN (애니메이션) */}
      {/* pointer-events 제어 + scale/opacity/translate로 자연스러운 펼침 */}
      <div
        className={cn(
          "absolute z-30 mt-2 w-full origin-top",
          "transition-all duration-150 ease-out",
          open
            ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
            : "opacity-0 -translate-y-1 scale-[0.98] pointer-events-none"
        )}
      >
        <div
          className={cn(
            "rounded-xl border border-white/10",
            "bg-[#0b0d12]/95 backdrop-blur",
            "shadow-[0_20px_60px_rgba(0,0,0,0.65)]",
            "overflow-hidden"
          )}
          role="listbox"
        >
          {/* 스크롤 영역 */}
          <div className={cn("overflow-auto", maxHeightClassName, "scroll-dark")}>
            {options.map((o) => {
              const active = o.id === value;
              return (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => {
                    onChange(o.id);
                    setOpen(false);
                  }}
                  className={cn(
                    "w-full px-3 py-2 text-left text-sm",
                    "flex items-center gap-2",
                    "transition-colors duration-150",
                    active
                      ? "bg-white/10 text-white"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  )}
                  role="option"
                  aria-selected={active}
                >
                  {o.icon}
                  <span className="truncate">{o.label}</span>
                </button>
              );
            })}
          </div>

          {/* 아래 얇은 라인(기계 UI 느낌) */}
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
      </div>
    </div>
  );
}