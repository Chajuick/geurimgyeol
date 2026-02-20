import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import Modal from "@/components/ui/modal";
import GButton from "@/components/ui/gyeol-button";
import { uiInput } from "@/components/ui/form/presets";
import SelectBox from "@/components/ui/gyeol-select";
import NumberBox from "@/components/ui/gyeol-number";

export type KindDef = {
  id: string;
  label: string;
  meta?: { order?: number; pinned?: boolean; hidden?: boolean };
};

export default function ProperNounKindsModal(props: {
  open: boolean;
  onClose: () => void;

  world: any;
  nouns: any[];
  defaultKinds: KindDef[];

  slugify: (s: string) => string;
  getEntryKindId: (n: any) => string;

  onSave: (payload: {
    cleanedKinds: KindDef[];
    nextDefaultKindId: string;
    migratedNouns: any[];
    validIds: Set<string>;
  }) => void;
}) {
  const {
    open,
    onClose,
    world,
    nouns,
    defaultKinds,
    slugify,
    getEntryKindId,
    onSave,
  } = props;

  const [kindsDraft, setKindsDraft] = useState<KindDef[]>([]);
  const [defaultKindDraft, setDefaultKindDraft] = useState<string>("concept");
  const [newKindLabel, setNewKindLabel] = useState("");
  const [newKindId, setNewKindId] = useState("");

  const openInit = () => {
    const base = (
      world.properNounKinds?.length ? world.properNounKinds : defaultKinds
    ) as KindDef[];

    const hasOther = base.some(k => k.id === "other");
    const normalized = hasOther
      ? base
      : [...base, { id: "other", label: "기타", meta: { order: 999 } }];

    const sorted = [...normalized].sort(
      (a, b) => (a.meta?.order ?? 0) - (b.meta?.order ?? 0)
    );

    setKindsDraft(sorted.map(k => ({ ...k, meta: { ...(k.meta ?? {}) } })));
    setDefaultKindDraft(
      world.defaultProperNounKindId ??
        sorted.find(k => k.id === "concept")?.id ??
        sorted[0]?.id ??
        "other"
    );
    setNewKindLabel("");
    setNewKindId("");
  };

  // modal open될 때 초기화
  useMemo(() => {
    if (open) openInit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const addKind = () => {
    const label = newKindLabel.trim();
    if (!label) return;

    const manualId = slugify(newKindId);
    const autoId = slugify(label);
    const id = (manualId || autoId || `kind-${Date.now()}`).toLowerCase();

    if (kindsDraft.some(k => k.id === id)) return;

    const maxOrder =
      Math.max(0, ...kindsDraft.map(k => Number(k.meta?.order ?? 0))) + 10;

    const next: KindDef = { id, label, meta: { order: maxOrder } };

    setKindsDraft(prev =>
      [...prev, next].sort(
        (a, b) => (a.meta?.order ?? 0) - (b.meta?.order ?? 0)
      )
    );
    setNewKindLabel("");
    setNewKindId("");
  };

  const removeKind = (id: string) => {
    if (id === "other") return;
    setKindsDraft(prev => prev.filter(k => k.id !== id));
    if (defaultKindDraft === id) setDefaultKindDraft("other");
  };

  const saveKinds = () => {
    const hasOther = kindsDraft.some(k => k.id === "other");
    const withOther = hasOther
      ? kindsDraft
      : [...kindsDraft, { id: "other", label: "기타", meta: { order: 999 } }];

    const cleaned = withOther
      .map(k => ({
        id: String(k.id).trim(),
        label: String(k.label ?? "").trim() || String(k.id),
        meta: { ...(k.meta ?? {}) },
      }))
      .filter(k => !!k.id)
      .sort((a, b) => (a.meta?.order ?? 0) - (b.meta?.order ?? 0));

    const validIds = new Set(cleaned.map(k => k.id));
    const nextDefault = validIds.has(defaultKindDraft)
      ? defaultKindDraft
      : "other";

    const migratedNouns = nouns.map(n => {
      const kid = getEntryKindId(n);
      const safe = validIds.has(kid) ? kid : "other";
      const { kind, ...rest } = n as any;
      return { ...rest, kindId: safe };
    });

    onSave({
      cleanedKinds: cleaned,
      nextDefaultKindId: nextDefault,
      migratedNouns,
      validIds,
    });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="분류 편집"
      maxWidthClassName="max-w-3xl"
      footer={
        <div className="flex justify-end gap-2">
          <GButton variant="neutral" text="취소" onClick={onClose} />
          <GButton variant="primary" text="저장" onClick={saveKinds} />
        </div>
      }
    >
      <div className="space-y-4">
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="text-xs text-white/60 mb-2">기본값(Default)</div>
          <SelectBox
            value={defaultKindDraft}
            onChange={setDefaultKindDraft}
            options={kindsDraft}
          />
          <div className="mt-2 text-[11px] text-white/45">
            신규 항목 생성 시 해당 분류가 자동으로 선택됩니다.
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_260px_auto] gap-2">
            <input
              className={uiInput}
              placeholder="표시명"
              value={newKindLabel}
              onChange={e => {
                const label = e.target.value;
                setNewKindLabel(label);
                if (!newKindId.trim()) setNewKindId(slugify(label));
              }}
            />
            <input
              className={uiInput}
              placeholder="고유 ID"
              value={newKindId}
              onChange={e => setNewKindId(e.target.value)}
            />
            <GButton
              variant="neutral"
              icon={<Plus className="w-4 h-4" />}
              text="추가"
              onClick={addKind}
            />
          </div>

          <div className="mt-4 grid gap-2">
            {kindsDraft
              .slice()
              .sort((a, b) => (a.meta?.order ?? 0) - (b.meta?.order ?? 0))
              .map(k => (
                <div
                  key={k.id}
                  className="rounded-xl border border-white/10 bg-black/10 p-3 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-sm text-white/85 truncate">
                      <span className="font-semibold">{k.label}</span>{" "}
                      <span className="text-white/45 text-xs">({k.id})</span>
                    </div>

                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <div className="text-[11px] text-white/50 mb-1">
                          label
                        </div>
                        <input
                          className={uiInput}
                          value={k.label}
                          onChange={e => {
                            const v = e.target.value;
                            setKindsDraft(prev =>
                              prev.map(x =>
                                x.id === k.id ? { ...x, label: v } : x
                              )
                            );
                          }}
                        />
                      </div>

                      <div>
                        <div className="text-[11px] text-white/50 mb-1">
                          order
                        </div>
                        <NumberBox
                          value={Number(k.meta?.order ?? 0)}
                          min={0}
                          step={1}
                          onChange={num => {
                            setKindsDraft(prev =>
                              prev.map(x =>
                                x.id === k.id
                                  ? {
                                      ...x,
                                      meta: { ...(x.meta ?? {}), order: num },
                                    }
                                  : x
                              )
                            );
                          }}
                        />
                      </div>
                    </div>

                    {k.id === "other" ? (
                      <div className="mt-2 text-[11px] text-white/45">
                        * “기타(other)”는 삭제할 수 없습니다.
                      </div>
                    ) : null}
                  </div>

                  <div className="shrink-0">
                    <GButton
                      variant="danger"
                      size="icon"
                      icon={<Trash2 className="w-4 h-4" />}
                      onClick={() => removeKind(k.id)}
                      title="삭제"
                      disabled={k.id === "other"}
                    />
                  </div>
                </div>
              ))}
          </div>

          <div className="mt-3 text-[11px] text-white/45">
            * 분류를 삭제하면, 그 분류를 쓰던 항목들은 자동으로 “기타(other)”로
            이동됩니다.
          </div>
        </div>
      </div>
    </Modal>
  );
}
