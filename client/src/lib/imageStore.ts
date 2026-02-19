// src/lib/imageStore.ts
import { get, set, del } from "idb-keyval";

const IMG_PREFIX = "img:";
const IMG_INDEX_KEY = "__img_index__"; // 이미지 키 목록 저장용

// 안전한 UUID 생성 (randomUUID 없을 때 폴백)
function safeUUID() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  // 폴백: 충분히 유니크한 문자열
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

// 이미지 키는 "img:" prefix로 통일
export function makeImgKey() {
  return `${IMG_PREFIX}${safeUUID()}`;
}

// 내부: 이미지 키 인덱스 관리
async function readIndex(): Promise<string[]> {
  return (await get<string[]>(IMG_INDEX_KEY)) ?? [];
}
async function writeIndex(next: string[]) {
  await set(IMG_INDEX_KEY, Array.from(new Set(next)));
}
async function addToIndex(key: string) {
  const cur = await readIndex();
  if (!cur.includes(key)) {
    cur.push(key);
    await writeIndex(cur);
  }
}
async function removeFromIndex(key: string) {
  const cur = await readIndex();
  const next = cur.filter((k) => k !== key);
  await writeIndex(next);
}

/** Blob 저장 */
export async function saveImageBlob(key: string, blob: Blob) {
  if (!key.startsWith(IMG_PREFIX)) {
    throw new Error(`Invalid image key: must start with "${IMG_PREFIX}"`);
  }
  await set(key, blob);
  await addToIndex(key);
  return key;
}

/** Blob 로드 */
export async function loadImageBlob(key: string) {
  return (await get<Blob>(key)) ?? null;
}

/** 단일 삭제 */
export async function removeImage(key: string) {
  await del(key);
  if (key.startsWith(IMG_PREFIX)) {
    await removeFromIndex(key);
  }
}

/** 전체 삭제 (img: 만) */
export async function clearAllImages() {
  const all = await readIndex();
  await Promise.all(all.map((k) => del(k)));
  await writeIndex([]);
}

/** (선택) 인덱스 조회: 디버깅/유지보수에 도움 */
export async function listImageKeys() {
  return await readIndex();
}

/** DataURL → Blob 변환 (base64 / non-base64 모두 수용) */
export function dataUrlToBlob(dataUrl: string) {
  const [head, body] = dataUrl.split(",");
  if (!head || body == null) {
    throw new Error("Invalid data URL");
  }

  const mime = head.match(/data:(.*?)(;base64)?$/)?.[1] || "application/octet-stream";
  const isBase64 = head.includes(";base64");

  if (isBase64) {
    const bin = atob(body);
    const u8 = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
    return new Blob([u8], { type: mime });
  }

  // non-base64 (percent-encoded)
  const decoded = decodeURIComponent(body);
  return new Blob([decoded], { type: mime });
}