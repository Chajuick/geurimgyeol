import { useMemo, useState } from "react";
import { Plus, Search, Trash2, Pencil } from "lucide-react";

import { HUDPanel, HUDSectionTitle, HUDBadge } from "@/components/ui/hud";
import GButton from "@/components/ui/gyeol-button";
import Modal from "@/components/ui/modal";
import { uiInput, uiTextarea } from "@/components/ui/form/presets";

const KINDS = [
  "person",
  "place",
  "organization",
  "item",
  "technology",
  "concept",
  "species",
  "other",
] as const;

type Kind = (typeof KINDS)[number];

function makeId() {
  return Date.now().toString();
}

function toTags(text: string) {
  return text
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

export default function WorldProperNounsTab({ world, editMode, updateWorld }: any) {
  const [q, setQ] = useState("");
  const [kind, setKind] = useState<Kind | "all">("all");

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<any>(null);

  const nouns = (world.properNouns ?? []) as any[];

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return nouns.filter((n) => {
      if (kind !== "all" && n.kind !== kind) return false;
      if (!s) return true;
      return (
        (n.title || "").toLowerCase().includes(s) ||
        (n.summary || "").toLowerCase().includes(s)
      );
    });
  }, [nouns, q, kind]);

  const openCreate = () => {
    setEditingId(null);
    setDraft({
      id: makeId(),
      kind: "concept",
      title: "",
      summary: "",
      description: "",
      tags: [],
    });
    setOpen(true);
  };

  const openEdit = (n: any) => {
    setEditingId(n.id);
    setDraft({
      id: n.id,
      kind: n.kind ?? "concept",
      title: n.title ?? "",
      summary: n.summary ?? "",
      description: n.description ?? "",
      tags: n.tags ?? [],
    });
    setOpen(true);
  };

  const close = () => {
    setOpen(false);
    setDraft(null);
    setEditingId(null);
  };

  const save = () => {
    if (!draft) return;
    const title = String(draft.title || "").trim();
    if (!title) return;

    const next = {
      ...draft,
      title,
      meta: { ...(draft.meta ?? {}), updatedAt: new Date().toISOString() },
    };

    if (editingId) {
      updateWorld({
        properNouns: nouns.map((n) => (n.id === editingId ? { ...n, ...next } : n)),
      });
    } else {
      updateWorld({ properNouns: [...nouns, next] });
    }
    close();
  };

  const remove = (id: string) => {
    updateWorld({ properNouns: nouns.filter((n) => n.id !== id) });
  };

  return (
    <HUDPanel className="p-6">
      <HUDSectionTitle
        right={
          <div className="flex items-center gap-2">
            <HUDBadge>{`TOTAL ${nouns.length}`}</HUDBadge>
            {editMode && (
              <GButton
                variant="primary"
                icon={<Plus className="w-4 h-4" />}
                text="항목 추가"
                onClick={openCreate}
              />
            )}
          </div>
        }
      >
        TERMS / INDEX
      </HUDSectionTitle>

      {/* controls */}
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="제목/요약 검색"
            className={`${uiInput} pl-9`}
          />
        </div>

        <div className="flex flex-wrap gap-2 justify-start lg:justify-end">
          <GButton variant={kind === "all" ? "primary" : "neutral"} text="ALL" onClick={() => setKind("all")} />
          {KINDS.slice(0, 4).map((k) => (
            <GButton
              key={k}
              variant={kind === k ? "primary" : "neutral"}
              text={k.toUpperCase()}
              onClick={() => setKind(k)}
            />
          ))}
        </div>
      </div>

      {/* list */}
      <div className="mt-5 grid gap-3">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-black/20 p-6 text-sm text-white/60">
            항목이 없습니다.
          </div>
        ) : (
          filtered.map((n) => (
            <div key={n.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="text-lg font-semibold truncate">{n.title}</div>
                    <HUDBadge>{String(n.kind || "other").toUpperCase()}</HUDBadge>
                  </div>

                  {n.summary ? (
                    <div className="mt-2 text-sm text-white/70 line-clamp-2 whitespace-pre-wrap">
                      {n.summary}
                    </div>
                  ) : (
                    <div className="mt-2 text-sm text-white/50">요약 없음</div>
                  )}
                </div>

                {editMode && (
                  <div className="shrink-0 flex items-center gap-2">
                    <GButton
                      variant="neutral"
                      size="icon"
                      icon={<Pencil className="w-4 h-4" />}
                      onClick={() => openEdit(n)}
                      title="편집"
                    />
                    <GButton
                      variant="danger"
                      size="icon"
                      icon={<Trash2 className="w-4 h-4" />}
                      onClick={() => remove(n.id)}
                      title="삭제"
                    />
                  </div>
                )}
              </div>

              {n.tags?.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {n.tags.map((t: string) => (
                    <HUDBadge key={t}>{t}</HUDBadge>
                  ))}
                </div>
              ) : null}
            </div>
          ))
        )}
      </div>

      {/* modal */}
      <Modal
        open={open && editMode}
        onClose={close}
        title={editingId ? "고유명사 편집" : "고유명사 추가"}
        maxWidthClassName="max-w-3xl"
        footer={
          <div className="flex justify-end gap-2">
            <GButton variant="neutral" text="취소" onClick={close} />
            <GButton variant="primary" text="저장" onClick={save} />
          </div>
        }
      >
        {draft && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-white/60 mb-2">제목</div>
                <input
                  className={uiInput}
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                />
              </div>

              <div>
                <div className="text-xs text-white/60 mb-2">종류(kind)</div>
                <select
                  className={uiInput}
                  value={draft.kind}
                  onChange={(e) => setDraft({ ...draft, kind: e.target.value })}
                >
                  {KINDS.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <div className="text-xs text-white/60 mb-2">요약</div>
              <textarea
                className={uiTextarea}
                value={draft.summary}
                onChange={(e) => setDraft({ ...draft, summary: e.target.value })}
              />
            </div>

            <div>
              <div className="text-xs text-white/60 mb-2">본문</div>
              <textarea
                className={uiTextarea}
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              />
            </div>

            <div>
              <div className="text-xs text-white/60 mb-2">태그(콤마)</div>
              <input
                className={uiInput}
                value={(draft.tags || []).join(", ")}
                onChange={(e) => setDraft({ ...draft, tags: toTags(e.target.value) })}
              />
            </div>

            <div className="text-[11px] text-white/45">
              (링크(worldIds/characterIds/creatureIds/entryIds/eventIds)는 다음 단계에서 “선택 UI”로 붙이면 더 게임스럽게 나옴)
            </div>
          </div>
        )}
      </Modal>
    </HUDPanel>
  );
}