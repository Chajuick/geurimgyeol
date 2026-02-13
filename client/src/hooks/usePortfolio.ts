import { useEffect, useState } from "react";
import JSZip from "jszip";

import { PortfolioData } from "@/types";
import { DEFAULT_PORTFOLIO_DATA } from "@/lib/defaultData";
import {
  loadImageBlob,
  saveImageBlob,
  dataUrlToBlob,
  clearAllImages,
} from "@/lib/imageStore";

const STORAGE_KEY = "geurim-gyeol-portfolio";

/** data 전체에서 "img:" 키를 수집 */
function collectImageKeys(obj: any, out = new Set<string>()) {
  if (typeof obj === "string") {
    if (obj.startsWith("img:")) out.add(obj);
    return out;
  }
  if (!obj || typeof obj !== "object") return out;

  if (Array.isArray(obj)) {
    obj.forEach(v => collectImageKeys(v, out));
    return out;
  }

  Object.values(obj).forEach(v => collectImageKeys(v, out));
  return out;
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function replaceImgKeysWithDataUrls(obj: any): Promise<any> {
  if (typeof obj === "string") {
    if (obj.startsWith("img:")) {
      const blob = await loadImageBlob(obj);
      if (!blob) return ""; // 없으면 빈값 처리
      return await blobToDataUrl(blob);
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    return Promise.all(obj.map(replaceImgKeysWithDataUrls));
  }

  if (obj && typeof obj === "object") {
    const entries = await Promise.all(
      Object.entries(obj).map(async ([k, v]) => [k, await replaceImgKeysWithDataUrls(v)] as const)
    );
    return Object.fromEntries(entries);
  }

  return obj;
}

export function usePortfolio() {
  const [data, setData] = useState<PortfolioData>(DEFAULT_PORTFOLIO_DATA);
  const [isLoaded, setIsLoaded] = useState(false);

  // 로컬 스토리지에서 데이터 로드
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as PortfolioData;
        setData(parsed);
      } else {
        setData(DEFAULT_PORTFOLIO_DATA);
      }
    } catch (error) {
      console.error("Failed to load portfolio data:", error);
      setData(DEFAULT_PORTFOLIO_DATA);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  /** 저장(로컬스토리지 + state) */
  const saveData = (newData: PortfolioData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
      setData(newData);
    } catch (error) {
      console.error("Failed to save portfolio data:", error);
      // 저장 실패해도 state는 반영해두는 게 UX상 좋을 때가 많음
      setData(newData);
    }
  };

  /** ZIP으로 내보내기 (data.json + images/*) */
  const exportToJSON = async () => {
    const zip = new JSZip();

    // 1) data.json
    zip.file("data.json", JSON.stringify(data, null, 2));

    // 2) images/
    const imgKeys = Array.from(collectImageKeys(data));
    const imgFolder = zip.folder("images");

    for (const key of imgKeys) {
      const blob = await loadImageBlob(key);
      if (!blob) continue;

      // ":"는 파일명에서 애매할 수 있어 안전하게 치환
      const safeName = key.replaceAll(":", "__");
      imgFolder?.file(safeName, blob);
    }

    const outBlob = await zip.generateAsync({ type: "blob" });

    const url = URL.createObjectURL(outBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "geurim-gyeol-portfolio.zip";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportToSingleJSON = async () => {
    // data를 깊게 복사 + img:키를 dataURL로 교체한 결과
    const dataWithEmbeddedImages = (await replaceImgKeysWithDataUrls(data)) as PortfolioData;

    const element = document.createElement("a");
    const file = new Blob([JSON.stringify(dataWithEmbeddedImages, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(file);
    element.href = url;
    element.download = "geurim-gyeol-portfolio-embedded.json";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    URL.revokeObjectURL(url);
  };

  /** ZIP(.zip) 또는 JSON(.json) 가져오기 */
  const importFromJSON = async (file: File) => {
    // 1) ZIP이면 (추천 포맷)
    if (file.name.toLowerCase().endsWith(".zip")) {
      const zip = await JSZip.loadAsync(file);

      const dataText = await zip.file("data.json")?.async("string");
      if (!dataText) throw new Error("data.json not found in zip");

      const nextData = JSON.parse(dataText) as PortfolioData;

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
          if (key.startsWith("img:")) {
            await saveImageBlob(key, blob);
          }
        }
      }

      // ✅ 가져온 데이터는 로컬스토리지에도 저장
      saveData(nextData);
      return;
    }

    // 2) JSON이면 (기존 호환)
    if (file.name.toLowerCase().endsWith(".json")) {
      const text = await file.text();
      const parsed = JSON.parse(text);

      // JSON 안에 dataURL이 있으면 자동으로 img키로 변환해서 IndexedDB로 옮기기
      const migrateDataUrls = async (obj: any): Promise<any> => {
        if (typeof obj === "string" && obj.startsWith("data:")) {
          const key = `img:${crypto.randomUUID()}`;
          await saveImageBlob(key, dataUrlToBlob(obj));
          return key;
        }
        if (Array.isArray(obj)) return Promise.all(obj.map(migrateDataUrls));
        if (obj && typeof obj === "object") {
          const entries = await Promise.all(
            Object.entries(obj).map(async ([k, v]) => [
              k,
              await migrateDataUrls(v),
            ])
          );
          return Object.fromEntries(entries);
        }
        return obj;
      };

      const migrated = (await migrateDataUrls(parsed)) as PortfolioData;

      // ✅ 가져온 데이터는 로컬스토리지에도 저장
      saveData(migrated);
      return;
    }

    throw new Error("Unsupported file type");
  };

  /** 데이터 초기화 (이미지 IndexedDB까지 정리) */
  const resetData = async () => {
    await clearAllImages();
    saveData(DEFAULT_PORTFOLIO_DATA);
  };

  return {
    data,
    setData: saveData, // 외부에서 setData(...) 하면 저장까지 같이 됨
    isLoaded,
    exportToJSON, // 이름은 유지(사실 zip export)
    exportToSingleJSON,
    importFromJSON,
    resetData,
  };
}