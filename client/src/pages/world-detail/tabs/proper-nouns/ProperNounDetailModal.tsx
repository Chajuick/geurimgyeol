import { useEffect, useMemo, useState } from "react";
import { Pencil, Save, Trash2, X, Image as ImageIcon } from "lucide-react";

import Modal from "@/components/ui/modal";
import GButton from "@/components/ui/gyeol-button";
import { HUDBadge } from "@/components/ui/hud";
import { uiInput, uiTextarea } from "@/components/ui/form/presets";
import { cn } from "@/lib/utils";
import ImageUpload from "@/components/ImageUpload";
import { useResolvedImage } from "@/hooks/useResolvedImage";

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
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}
function getEntryKindId(n: any): string {
  return String(n?.kindId ?? n?.kind ?? "other");
}

/** ✅ HUD 카드 베이스: 구분감 확 올려줌 */
const hudCard = cn(
  "rounded-2xl border",
  "border-white/14",
  "bg-gradient-to-b from-white/[0.06] to-black/40",
  "shadow-[0_10px_40px_rgba(0,0,0,0.55)]",
  "backdrop-blur-md"
);

/** ✅ 내부 패널: 섹션마다 구분되는 블럭 */
const hudPanel = cn(
  "rounded-2xl border border-white/12",
  "bg-black/35",
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
);

/** ✅ 라벨 */
const labelCls = "text-[11px] tracking-wider uppercase text-white/55";

/** ✅ 읽기 뷰 박스 */
const readBox = cn(
  "rounded-xl border border-white/10 bg-black/45",
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",
  "text-white/80"
);

