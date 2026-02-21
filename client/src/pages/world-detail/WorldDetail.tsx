import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { ArrowLeft, BookOpen, Sparkles } from "lucide-react";

import { usePortfolioContext } from "@/contexts/PortfolioContext";
import GButton from "@/components/ui/gyeol-button";
import { HUDPanel, HUDBadge, HUDSegmentTabs } from "@/components/ui/hud";
import { cn } from "@/lib/utils";

import WorldOverviewTab from "./tabs/WorldOverviewTab";
import WorldEventsTab from "./tabs/WorldEventsTab";
import WorldProperNounsTab from "./tabs/WorldProperNounsTab";
import WorldChronologyTab from "./tabs/WorldChronologyTab";

import EntityDetailFullscreen from "@/components/entities/detail/EntityDetailFullscreen";
import type { ID, CharacterData, CreatureData } from "@/types";

type TabKey = "overview" | "events" | "properNouns" | "chronology";
const TAB_KEYS: TabKey[] = ["overview", "events", "properNouns", "chronology"];

function getQueryTab(loc: string): TabKey | null {
  const q = loc.split("?")[1] || "";
  const params = new URLSearchParams(q);
  const t = params.get("tab");
  if (!t) return null;
  return (TAB_KEYS as string[]).includes(t) ? (t as TabKey) : null;
}

type EntityKind = "character" | "creature";

