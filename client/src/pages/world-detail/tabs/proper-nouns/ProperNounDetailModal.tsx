import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Save, Trash2, X, Plus } from "lucide-react";

import Modal from "@/components/ui/modal";
import GButton from "@/components/ui/gyeol-button";
import { HUDBadge, HUDPanel } from "@/components/ui/hud";
import { uiInput, uiTextarea } from "@/components/ui/form/presets";
import { cn } from "@/lib/utils";
import ImageUpload from "@/components/ImageUpload";
import { useResolvedImage } from "@/hooks/useResolvedImage";

import AddItemCard from "@/components/worlds/AddItemCard";
import EntityDetailFullscreen from "@/components/entities/detail/EntityDetailFullscreen";

function toTags(text: string) {
  return text
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}
function toIds(text: string) {
  return text
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}
function fromIds(ids?: string[]) {
  return Array.isArray(ids) ? ids.join(", ") : "";
}
function makeId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}
function getEntryKindId(n: any): string {
  return String(n?.kindId ?? n?.kind ?? "other");
}

type AddTab = "character" | "creature";

/** ✅ HUD 카드 베이스 */
const hudCard = cn(
  "rounded-2xl border",
  "border-white/14",
  "bg-gradient-to-b from-white/[0.06] to-black/40",
  "shadow-[0_10px_40px_rgba(0,0,0,0.55)]",
  "backdrop-blur-md"
);

/** ✅ 내부 패널 */
const hudPanel = cn(
  "rounded-2xl border border-white/4",
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
);

const labelCls = "text-[11px] tracking-wider uppercase text-white/55";

const readBox = cn("rounded-xl border-none", "text-white/60");

function LinkedThumbCard(props: { name?: string; profileImage?: string; type: AddTab }) {
  const { name, profileImage, type } = props;
  const src = useResolvedImage(profileImage || "");

  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 overflow-hidden">
      <div className="aspect-square overflow-hidden">
        {src ? (
          <img src={src} alt={name || ""} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full grid place-items-center text-[11px] text-white/45 bg-black/40">
            NO IMAGE
          </div>
        )}
      </div>
      <div className="p-2">
        <div className="text-xs font-semibold text-white/85 truncate">{name || "이름 없음"}</div>
        <div className="mt-0.5 text-[10px] text-white/45">{type === "character" ? "CHAR" : "CREATURE"}</div>
      </div>
    </div>
  );
}

