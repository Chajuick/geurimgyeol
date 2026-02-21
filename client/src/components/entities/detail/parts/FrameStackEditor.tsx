// client/src/components/entities/detail/parts/FrameStackEditor.tsx
import React from "react";
import type { FramePresetId, FrameStack } from "@/types";

const PRESETS: { id: FramePresetId; label: string }[] = [
  { id: "none", label: "NONE" },
  { id: "border", label: "BORDER" },
  { id: "glow-soft", label: "GLOW S" },
  { id: "glow-strong", label: "GLOW L" },
  { id: "targeting", label: "TARGET" },
  { id: "scan-sweep", label: "SWEEP" },
  { id: "glass-surface", label: "GLASS" },
  { id: "steel-surface", label: "STEEL" },
];

export const DEFAULT_STACK: FrameStack = {
  presets: ["none"],
  thickness: 2,
  intensity: 0.9,
};

export default function FrameStackEditor(props: {
  value: FrameStack;
  onChange: (next: FrameStack) => void;
}) {
  const { value, onChange } = props;
  const presets = value.presets || [];

  const toggle = (id: FramePresetId) => {
    if (id === "none") return onChange({ ...value, presets: ["none"] });

    const has = presets.includes(id);
    const next = has
      ? presets.filter(p => p !== id)
      : [...presets.filter(p => p !== "none"), id];

    onChange({ ...value, presets: next.length ? next : ["none"] });
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
              className={[
                "px-3 py-1.5 rounded-xl text-[11px] tracking-[0.18em]",
                "border transition",
                active
                  ? "bg-white/10 border-white/25 text-white"
                  : "bg-black/25 border-white/10 text-white/65 hover:border-white/20 hover:text-white/80",
              ].join(" ")}
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
            value={value.thickness ?? 2}
            onChange={e =>
              onChange({ ...value, thickness: Number(e.target.value) })
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
            value={value.intensity ?? 0.9}
            onChange={e =>
              onChange({ ...value, intensity: Number(e.target.value) })
            }
            className="mt-1 w-full h-10 px-3 rounded-xl bg-black/25 border border-white/10 text-white outline-none
              focus:ring-2 focus:ring-white/15 focus:border-white/20"
          />
        </label>
      </div>
    </div>
  );
}
