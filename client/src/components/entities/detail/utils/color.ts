export function clamp255(n: number) {
    return Math.max(0, Math.min(255, n));
}

export function hexToRgb(hex: string) {
    const m = hex.trim().match(/^#?([0-9a-f]{6})$/i);
    if (!m) return null;
    const v = m[1];
    const r = parseInt(v.slice(0, 2), 16);
    const g = parseInt(v.slice(2, 4), 16);
    const b = parseInt(v.slice(4, 6), 16);
    return { r, g, b };
}

export function rgbToHex(r: number, g: number, b: number) {
    const rr = clamp255(r).toString(16).padStart(2, "0");
    const gg = clamp255(g).toString(16).padStart(2, "0");
    const bb = clamp255(b).toString(16).padStart(2, "0");
    return `#${rr}${gg}${bb}`.toUpperCase();
}

export function isHex6(v: string) {
    return /^#([0-9a-f]{6})$/i.test(v.trim());
}

export function getPrimaryColor(symbolColors: any): string | null {
    if (!symbolColors) return null;
    if (Array.isArray(symbolColors)) {
        const c = symbolColors.find((v) => v?.hex);
        return c?.hex ?? null;
    }
    if (typeof symbolColors === "object") {
        if ("hex" in symbolColors) return (symbolColors as any).hex ?? null;
    }
    return null;
}