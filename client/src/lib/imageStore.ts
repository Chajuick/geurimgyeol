// src/lib/imageStore.ts
import { get, set, del, keys } from "idb-keyval";

// 이미지 키는 "img:" prefix로 통일
export function makeImgKey() {
  return `img:${crypto.randomUUID()}`;
}

export async function saveImageBlob(key: string, blob: Blob) {
  await set(key, blob);
  return key;
}

export async function loadImageBlob(key: string) {
  return (await get<Blob>(key)) ?? null;
}

export async function removeImage(key: string) {
  await del(key);
}

export async function clearAllImages() {
  const all = await keys();
  await Promise.all(
    all
      .filter((k) => typeof k === "string" && k.startsWith("img:"))
      .map((k) => del(k))
  );
}

// DataURL → Blob 변환 (기존 base64도 수용)
export function dataUrlToBlob(dataUrl: string) {
  const [head, body] = dataUrl.split(",");
  const mime = head.match(/data:(.*?);base64/)?.[1] || "application/octet-stream";
  const bin = atob(body);
  const u8 = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
  return new Blob([u8], { type: mime });
}