import React from "react";
import type { FramePresetId, FrameStack } from "@/types";
import { cn } from "@/lib/utils";

const PRESETS: { id: FramePresetId; label: string }[] = [
  { id: "none", label: "NONE" },
  { id: "border", label: "BORDER" },
  { id: "glow-soft", label: "GLOW S" },
  { id: "glow-strong", label: "GLOW L" },
  { id: "targeting", label: "TARGET" },
  { id: "scan-sweep", label: "SWEEP" },
  { id: "glass-surface", label: "GLASS" },
  { id: "steel-surface", label: "STEEL" },
  { id: "electric", label: "ELECTRIC" },
  { id: "flame", label: "FLAME" },
];

export default function FrameStackPicker(props: {
  value: FrameStack;
  onChange: (next: FrameStack) => void;
}) {
  const presets = props.value.presets || [];

  const toggle = (id: FramePresetId) => {
    if (id === "none") {
      props.onChange({ ...props.value, presets: ["none"] });
      return;
    }
    const has = presets.includes(id);
    const next = has
      ? presets.filter(p => p !== id)
      : [...presets.filter(p => p !== "none"), id];
    props.onChange({ ...props.value, presets: next.length ? next : ["none"] });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {PRESETS.map(p => {
          const active = presets.includes(p.id);
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => toggle(p.id)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-[11px] tracking-[0.18em]",
                "border transition",
                active
                  ? "bg-white/10 border-white/25 text-white"
                  : "bg-black/25 border-white/10 text-white/65 hover:border-white/20 hover:text-white/80"
              )}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="text-[11px] text-white/55 tracking-[0.22em]">
          THICKNESS
          <input
            type="number"
            min={1}
            max={10}
            value={props.value.thickness ?? 2}
            onChange={e =>
              props.onChange({
                ...props.value,
                thickness: Number(e.target.value),
              })
            }
            className="mt-1 w-full h-10 px-3 rounded-xl bg-black/25 border border-white/10 text-white outline-none
              focus:ring-2 focus:ring-white/15 focus:border-white/20"
          />
        </label>

        <label className="text-[11px] text-white/55 tracking-[0.22em]">
          INTENSITY
          <input
            type="number"
            step={0.05}
            min={0}
            max={1}
            value={props.value.intensity ?? 0.9}
            onChange={e =>
              props.onChange({
                ...props.value,
                intensity: Number(e.target.value),
              })
            }
            className="mt-1 w-full h-10 px-3 rounded-xl bg-black/25 border border-white/10 text-white outline-none
              focus:ring-2 focus:ring-white/15 focus:border-white/20"
          />
        </label>
      </div>
    </div>
  );
}
