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
    kinds.find((k) => k.id === "concept")?.id ??
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
  const safeKid = kinds.some((k) => String(k.id) === String(kid)) ? kid : defaultKind;

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
    nouns.forEach((n) => m.set(String(n.id), n));
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

  const kindLabelMap = useMemo(() => {
    const m = new Map<string, string>();
    kinds.forEach((k) => m.set(String(k.id), String(k.label ?? k.id)));
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
    return nouns.map((n) => {
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
      .filter((x) => (kind === "all" ? true : x.kid === kind))
      .filter((x) => (!s ? true : x.hay.includes(s)))
      .map((x) => x.n);
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
    (id: string) => updateWorld({ properNouns: nouns.filter((n) => String(n.id) !== String(id)) }),
    [updateWorld, nouns]
  );

  const upsertEntry = useCallback(
    (nextEntry: any, editingId: string | null) => {
      if (editingId) {
        updateWorld({
          properNouns: nouns.map((n) => (String(n.id) === String(editingId) ? { ...n, ...nextEntry } : n)),
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
    <HUDPanel className="p-6 h-full min-h-0 flex flex-col">
      <HUDSectionTitle
        right={
          <div className="flex flex-wrap items-center justify-end gap-2">
            <HUDBadge className="shrink-0 hidden sm:visible">{`TOTAL ${nouns.length}`}</HUDBadge>

            {editMode && (
              <div className="flex flex-wrap items-center gap-2">
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
              </div>
            )}
          </div>
        }
      >
        <div className="hidden sm:visible">TERMS / INDEX</div>
      </HUDSectionTitle>

      {/* controls (스크롤 안됨) */}
      <div className="mt-3 sm:mt-4 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-3 shrink-0">
        {/* search */}
        <div className="relative">
          <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="제목/요약/본문/태그 검색"
            className={cn(uiInput, "pl-9")}
          />
        </div>

        {/* kind chips: 모바일은 가로 스크롤 */}
        <div
          className={cn(
            "lg:justify-end",
            "flex items-center gap-2",
            "overflow-x-auto overflow-y-hidden",
            "whitespace-nowrap",
            "py-1",
            "scrollbar-none",
            "overscroll-x-contain",
            "snap-x snap-mandatory"
          )}
        >
          <div className="w-1 shrink-0" />

          <div className="snap-start shrink-0">
            <GButton
              variant={kind === "all" ? "primary" : "neutral"}
              text="ALL"
              onClick={() => setKind("all")}
            />
          </div>

          {kinds.map((k) => (
            <div key={k.id} className="snap-start shrink-0">
              <GButton
                variant={kind === k.id ? "primary" : "neutral"}
                text={k.label}
                onClick={() => setKind(k.id)}
              />
            </div>
          ))}

          <div className="w-2 shrink-0" />
        </div>
      </div>

      {/* list wrapper: 여기만 스크롤 */}
      <div
        className={cn(
          "mt-4 sm:mt-5 flex-1 min-h-0",
          "overflow-y-auto",
          "overscroll-contain",
          "[scrollbar-gutter:stable]",
          "scroll-dark",
          "webkit-overflow-scrolling-touch",
          "pr-1"
        )}
      >
        <div className="grid gap-3">
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-black/20 p-5 sm:p-6 text-sm text-white/60">
              항목이 없습니다.
            </div>
          ) : (
            filtered.map((n) => {
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
    </HUDPanel>
  );
}