export default function ProperNounDetailModal(props: {
  open: boolean;
  onClose: () => void;

  editMode: boolean;

  isEditing: boolean;
  setIsEditing: (v: boolean) => void;

  kinds: { id: string; label: string; meta?: any }[];
  worldDefaultKindId?: string;

  forceNew?: boolean;
  entry: any | null;
  kindLabel: (id: string) => string;

  onDelete: (id: string) => void;
  onSave: (payload: { entry: any; editingId: string | null }) => void;
}) {
  const {
    open,
    onClose,
    editMode,
    isEditing,
    setIsEditing,
    kinds,
    worldDefaultKindId,
    entry,
    forceNew,
    kindLabel,
    onDelete,
    onSave,
  } = props;

  const [draft, setDraft] = useState<any | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  // (태그/링크는 아직 안쓴다 했지만, 저장 로직 유지)
  const [tagsText, setTagsText] = useState("");
  const [worldIdsText, setWorldIdsText] = useState("");
  const [characterIdsText, setCharacterIdsText] = useState("");
  const [creatureIdsText, setCreatureIdsText] = useState("");
  const [entryIdsText, setEntryIdsText] = useState("");
  const [eventIdsText, setEventIdsText] = useState("");

  useEffect(() => {
    if (!open) return;

    if (!entry) {
      const defaultKind =
        worldDefaultKindId ??
        kinds.find(k => k.id === "concept")?.id ??
        kinds[0]?.id ??
        "other";

      const base = {
        id: makeId(),
        kindId: defaultKind,
        title: "",
        summary: "",
        description: "",
        image: "",
        icon: "",
        tags: [],
        links: {
          worldIds: [],
          characterIds: [],
          creatureIds: [],
          entryIds: [],
          eventIds: [],
        },
      };

      setDraft(base);
      setEditingId(null);
      setTagsText("");
      setWorldIdsText("");
      setCharacterIdsText("");
      setCreatureIdsText("");
      setEntryIdsText("");
      setEventIdsText("");
      
      return;
    }

    const kid = getEntryKindId(entry);
    const safeKid = kinds.some(k => k.id === kid) ? kid : (worldDefaultKindId ?? "other");

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

    setDraft(normalized);

    setEditingId(forceNew ? null : (entry?.id ?? null));

    setEditingId(entry?.id ?? null);

    setTagsText(Array.isArray(normalized.tags) ? normalized.tags.join(", ") : "");
    setWorldIdsText(fromIds(normalized.links?.worldIds));
    setCharacterIdsText(fromIds(normalized.links?.characterIds));
    setCreatureIdsText(fromIds(normalized.links?.creatureIds));
    setEntryIdsText(fromIds(normalized.links?.entryIds));
    setEventIdsText(fromIds(normalized.links?.eventIds));
  }, [open, entry, kinds, worldDefaultKindId]);

  const iconSrc = useResolvedImage(draft?.icon || "");
  const imageSrc = useResolvedImage(draft?.image || "");

  const title = String(draft?.title || "").trim();
  const canSave = !!title;

  const viewKindId = String(draft?.kindId || "other");
  const viewKindLabel = kindLabel(viewKindId);

  const header = useMemo(() => {
    return (
      <div className={cn(hudCard, "p-4 relative overflow-hidden")}>
        {/* ✅ HUD 라인/글로우 */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-white/15" />
        <div className="pointer-events-none absolute -top-24 -right-24 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 -left-28 w-72 h-72 rounded-full bg-white/5 blur-3xl" />

        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-xl border border-white/15 bg-black/50 overflow-hidden grid place-items-center shrink-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
            {iconSrc ? (
              <img src={iconSrc} className="w-full h-full object-cover" alt="" />
            ) : (
              <div className="text-[11px] text-white/45 text-center">NO ICON</div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            {/* ✅ 제목이 넓게 먹도록 flex-1 */}
            <div className="flex items-center gap-2 min-w-0">
              <div className="text-xl font-semibold truncate flex-1 min-w-0 text-white/90">
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
          </div>

          {/* 우측 상태칩 */}
          <div className="shrink-0 hidden sm:flex items-center gap-2">
            <HUDBadge>{viewKindLabel}</HUDBadge>
          </div>
        </div>
      </div>
    );
  }, [iconSrc, title, viewKindLabel, draft?.summary, isEditing]);

  const close = () => onClose();

  const doSave = () => {
    if (!draft) return;
    if (!canSave) return;

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

    const isNew = !!forceNew || !editingId;
    onSave({ entry: next, editingId: isNew ? null : next.id });
  };

  const doDelete = () => {
    if (!draft?.id) return;
    onDelete(draft.id);
    close();
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title="항목 상세"
      maxWidthClassName="max-w-6xl"
      footer={
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {editMode && draft?.id ? (
              <GButton
                variant="danger"
                icon={<Trash2 className="w-4 h-4" />}
                text="삭제"
                onClick={doDelete}
                disabled={!editingId && !entry}
              />
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <GButton variant="neutral" icon={<X className="w-4 h-4" />} text="닫기" onClick={close} />

            {editMode && (
              <>
                {!isEditing ? (
                  <GButton
                    variant="neutral"
                    icon={<Pencil className="w-4 h-4" />}
                    text="편집"
                    onClick={() => setIsEditing(true)}
                  />
                ) : (
                  <GButton
                    variant="primary"
                    icon={<Save className="w-4 h-4" />}
                    text="저장"
                    onClick={doSave}
                    disabled={!canSave}
                  />
                )}
              </>
            )}
          </div>
        </div>
      }
    >
      {draft && (
        <div className="space-y-4">
          {/* ✅ 헤더 구분 강화 */}
          {header}

          <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-4">
            {/* LEFT: MEDIA */}
            <div className="space-y-4">
              <div className={cn(hudPanel, "p-4")}>
                {editMode && <div className="flex items-center justify-between mb-2">
                  <div className={labelCls}>대표 이미지</div>
                  <div className="text-[11px] text-white/45 flex items-center gap-1">
                    <ImageIcon className="w-3 h-3" />
                    main
                  </div>
                </div>}

                {isEditing ? (
                  <ImageUpload
                    value={draft.image || ""}
                    onChange={(v: string) => setDraft({ ...draft, image: v })}
                    aspect="video"
                    className="w-full"
                  />
                ) : (
                  <div className="rounded-2xl border border-white/12 bg-black/50 overflow-hidden">
                    {imageSrc ? (
                      <img src={imageSrc} className="w-full h-[230px] object-cover" alt="" />
                    ) : (
                      <div className="h-[230px] grid place-items-center text-sm text-white/50">
                        이미지 없음
                      </div>
                    )}
                  </div>
                )}
              </div>

              {editMode && <div className={cn(hudPanel, "p-4")}>
                <div className="flex items-center justify-between mb-2">
                  <div className={labelCls}>아이콘</div>
                  <div className="text-[11px] text-white/45">square</div>
                </div>

                {isEditing ? (
                  <ImageUpload
                    value={draft.icon || ""}
                    onChange={(v: string) => setDraft({ ...draft, icon: v })}
                    aspect="square"
                    className="w-full"
                  />
                ) : (
                  <div className="rounded-2xl border border-white/12 bg-black/50 overflow-hidden">
                    {iconSrc ? (
                      <img src={iconSrc} className="w-full h-[180px] object-cover" alt="" />
                    ) : (
                      <div className="h-[180px] grid place-items-center text-sm text-white/50">
                        아이콘 없음
                      </div>
                    )}
                  </div>
                )}
              </div>}
            </div>

            {/* RIGHT: TEXT */}
            <div className="space-y-4">
              {/* ✅ 핵심 정보(분류/명칭/요약) : 감상모드에서도 보여주기 */}
              <div className={cn(hudPanel, "p-4 space-y-4")}>
                {editMode && <div>
                  <div className={labelCls + " mb-2"}>분류</div>
                  {isEditing ? (
                    <div className="rounded-2xl border border-white/12 bg-black/40 p-1 flex flex-wrap gap-1">
                      {kinds.map(k => {
                        const active = String(draft.kindId) === k.id;
                        return (
                          <button
                            key={k.id}
                            type="button"
                            onClick={() => setDraft({ ...draft, kindId: k.id })}
                            className={cn(
                              "px-3 py-2 rounded-xl text-sm font-medium transition",
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
                  ) : (
                    <div className={cn(readBox, "px-3 py-2")}>{viewKindLabel}</div>
                  )}
                </div>}

                {editMode && <div>
                  <div className={labelCls + " mb-2"}>명칭</div>
                  {isEditing ? (
                    <input
                      className={cn(uiInput, "bg-black/55 border-white/12")}
                      value={draft.title}
                      onChange={e => setDraft({ ...draft, title: e.target.value })}
                    />
                  ) : (
                    <div className={cn(readBox, "px-3 py-2")}>{draft.title || "제목 없음"}</div>
                  )}
                </div>}

                <div>
                  {editMode && <div className={labelCls + " mb-2"}>요약</div>}
                  {isEditing ? (
                    <textarea
                      className={cn(uiTextarea, "bg-black/55 border-white/12")}
                      value={draft.summary}
                      onChange={e => setDraft({ ...draft, summary: e.target.value })}
                    />
                  ) : (
                    <div className={cn(readBox, "p-3 whitespace-pre-wrap max-h-[160px] overflow-auto text-xl text-white/90")}>
                      {draft.summary || "요약 없음"}
                    </div>
                  )}
                </div>
              </div>

              {/* 본문 */}
              <div className={cn(hudPanel, "p-4")}>
                {editMode && <div className={labelCls + " mb-2"}>본문</div>}
                {isEditing ? (
                  <textarea
                    className={cn(uiTextarea, "min-h-[260px]", "bg-black/55 border-white/12")}
                    value={draft.description}
                    onChange={e => setDraft({ ...draft, description: e.target.value })}
                  />
                ) : (
                  <div className={cn(readBox, "p-3 whitespace-pre-wrap max-h-[420px] overflow-auto")}>
                    {draft.description || "본문 없음"}
                  </div>
                )}
              </div>

              {/* (링크/태그는 아직 안쓴다 했으니 UI는 숨김. 저장 로직만 유지) */}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}