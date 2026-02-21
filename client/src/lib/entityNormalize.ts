// client/src/lib/entityNormalize.ts
import type { SubImage, SymbolColor } from "@/types";

const DEFAULT_HEX = "#444444";

function upHex(v: any) {
    return String(v || DEFAULT_HEX).toUpperCase();
}

/** 구형/혼재 입력을 신형 SymbolColor[]로 정규화 */
export function normalizeSymbolColors(raw: any): SymbolColor[] {
    if (!raw) return [];
    const arr = Array.isArray(raw) ? raw : raw?.hex ? [raw] : [];

    return arr
        .map((c: any, idx: number) => {
            if (!c) return null;

            // string 배열: ["#FF00AA", ...]
            if (typeof c === "string") {
                const hex = upHex(c);
                return {
                    id: `sc-${hex}-${idx}`,
                    name: "",
                    hex,
                } satisfies SymbolColor;
            }

            const hex = upHex(c.hex ?? c.color);
            const id = String(c.id ?? `sc-${hex}-${idx}`);
            const name = String(c.name ?? c.label ?? "");
            return { id, name, hex } satisfies SymbolColor;
        })
        .filter(Boolean) as SymbolColor[];
}

/** 구형/혼재 입력을 신형 SubImage[]로 정규화 */
export function normalizeSubImages(raw: any): SubImage[] {
    if (!raw) return [];
    const arr = Array.isArray(raw) ? raw : [];

    return arr
        .map((s: any) => {
            if (!s) return null;

            // string 배열: ["url", ...]
            if (typeof s === "string") {
                return {
                    image: String(s),
                    summary: "",
                    description: "",
                } satisfies SubImage;
            }

            const image = String(s.image ?? s.url ?? "");
            const summary = String(s.summary ?? s.caption ?? "");
            const description = String(s.description ?? "");
            return { image, summary, description } satisfies SubImage;
        })
        .filter(Boolean) as SubImage[];
}

/** 저장할 때도 “신형 스키마”로 한번 더 고정 */
export function sanitizeSymbolColors(colors: any): SymbolColor[] {
    return normalizeSymbolColors(colors).map((c, i) => ({
        id: String(c.id || `sc-${c.hex}-${i}`),
        name: String(c.name || ""),
        hex: upHex(c.hex),
    }));
}

export function sanitizeSubImages(subs: any): SubImage[] {
    return normalizeSubImages(subs).map((s) => ({
        image: String(s.image || ""),
        summary: String(s.summary || ""),
        description: String(s.description || ""),
    }));
}

/** 캐시 비교용(신 스키마 기준) */
export function symbolColorsEqual(a: SymbolColor[] = [], b: SymbolColor[] = []) {
    if (a === b) return true;
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
        const A = a[i], B = b[i];
        if (!A || !B) return false;
        if (String(A.id) !== String(B.id)) return false;
        if (upHex(A.hex) !== upHex(B.hex)) return false;
        if (String(A.name ?? "") !== String(B.name ?? "")) return false;
    }
    return true;
}

export function subImagesEqual(a: SubImage[] = [], b: SubImage[] = []) {
    if (a === b) return true;
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
        const A = a[i], B = b[i];
        if (!A || !B) return false;
        if (String(A.image ?? "") !== String(B.image ?? "")) return false;
        if (String(A.summary ?? "") !== String(B.summary ?? "")) return false;
        if (String(A.description ?? "") !== String(B.description ?? "")) return false;
    }
    return true;
}