export default function ProperNounDetailModal(props: {
  open: boolean;
  onClose: () => void;
  mode: "view" | "edit";
  editMode: boolean;

  kinds: { id: string; label: string; meta?: any }[];
  worldDefaultKindId?: string;

  forceNew?: boolean;
  entry: any | null;
  kindLabel: (id: string) => string;

  initialDraft?: any | null;
  initialEditingId?: string | null;

  onDelete: (id: string) => void;
  onSave: (payload: { entry: any; editingId: string | null }) => void;

  data: any;
}) {
  const {
    open,
    onClose,
    mode,
    editMode,
    kinds,
    worldDefaultKindId,
    entry,
    forceNew,
    kindLabel,
    onDelete,
    onSave,
    initialDraft,
    initialEditingId,
    data,
  } = props;

  const isEditing = mode === "edit" && editMode;

  const [draft, setDraft] = useState<any | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [tagsText, setTagsText] = useState("");
  const [worldIdsText, setWorldIdsText] = useState("");
  const [characterIdsText, setCharacterIdsText] = useState("");
  const [creatureIdsText, setCreatureIdsText] = useState("");
  const [entryIdsText, setEntryIdsText] = useState("");
  const [eventIdsText, setEventIdsText] = useState("");

  const [isAddingLink, setIsAddingLink] = useState(false);
  const [addTab, setAddTab] = useState<AddTab>("character");
  const [search, setSearch] = useState("");

  const [detailOpen, setDetailOpen] = useState<{ type: AddTab; id: string } | null>(null);
  const [detailSubIndex, setDetailSubIndex] = useState(0);

  const applyDraft = useCallback((base: any, nextEditingId: string | null) => {
    setDraft(base);
    setEditingId(nextEditingId);

    setTagsText(Array.isArray(base.tags) ? base.tags.join(", ") : "");
    setWorldIdsText(fromIds(base.links?.worldIds));
    setCharacterIdsText(fromIds(base.links?.characterIds));
    setCreatureIdsText(fromIds(base.links?.creatureIds));
    setEntryIdsText(fromIds(base.links?.entryIds));
    setEventIdsText(fromIds(base.links?.eventIds));
  }, []);

  useEffect(() => {
    if (!open) {
      setDraft(null);
      setEditingId(null);
      setIsAddingLink(false);
      setSearch("");
      setDetailOpen(null);
      setDetailSubIndex(0);
      return;
    }

    if (initialDraft) {
      applyDraft(initialDraft, initialEditingId ?? (forceNew ? null : initialDraft.id ?? null));
      return;
    }

    if (!entry || forceNew) {
      const defaultKind =
        worldDefaultKindId ?? kinds.find((k) => k.id === "concept")?.id ?? kinds[0]?.id ?? "other";

      const base = {
        id: entry?.id ?? makeId(),
        kindId: defaultKind,
        title: entry?.title ?? "",
        summary: entry?.summary ?? "",
        description: entry?.description ?? "",
        image: entry?.image ?? "",
        icon: entry?.icon ?? "",
        tags: entry?.tags ?? [],
        links: {
          worldIds: entry?.links?.worldIds ?? [],
          characterIds: entry?.links?.characterIds ?? [],
          creatureIds: entry?.links?.creatureIds ?? [],
          entryIds: entry?.links?.entryIds ?? [],
          eventIds: entry?.links?.eventIds ?? [],
        },
        meta: entry?.meta ?? undefined,
      };

      applyDraft(base, forceNew ? null : entry?.id ?? null);
      return;
    }

    const kid = getEntryKindId(entry);
    const safeKid = kinds.some((k) => String(k.id) === String(kid)) ? kid : worldDefaultKindId ?? "other";

    const normalized = {
      id: entry.id,
      kindId: safeKid,
      title: entry.title ?? "",
      summary: entry.summary ?? "",
      description: entry.description ?? "",
      image: entry.image ?? "",
      icon: entry.icon ?? "",
      tags: entry.tags ?? [],
      meta: entry.meta ?? undefined,
      links: {
        worldIds: entry.links?.worldIds ?? [],
        characterIds: entry.links?.characterIds ?? [],
        creatureIds: entry.links?.creatureIds ?? [],
        entryIds: entry.links?.entryIds ?? [],
        eventIds: entry.links?.eventIds ?? [],
      },
    };

    applyDraft(normalized, entry.id);
  }, [open, initialDraft, initialEditingId, entry, forceNew, kinds, worldDefaultKindId, applyDraft]);

  const iconSrc = useResolvedImage(draft?.icon || "");
  const imageSrc = useResolvedImage(draft?.image || "");

  const title = String(draft?.title || "").trim();
  const canSave = !!title;

  const viewKindId = String(draft?.kindId || "other");
  const viewKindLabel = kindLabel(viewKindId);

  const characterById = useMemo(() => {
    const m = new Map<string, any>();
    (data?.characters ?? []).forEach((c: any) => m.set(String(c.id), c));
    return m;
  }, [data?.characters]);

  const creatureById = useMemo(() => {
    const m = new Map<string, any>();
    (data?.creatures ?? []).forEach((c: any) => m.set(String(c.id), c));
    return m;
  }, [data?.creatures]);

  const linkedCharacterIds = draft?.links?.characterIds ?? [];
  const linkedCreatureIds = draft?.links?.creatureIds ?? [];

  const linkedItems = useMemo(() => {
    const out: { type: AddTab; id: string; data: any }[] = [];
    for (const id of linkedCharacterIds) {
      const ent = characterById.get(String(id));
      if (ent) out.push({ type: "character", id: String(id), data: ent });
    }
    for (const id of linkedCreatureIds) {
      const ent = creatureById.get(String(id));
      if (ent) out.push({ type: "creature", id: String(id), data: ent });
    }
    return out;
  }, [linkedCharacterIds, linkedCreatureIds, characterById, creatureById]);

  const header = useMemo(() => {
    return (
      <div className={cn(hudCard, "p-3 sm:p-4 relative overflow-hidden")}>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-white/15" />
        <div className="pointer-events-none absolute -top-24 -right-24 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 -left-28 w-72 h-72 rounded-full bg-white/5 blur-3xl" />

        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl border border-white/15 bg-black/50 overflow-hidden flex items-center justify-center shrink-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
            {iconSrc ? (
              <img src={iconSrc} className="w-full h-full object-contain" alt="" />
            ) : (
              <div className="text-[11px] text-white/45 text-center">NO ICON</div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 min-w-0">
              <div className="text-lg sm:text-xl font-semibold truncate flex-1 min-w-0 text-white/90">
                {title || "제목 없음"}
              </div>
            </div>

            {draft?.summary ? (
              <div className="mt-1 text-sm text-white/65 line-clamp-1 whitespace-pre-wrap">
                {draft.summary}
              </div>
            ) : (
              <div className="mt-1 text-sm text-white/45">요약 없음</div>
            )}

            {/* ✅ 모바일에서도 뱃지 보여주기 (줄바꿈 허용) */}
            <div className="mt-2 flex flex-wrap gap-2 sm:hidden">
              <HUDBadge>{viewKindLabel}</HUDBadge>
              <HUDBadge tone={isEditing ? "warn" : "neutral"}>{isEditing ? "EDIT" : "VIEW"}</HUDBadge>
            </div>
          </div>

          <div className="shrink-0 hidden sm:flex items-center gap-2">
            <HUDBadge>{viewKindLabel}</HUDBadge>
            <HUDBadge tone={isEditing ? "warn" : "neutral"}>{isEditing ? "EDIT" : "VIEW"}</HUDBadge>
          </div>
        </div>
      </div>
    );
  }, [iconSrc, title, viewKindLabel, draft?.summary, isEditing]);

  const close = onClose;

  const doSave = useCallback(() => {
    if (!draft) return;
    if (!canSave) return;
    if (!isEditing) return;

    const next = {
      ...draft,
      title: String(draft.title || "").trim(),
      kindId: String(draft.kindId || "other"),
      tags: toTags(tagsText),
      links: {
        worldIds: toIds(worldIdsText),
        characterIds: toIds(characterIdsText),
        creatureIds: toIds(creatureIdsText),
        entryIds: toIds(entryIdsText),
        eventIds: toIds(eventIdsText),
      },
      meta: { ...(draft.meta ?? {}), updatedAt: new Date().toISOString() },
    };

    onSave({ entry: next, editingId });
  }, [
    draft,
    canSave,
    isEditing,
    tagsText,
    worldIdsText,
    characterIdsText,
    creatureIdsText,
    entryIdsText,
    eventIdsText,
    onSave,
    editingId,
  ]);

  const doDelete = useCallback(() => {
    if (!isEditing) return;
    if (!draft?.id) return;
    onDelete(draft.id);
    close();
  }, [isEditing, draft?.id, onDelete, close]);

  const removeLinked = useCallback(
    (type: AddTab, id: string) => {
      if (!isEditing || !draft) return;

      const nextLinks = { ...(draft.links ?? {}) };
      if (type === "character") {
        nextLinks.characterIds = (nextLinks.characterIds ?? []).filter((x: string) => String(x) !== String(id));
      } else {
        nextLinks.creatureIds = (nextLinks.creatureIds ?? []).filter((x: string) => String(x) !== String(id));
      }

      setDraft({ ...draft, links: nextLinks });
      setCharacterIdsText(fromIds(nextLinks.characterIds));
      setCreatureIdsText(fromIds(nextLinks.creatureIds));
    },
    [isEditing, draft]
  );

  const addLinked = useCallback(
    (type: AddTab, id: string) => {
      if (!isEditing || !draft) return;

      const nextLinks = { ...(draft.links ?? {}) };
      if (type === "character") {
        const prev = Array.isArray(nextLinks.characterIds) ? nextLinks.characterIds : [];
        if (!prev.some((x: string) => String(x) === String(id))) nextLinks.characterIds = [...prev, String(id)];
      } else {
        const prev = Array.isArray(nextLinks.creatureIds) ? nextLinks.creatureIds : [];
        if (!prev.some((x: string) => String(x) === String(id))) nextLinks.creatureIds = [...prev, String(id)];
      }

      setDraft({ ...draft, links: nextLinks });
      setCharacterIdsText(fromIds(nextLinks.characterIds));
      setCreatureIdsText(fromIds(nextLinks.creatureIds));
    },
    [isEditing, draft]
  );

  const detailEntity = useMemo(() => {
    if (!detailOpen) return null;
    if (detailOpen.type === "character") return characterById.get(detailOpen.id) ?? null;
    return creatureById.get(detailOpen.id) ?? null;
  }, [detailOpen, characterById, creatureById]);

  const q = search.trim().toLowerCase();
  const addedSet = useMemo(() => {
    const s = new Set<string>();
    if (addTab === "character") (draft?.links?.characterIds ?? []).forEach((x: string) => s.add(String(x)));
    else (draft?.links?.creatureIds ?? []).forEach((x: string) => s.add(String(x)));
    return s;
  }, [addTab, draft?.links?.characterIds, draft?.links?.creatureIds]);

  const filteredAddList = useMemo(() => {
    const source = addTab === "character" ? data?.characters ?? [] : data?.creatures ?? [];
    return source
      .filter((x: any) => !addedSet.has(String(x.id)))
      .filter((x: any) => (!q ? true : String(x.name ?? "").toLowerCase().includes(q)));
  }, [addTab, data?.characters, data?.creatures, addedSet, q]);

  const skeleton = (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="h-16 rounded-2xl bg-white/5 animate-pulse" />
      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-4">
        <div className="h-[240px] sm:h-[280px] rounded-2xl bg-white/5 animate-pulse" />
        <div className="h-[240px] sm:h-[280px] rounded-2xl bg-white/5 animate-pulse" />
      </div>
      <div className="h-24 sm:h-32 rounded-2xl bg-white/5 animate-pulse" />
    </div>
  );

  return (
    <>
      <Modal
        open={open}
        onClose={close}
        title="항목 상세"
        maxWidthClassName="max-w-6xl"
        footer={
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {isEditing && draft?.id && (
                <GButton
                  variant="danger"
                  icon={<Trash2 className="w-4 h-4" />}
                  text="삭제"
                  onClick={doDelete}
                  disabled={!editingId}
                />
              )}
            </div>

            <div className="flex items-center gap-2">
              <GButton variant="neutral" icon={<X className="w-4 h-4" />} text="닫기" onClick={close} />
              {isEditing && (
                <GButton
                  variant="primary"
                  icon={<Save className="w-4 h-4" />}
                  text="저장"
                  onClick={doSave}
                  disabled={!canSave}
                />
              )}
            </div>
          </div>
        }
      >
        {!draft ? (
          skeleton
        ) : (
          // ✅ 모달 바디 한 곳만 스크롤: 모바일에서 내용 잘림/이중 스크롤 방지
          <div className="p-2 sm:p-4">
            <div
              className={cn(
                "max-h-[calc(100svh-220px)] sm:max-h-none",
                "min-w-0",
                "space-y-4"
              )}
            >
              {header}

              <HUDPanel className="p-6">
                <div className="space-y-5 sm:space-y-6">
                  {/* ABOUT */}
                  <div>
                    <div className="text-[11px] tracking-[0.26em] text-white/55">ABOUT</div>
                    <div className="mt-1 text-sm text-white/70">개요</div>
                  </div>

                  {/* ✅ 모바일: 1열(스택), 데스크탑: 2열 */}
                  <div className="grid grid-cols-1 lg:grid-cols-[380px_minmax(0,1fr)] gap-4 items-stretch">
                    {/* LEFT */}
                    <div className="flex flex-col gap-4 min-h-0">
                      <div className={cn(hudPanel, "flex flex-col min-h-[220px] sm:min-h-[320px]")}>
                        {isEditing && <div className={labelCls + " mb-2"}>대표 이미지</div>}

                        <div className="flex-1 min-h-0">
                          {isEditing ? (
                            <ImageUpload
                              value={draft.image || ""}
                              onChange={(v: string) => setDraft({ ...draft, image: v })}
                              aspect="video"
                              className="w-full h-full"
                            />
                          ) : (
                            <div className="rounded-2xl border border-none overflow-hidden h-full">
                              {imageSrc ? (
                                <img src={imageSrc} className="w-full h-full object-cover" alt="" />
                              ) : (
                                <div className="h-full grid place-items-center text-sm text-white/50">이미지 없음</div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {isEditing && (
                        <div className={cn(hudPanel, "p-4")}>
                          <div className={labelCls + " mb-2"}>아이콘</div>
                          <ImageUpload
                            value={draft.icon || ""}
                            onChange={(v: string) => setDraft({ ...draft, icon: v })}
                            aspect="square"
                            className="w-full"
                          />
                        </div>
                      )}
                    </div>

                    {/* RIGHT */}
                    <div className="min-h-0 min-w-0 overflow-hidden">
                      <div className={cn(hudPanel, "p-4 space-y-4 min-h-[220px] sm:min-h-[320px]", "min-w-0 overflow-hidden")}>
                        {isEditing && (
                          <div>
                            <div className={labelCls + " mb-2"}>분류</div>

                            {/* ✅ 모바일: 가로 스크롤 chips */}
                            <div
                              className={cn(
                                "rounded-2xl border border-white/12 bg-black/40 p-1",
                                "flex items-center gap-1",
                                "overflow-x-auto overflow-y-hidden whitespace-nowrap",
                                "scrollbar-none"
                              )}
                            >
                              {kinds.map((k) => {
                                const active = String(draft.kindId) === k.id;
                                return (
                                  <button
                                    key={k.id}
                                    type="button"
                                    onClick={() => setDraft({ ...draft, kindId: k.id })}
                                    className={cn(
                                      "px-3 py-2 rounded-xl text-sm font-medium transition shrink-0",
                                      active
                                        ? "bg-white/12 border border-white/20 text-white"
                                        : "text-white/60 hover:text-white hover:bg-white/6"
                                    )}
                                  >
                                    {k.label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {isEditing && (
                          <div className="min-w-0">
                            <div className={labelCls + " mb-2"}>명칭</div>
                            <input
                              className={cn(
                                uiInput,
                                "bg-black/55 border-white/12",
                                "w-full min-w-0 max-w-full"
                              )}
                              value={draft.title}
                              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                            />
                          </div>
                        )}

                        <div>
                          {isEditing && <div className={labelCls + " mb-2"}>요약</div>}
                          {isEditing ? (
                            <textarea
                              className={cn(uiTextarea, "bg-black/55 border-white/12")}
                              value={draft.summary}
                              onChange={(e) => setDraft({ ...draft, summary: e.target.value })}
                            />
                          ) : (
                            <div className={cn(readBox, "whitespace-pre-wrap text-base sm:text-xl text-white/80")}>
                              {draft.summary || "요약 없음"}
                            </div>
                          )}
                        </div>

                        <div>
                          {isEditing && <div className={labelCls + " mb-2"}>본문</div>}
                          {isEditing ? (
                            <textarea
                              className={cn(uiTextarea, "min-h-[160px] sm:min-h-[220px]", "bg-black/55 border-white/12")}
                              value={draft.description}
                              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                            />
                          ) : (
                            <div className={cn(readBox, "whitespace-pre-wrap")}>{draft.description || "본문 없음"}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* LINKED */}
                  <div>
                    <div className="flex items-center justify-between gap-3 pt-1">
                      <div>
                        <div className="text-[11px] tracking-[0.26em] text-white/55">LINKED</div>
                        <div className="mt-1 text-sm text-white/70">연관 캐릭터 / 크리쳐</div>
                      </div>

                      {isEditing && (
                        <GButton
                          variant="neutral"
                          icon={<Plus className="w-4 h-4" />}
                          text="추가"
                          onClick={() => {
                            setIsAddingLink(true);
                            setAddTab("character");
                            setSearch("");
                          }}
                        />
                      )}
                    </div>

                    <div className="mt-4 mb-2">
                      {linkedItems.length === 0 ? (
                        <div className={cn(hudPanel, "relative overflow-hidden p-6 bg-black/30 border border-white/10")}>
                          <div className="pointer-events-none absolute inset-0 opacity-[0.12] bg-[linear-gradient(rgba(255,255,255,0.18)_1px,transparent_1px)] bg-[length:100%_3px]" />
                          <div className="pointer-events-none absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/10 blur-3xl" />
                          <div className="pointer-events-none absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-white/5 blur-3xl" />

                          <div className="relative">
                            <div className="text-sm font-semibold text-white/85">연관된 캐릭터/크리쳐가 없습니다.</div>
                            <div className="mt-1 text-[12px] text-white/55">
                              {isEditing ? "추가 버튼으로 연결을 만들어 보세요." : "연결된 항목이 아직 존재하지 않습니다."}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="grid gap-3 grid-cols-3 sm:grid-cols-4 md:grid-cols-6 xl:grid-cols-7">
                          {linkedItems.map((it) => (
                            <div
                              key={`${it.type}:${it.id}`}
                              className="text-left"
                              onClick={() => {
                                setDetailOpen({ type: it.type, id: it.id });
                                setDetailSubIndex(0);
                              }}
                            >
                              <div className="relative">
                                <LinkedThumbCard type={it.type} name={it.data?.name} profileImage={it.data?.profileImage} />

                                {isEditing && (
                                  <button
                                    type="button"
                                    className="absolute -top-2 -right-2 w-8 h-8 rounded-full border border-white/15 bg-black/70 text-white/80 hover:bg-black/90"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeLinked(it.type, it.id);
                                    }}
                                    title="연결 제거"
                                  >
                                    <X className="w-4 h-4 mx-auto" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 태그/링크 텍스트 UI는 숨김 유지 */}
                </div>
              </HUDPanel>
            </div>
          </div>
        )}
      </Modal>

      {/* 연관 추가 모달 */}
      <Modal
        open={isAddingLink && isEditing}
        onClose={() => {
          setIsAddingLink(false);
          setSearch("");
        }}
        title="연관 캐릭터/크리쳐 추가"
        maxWidthClassName="max-w-3xl"
        footer={
          <div className="flex justify-end gap-2">
            <GButton
              variant="neutral"
              text="닫기"
              onClick={() => {
                setIsAddingLink(false);
                setSearch("");
              }}
            />
          </div>
        }
      >
        <div className="flex items-center gap-2 mb-4 px-2">
          <GButton
            variant={addTab === "character" ? "primary" : "neutral"}
            text="캐릭터"
            onClick={() => setAddTab("character")}
            className="flex-1"
          />
          <GButton
            variant={addTab === "creature" ? "primary" : "neutral"}
            text="크리쳐"
            onClick={() => setAddTab("creature")}
            className="flex-1"
          />
        </div>

        <div className="mb-4 px-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`${addTab === "character" ? "캐릭터" : "크리쳐"} 이름 검색`}
            className={uiInput}
          />
        </div>

        <div className="p-2">
          {filteredAddList.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-black/20 p-6 text-center">
              <p className="text-sm text-white/80">검색 결과가 없습니다.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {filteredAddList.map((item: any) => (
                <AddItemCard
                  id={item.id}
                  name={item.name}
                  image={item.profileImage}
                  onPick={() => {
                    addLinked(addTab, String(item.id));
                    setIsAddingLink(false);
                    setSearch("");
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* Entity 상세 */}
      {detailEntity && (
        <EntityDetailFullscreen
          entity={detailEntity}
          viewSubIndex={detailSubIndex}
          setViewSubIndex={setDetailSubIndex}
          onClose={() => {
            setDetailOpen(null);
            setDetailSubIndex(0);
          }}
          editable={false}
          onDelete={undefined}
          onPatch={undefined}
          tagOptions={[]}
        />
      )}
    </>
  );
}