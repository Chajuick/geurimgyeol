import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Search, Settings2 } from "lucide-react";

import { HUDPanel, HUDSectionTitle, HUDBadge } from "@/components/ui/hud";
import GButton from "@/components/ui/gyeol-button";
import { uiInput } from "@/components/ui/form/presets";

import { DEFAULT_WORLD_PROPER_NOUN_KINDS } from "@/lib/defaultData";

import ProperNounCard from "./proper-nouns/ProperNounCard";
import ProperNounDetailModal from "./proper-nouns/ProperNounDetailModal";
import ProperNounKindsModal, { KindDef } from "./proper-nouns/ProperNounKindsModal";
import { cn } from "@/lib/utils";

function makeId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

/** id 자동 생성용: 한글/공백 들어오면 안전하게 slug */
function slugify(input: string) {
  const s = (input || "").trim().toLowerCase();
  if (!s) return "";
  const normalized = s.replace(/\s+/g, "-").replace(/[^a-z0-9\-_]/g, "");
  return normalized || "";
}

/** entry에서 kindId를 안전하게 읽기(구버전 kind 지원) */
function getEntryKindId(n: any): string {
  return String(n?.kindId ?? n?.kind ?? "other");
}

/** ✅ 작은 디바운스 훅 (검색/입력 부하 줄이기) */
function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}

