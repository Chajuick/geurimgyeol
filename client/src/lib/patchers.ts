import type { PortfolioData, WorldData } from "@/types";

/** Settings 업데이트 */
export const patchSettings = (
    prev: PortfolioData,
    patch: Partial<PortfolioData["settings"]>
): PortfolioData => ({
    ...prev,
    settings: { ...prev.settings, ...patch },
});

/** World 업데이트 */
export const patchWorld = (
    prev: PortfolioData,
    worldId: string,
    patch: Partial<WorldData>
): PortfolioData => ({
    ...prev,
    worlds: prev.worlds.map(w =>
        w.id === worldId ? { ...w, ...patch } : w
    ),
});