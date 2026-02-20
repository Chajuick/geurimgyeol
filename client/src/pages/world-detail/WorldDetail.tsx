import { useEffect, useMemo, useState } from "react";
import { useLocation, useRoute } from "wouter";
import {
  ArrowLeft,
  BookOpen,
  CalendarClock,
  ScrollText,
  Sparkles,
} from "lucide-react";

import { usePortfolioContext } from "@/contexts/PortfolioContext";
import GButton from "@/components/ui/gyeol-button";
import { HUDPanel, HUDBadge, HUDSegmentTabs } from "@/components/ui/hud";
import { cn } from "@/lib/utils";

import WorldOverviewTab from "./tabs/WorldOverviewTab";
import WorldEventsTab from "./tabs/WorldEventsTab";
import WorldProperNounsTab from "./tabs/WorldProperNounsTab";
import WorldChronologyTab from "./tabs/WorldChronologyTab";

type TabKey = "overview" | "events" | "properNouns" | "chronology";
const TAB_KEYS: TabKey[] = ["overview", "events", "properNouns", "chronology"];

function stripQuery(loc: string) {
  return loc.split("?")[0] || loc;
}

function getQueryTab(loc: string): TabKey | null {
  const q = loc.split("?")[1] || "";
  const params = new URLSearchParams(q);
  const t = params.get("tab");
  if (!t) return null;
  return (TAB_KEYS as string[]).includes(t) ? (t as TabKey) : null;
}

function setQueryTab(loc: string, tab: TabKey) {
  const base = stripQuery(loc);
  const q = loc.includes("?") ? loc.split("?")[1] : "";
  const params = new URLSearchParams(q);
  params.set("tab", tab);
  return `${base}?${params.toString()}`;
}

