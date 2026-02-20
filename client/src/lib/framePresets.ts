import type { FramePresetId } from "@/types";

export const OUTER_PRESETS = new Set<FramePresetId>([
    "border",
    "glow-soft",
    "glow-strong",
    "targeting",
]);

export function isOuterPreset(id: FramePresetId) {
    return OUTER_PRESETS.has(id);
}

export const OUTER_OPTIONS: { id: FramePresetId; label: string }[] = [
    { id: "none", label: "없음" },
    { id: "border", label: "외곽선" },
    { id: "glow-soft", label: "발광도(약)" },
    { id: "glow-strong", label: "발광도(강)" },
    { id: "targeting", label: "조준 HUD" },
];

export const INNER_OPTIONS: { id: FramePresetId; label: string }[] = [
    { id: "none", label: "없음" },
    { id: "scan-sweep", label: "스캔 스윕" },
    { id: "glass-surface", label: "유리 표면" },
    { id: "steel-surface", label: "강철 표면" },
];

export const FRAME_PRESETS: { id: FramePresetId; label: string; desc?: string }[] = [
    { id: "none", label: "없음" },
    { id: "border", label: "외곽선" },
    { id: "glow-soft", label: "발광도(약)" },
    { id: "glow-strong", label: "발광도(강)" },
    { id: "targeting", label: "조준 HUD" },
    { id: "scan-sweep", label: "스캔 스윕" },
    { id: "glass-surface", label: "유리 표면" },
    { id: "steel-surface", label: "강철 표면" },
];