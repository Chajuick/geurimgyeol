import { useMemo, useState } from "react";
import { Plus, Search, Trash2, Pencil } from "lucide-react";

import { HUDPanel, HUDSectionTitle, HUDBadge } from "@/components/ui/hud";
import GButton from "@/components/ui/gyeol-button";
import Modal from "@/components/ui/modal";
import { uiInput, uiTextarea } from "@/components/ui/form/presets";

type Draft = {
  id: string;
  kind: "event";
  title: string;
  summary: string;
  description: string;
  tags: string[];

  date: any; // WorldDateRange
  showOnTimeline: boolean;
  importance?: 1 | 2 | 3 | 4 | 5;
};

function makeId() {
  return Date.now().toString();
}

function toTags(text: string) {
  return text
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

function formatDateRange(dr: any) {
  if (!dr) return "—";
  const fmt = (d: any) => {
    if (!d) return "—";
    const era = d.eraId ? `${d.eraId} ` : "";
    const suf = d.suffixId ? ` ${d.suffixId}` : "";
    const note = d.note ? ` (${d.note})` : "";
    return `${era}${d.year}${suf}${note}`.trim();
  };

  if (dr.kind === "point") return fmt(dr.at);
  if (dr.kind === "range") {
    const a = fmt(dr.from);
    const b = dr.to ? fmt(dr.to) : "…";
    return `${a} → ${b}`;
  }
  return "—";
}

export default function WorldEventsTab({ world, editMode, updateWorld }: any) {
  const [q, setQ] = useState("");
  const [onlyTimeline, setOnlyTimeline] = useState(false);

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);

  const events = (world.events ?? []) as any[];

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return events
      .filter((e) => {
        if (onlyTimeline && !e.showOnTimeline) return false;
        if (!s) return true;
        return (
          (e.title || "").toLowerCase().includes(s) ||
          (e.summary || "").toLowerCase().includes(s)
        );
      })
      .slice()
      // 대충 정렬(추후 chronology 기준 정렬 로직으로 교체 가능)
      .sort((a, b) => (b.meta?.updatedAt || "").localeCompare(a.meta?.updatedAt || ""));
  }, [events, q, onlyTimeline]);

  const openCreate = () => {
    const next: Draft = {
      id: makeId(),
      kind: "event",
      title: "",
      summary: "",
      description: "",
      tags: [],
      date: { kind: "point", at: { eraId: world.chronology?.defaultEraId || "ERA", year: 0 } },
      showOnTimeline: true,
      importance: 3,
    };
    setEditingId(null);
    setDraft(next);
    setOpen(true);
  };

  const openEdit = (e: any) => {
    setEditingId(e.id);
    setDraft({
      id: e.id,
      kind: "event",
      title: e.title ?? "",
      summary: e.summary ?? "",
      description: e.description ?? "",
      tags: e.tags ?? [],
      date: e.date ?? { kind: "point", at: { eraId: "ERA", year: 0 } },
      showOnTimeline: !!e.showOnTimeline,
      importance: e.importance ?? 3,
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
    const title = draft.title.trim();
    if (!title) return;

    const next = {
      ...draft,
      title,
      meta: { ...(draft as any).meta, updatedAt: new Date().toISOString() },
    };

    if (editingId) {
      updateWorld({
        events: events.map((e) => (e.id === editingId ? { ...e, ...next } : e)),
      });
    } else {
      updateWorld({ events: [...events, next] });
    }
    close();
  };

  const remove = (id: string) => {
    updateWorld({ events: events.filter((e) => e.id !== id) });
  };

  return (
    <HUDPanel className="p-6">
      <HUDSectionTitle
        right={
          <div className="flex items-center gap-2">
            <HUDBadge>{`TOTAL ${events.length}`}</HUDBadge>
            {editMode && (
              <GButton
                variant="primary"
                icon={<Plus className="w-4 h-4" />}
                text="사건 추가"
                onClick={openCreate}
              />
            )}
          </div>
        }
      >
        EVENT LOG
      </HUDSectionTitle>

      {/* controls */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="제목/요약 검색"
            className={`${uiInput} pl-9`}
          />
        </div>

        <div className="flex items-center gap-2">
          <GButton
            variant={onlyTimeline ? "primary" : "neutral"}
            text={onlyTimeline ? "타임라인만" : "전체"}
            onClick={() => setOnlyTimeline((v) => !v)}
          />
        </div>
      </div>

      {/* list */}
      <div className="mt-5 grid gap-3">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-black/20 p-6 text-sm text-white/60">
            사건이 없습니다.
          </div>
        ) : (
          filtered.map((e) => (
            <div
              key={e.id}
              className="rounded-2xl border border-white/10 bg-black/20 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="text-lg font-semibold truncate">{e.title}</div>
                    {e.showOnTimeline && <HUDBadge tone="info">TIMELINE</HUDBadge>}
                    {e.importance ? <HUDBadge>{`★ ${e.importance}`}</HUDBadge> : null}
                  </div>
                  <div className="mt-1 text-xs text-white/55">
                    {formatDateRange(e.date)}
                  </div>
                  {e.summary ? (
                    <div className="mt-2 text-sm text-white/70 line-clamp-2 whitespace-pre-wrap">
                      {e.summary}
                    </div>
                  ) : null}
                </div>

                {editMode && (
                  <div className="shrink-0 flex items-center gap-2">
                    <GButton
                      variant="neutral"
                      size="icon"
                      icon={<Pencil className="w-4 h-4" />}
                      onClick={() => openEdit(e)}
                      title="편집"
                    />
                    <GButton
                      variant="danger"
                      size="icon"
                      icon={<Trash2 className="w-4 h-4" />}
                      onClick={() => remove(e.id)}
                      title="삭제"
                    />
                  </div>
                )}
              </div>

              {e.tags?.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {e.tags.map((t: string) => (
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
        title={editingId ? "사건 편집" : "사건 추가"}
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
            <div>
              <div className="text-xs text-white/60 mb-2">제목</div>
              <input
                className={uiInput}
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-white/60 mb-2">요약</div>
                <textarea
                  className={uiTextarea}
                  value={draft.summary}
                  onChange={(e) => setDraft({ ...draft, summary: e.target.value })}
                  placeholder="한줄~두줄 요약"
                />
              </div>

              <div>
                <div className="text-xs text-white/60 mb-2">태그(콤마)</div>
                <input
                  className={uiInput}
                  value={(draft.tags || []).join(", ")}
                  onChange={(e) => setDraft({ ...draft, tags: toTags(e.target.value) })}
                />

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <label className="text-xs text-white/60 flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={draft.showOnTimeline}
                      onChange={(e) =>
                        setDraft({ ...draft, showOnTimeline: e.target.checked })
                      }
                    />
                    타임라인 표시
                  </label>

                  <div className="flex items-center gap-2">
                    <div className="text-xs text-white/60">중요도</div>
                    <select
                      className={uiInput}
                      value={draft.importance ?? 3}
                      onChange={(e) =>
                        setDraft({ ...draft, importance: Number(e.target.value) as any })
                      }
                    >
                      {[1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* date */}
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-center justify-between">
                <div className="text-xs text-white/60">날짜</div>

                <div className="flex gap-2">
                  <GButton
                    variant={draft.date?.kind === "point" ? "primary" : "neutral"}
                    text="POINT"
                    onClick={() =>
                      setDraft({
                        ...draft,
                        date: { kind: "point", at: draft.date?.from || draft.date?.at || { eraId: "ERA", year: 0 } },
                      })
                    }
                  />
                  <GButton
                    variant={draft.date?.kind === "range" ? "primary" : "neutral"}
                    text="RANGE"
                    onClick={() =>
                      setDraft({
                        ...draft,
                        date: {
                          kind: "range",
                          from: draft.date?.at || draft.date?.from || { eraId: "ERA", year: 0 },
                          to: draft.date?.to,
                        },
                      })
                    }
                  />
                </div>
              </div>

              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                {draft.date?.kind === "point" ? (
                  <>
                    <div>
                      <div className="text-xs text-white/60 mb-2">ERA ID</div>
                      <input
                        className={uiInput}
                        value={draft.date.at.eraId ?? ""}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            date: {
                              kind: "point",
                              at: { ...draft.date.at, eraId: e.target.value },
                            },
                          })
                        }
                      />
                    </div>

                    <div>
                      <div className="text-xs text-white/60 mb-2">YEAR</div>
                      <input
                        type="number"
                        className={uiInput}
                        value={draft.date.at.year ?? 0}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            date: {
                              kind: "point",
                              at: { ...draft.date.at, year: Number(e.target.value) },
                            },
                          })
                        }
                      />
                    </div>

                    <div className="md:col-span-2">
                      <div className="text-xs text-white/60 mb-2">NOTE</div>
                      <input
                        className={uiInput}
                        value={draft.date.at.note ?? ""}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            date: {
                              kind: "point",
                              at: { ...draft.date.at, note: e.target.value },
                            },
                          })
                        }
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <div className="text-xs text-white/60 mb-2">FROM (ERA)</div>
                      <input
                        className={uiInput}
                        value={draft.date.from.eraId ?? ""}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            date: {
                              ...draft.date,
                              from: { ...draft.date.from, eraId: e.target.value },
                            },
                          })
                        }
                      />
                    </div>
                    <div>
                      <div className="text-xs text-white/60 mb-2">FROM (YEAR)</div>
                      <input
                        type="number"
                        className={uiInput}
                        value={draft.date.from.year ?? 0}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            date: {
                              ...draft.date,
                              from: { ...draft.date.from, year: Number(e.target.value) },
                            },
                          })
                        }
                      />
                    </div>

                    <div>
                      <div className="text-xs text-white/60 mb-2">TO (ERA)</div>
                      <input
                        className={uiInput}
                        value={draft.date.to?.eraId ?? ""}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            date: {
                              ...draft.date,
                              to: { ...(draft.date.to ?? { eraId: "", year: 0 }), eraId: e.target.value },
                            },
                          })
                        }
                      />
                    </div>
                    <div>
                      <div className="text-xs text-white/60 mb-2">TO (YEAR)</div>
                      <input
                        type="number"
                        className={uiInput}
                        value={draft.date.to?.year ?? 0}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            date: {
                              ...draft.date,
                              to: { ...(draft.date.to ?? { eraId: "", year: 0 }), year: Number(e.target.value) },
                            },
                          })
                        }
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            <div>
              <div className="text-xs text-white/60 mb-2">본문</div>
              <textarea
                className={uiTextarea}
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                placeholder="상세 설명(플레이버/서술)"
              />
            </div>
          </div>
        )}
      </Modal>
    </HUDPanel>
  );
}