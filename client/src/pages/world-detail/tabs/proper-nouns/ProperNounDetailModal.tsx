import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Save, Trash2, X, Plus } from "lucide-react";

import Modal from "@/components/ui/modal";
import GButton from "@/components/ui/gyeol-button";
import { uiInput, uiTextarea } from "@/components/ui/form/presets";
import { cn } from "@/lib/utils";
import ImageUpload from "@/components/ImageUpload";
import { useResolvedImage } from "@/hooks/useResolvedImage";

import AddItemCard from "@/components/worlds/AddItemCard";
import EntityDetailFullscreen from "@/components/entities/detail/EntityDetailFullscreen";

function toTags(text: string) {
  return text
    .split(",")
    .map(t => t.trim())
    .filter(Boolean);
}
function toIds(text: string) {
  return text
    .split(",")
    .map(t => t.trim())
    .filter(Boolean);
}
function fromIds(ids?: string[]) {
  return Array.isArray(ids) ? ids.join(", ") : "";
}
function makeId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto)
    return crypto.randomUUID();
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}
function getEntryKindId(n: any): string {
  return String(n?.kindId ?? n?.kind ?? "other");
}

type AddTab = "character" | "creature";

/** 폼 필드 래퍼 */
function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-baseline gap-2">
        <span className="text-xs font-medium text-white/60">
          {label}
          {required && <span className="ml-0.5 text-brand">*</span>}
        </span>
        {hint && <span className="text-[11px] text-white/30">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

/** 연관 캐릭터/크리쳐 칩 */
function LinkedChip(props: {
  name?: string;
  profileImage?: string;
  type: AddTab;
  onOpen: () => void;
  onRemove?: () => void;
}) {
  const { name, profileImage, type, onOpen, onRemove } = props;
  const src = useResolvedImage(profileImage || "");

  return (
    <div className="group relative">
      <button
        type="button"
        onClick={onOpen}
        className={cn(
          "inline-flex items-center gap-2.5 h-11 pl-1 rounded-full",
          onRemove ? "pr-9" : "pr-4",
          "bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] hover:border-white/15 transition-colors"
        )}
      >
        <span className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-white/5">
          {src ? (
            <img src={src} alt="" className="h-full w-full object-cover" />
          ) : null}
        </span>
        <span className="text-left leading-tight">
          <span className="block text-sm font-medium text-white/90 max-w-[140px] truncate">
            {name || "이름 없음"}
          </span>
          <span className="block text-[10px] text-white/40">
            {type === "character" ? "캐릭터" : "크리쳐"}
          </span>
        </span>
      </button>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          title="연결 제거"
          className="absolute right-1.5 top-1/2 -translate-y-1/2 grid place-items-center h-7 w-7 rounded-full text-white/45 hover:bg-red-500/80 hover:text-white transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
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

  const [detailOpen, setDetailOpen] = useState<{
    type: AddTab;
    id: string;
  } | null>(null);
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
      applyDraft(
        initialDraft,
        initialEditingId ?? (forceNew ? null : (initialDraft.id ?? null))
      );
      return;
    }

    if (!entry || forceNew) {
      const defaultKind =
        worldDefaultKindId ??
        kinds.find(k => k.id === "concept")?.id ??
        kinds[0]?.id ??
        "other";

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

      applyDraft(base, forceNew ? null : (entry?.id ?? null));
      return;
    }

    const kid = getEntryKindId(entry);
    const safeKid = kinds.some(k => String(k.id) === String(kid))
      ? kid
      : (worldDefaultKindId ?? "other");

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
  }, [
    open,
    initialDraft,
    initialEditingId,
    entry,
    forceNew,
    kinds,
    worldDefaultKindId,
    applyDraft,
  ]);

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
        nextLinks.characterIds = (nextLinks.characterIds ?? []).filter(
          (x: string) => String(x) !== String(id)
        );
      } else {
        nextLinks.creatureIds = (nextLinks.creatureIds ?? []).filter(
          (x: string) => String(x) !== String(id)
        );
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
        const prev = Array.isArray(nextLinks.characterIds)
          ? nextLinks.characterIds
          : [];
        if (!prev.some((x: string) => String(x) === String(id)))
          nextLinks.characterIds = [...prev, String(id)];
      } else {
        const prev = Array.isArray(nextLinks.creatureIds)
          ? nextLinks.creatureIds
          : [];
        if (!prev.some((x: string) => String(x) === String(id)))
          nextLinks.creatureIds = [...prev, String(id)];
      }

      setDraft({ ...draft, links: nextLinks });
      setCharacterIdsText(fromIds(nextLinks.characterIds));
      setCreatureIdsText(fromIds(nextLinks.creatureIds));
    },
    [isEditing, draft]
  );

  const detailEntity = useMemo(() => {
    if (!detailOpen) return null;
    if (detailOpen.type === "character")
      return characterById.get(detailOpen.id) ?? null;
    return creatureById.get(detailOpen.id) ?? null;
  }, [detailOpen, characterById, creatureById]);

  const q = search.trim().toLowerCase();
  const addedSet = useMemo(() => {
    const s = new Set<string>();
    if (addTab === "character")
      (draft?.links?.characterIds ?? []).forEach((x: string) =>
        s.add(String(x))
      );
    else
      (draft?.links?.creatureIds ?? []).forEach((x: string) =>
        s.add(String(x))
      );
    return s;
  }, [addTab, draft?.links?.characterIds, draft?.links?.creatureIds]);

  const filteredAddList = useMemo(() => {
    const source =
      addTab === "character"
        ? (data?.characters ?? [])
        : (data?.creatures ?? []);
    return source
      .filter((x: any) => !addedSet.has(String(x.id)))
      .filter((x: any) =>
        !q
          ? true
          : String(x.name ?? "")
              .toLowerCase()
              .includes(q)
      );
  }, [addTab, data?.characters, data?.creatures, addedSet, q]);

  const skeleton = (
    <div className="space-y-4 p-6">
      <div className="aspect-[16/9] rounded-2xl bg-white/5 animate-pulse" />
      <div className="h-8 w-1/2 rounded-xl bg-white/5 animate-pulse" />
      <div className="h-24 rounded-2xl bg-white/5 animate-pulse" />
    </div>
  );

  const openLinkedDetail = (type: AddTab, id: string) => {
    setDetailOpen({ type, id });
    setDetailSubIndex(0);
  };

  /* ---------- 연관 캐릭터/크리쳐 (보기/편집 공용) ---------- */
  const linkedSection = (
    <section>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-white/85">
          연관 캐릭터 · 크리쳐
          {linkedItems.length > 0 && (
            <span className="ml-1.5 font-normal text-white/35">
              {linkedItems.length}
            </span>
          )}
        </h3>
        {isEditing && (
          <GButton
            variant="neutral"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            text="연결 추가"
            onClick={() => {
              setIsAddingLink(true);
              setAddTab("character");
              setSearch("");
            }}
          />
        )}
      </div>

      <div className="mt-3">
        {linkedItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 px-4 py-6 text-center text-sm text-white/40">
            {isEditing
              ? "‘연결 추가’로 관련된 캐릭터·크리쳐를 이어보세요"
              : "연결된 캐릭터·크리쳐가 없어요"}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {linkedItems.map(it => (
              <LinkedChip
                key={`${it.type}:${it.id}`}
                type={it.type}
                name={it.data?.name}
                profileImage={it.data?.profileImage}
                onOpen={() => openLinkedDetail(it.type, it.id)}
                onRemove={
                  isEditing ? () => removeLinked(it.type, it.id) : undefined
                }
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );

  /* ---------- 보기 모드: 커버형 레이아웃 ---------- */
  const viewBody = draft && (
    <article>
      {/* cover */}
      <div
        className={cn(
          "relative w-full overflow-hidden",
          imageSrc ? "aspect-[16/9] max-h-[52vh]" : "h-40"
        )}
      >
        {imageSrc ? (
          <img
            src={imageSrc}
            alt=""
            className="absolute inset-0 h-full w-full object-cover animate-in fade-in zoom-in-105 duration-700"
          />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(80%_100%_at_20%_0%,rgba(129,140,248,0.18),transparent_70%)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#111114] via-[#111114]/40 to-transparent" />
      </div>

      {/* title block (커버 하단에 겹침) */}
      <div className="relative -mt-20 px-6 sm:px-8">
        <div className="flex items-end gap-4">
          <div className="h-16 w-16 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-2xl border border-white/15 bg-black/60 shadow-[0_10px_30px_rgba(0,0,0,0.6)] grid place-items-center">
            {iconSrc ? (
              <img
                src={iconSrc}
                alt=""
                className="h-full w-full object-contain"
              />
            ) : null}
          </div>
          <div className="min-w-0 pb-1">
            <span className="inline-flex items-center h-6 px-2.5 rounded-full bg-brand/15 border border-brand/25 text-[11px] font-medium text-indigo-100">
              {viewKindLabel}
            </span>
          </div>
        </div>

        <h2 className="mt-4 font-display text-3xl sm:text-4xl font-semibold tracking-[-0.02em] leading-tight break-keep">
          {title || "제목 없음"}
        </h2>
        {draft.summary ? (
          <p className="mt-2 text-base sm:text-lg text-white/60 leading-relaxed whitespace-pre-line break-keep">
            {draft.summary}
          </p>
        ) : null}
      </div>

      {/* body */}
      <div className="px-6 sm:px-8 pt-6 pb-8 space-y-8">
        <div className="h-px bg-gradient-to-r from-white/10 via-white/[0.06] to-transparent" />

        {draft.description ? (
          <p className="text-[15px] sm:text-base leading-[1.95] text-white/80 whitespace-pre-line break-keep">
            {draft.description}
          </p>
        ) : (
          <p className="text-sm text-white/40">
            아직 본문이 작성되지 않았어요.
          </p>
        )}

        {linkedSection}
      </div>
    </article>
  );

  /* ---------- 편집 모드: 폼 레이아웃 ---------- */
  const editBody = draft && (
    <div className="p-5 sm:p-7 space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-6">
        {/* media */}
        <div className="space-y-5">
          <Field label="대표 이미지">
            <ImageUpload
              value={draft.image || ""}
              onChange={(v: string) => setDraft({ ...draft, image: v })}
              aspect="video"
              className="w-full"
            />
          </Field>
          <Field label="아이콘">
            <ImageUpload
              value={draft.icon || ""}
              onChange={(v: string) => setDraft({ ...draft, icon: v })}
              aspect="square"
              className="w-full max-w-[160px]"
            />
          </Field>
        </div>

        {/* fields */}
        <div className="min-w-0 space-y-5">
          <Field label="분류">
            <div className="flex flex-wrap gap-1.5">
              {kinds.map(k => {
                const active = String(draft.kindId) === k.id;
                return (
                  <button
                    key={k.id}
                    type="button"
                    onClick={() => setDraft({ ...draft, kindId: k.id })}
                    className={cn(
                      "h-8 px-3.5 rounded-full text-[13px] font-medium border transition-colors",
                      active
                        ? "bg-brand/15 text-indigo-100 border-brand/35"
                        : "bg-white/[0.03] text-white/55 border-white/[0.08] hover:bg-white/[0.07] hover:text-white"
                    )}
                  >
                    {k.label}
                  </button>
                );
              })}
            </div>
          </Field>

          <Field label="명칭" required>
            <input
              className={cn(uiInput, "w-full min-w-0")}
              value={draft.title}
              placeholder="예: 「CORE ZONE」"
              onChange={e => setDraft({ ...draft, title: e.target.value })}
            />
          </Field>

          <Field label="요약" hint="목록 카드와 상세 제목 아래에 보여요">
            <textarea
              className={cn(uiTextarea, "min-h-[72px]")}
              value={draft.summary}
              onChange={e => setDraft({ ...draft, summary: e.target.value })}
            />
          </Field>

          <Field label="본문">
            <textarea
              className={cn(
                uiTextarea,
                "min-h-[200px] sm:min-h-[260px] leading-relaxed"
              )}
              value={draft.description}
              onChange={e =>
                setDraft({ ...draft, description: e.target.value })
              }
            />
          </Field>
        </div>
      </div>

      <div className="h-px bg-white/[0.07]" />

      {linkedSection}
    </div>
  );

  return (
    <>
      <Modal
        open={open}
        onClose={close}
        title={isEditing ? (editingId ? "항목 편집" : "새 항목") : title}
        headerless={!isEditing}
        maxWidthClassName={isEditing ? "max-w-5xl" : "max-w-3xl"}
        footer={
          isEditing ? (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {draft?.id && editingId && (
                  <GButton
                    variant="danger"
                    icon={<Trash2 className="w-4 h-4" />}
                    text="삭제"
                    onClick={doDelete}
                  />
                )}
              </div>

              <div className="flex items-center gap-2">
                <GButton variant="ghost" text="취소" onClick={close} />
                <GButton
                  variant="primary"
                  icon={<Save className="w-4 h-4" />}
                  text="저장"
                  onClick={doSave}
                  disabled={!canSave}
                />
              </div>
            </div>
          ) : undefined
        }
      >
        {!draft ? skeleton : isEditing ? editBody : viewBody}
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
            onChange={e => setSearch(e.target.value)}
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
                  key={item.id}
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