export default function WorldDetail() {
  const { data, setData, editMode } = usePortfolioContext();
  const [location, setLocation] = useLocation();

  const [match, params] = useRoute("/worlds/:worldId");
  const worldId = params?.worldId;

  // ✅ entities: id -> entity (O(1))
  const characterById = useMemo(() => {
    const m = new Map<ID, CharacterData>();
    (data.characters ?? []).forEach(c => m.set(c.id, c));
    return m;
  }, [data.characters]);

  const creatureById = useMemo(() => {
    const m = new Map<ID, CreatureData>();
    (data.creatures ?? []).forEach(c => m.set(c.id, c));
    return m;
  }, [data.creatures]);

  // ✅ worlds: id -> world (O(1))
  const worldById = useMemo(() => {
    const m = new Map<string, any>();
    (data.worlds ?? []).forEach(w => m.set(w.id, w));
    return m;
  }, [data.worlds]);

  const world = useMemo(() => {
    if (!worldId) return null;
    return worldById.get(worldId) ?? null;
  }, [worldId, worldById]);

  // ✅ tab: URL query 동기화
  const [tab, _setTab] = useState<TabKey>(() => getQueryTab(location) ?? "overview");

  useEffect(() => {
    const fromUrl = getQueryTab(location);
    if (fromUrl && fromUrl !== tab) _setTab(fromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  const setTab = useCallback(
    (t: TabKey) => {
      _setTab(t);
      if (worldId) setLocation(`/worlds/${worldId}?tab=${t}`);
    },
    [setLocation, worldId]
  );

  // ✅ 탭 언마운트 방지
  const [visitedTabs, setVisitedTabs] = useState<Set<TabKey>>(() => new Set([tab]));
  useEffect(() => {
    setVisitedTabs(prev => {
      if (prev.has(tab)) return prev;
      const next = new Set(prev);
      next.add(tab);
      return next;
    });
  }, [tab]);

  // ✅ 상세 모달 state
  const [detailOpen, setDetailOpen] = useState<{ type: EntityKind; id: ID } | null>(null);
  const [detailSubIndex, setDetailSubIndex] = useState(0);

  const openEntityDetail = useCallback((type: EntityKind, id: ID) => {
    setDetailOpen({ type, id });
    setDetailSubIndex(0);
  }, []);

  const detailEntity = useMemo(() => {
    if (!detailOpen) return null;
    if (detailOpen.type === "character") return characterById.get(detailOpen.id) ?? null;
    return creatureById.get(detailOpen.id) ?? null;
  }, [detailOpen, characterById, creatureById]);

  const detailTagOptions = useMemo(() => [] as string[], []);

  // ✅ 월드 업데이트
  const updateWorld = useCallback(
    (patch: any) => {
      if (!worldId) return;
      setData(prev => {
        const worlds = prev.worlds ?? [];
        const idx = worlds.findIndex(w => w.id === worldId);
        if (idx < 0) return prev;

        const nextWorlds = [...worlds];
        nextWorlds[idx] = { ...nextWorlds[idx], ...patch };
        return { ...prev, worlds: nextWorlds };
      });
    },
    [setData, worldId]
  );

  const stats = useMemo(() => {
    const linked = (world?.worldCharacters?.length ?? 0) + (world?.worldCreatures?.length ?? 0);
    const events = (world?.events ?? []).length;
    const nouns = (world?.properNouns ?? []).length;
    return { linked, events, nouns };
  }, [world]);

  // ✅ "로딩 vs 진짜 not found" 판별
  const worldsArr = data.worlds ?? [];
  const [worldsHydrated, setWorldsHydrated] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (worldsArr.length > 0) setWorldsHydrated(true);
  }, [worldsArr.length]);

  useEffect(() => {
    if (!match || !worldId) return;

    if (!worldsHydrated) {
      setNotFound(false);
      return;
    }
    setNotFound(!world);
  }, [match, worldId, worldsHydrated, world]);

  const isLocating = !!match && !!worldId && !world && !notFound;

  if (!match) return null;

  if (!worldId) {
    return (
      <div className="min-h-[100svh] gyeol-bg text-white relative overflow-hidden">
        <LocatingOverlay show text="LOCATING ROUTE" />
      </div>
    );
  }

  if (!world && notFound) {
    return (
      <div className="min-h-[100svh] gyeol-bg text-white p-6 md:p-10 h-full flex items-center justify-center">
        <div className="max-w-xl mx-auto space-y-4 flex flex-col items-center text-center">
          <div className="text-xl md:text-2xl font-bold">월드를 찾을 수 없습니다</div>
          <div className="text-white/60 text-sm">
            삭제되었거나 잘못된 주소일 수 있어요.
          </div>
          <GButton variant="primary" text="세계관 목록으로" onClick={() => setLocation("/worlds")} />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "min-h-[100svh] md:h-[100svh]",
        "gyeol-bg text-white relative",
        "overflow-hidden"
      )}
    >
      {/* bg */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.07),transparent_45%),radial-gradient(circle_at_80%_30%,rgba(99,102,241,0.10),transparent_45%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.10),rgba(0,0,0,0.60))]" />

      {world && (
        <>
          <div className="relative z-10 px-4 sm:px-6 md:px-10 lg:px-12 py-6 md:py-10 md:h-full min-h-0 flex flex-col">
            {/* TOP BAR */}
            <div className="flex items-center sm:items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <GButton
                  variant="ghost"
                  icon={<ArrowLeft className="w-4 h-4" />}
                  text="세계관"
                  onClick={() => setLocation("/worlds")}
                />
                <div className="flex flex-wrap items-center justify-end gap-1.5 sm:gap-2 max-w-[60%] sm:max-w-none">
                  {editMode ? (
                    <HUDBadge tone="warn">EDIT</HUDBadge>
                  ) : (
                    <HUDBadge>VIEW</HUDBadge>
                  )}
                </div>
              </div>
            </div>

            {/* DOSSIER */}
            <HUDPanel className="p-6 mt-4 sm:mt-6 shrink-0">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div className="min-w-0">
                  <div className="text-[11px] tracking-[0.26em] text-white/55">DOSSIER</div>
                  <div className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight truncate">
                    {world.name}
                  </div>
                </div>

                {/* ✅ 모바일: stats는 아래로 내려가고 grid 자동 */}
                <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 self-start">
                  <DossierStat label="LINKED" value={stats.linked} />
                  <DossierStat label="TERMS" value={stats.nouns} />
                </div>
              </div>

              <div className="mt-5 sm:mt-6">
                <div className="text-[12px] tracking-[0.26em] text-white/55">NAVIGATION</div>

                <div className="mt-3">
                  <HUDSegmentTabs<TabKey>
                    value={tab}
                    onChange={setTab}
                    items={[
                      { key: "overview", label: "소개", icon: <BookOpen className="w-4 h-4" /> },
                      { key: "properNouns", label: "세계관 요소", icon: <Sparkles className="w-4 h-4" /> },
                      // 필요하면 아래도 다시 열기
                      // { key: "events", label: "이벤트", icon: <CalendarClock className="w-4 h-4" /> },
                      // { key: "chronology", label: "연표", icon: <ScrollText className="w-4 h-4" /> },
                    ]}
                  />
                </div>
              </div>
            </HUDPanel>

            {/* CONTENT */}
            <div className="mt-3 sm:mt-4 flex-1 min-h-0 overflow-hidden">
              <div className="h-full min-h-0 overflow-hidden">
                {visitedTabs.has("overview") && (
                  <div className={cn("h-full min-h-0", tab === "overview" ? "block" : "hidden")}>
                    <WorldOverviewTab
                      world={world}
                      editMode={editMode}
                      updateWorld={updateWorld}
                      data={data}
                      onOpenEntity={openEntityDetail}
                    />
                  </div>
                )}

                {visitedTabs.has("events") && (
                  <div className={cn("h-full min-h-0", tab === "events" ? "block" : "hidden")}>
                    <WorldEventsTab world={world} editMode={editMode} updateWorld={updateWorld} />
                  </div>
                )}

                {visitedTabs.has("properNouns") && (
                  <div className={cn("h-full min-h-0", tab === "properNouns" ? "block" : "hidden")}>
                    <WorldProperNounsTab
                      world={world}
                      editMode={editMode}
                      updateWorld={updateWorld}
                      data={data}
                    />
                  </div>
                )}

                {visitedTabs.has("chronology") && (
                  <div className={cn("h-full min-h-0", tab === "chronology" ? "block" : "hidden")}>
                    <WorldChronologyTab world={world} editMode={editMode} updateWorld={updateWorld} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ENTITY DETAIL MODAL */}
          {detailEntity && (
            <EntityDetailFullscreen
              entity={detailEntity as any}
              viewSubIndex={detailSubIndex}
              setViewSubIndex={setDetailSubIndex}
              onClose={() => {
                setDetailOpen(null);
                setDetailSubIndex(0);
              }}
              editable={false}
              onDelete={undefined}
              onPatch={undefined}
              tagOptions={detailTagOptions}
            />
          )}
        </>
      )}

      <LocatingOverlay show={isLocating} text="LOCATING WORLD" />
    </div>
  );
}