/** ✅ entry -> modal draft로 정규화 (열기 전에 확정) */
function normalizeEntryToDraft(args: {
  entry: any | null;
  kinds: KindDef[];
  worldDefaultKindId?: string;
  forceNew: boolean;
}) {
  const { entry, kinds, worldDefaultKindId, forceNew } = args;

  const defaultKind =
    worldDefaultKindId ??
    kinds.find(k => k.id === "concept")?.id ??
    kinds[0]?.id ??
    "other";

  const base = entry ?? {
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

  const kid = getEntryKindId(base);
  const safeKid = kinds.some(k => String(k.id) === String(kid)) ? kid : defaultKind;

  return {
    ...base,
    id: forceNew ? makeId() : base.id,
    kindId: safeKid,
    title: base.title ?? "",
    summary: base.summary ?? "",
    description: base.description ?? "",
    image: base.image ?? "",
    icon: base.icon ?? "",
    tags: base.tags ?? [],
    links: {
      worldIds: base.links?.worldIds ?? [],
      characterIds: base.links?.characterIds ?? [],
      creatureIds: base.links?.creatureIds ?? [],
      entryIds: base.links?.entryIds ?? [],
      eventIds: base.links?.eventIds ?? [],
    },
    meta: base.meta ?? undefined,
  };
}

export default function WorldProperNounsTab({ world, editMode, updateWorld, data }: any) {
  // ✅ createDraft (생성 모드에서만 사용) - 유지
  const [createDraft, setCreateDraft] = useState<any | null>(null);

  const [q, setQ] = useState("");
  const qDebounced = useDebouncedValue(q, 120);

  const [kind, setKind] = useState<string | "all">("all");

  // detail modal
  const [openDetail, setOpenDetail] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [detailEdit, setDetailEdit] = useState(false);

  // ✅ 모달 반짝임 방지: 열기 전에 초기 draft를 확정해서 전달
  const [initialDraft, setInitialDraft] = useState<any | null>(null);
  const [initialEditingId, setInitialEditingId] = useState<string | null>(null);

  // kind editor modal
  const [openKinds, setOpenKinds] = useState(false);

  const nouns = (world.properNouns ?? []) as any[];

  // nounsById (detail lookup O(1))
  const nounById = useMemo(() => {
    const m = new Map<string, any>();
    nouns.forEach(n => m.set(String(n.id), n));
    return m;
  }, [nouns]);

  // kinds: world > fallback
  const kinds = useMemo<KindDef[]>(() => {
    const list =
      (world.properNounKinds?.length ? world.properNounKinds : DEFAULT_WORLD_PROPER_NOUN_KINDS) ??
      [];

    const hasOther = list.some((k: any) => String(k.id) === "other");
    const withOther = hasOther ? list : [...list, { id: "other", label: "기타", meta: { order: 999 } }];

    return [...withOther].sort((a: any, b: any) => (a.meta?.order ?? 0) - (b.meta?.order ?? 0));
  }, [world.properNounKinds]);

  // label map (kindLabel O(1))
  const kindLabelMap = useMemo(() => {
    const m = new Map<string, string>();
    kinds.forEach(k => m.set(String(k.id), String(k.label ?? k.id)));
    return m;
  }, [kinds]);

  const kindLabel = useCallback((id: string) => kindLabelMap.get(String(id)) ?? String(id), [kindLabelMap]);

  // filtered list (qDebounced 사용)
  const filtered = useMemo(() => {
    const s = (qDebounced || "").trim().toLowerCase();

    return nouns.filter(n => {
      const kid = getEntryKindId(n);

      if (kind !== "all" && kid !== kind) return false;
      if (!s) return true;

      const title = String(n.title ?? "").toLowerCase();
      const summary = String(n.summary ?? "").toLowerCase();
      const desc = String(n.description ?? "").toLowerCase();
      const tagsText = Array.isArray(n.tags) ? n.tags.join(",").toLowerCase() : "";

      return title.includes(s) || summary.includes(s) || desc.includes(s) || tagsText.includes(s);
    });
  }, [nouns, qDebounced, kind]);

  /** ✅ 생성: 무조건 편집 모드로 열기 (열기 전에 initialDraft 확정) */
  const openCreate = useCallback(() => {
    const draft = normalizeEntryToDraft({
      entry: null,
      kinds,
      worldDefaultKindId: world.defaultProperNounKindId,
      forceNew: true,
    });

    setCreateDraft(draft);
    setInitialDraft(draft);
    setInitialEditingId(null); // ✅ insert
    setDetailId(draft.id);
    setDetailEdit(true);
    setOpenDetail(true);
  }, [kinds, world.defaultProperNounKindId]);

  /** ✅ 감상으로 열기 (열기 전에 initialDraft 확정) */
  const openView = useCallback(
    (id: string) => {
      const e = nounById.get(String(id)) ?? null;
      const draft = normalizeEntryToDraft({
        entry: e,
        kinds,
        worldDefaultKindId: world.defaultProperNounKindId,
        forceNew: false,
      });

      setCreateDraft(null);
      setInitialDraft(draft);
      setInitialEditingId(String(id)); // update target
      setDetailId(id);
      setDetailEdit(false);
      setOpenDetail(true);
    },
    [nounById, kinds, world.defaultProperNounKindId]
  );

  /** ✅ 편집으로 열기 (열기 전에 initialDraft 확정) */
  const openEdit = useCallback(
    (id: string) => {
      if (!editMode) return;
      const e = nounById.get(String(id)) ?? null;
      const draft = normalizeEntryToDraft({
        entry: e,
        kinds,
        worldDefaultKindId: world.defaultProperNounKindId,
        forceNew: false,
      });

      setCreateDraft(null);
      setInitialDraft(draft);
      setInitialEditingId(String(id)); // update target
      setDetailId(id);
      setDetailEdit(true);
      setOpenDetail(true);
    },
    [editMode, nounById, kinds, world.defaultProperNounKindId]
  );

  const closeDetail = useCallback(() => {
    setOpenDetail(false);
    setDetailId(null);
    setDetailEdit(false);
    setCreateDraft(null);

    // ✅ 다음 오픈 때 이전 내용이 먼저 뜨는 현상 방지
    setInitialDraft(null);
    setInitialEditingId(null);
  }, []);

  const removeEntry = useCallback(
    (id: string) => {
      updateWorld({ properNouns: nouns.filter(n => n.id !== id) });
    },
    [updateWorld, nouns]
  );

  const upsertEntry = useCallback(
    (nextEntry: any, editingId: string | null) => {
      if (editingId) {
        updateWorld({
          properNouns: nouns.map(n => (n.id === editingId ? { ...n, ...nextEntry } : n)),
        });
      } else {
        updateWorld({ properNouns: [...nouns, nextEntry] });
      }
    },
    [updateWorld, nouns]
  );

  const openKindEditor = useCallback(() => setOpenKinds(true), []);

  const saveKinds = useCallback(
    (payload: {
      cleanedKinds: KindDef[];
      nextDefaultKindId: string;
      migratedNouns: any[];
      validIds: Set<string>;
    }) => {
      updateWorld({
        properNounKinds: payload.cleanedKinds,
        defaultProperNounKindId: payload.nextDefaultKindId,
        properNouns: payload.migratedNouns,
      });

      if (kind !== "all" && !payload.validIds.has(kind)) setKind("all");
      setOpenKinds(false);
    },
    [updateWorld, kind]
  );

  // (기존 유지) detailEntry: 모달 내부 fallback용
  const detailEntry = useMemo(() => {
    if (!detailId) return null;
    if (createDraft?.id === detailId) return createDraft;
    return nounById.get(detailId) ?? null;
  }, [detailId, createDraft, nounById]);

  return (
    <HUDPanel className="p-6 h-full min-h-0 flex flex-col">
      <HUDSectionTitle
        right={
          <div className="flex items-center gap-2">
            <HUDBadge>{`TOTAL ${nouns.length}`}</HUDBadge>

            {editMode && (
              <>
                <GButton
                  variant="neutral"
                  icon={<Settings2 className="w-4 h-4" />}
                  text="분류 편집"
                  onClick={openKindEditor}
                />
                <GButton
                  variant="primary"
                  icon={<Plus className="w-4 h-4" />}
                  text="항목 추가"
                  onClick={openCreate}
                />
              </>
            )}
          </div>
        }
      >
        TERMS / INDEX
      </HUDSectionTitle>

      {/* controls (스크롤 안됨) */}
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-3 shrink-0">
        <div className="relative">
          <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="제목/요약/본문/태그 검색"
            className={`${uiInput} pl-9`}
          />
        </div>

        <div className="flex flex-wrap gap-2 justify-start lg:justify-end">
          <GButton
            variant={kind === "all" ? "primary" : "neutral"}
            text="ALL"
            onClick={() => setKind("all")}
          />
          {kinds.map(k => (
            <GButton
              key={k.id}
              variant={kind === k.id ? "primary" : "neutral"}
              text={k.label}
              onClick={() => setKind(k.id)}
            />
          ))}
        </div>
      </div>

      {/* ✅ list wrapper: 여기만 스크롤 */}
      <div
        className={cn(
          "mt-5 flex-1 min-h-0",
          "overflow-y-scroll",
          "[scrollbar-gutter:stable]",
          "scroll-dark",
          "pr-1"
        )}
      >
        <div className="grid gap-3">
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-black/20 p-6 text-sm text-white/60">
              항목이 없습니다.
            </div>
          ) : (
            filtered.map(n => {
              const kid = getEntryKindId(n);
              return (
                <ProperNounCard
                  key={n.id}
                  entry={n}
                  kindLabel={kindLabel(kid)}
                  editMode={editMode}
                  onOpen={() => openView(n.id)}
                  onOpenEdit={() => openEdit(n.id)}
                  onRemove={() => removeEntry(n.id)}
                />
              );
            })
          )}
        </div>
      </div>

      {/* DETAIL (view/edit/create) */}
      <ProperNounDetailModal
        open={openDetail}
        onClose={closeDetail}
        editMode={editMode}
        mode={detailEdit ? "edit" : "view"}
        kinds={kinds}
        worldDefaultKindId={world.defaultProperNounKindId}
        entry={detailEntry}
        data={data}
        forceNew={!!createDraft}
        initialDraft={initialDraft}          // ✅ 추가
        initialEditingId={initialEditingId}  // ✅ 추가
        kindLabel={(id: string) => kindLabel(id)}
        onDelete={(id: string) => removeEntry(id)}
        onSave={(payload: { entry: any; editingId: string | null }) => {
          upsertEntry(payload.entry, payload.editingId);
          if (!payload.editingId) setCreateDraft(null);
          closeDetail();
        }}
      />

      {/* KIND EDITOR */}
      <ProperNounKindsModal
        open={openKinds && editMode}
        onClose={() => setOpenKinds(false)}
        world={world}
        nouns={nouns}
        defaultKinds={DEFAULT_WORLD_PROPER_NOUN_KINDS}
        slugify={slugify}
        getEntryKindId={getEntryKindId}
        onSave={saveKinds}
      />
    </HUDPanel>
  );
}