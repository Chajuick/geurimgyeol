import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Search, Settings2 } from "lucide-react";

import GButton from "@/components/ui/gyeol-button";
import { uiInput } from "@/components/ui/form/presets";

import { DEFAULT_WORLD_PROPER_NOUN_KINDS } from "@/lib/defaultData";

import ProperNounCard from "./proper-nouns/ProperNounCard";
import ProperNounDetailModal from "./proper-nouns/ProperNounDetailModal";
import ProperNounKindsModal, {
  KindDef,
} from "./proper-nouns/ProperNounKindsModal";
import { cn } from "@/lib/utils";

function makeId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto)
    return crypto.randomUUID();
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
  const safeKid = kinds.some(k => String(k.id) === String(kid))
    ? kid
    : defaultKind;

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

export default function WorldProperNounsTab({
  world,
  editMode,
  updateWorld,
  data,
}: any) {
  const [createDraft, setCreateDraft] = useState<any | null>(null);

  const [q, setQ] = useState("");
  const qDebounced = useDebouncedValue(q, 120);
  const [kind, setKind] = useState<string | "all">("all");

  // detail modal
  const [openDetail, setOpenDetail] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [detailEdit, setDetailEdit] = useState(false);

  // ✅ 모달 반짝임 방지
  const [initialDraft, setInitialDraft] = useState<any | null>(null);
  const [initialEditingId, setInitialEditingId] = useState<string | null>(null);

  // kind editor modal
  const [openKinds, setOpenKinds] = useState(false);

  const nouns = (world.properNouns ?? []) as any[];

  const nounById = useMemo(() => {
    const m = new Map<string, any>();
    nouns.forEach(n => m.set(String(n.id), n));
    return m;
  }, [nouns]);

  // kinds: world > fallback
  const kinds = useMemo<KindDef[]>(() => {
    const list =
      (world.properNounKinds?.length
        ? world.properNounKinds
        : DEFAULT_WORLD_PROPER_NOUN_KINDS) ?? [];

    const hasOther = list.some((k: any) => String(k.id) === "other");
    const withOther = hasOther
      ? list
      : [...list, { id: "other", label: "기타", meta: { order: 999 } }];

    return [...withOther].sort(
      (a: any, b: any) => (a.meta?.order ?? 0) - (b.meta?.order ?? 0)
    );
  }, [world.properNounKinds]);

  const kindLabelMap = useMemo(() => {
    const m = new Map<string, string>();
    kinds.forEach(k => m.set(String(k.id), String(k.label ?? k.id)));
    return m;
  }, [kinds]);

  const kindLabel = useCallback(
    (id: string) => kindLabelMap.get(String(id)) ?? String(id),
    [kindLabelMap]
  );

  /**
   * ✅ 핵심 최적화: 검색용 문자열(haystack)을 nouns 변경 시에만 준비
   * - 매 렌더마다 toLowerCase/join 반복 제거
   */
  const prepared = useMemo(() => {
    return nouns.map(n => {
      const title = String(n.title ?? "");
      const summary = String(n.summary ?? "");
      const desc = String(n.description ?? "");
      const tags = Array.isArray(n.tags) ? n.tags.join(",") : "";
      const kid = getEntryKindId(n);

      return {
        n,
        id: String(n.id),
        kid,
        hay: (title + "\n" + summary + "\n" + desc + "\n" + tags).toLowerCase(),
      };
    });
  }, [nouns]);

  const filtered = useMemo(() => {
    const s = (qDebounced || "").trim().toLowerCase();

    return prepared
      .filter(x => (kind === "all" ? true : x.kid === kind))
      .filter(x => (!s ? true : x.hay.includes(s)))
      .map(x => x.n);
  }, [prepared, qDebounced, kind]);

  const openCreate = useCallback(() => {
    const draft = normalizeEntryToDraft({
      entry: null,
      kinds,
      worldDefaultKindId: world.defaultProperNounKindId,
      forceNew: true,
    });

    setCreateDraft(draft);
    setInitialDraft(draft);
    setInitialEditingId(null);
    setDetailId(String(draft.id));
    setDetailEdit(true);
    setOpenDetail(true);
  }, [kinds, world.defaultProperNounKindId]);

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
      setInitialEditingId(String(id));
      setDetailId(String(id));
      setDetailEdit(false);
      setOpenDetail(true);
    },
    [nounById, kinds, world.defaultProperNounKindId]
  );

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
      setInitialEditingId(String(id));
      setDetailId(String(id));
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
    setInitialDraft(null);
    setInitialEditingId(null);
  }, []);

  const removeEntry = useCallback(
    (id: string) =>
      updateWorld({
        properNouns: nouns.filter(n => String(n.id) !== String(id)),
      }),
    [updateWorld, nouns]
  );

  const upsertEntry = useCallback(
    (nextEntry: any, editingId: string | null) => {
      if (editingId) {
        updateWorld({
          properNouns: nouns.map(n =>
            String(n.id) === String(editingId) ? { ...n, ...nextEntry } : n
          ),
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

  const detailEntry = useMemo(() => {
    if (!detailId) return null;
    if (createDraft?.id === detailId) return createDraft;
    return nounById.get(detailId) ?? null;
  }, [detailId, createDraft, nounById]);

  return (
    <div className="flex flex-col">
      {/* header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2.5 text-lg font-semibold tracking-[-0.01em] text-white/95">
            <span aria-hidden className="h-4 w-[3px] rounded-full bg-brand" />
            세계관 요소
          </h3>
          <div className="mt-1.5 pl-[13px] text-xs text-white/40">
            장소 · 조직 · 개념 등 이 세계를 이루는 고유명사 {nouns.length}개
          </div>
        </div>

        {editMode && (
          <div className="flex flex-wrap items-center gap-2">
            <GButton
              variant="neutral"
              size="sm"
              icon={<Settings2 className="w-4 h-4" />}
              text="분류 편집"
              onClick={openKindEditor}
            />
            <GButton
              variant="primary"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
              text="항목 추가"
              onClick={openCreate}
            />
          </div>
        )}
      </div>

      {/* controls */}
      <div className="mt-6 flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="relative lg:w-80 shrink-0">
          <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="제목 · 요약 · 본문 · 태그 검색"
            className={cn(uiInput, "pl-9")}
          />
        </div>

        {/* kind chips: 모바일은 가로 스크롤 */}
        <div className="flex items-center gap-1.5 overflow-x-auto overflow-y-hidden whitespace-nowrap py-1 scrollbar-none overscroll-x-contain">
          {[{ id: "all", label: "전체" }, ...kinds].map(k => {
            const active = kind === k.id;
            return (
              <button
                key={k.id}
                type="button"
                onClick={() => setKind(k.id)}
                className={cn(
                  "shrink-0 h-8 px-3.5 rounded-full text-[13px] font-medium border transition-colors",
                  active
                    ? "bg-white/[0.12] text-white border-white/20"
                    : "bg-white/[0.03] text-white/55 border-white/[0.07] hover:bg-white/[0.07] hover:text-white"
                )}
              >
                {k.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* list wrapper: 여기만 스크롤 */}
      <div className="mt-6">
        <div className="grid gap-3 lg:grid-cols-2">
          {filtered.length === 0 ? (
            <div className="lg:col-span-2 grid place-items-center rounded-2xl border border-dashed border-white/10 py-14 text-sm text-white/50">
              {q ? "검색 결과가 없어요" : "등록된 항목이 없어요"}
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
                  onOpen={openView}
                  onOpenEdit={openEdit}
                  onRemove={removeEntry}
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
        initialDraft={initialDraft}
        initialEditingId={initialEditingId}
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
    </div>
  );
}
