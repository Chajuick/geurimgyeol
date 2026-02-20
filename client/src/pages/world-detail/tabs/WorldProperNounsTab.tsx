import { useMemo, useState } from "react";
import { Plus, Search, Settings2 } from "lucide-react";

import { HUDPanel, HUDSectionTitle, HUDBadge } from "@/components/ui/hud";
import GButton from "@/components/ui/gyeol-button";
import { uiInput } from "@/components/ui/form/presets";

import { DEFAULT_WORLD_PROPER_NOUN_KINDS } from "@/lib/defaultData";

import ProperNounCard from "./proper-nouns/ProperNounCard";
import ProperNounDetailModal from "./proper-nouns/ProperNounDetailModal";
import ProperNounKindsModal, { KindDef } from "./proper-nouns/ProperNounKindsModal";

function makeId() {
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

export default function WorldProperNounsTab({ world, editMode, updateWorld }: any) {
  const [q, setQ] = useState("");
  const [kind, setKind] = useState<string | "all">("all");

  // detail modal
  const [openDetail, setOpenDetail] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [detailEdit, setDetailEdit] = useState(false); // 상세창 내부 편집 토글

  // kind editor modal
  const [openKinds, setOpenKinds] = useState(false);

  const nouns = (world.properNouns ?? []) as any[];

  // kinds: world > fallback
  const kinds = useMemo<KindDef[]>(() => {
    const list =
      (world.properNounKinds?.length ? world.properNounKinds : DEFAULT_WORLD_PROPER_NOUN_KINDS) ?? [];

    // ensure "other" exists
    const hasOther = list.some((k: any) => String(k.id) === "other");
    const withOther = hasOther ? list : [...list, { id: "other", label: "기타", meta: { order: 999 } }];

    return [...withOther].sort((a: any, b: any) => (a.meta?.order ?? 0) - (b.meta?.order ?? 0));
  }, [world.properNounKinds]);

  const kindLabel = (id: string) => kinds.find(k => k.id === id)?.label ?? id;

  // filtered list
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();

    return nouns.filter(n => {
      const kid = getEntryKindId(n);

      if (kind !== "all" && kid !== kind) return false;
      if (!s) return true;

      const tagsText = Array.isArray(n.tags) ? n.tags.join(",").toLowerCase() : "";
      return (
        (n.title || "").toLowerCase().includes(s) ||
        (n.summary || "").toLowerCase().includes(s) ||
        (n.description || "").toLowerCase().includes(s) ||
        tagsText.includes(s)
      );
    });
  }, [nouns, q, kind]);

  const openCreate = () => {
    const defaultKind =
      world.defaultProperNounKindId ?? kinds.find(k => k.id === "concept")?.id ?? kinds[0]?.id ?? "other";

    const draft = {
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

    setDetailId(draft.id);
    setOpenDetail(true);
    setDetailEdit(true);

    // 임시로 draft를 world에 넣지 않고, modal에서 저장 시 insert
    // modal에 draft를 전달하기 위해 id가 필요하니, modal에 "createDraft"로 넘김
    setCreateDraft(draft);
  };

  const [createDraft, setCreateDraft] = useState<any | null>(null);

  const openView = (id: string, edit = false) => {
    setCreateDraft(null);
    setDetailId(id);
    setOpenDetail(true);
    setDetailEdit(edit && editMode);
  };

  const closeDetail = () => {
    setOpenDetail(false);
    setDetailId(null);
    setDetailEdit(false);
    setCreateDraft(null);
  };

  const removeEntry = (id: string) => {
    updateWorld({ properNouns: nouns.filter(n => n.id !== id) });
  };

  const upsertEntry = (nextEntry: any, editingId: string | null) => {
    if (editingId) {
      updateWorld({
        properNouns: nouns.map(n => (n.id === editingId ? { ...n, ...nextEntry } : n)),
      });
    } else {
      updateWorld({ properNouns: [...nouns, nextEntry] });
    }
  };

  const openKindEditor = () => setOpenKinds(true);

  const saveKinds = (payload: {
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

    // 필터가 삭제된 kind를 보고 있으면 all로
    if (kind !== "all" && !payload.validIds.has(kind)) setKind("all");
    setOpenKinds(false);
  };

  const detailEntry = useMemo(() => {
    if (!detailId) return null;
    // 생성 중이면 createDraft 우선
    if (createDraft?.id === detailId) return createDraft;
    return nouns.find(n => n.id === detailId) ?? null;
  }, [detailId, nouns, createDraft]);

  return (
    <HUDPanel className="p-6">
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

      {/* controls */}
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-3">
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
          <GButton variant={kind === "all" ? "primary" : "neutral"} text="ALL" onClick={() => setKind("all")} />
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

      {/* list */}
      <div className="mt-5 grid gap-3">
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
                onOpen={() => openView(n.id, false)}
                onOpenEdit={() => openView(n.id, true)}
                onRemove={() => removeEntry(n.id)}
              />
            );
          })
        )}
      </div>

      {/* DETAIL (view/edit/create) */}
      <ProperNounDetailModal
        open={openDetail}
        onClose={closeDetail}
        editMode={editMode}
        isEditing={detailEdit}
        setIsEditing={setDetailEdit}
        kinds={kinds}
        worldDefaultKindId={world.defaultProperNounKindId}
        entry={detailEntry}
        forceNew={!!createDraft}
        kindLabel={(id: string) => kindLabel(id)}
        onDelete={(id: string) => removeEntry(id)}
        onSave={(payload: { entry: any; editingId: string | null }) => {
          upsertEntry(payload.entry, payload.editingId);
          // createDraft였으면 저장 후 draft 정리
          if (!payload.editingId) setCreateDraft(null);
          setDetailEdit(false);
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