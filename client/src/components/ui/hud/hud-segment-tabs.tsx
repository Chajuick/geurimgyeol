import * as React from "react";
import { cn } from "@/lib/utils";

export type SegmentTabItem<T extends string> = {
  key: T;
  label: string;
  icon?: React.ReactNode;
  right?: React.ReactNode; // ex) count badge
  disabled?: boolean;
};

export default function HUDSegmentTabs<T extends string>(props: {
  value: T;
  onChange: (v: T) => void;
  items: SegmentTabItem<T>[];
  className?: string;
}) {
  const { value, onChange, items, className } = props;

  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-black/20 p-1",
        "flex gap-1",
        className
      )}
      role="tablist"
      aria-label="HUD tabs"
    >
      {items.map((it) => {
        const active = it.key === value;

        return (
          <button
            key={it.key}
            type="button"
            disabled={it.disabled}
            onClick={() => {
              if (it.disabled || active) return; // ✅ active 탭 재클릭 번쩍 방지
              onChange(it.key);
            }}
            className={cn(
              "flex-1 min-w-0 px-3 py-2 rounded-xl",
              "transition-[background-color,border-color,color,box-shadow,transform,filter] duration-200",
              "flex items-center justify-center gap-2",
              "outline-none select-none",

              // ✅ focus 번쩍 통제 (키보드 접근성은 유지)
              "focus-visible:ring-2 focus-visible:ring-amber-300/25 focus-visible:ring-offset-0",

              // ✅ 눌림(클릭 순간) 번쩍 통제
              !active && !it.disabled ? "active:scale-[0.99] active:bg-white/7" : "",

              it.disabled ? "opacity-40 cursor-not-allowed" : "",
              active ? "pointer-events-none" : "",

              active
                ? cn(
                    "bg-white/10 border border-white/15 text-white",
                    "shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_18px_40px_rgba(0,0,0,0.35)]"
                  )
                : "text-white/55 hover:text-white hover:bg-white/5"
            )}
            role="tab"
            aria-selected={active}
            aria-current={active ? "page" : undefined}
          >
            {it.icon ? (
              <span className={cn("opacity-90", active ? "opacity-100" : "opacity-70")}>
                {it.icon}
              </span>
            ) : null}

            <span className="text-sm font-medium truncate">{it.label}</span>

            {it.right ? <span className="ml-1">{it.right}</span> : null}
          </button>
        );
      })}
    </div>
  );
}