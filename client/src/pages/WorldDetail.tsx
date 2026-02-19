import { useMemo, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { BookOpen, Sparkles, ScrollText, CalendarClock, ArrowLeft } from "lucide-react";

import { HUDPanel, HUDBadge, HUDSegmentTabs, HUDSectionTitle } from "@/components/ui/hud/index";
import { usePortfolioContext } from "@/contexts/PortfolioContext";
import GButton from "@/components/ui/gyeol-button";
import { cn } from "@/lib/utils";

type TabKey = "overview" | "events" | "properNouns" | "chronology";

export default function WorldDetail() {
  const { data, setData, editMode } = usePortfolioContext();
  const [, setLocation] = useLocation();

  const [match, params] = useRoute("/worlds/:worldId");
  const worldId = params?.worldId;

  const world = useMemo(() => {
    if (!worldId) return null;
    return (data.worlds ?? []).find((w) => w.id === worldId) ?? null;
  }, [data.worlds, worldId]);

  const [tab, setTab] = useState<TabKey>("overview");

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

  const updateWorld = (patch: Partial<typeof world>) => {
    setData((prev) => {
      const nextWorlds = [...(prev.worlds ?? [])];
      const idx = nextWorlds.findIndex((w) => w.id === worldId);
      if (idx < 0) return prev;
      nextWorlds[idx] = { ...nextWorlds[idx], ...patch };
      return { ...prev, worlds: nextWorlds };
    });
  };

  const stats = {
    events: (world.events ?? []).length,
    nouns: (world.properNouns ?? []).length,
    linked:
      (world.worldCharacters?.length ?? 0) + (world.worldCreatures?.length ?? 0),
  };

  return (
    <div className="min-h-screen gyeol-bg text-white relative overflow-hidden">
      {/* subtle overlay noise / vignette */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_10%,rgba(255,255,255,0.08),transparent_45%),radial-gradient(circle_at_80%_30%,rgba(99,102,241,0.10),transparent_45%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.15),rgba(0,0,0,0.55))]" />

      <div className="relative z-10 px-6 md:px-10 lg:px-12 py-10">
        {/* HEADER */}
        <HUDPanel className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <span className="text-[11px] tracking-[0.26em] text-white/55">
                  WORLD DOSSIER
                </span>

                {editMode && (
                  <HUDBadge tone="warn">EDIT MODE</HUDBadge>
                )}
              </div>

              <div className="mt-2 text-3xl md:text-4xl font-extrabold tracking-tight truncate">
                {world.name}
              </div>

              <div className="mt-2 text-sm text-white/65 line-clamp-2">
                {world.description || "설명이 없습니다"}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <HUDBadge>{`LINKED ${stats.linked}`}</HUDBadge>
                <HUDBadge>{`EVENTS ${stats.events}`}</HUDBadge>
                <HUDBadge>{`TERMS ${stats.nouns}`}</HUDBadge>
              </div>
            </div>

            <div className="shrink-0 flex gap-2">
              <GButton
                variant="ghost"
                size="md"
                icon={<ArrowLeft className="w-4 h-4" />}
                text="목록"
                onClick={() => setLocation("/worlds")}
              />
            </div>
          </div>

          {/* TABS */}
          <div className="mt-6">
            <HUDSegmentTabs
              value={tab}
              onChange={setTab}
              items={[
                { key: "overview", label: "소개", icon: <BookOpen className="w-4 h-4" /> },
                { key: "events", label: "사건", icon: <ScrollText className="w-4 h-4" /> },
                { key: "properNouns", label: "고유명사", icon: <Sparkles className="w-4 h-4" /> },
                { key: "chronology", label: "연대", icon: <CalendarClock className="w-4 h-4" /> },
              ]}
            />
          </div>
        </HUDPanel>

        {/* CONTENT */}
        <div className="mt-6 grid gap-4">
          {tab === "overview" && (
            <WorldOverviewTab world={world} editMode={editMode} updateWorld={updateWorld} />
          )}

          {tab === "events" && (
            <WorldEventsTab world={world} editMode={editMode} updateWorld={updateWorld} />
          )}

          {tab === "properNouns" && (
            <WorldProperNounsTab world={world} editMode={editMode} updateWorld={updateWorld} />
          )}

          {tab === "chronology" && (
            <WorldChronologyTab world={world} editMode={editMode} updateWorld={updateWorld} />
          )}
        </div>
      </div>
    </div>
  );
}