function DossierStat({ label, value }: { label: string; value: number }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-black/20",
        "px-4 py-2",
        "shadow-[0_12px_30px_rgba(0,0,0,0.35)]"
      )}
    >
      <div className="text-[10px] tracking-[0.26em] text-white/45">{label}</div>
      <div className="mt-1 text-lg font-semibold text-white/85">{value}</div>
    </div>
  );
}

function LocatingOverlay({ show, text }: { show: boolean; text?: string }) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 z-[80]",
        "transition-opacity duration-300 ease-out",
        show ? "opacity-100" : "opacity-0"
      )}
      aria-hidden={!show}
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />

      <div className="absolute inset-0 flex items-center justify-center px-4">
        <div
          className={cn(
            "rounded-2xl border border-white/10 bg-black/40",
            "px-5 sm:px-6 py-4 shadow-[0_18px_45px_rgba(0,0,0,0.45)]"
          )}
        >
          <div className="flex items-center gap-3">
            <div className="h-4 w-4 rounded-full border border-white/30 border-t-white/80 animate-spin" />
            <div className="text-[11px] tracking-[0.26em] text-white/70">
              {text ?? "LOCATING"}
              <span className="inline-block w-6 align-baseline">
                <span className="animate-[gyeolDots_1.2s_infinite]">...</span>
              </span>
            </div>
          </div>
          <div className="mt-1 text-xs text-white/45 text-center">길을 찾는 중입니다.</div>
        </div>
      </div>

      <style>{`
        @keyframes gyeolDots {
          0% { opacity: .2 }
          50% { opacity: 1 }
          100% { opacity: .2 }
        }
      `}</style>
    </div>
  );
}