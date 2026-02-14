// src/components/editor/forms/CharacterEditForm.tsx
import React from "react";
import { Plus, X } from "lucide-react";
import GButton from "@/components/ui/gyeol-button";
import ImageUpload from "@/components/ImageUpload";

type ColorHex = `#${string}`;
type SubImage = { image: string; description: string };

export type SymbolColor = {
  id: string;
  name: string;
  hex: ColorHex;
};

export type CharacterDraft = {
  id: string;
  name: string;
  subCategories: string[];
  profileImage: string;
  mainImage: string;
  mainImageDesc?: string;
  subImages: SubImage[];
  tags: string[];
  description: string;
  symbolColors?: SymbolColor[];
};

export default function CharacterEditForm(props: {
  draft: CharacterDraft;
  setDraft: React.Dispatch<React.SetStateAction<CharacterDraft>>;
  allSubs: string[];
}) {
  const { draft, setDraft, allSubs } = props;

  const toggleSub = (s: string) => {
    setDraft((d) => {
      const has = (d.subCategories || []).includes(s);
      const next = has
        ? (d.subCategories || []).filter((x) => x !== s)
        : [...(d.subCategories || []), s];
      return { ...d, subCategories: next };
    });
  };

  const addSubImage = () =>
    setDraft((d) => ({
      ...d,
      subImages: [...d.subImages, { image: "", description: "" }],
    }));

  const updateSubImage = (idx: number, patch: Partial<SubImage>) =>
    setDraft((d) => {
      const next = [...d.subImages];
      next[idx] = { ...next[idx], ...patch };
      return { ...d, subImages: next };
    });

  const removeSubImage = (idx: number) =>
    setDraft((d) => ({
      ...d,
      subImages: d.subImages.filter((_, i) => i !== idx),
    }));

  return (
    <>
      {/* 기본 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-semibold mb-2">이름</p>
          <input
            value={draft.name}
            onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
            className="w-full h-10 px-3 rounded-xl border border-border bg-background"
          />
        </div>
      </div>

      {/* 서브 태그 */}
      <div>
        <p className="text-sm font-semibold mb-2">서브 카테고리 (복수 선택)</p>
        <div className="flex flex-wrap gap-2">
          {allSubs.map((s) => {
            const active = (draft.subCategories || []).includes(s);
            return (
              <button
                type="button"
                key={s}
                onClick={() => toggleSub(s)}
                className={[
                  "px-3 h-8 rounded-full text-xs border transition",
                  active
                    ? "bg-foreground text-background border-foreground"
                    : "bg-zinc-950 text-zinc-300 border-zinc-800 hover:bg-zinc-900",
                ].join(" ")}
              >
                {s}
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {(draft.subCategories || []).length === 0 ? (
            <p className="text-xs text-muted-foreground">
              서브 카테고리를 1개 이상 선택해주세요.
            </p>
          ) : (
            (draft.subCategories || []).map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-2 px-3 h-8 rounded-full bg-foreground/10 text-foreground text-xs border border-foreground/15"
              >
                {t}
                <button
                  type="button"
                  onClick={() => toggleSub(t)}
                  className="opacity-70 hover:opacity-100"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))
          )}
        </div>
      </div>

      {/* 상징색 */}
      <div className="rounded-2xl border border-border bg-secondary/30 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold">상징색</p>
            <p className="text-xs text-muted-foreground mt-1">
              색 이름 + HEX 입력 또는 팔레트로 선택 (보통 1~2개 추천)
            </p>
          </div>

          <GButton
            variant="dark"
            icon={<Plus className="w-4 h-4" />}
            text="색 추가"
            onClick={() =>
              setDraft((d) => ({
                ...d,
                symbolColors: [
                  ...(d.symbolColors || []),
                  {
                    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
                    name: "새 상징색",
                    hex: "#3B82F6" as const,
                  },
                ],
              }))
            }
          />
        </div>

        {(draft.symbolColors || []).length === 0 ? (
          <p className="text-sm text-muted-foreground">
            아직 상징색이 없습니다. “색 추가”를 눌러주세요.
          </p>
        ) : (
          <div className="space-y-3">
            {(draft.symbolColors || []).map((sc, idx) => (
              <div
                key={sc.id}
                className="rounded-xl border border-border bg-background/40 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold">상징색 #{idx + 1}</p>

                  <GButton
                    variant="danger"
                    text="삭제"
                    onClick={() =>
                      setDraft((d) => ({
                        ...d,
                        symbolColors: (d.symbolColors || []).filter(
                          (x) => x.id !== sc.id
                        ),
                      }))
                    }
                  />
                </div>

                <div className="mt-3 grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                  <div className="md:col-span-2">
                    <p className="text-xs font-medium mb-2">미리보기</p>
                    <div
                      className="h-10 rounded-lg border border-border"
                      style={{ background: sc.hex }}
                      title={sc.hex}
                    />
                  </div>

                  <div className="md:col-span-5">
                    <p className="text-xs font-medium mb-2">색 이름</p>
                    <input
                      value={sc.name}
                      onChange={(e) =>
                        setDraft((d) => ({
                          ...d,
                          symbolColors: (d.symbolColors || []).map((x) =>
                            x.id === sc.id ? { ...x, name: e.target.value } : x
                          ),
                        }))
                      }
                      className="w-full h-10 px-3 rounded-xl border border-border bg-background"
                      placeholder='예: "심해의 푸른색"'
                    />
                  </div>

                  <div className="md:col-span-3">
                    <p className="text-xs font-medium mb-2">HEX</p>
                    <input
                      value={sc.hex}
                      onChange={(e) => {
                        const v = e.target.value.trim();
                        const hex = (v.startsWith("#") ? v : `#${v}`) as any;
                        setDraft((d) => ({
                          ...d,
                          symbolColors: (d.symbolColors || []).map((x) =>
                            x.id === sc.id ? { ...x, hex } : x
                          ),
                        }));
                      }}
                      className="w-full h-10 px-3 rounded-xl border border-border bg-background font-mono"
                      placeholder="#0A3D91"
                    />
                    <p className="text-[11px] text-muted-foreground mt-1">
                      예: #0A3D91
                    </p>
                  </div>

                  <div className="md:col-span-2">
                    <p className="text-xs font-medium mb-2">팔레트</p>
                    <input
                      type="color"
                      value={sc.hex}
                      onChange={(e) => {
                        const hex = e.target.value as any;
                        setDraft((d) => ({
                          ...d,
                          symbolColors: (d.symbolColors || []).map((x) =>
                            x.id === sc.id ? { ...x, hex } : x
                          ),
                        }));
                      }}
                      className="h-10 w-full rounded-lg border border-border bg-background p-1"
                      title="색 선택"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-xs font-medium mb-2">추천 팔레트</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "#EF4444",
                      "#F97316",
                      "#EAB308",
                      "#22C55E",
                      "#06B6D4",
                      "#3B82F6",
                      "#8B5CF6",
                      "#EC4899",
                      "#111827",
                      "#F8FAFC",
                    ].map((hex) => (
                      <button
                        key={hex}
                        type="button"
                        onClick={() =>
                          setDraft((d) => ({
                            ...d,
                            symbolColors: (d.symbolColors || []).map((x) =>
                              x.id === sc.id ? { ...x, hex: hex as any } : x
                            ),
                          }))
                        }
                        className="w-7 h-7 rounded-full border border-border"
                        style={{ background: hex }}
                        title={hex}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 설명 */}
      <div>
        <p className="text-sm font-semibold mb-2">캐릭터 설명</p>
        <textarea
          value={draft.description}
          onChange={(e) =>
            setDraft((d) => ({ ...d, description: e.target.value }))
          }
          className="w-full min-h-24 p-3 rounded-xl border border-border bg-background resize-none"
          placeholder="세계관/성격/능력 등"
        />
      </div>

      {/* 프로필 */}
      <div className="rounded-2xl border border-border bg-secondary/30 p-5 space-y-3">
        <p className="font-semibold">프로필 이미지</p>
        <ImageUpload
          value={draft.profileImage}
          onChange={(v) => setDraft((d) => ({ ...d, profileImage: v }))}
        />
      </div>

      {/* 메인 */}
      <div className="rounded-2xl border border-border bg-secondary/30 p-5 space-y-3">
        <p className="font-semibold">메인 이미지</p>
        <ImageUpload
          value={draft.mainImage}
          onChange={(v) => setDraft((d) => ({ ...d, mainImage: v }))}
        />
        <textarea
          value={draft.mainImageDesc || ""}
          onChange={(e) =>
            setDraft((d) => ({ ...d, mainImageDesc: e.target.value }))
          }
          className="w-full min-h-20 p-3 rounded-xl border border-border bg-background resize-none"
          placeholder="메인 이미지 설명"
        />
      </div>

      {/* 서브 */}
      <div className="rounded-2xl border border-border bg-secondary/30 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <p className="font-semibold">서브 이미지</p>
          <GButton
            variant="dark"
            icon={<Plus className="w-4 h-4" />}
            text="추가"
            onClick={addSubImage}
          />
        </div>

        {draft.subImages.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            서브 이미지를 추가해주세요.
          </p>
        ) : (
          <div className="space-y-6">
            {draft.subImages.map((s, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-border bg-background/40 p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">서브 #{idx + 1}</p>
                  <GButton
                    variant="danger"
                    text="삭제"
                    onClick={() => removeSubImage(idx)}
                  />
                </div>

                <ImageUpload
                  value={s.image}
                  onChange={(v) => updateSubImage(idx, { image: v })}
                />
                <textarea
                  value={s.description}
                  onChange={(e) =>
                    updateSubImage(idx, { description: e.target.value })
                  }
                  className="w-full min-h-20 p-3 rounded-xl border border-border bg-background resize-none"
                  placeholder="서브 이미지 설명"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}