export default function WorldDetail() {
  const { data, setData, editMode } = usePortfolioContext();
  const [location, setLocation] = useLocation();

  const [match, params] = useRoute("/worlds/:worldId");
  const worldId = params?.worldId;

  const world = useMemo(() => {
    if (!worldId) return null;
    return (data.worlds ?? []).find(w => w.id === worldId) ?? null;
  }, [data.worlds, worldId]);

  // ✅ tab: URL query와 동기화
  const [tab, _setTab] = useState<TabKey>(
    () => getQueryTab(location) ?? "overview"
  );

  useEffect(() => {
    const fromUrl = getQueryTab(location);
    if (fromUrl && fromUrl !== tab) _setTab(fromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  const setTab = (t: TabKey) => {
    _setTab(t);
    setLocation(setQueryTab(location, t));
  };

  // ✅ 못 찾으면
  if (!match || !worldId || !world) {
    return (
      <div className="min-h-screen gyeol-bg text-white p-10">
        <div className="max-w-xl mx-auto space-y-4">
          <div className="text-2xl font-bold">월드를 찾을 수 없습니다</div>
          <div className="text-white/60 text-sm">
            삭제되었거나 잘못된 주소일 수 있어요.
          </div>
          <GButton
            variant="primary"
            text="세계관 목록으로"
            onClick={() => setLocation("/worlds")}
          />
        </div>
      </div>
    );
  }

  // ✅ 월드 업데이트(단일 월드 patch)
  const updateWorld = (patch: any) => {
    setData(prev => {
      const nextWorlds = [...(prev.worlds ?? [])];
      const idx = nextWorlds.findIndex(w => w.id === worldId);
      if (idx < 0) return prev;
      nextWorlds[idx] = { ...nextWorlds[idx], ...patch };
      return { ...prev, worlds: nextWorlds };
    });
  };

  const stats = {
    linked:
      (world.worldCharacters?.length ?? 0) +
      (world.worldCreatures?.length ?? 0),
    events: (world.events ?? []).length,
    nouns: (world.properNouns ?? []).length,
  };

  return (
    <div
      className={cn(
        // ✅ 모바일은 페이지 스크롤 유지, PC(md+)는 화면 고정 + 내부 스크롤
        "min-h-screen md:h-screen",
        "gyeol-bg text-white relative",
        "md:overflow-hidden"
      )}
    >
      {/* background HUD vignette */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.07),transparent_45%),radial-gradient(circle_at_80%_30%,rgba(99,102,241,0.10),transparent_45%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.10),rgba(0,0,0,0.60))]" />

      {/* ✅ 전체를 column 레이아웃으로 */}
      <div className="relative z-10 px-6 md:px-10 lg:px-12 py-10 md:h-full flex flex-col">
        {/* TOP BAR */}
        <div className="flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <GButton
              variant="ghost"
              icon={<ArrowLeft className="w-4 h-4" />}
              text="세계관"
              onClick={() => setLocation("/worlds")}
            />
            <div className="text-[11px] tracking-[0.26em] text-white/45 hidden sm:block">
              WORLD
            </div>
          </div>

          <div className="flex items-center gap-2">
            {editMode ? (
              <HUDBadge tone="warn">EDIT MODE</HUDBadge>
            ) : (
              <HUDBadge>VIEW MODE</HUDBadge>
            )}
            <HUDBadge>{`LINKED ${stats.linked}`}</HUDBadge>
            <HUDBadge>{`TERMS ${stats.nouns}`}</HUDBadge>
          </div>
        </div>

        {/* ✅ TOP: DOSSIER (전체 너비) */}
        <HUDPanel className="p-6 mt-6 shrink-0">
          <div className="flex flex-row justify-between items-center">
            <div>
              <div className="text-[11px] tracking-[0.26em] text-white/55">
                DOSSIER
              </div>

              <div className="mt-2 text-3xl font-extrabold tracking-tight truncate">
                {world.name}
              </div>
            </div>
            {/* quick stats grid */}
            <div className="grid grid-cols-2 gap-2">
              <DossierStat label="LINKED" value={stats.linked} />
              <DossierStat label="TERMS" value={stats.nouns} />
            </div>
          </div>

          <div className="mt-6">
            <div className="text-[12px] tracking-[0.26em] text-white/55">
              NAVIGATION
            </div>

            <div className="mt-3">
              <HUDSegmentTabs<TabKey>
                value={tab}
                onChange={setTab}
                items={[
                  {
                    key: "overview",
                    label: "소개",
                    icon: <BookOpen className="w-4 h-4" />,
                  },
                  {
                    key: "properNouns",
                    label: "세계관 요소",
                    icon: <Sparkles className="w-4 h-4" />,
                  },
                  /* 추후 개발
                  {
                    key: "events",
                    label: "사건",
                    icon: <ScrollText className="w-4 h-4" />,
                  },
                  {
                    key: "chronology",
                    label: "연대",
                    icon: <CalendarClock className="w-4 h-4" />,
                  },
                  */
                ]}
              />
            </div>
          </div>
        </HUDPanel>

        {/* ✅ BOTTOM: CONTENT (PC에서 이 영역만 스크롤) */}
        <div className="mt-4 flex-1 min-h-0">
          {/* min-h-0가 없으면 flex 자식이 overflow를 제대로 못 먹음 */}
          <div className="h-full overflow-hidden">
            <div className="h-full overflow-auto scroll-dark">
              {tab === "overview" && (
                <WorldOverviewTab
                  world={world}
                  editMode={editMode}
                  updateWorld={updateWorld}
                  data={data}
                />
              )}

              {tab === "events" && (
                <WorldEventsTab
                  world={world}
                  editMode={editMode}
                  updateWorld={updateWorld}
                />
              )}

              {tab === "properNouns" && (
                <WorldProperNounsTab
                  world={world}
                  editMode={editMode}
                  updateWorld={updateWorld}
                />
              )}

              {tab === "chronology" && (
                <WorldChronologyTab
                  world={world}
                  editMode={editMode}
                  updateWorld={updateWorld}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DossierStat({ label, value }: { label: string; value: number }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-black/20 pl-4 pr-10 py-2",
        "shadow-[0_12px_30px_rgba(0,0,0,0.35)]"
      )}
    >
      <div className="text-[10px] tracking-[0.26em] text-white/45">{label}</div>
      <div className="mt-1 text-lg font-semibold text-white/85">{value}</div>
    </div>
  );
}
