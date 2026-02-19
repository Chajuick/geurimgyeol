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
            onClick={() => !it.disabled && onChange(it.key)}
            className={cn(
              "flex-1 min-w-0 px-3 py-2 rounded-xl",
              "transition-all duration-200",
              "flex items-center justify-center gap-2",
              it.disabled ? "opacity-40 cursor-not-allowed" : "",
              active
                ? "bg-white/10 border border-white/15 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_18px_40px_rgba(0,0,0,0.35)]"
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