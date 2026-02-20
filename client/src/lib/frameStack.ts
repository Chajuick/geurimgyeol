import type {
  EntityMenuFrameSettings,
  FramePresetId,
  FrameStack,
  ID,
} from "@/types";

const uniq = <T,>(arr: T[]) => Array.from(new Set(arr));

/** selectedExtra 호환:
 * - OLD: { presets: FramePresetId[]; thickness?; intensity? }
 * - NEW: { outer: FramePresetId; inner: FramePresetId; thickness?; intensity? }
 */
function readSelectedExtraPresets(selectedExtra: any): FramePresetId[] {
  if (!selectedExtra) return [];

  // ✅ NEW: outer/inner 2슬롯
  if (typeof selectedExtra === "object" && (selectedExtra.outer || selectedExtra.inner)) {
    const outer = (selectedExtra.outer as FramePresetId) ?? "none";
    const inner = (selectedExtra.inner as FramePresetId) ?? "none";

    // "none"은 섞이면 제거되도록 아래 normalize에서 정리됨
    const out: FramePresetId[] = [];
    if (outer) out.push(outer);
    if (inner) out.push(inner);
    return out.filter(Boolean);
  }

  // ✅ OLD: presets 배열
  if (Array.isArray(selectedExtra.presets)) {
    return (selectedExtra.presets as FramePresetId[]).filter(Boolean);
  }

  return [];
}

export function resolveFrameStack(
  settings: EntityMenuFrameSettings | undefined,
  rankId: ID,
  selected: boolean
): FrameStack {
  const base = settings?.base ?? { presets: ["none"] as FramePresetId[] };

  const ov = (settings?.byRank ?? []).find(x => x.rankId === rankId);
  const selectedExtra = selected ? (settings as any)?.selectedExtra : undefined;

  // 1) base
  let presets: FramePresetId[] = (base.presets ?? ["none"]).filter(Boolean);
  let thickness = base.thickness ?? 2;
  let intensity = base.intensity ?? 0.9;

  // 2) byRank (replace/append)
  if (ov?.stack) {
    const ovPresets = (ov.stack.presets ?? ["none"]).filter(Boolean);

    if (ov.mode === "replace") {
      presets = ovPresets;
    } else {
      presets = uniq([...(presets ?? []), ...ovPresets]);
    }

    thickness = ov.stack.thickness ?? thickness;
    intensity = ov.stack.intensity ?? intensity;
  }

  // 3) ✅ selectedExtra는 무조건 덮어쓰기 (최우선)
  const extraPresets = readSelectedExtraPresets(selectedExtra);
  if (extraPresets.length) {
    presets = extraPresets;
    thickness =
      (selectedExtra?.thickness as number | undefined) ?? thickness;
    intensity =
      (selectedExtra?.intensity as number | undefined) ?? intensity;
  }

  // normalize
  presets = (presets ?? []).filter(Boolean);
  if (!presets.length) presets = ["none"];

  // none이 다른 프리셋과 같이 있으면 제거
  if (presets.length > 1) presets = presets.filter(p => p !== "none");

  // 중복 제거(outer+inner에서 같은 거 찍을 수도 있으니)
  presets = uniq(presets);

  return { presets, thickness, intensity };
}