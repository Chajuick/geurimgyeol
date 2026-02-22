import { useCallback, useEffect, useRef, useState } from "react";
import JSZip from "jszip";

import type { PortfolioData } from "@/types";
import { DEFAULT_PORTFOLIO_DATA } from "@/lib/defaultData";
import { loadImageBlob, saveImageBlob, clearAllImages } from "@/lib/imageStore";

const STORAGE_KEY = "geurim-gyeol-portfolio";
const SEED_FLAG_KEY = "geurim-gyeol__seeded_v1";
const SEED_ZIP_URL = "/seed/seed.zip";

const IMG_PREFIX = "img:";

/** data 전체에서 "img:" 키를 수집 */
function collectImageKeys(obj: any, out = new Set<string>()) {
  if (typeof obj === "string") {
    if (obj.startsWith(IMG_PREFIX)) out.add(obj);
    return out;
  }
  if (!obj || typeof obj !== "object") return out;

  if (Array.isArray(obj)) {
    obj.forEach((v) => collectImageKeys(v, out));
    return out;
  }

  Object.values(obj).forEach((v) => collectImageKeys(v, out));
  return out;
}

/** ✅ 안전한 JSON parse */
function safeParseJSON<T>(text: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

/** ✅ 스키마 마이그레이션: 누락 필드 채우기 + legacy rank -> rankId */
function migratePortfolioData(raw: any): PortfolioData {
  if (!raw || typeof raw !== "object") return DEFAULT_PORTFOLIO_DATA;

  const base = DEFAULT_PORTFOLIO_DATA;

  const merged: PortfolioData = {
    ...base,
    ...raw,
    profile: { ...base.profile, ...(raw.profile ?? {}) },
    settings: { ...base.settings, ...(raw.settings ?? {}) },
    worlds: Array.isArray(raw.worlds) ? raw.worlds : base.worlds,
    characters: Array.isArray(raw.characters) ? raw.characters : base.characters,
    creatures: Array.isArray(raw.creatures) ? raw.creatures : base.creatures,
  };
  merged.settings.editMode =
    typeof (merged.settings as any).editMode === "boolean"
      ? (merged.settings as any).editMode
      : false;
  // settings 필수값 보정(새 구조 기준)
  merged.settings.rankSets = merged.settings.rankSets ?? base.settings.rankSets;
  merged.settings.frameSettings =
    merged.settings.frameSettings ?? base.settings.frameSettings;

  const charSet = merged.settings.rankSets.characters;
  const creSet = merged.settings.rankSets.creatures;

  const charDefault =
    charSet.defaultTierId ?? charSet.tiers[0]?.id ?? "rank_default";
  const creDefault =
    creSet.defaultTierId ?? creSet.tiers[0]?.id ?? "threat_default";

  const labelToCharId = new Map((charSet.tiers ?? []).map((t) => [t.label, t.id]));
  const labelToCreId = new Map((creSet.tiers ?? []).map((t) => [t.label, t.id]));

  merged.characters = (merged.characters ?? []).map((c: any) => ({
    ...c,
    rankId: c?.rankId || labelToCharId.get(c?.rank) || charDefault,
  }));

  merged.creatures = (merged.creatures ?? []).map((c: any) => ({
    ...c,
    rankId: c?.rankId || labelToCreId.get(c?.rank) || creDefault,
  }));

  return merged;
}

/** seed.zip fetch → File 변환 */
async function fetchSeedZipAsFile(): Promise<File> {
  const res = await fetch(SEED_ZIP_URL, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch seed zip: ${res.status}`);
  const blob = await res.blob();
  return new File([blob], "seed.zip", { type: "application/zip" });
}

/** ZIP 검증: data.json 존재 + JSON 파싱 가능 */
async function readZipDataJson(zip: JSZip): Promise<PortfolioData> {
  const dataText = await zip.file("data.json")?.async("string");
  if (!dataText) throw new Error("data.json not found in zip");

  const parsed = safeParseJSON<any>(dataText);
  if (!parsed) throw new Error("data.json parse failed");

  return migratePortfolioData(parsed);
}

/**
 * ✅ ZIP import (data.json + images/*)
 * - 안전성: zip 검증/파싱 성공 후에만 기존 이미지 삭제
 */
async function importZipToStorage(
  file: File,
  setDataInternal: (next: PortfolioData) => void
) {
  if (!file.name.toLowerCase().endsWith(".zip")) {
    throw new Error("ZIP만 지원합니다.");
  }

  const zip = await JSZip.loadAsync(file);

  // ✅ 먼저 data.json 검증
  const nextData = await readZipDataJson(zip);

  // ✅ 여기까지 성공했을 때만 기존 이미지 제거(교체 import)
  await clearAllImages();

  // images 복원
  const images = zip.folder("images");
  if (images) {
    const entries = Object.keys(images.files);
    for (const path of entries) {
      if (path.endsWith("/")) continue;
      const f = zip.file(path);
      if (!f) continue;

      const blob = await f.async("blob");
      const filename = path.split("/").pop()!;
      // export에서 ":" -> "__" 했던 거 복구
      const key = filename.replaceAll("__", ":");
      if (key.startsWith(IMG_PREFIX)) {
        await saveImageBlob(key, blob);
      }
    }
  }

  // 최종 반영
  setDataInternal(nextData);
}

export function usePortfolio() {
  const [data, _setData] = useState<PortfolioData>(DEFAULT_PORTFOLIO_DATA);
  const [isLoaded, setIsLoaded] = useState(false);

  // 최신 data 스냅샷 (export 등에서 stale closure 방지)
  const dataRef = useRef<PortfolioData>(DEFAULT_PORTFOLIO_DATA);
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  // 저장 디바운스(연속 저장 방지)
  const saveTimer = useRef<number | null>(null);

  const persistToStorage = useCallback((next: PortfolioData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (error) {
      console.error("Failed to persist portfolio data:", error);
    }
  }, []);

  /** ✅ 내부 set + 저장 (값/함수 업데이터 둘 다 지원) */
  const setData = useCallback(
    (next: PortfolioData | ((prev: PortfolioData) => PortfolioData)) => {
      _setData((prev) => {
        const computed =
          typeof next === "function"
            ? (next as (p: PortfolioData) => PortfolioData)(prev)
            : next;

        const migrated = migratePortfolioData(computed);

        if (saveTimer.current) window.clearTimeout(saveTimer.current);
        saveTimer.current = window.setTimeout(() => {
          persistToStorage(migrated);
          saveTimer.current = null;
        }, 200);

        return migrated;
      });
    },
    [persistToStorage]
  );

  // ✅ 최초 로드: localStorage 없으면 seed.zip 자동 import (필요 시 재시도)
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);

        // 1) 저장된 데이터 있으면 그대로 사용
        if (stored) {
          const parsed = safeParseJSON<any>(stored);
          const migrated = migratePortfolioData(parsed);
          if (!cancelled) {
            _setData(migrated);
            setIsLoaded(true);
          }
          return;
        }

        // 2) 저장된 데이터 없으면 seed.zip 주입 시도
        //    - seeded 플래그가 있어도, storage가 없다면(유저가 지웠거나) seed 재주입이 더 자연스럽다.
        const seeded = localStorage.getItem(SEED_FLAG_KEY);

        // seed.zip 시도
        try {
          const seedFile = await fetchSeedZipAsFile();

          await importZipToStorage(seedFile, (next) => {
            if (cancelled) return;
            _setData(next);
            persistToStorage(next);
          });

          localStorage.setItem(SEED_FLAG_KEY, "1");
          if (!cancelled) setIsLoaded(true);
          return;
        } catch (seedErr) {
          console.warn(
            seeded
              ? "Seed flag exists but storage empty; seed re-import failed."
              : "Seed import failed.",
            seedErr
          );
        }

        // 3) seed 실패 시 fallback
        const fallback = migratePortfolioData(DEFAULT_PORTFOLIO_DATA);
        if (!cancelled) {
          _setData(fallback);
          persistToStorage(fallback);
          setIsLoaded(true);
        }
      } catch (e) {
        console.error("Failed to init portfolio:", e);
        const fallback = migratePortfolioData(DEFAULT_PORTFOLIO_DATA);
        if (!cancelled) {
          _setData(fallback);
          persistToStorage(fallback);
          setIsLoaded(true);
        }
      }
    })();

    return () => {
      cancelled = true;
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
  }, [persistToStorage]);

  /** ✅ ZIP으로 내보내기 (data.json + images/*) */
  const exportToZip = useCallback(async () => {
    const snapshot = dataRef.current;

    const zip = new JSZip();
    zip.file("data.json", JSON.stringify(snapshot, null, 2));

    const imgKeys = Array.from(collectImageKeys(snapshot));
    const imgFolder = zip.folder("images");

    for (const key of imgKeys) {
      const blob = await loadImageBlob(key);
      if (!blob) continue;
      const safeName = key.replaceAll(":", "__");
      imgFolder?.file(safeName, blob);
    }

    const outBlob = await zip.generateAsync({ type: "blob" });

    const url = URL.createObjectURL(outBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "seed.zip";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  /** ✅ ZIP 가져오기 (교체 import) */
  const importFromZip = useCallback(
    async (file: File) => {
      await importZipToStorage(file, (next) => {
        // setData로 보내면 migrate + debounce 저장까지 보장됨
        setData(next);
      });
    },
    [setData]
  );

  /**
   * ✅ 데이터 초기화
   * - “seed 상태로 되돌리기”가 기본 동작
   * - seed 실패 시 DEFAULT로 fallback
   */
  const resetData = useCallback(async () => {
    // 1) 기존 저장/이미지 정리
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = null;

    await clearAllImages();
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SEED_FLAG_KEY);

    // 2) 즉시 seed 재주입(주석/의도대로)
    try {
      const seedFile = await fetchSeedZipAsFile();
      await importZipToStorage(seedFile, (next) => {
        _setData(next);
        persistToStorage(next);
      });
      localStorage.setItem(SEED_FLAG_KEY, "1");
    } catch (e) {
      console.warn("Reset seed import failed. Falling back to default.", e);
      const fallback = migratePortfolioData(DEFAULT_PORTFOLIO_DATA);
      _setData(fallback);
      persistToStorage(fallback);
    }
  }, [persistToStorage]);

  return {
    data,
    setData,
    isLoaded,

    // zip-only
    exportToZip,
    importFromZip,

    resetData,
  };
}