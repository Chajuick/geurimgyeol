import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocation, useParams, useSearch } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  ChevronDown,
  ImageIcon,
  Library,
  Sparkles,
  UserRound,
} from "lucide-react";

import { usePortfolioContext } from "@/contexts/PortfolioContext";
import EditableText from "@/components/ui/editable-text";
import GButton from "@/components/ui/gyeol-button";
import EditWorldMediaModal from "@/components/worlds/modals/EditWorldMediaModal";
import { useResolvedImage } from "@/hooks/useResolvedImage";
import { cn } from "@/lib/utils";

import WorldOverviewTab from "./tabs/WorldOverviewTab";
import WorldEventsTab from "./tabs/WorldEventsTab";
import WorldProperNounsTab from "./tabs/WorldProperNounsTab";
import WorldChronologyTab from "./tabs/WorldChronologyTab";

import EntityDetailFullscreen from "@/components/entities/detail/EntityDetailFullscreen";
import type { ID, CharacterData, CreatureData } from "@/types";
import { LoadingOverlay } from "@/components/ui/loading-overlay";

type TabKey = "overview" | "events" | "properNouns" | "chronology";
const TAB_KEYS: TabKey[] = ["overview", "events", "properNouns", "chronology"];

function getQueryTab(search: string): TabKey | null {
  const params = new URLSearchParams(search);
  const t = params.get("tab");
  if (!t) return null;
  return (TAB_KEYS as string[]).includes(t) ? (t as TabKey) : null;
}

type EntityKind = "character" | "creature";

const DETAIL_TABS: {
  key: TabKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { key: "overview", label: "소개", icon: BookOpen },
  { key: "properNouns", label: "세계관 요소", icon: Sparkles },
  // 필요하면 다시 열기: events(이벤트), chronology(연표)
];

export default function WorldDetail() {
  const { data, setData, editMode, isLoaded } = usePortfolioContext();
  const [, setLocation] = useLocation();
  // ⚠️ wouter의 location에는 쿼리스트링이 없으므로 useSearch로 읽는다
  const search = useSearch();

  // ⚠️ useRoute는 전역 location을 읽어 페이지 퇴장 애니메이션 중 null이 되므로,
  //    Switch가 고정해 둔 Route 컨텍스트의 params를 사용
  const params = useParams<{ worldId: string }>();
  const worldId = params.worldId;
  const match = !!worldId;

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
  const [tab, _setTab] = useState<TabKey>(
    () => getQueryTab(search) ?? "overview"
  );

  useEffect(() => {
    // 쿼리가 없으면(뒤로가기 등) 기본 탭으로 복귀
    const fromUrl = getQueryTab(search) ?? "overview";
    if (fromUrl !== tab) _setTab(fromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const tabsRef = useRef<HTMLDivElement | null>(null);
  const heroRef = useRef<HTMLElement | null>(null);

  const setTab = useCallback(
    (t: TabKey) => {
      _setTab(t);
      // 탭 전환은 히스토리를 쌓지 않음 (뒤로가기 = 이전 페이지)
      if (worldId)
        setLocation(`/worlds/${worldId}?tab=${t}`, { replace: true });

      // 히어로를 지나 내려온 상태면, 탭바가 상단에 붙은 위치를 유지
      // ⚠️ sticky 요소의 offsetTop은 붙은 위치를 반환하므로 히어로 하단 기준
      const root = document.getElementById("root");
      const hero = heroRef.current;
      const tabsTop = hero ? hero.offsetTop + hero.offsetHeight : 0;
      if (root && root.scrollTop > tabsTop) root.scrollTop = tabsTop;
    },
    [setLocation, worldId]
  );

  // ✅ 탭 언마운트 방지
  const [visitedTabs, setVisitedTabs] = useState<Set<TabKey>>(
    () => new Set([tab])
  );
  useEffect(() => {
    setVisitedTabs(prev => {
      if (prev.has(tab)) return prev;
      const next = new Set(prev);
      next.add(tab);
      return next;
    });
  }, [tab]);

  // ✅ 상세 모달 state
  const [detailOpen, setDetailOpen] = useState<{
    type: EntityKind;
    id: ID;
  } | null>(null);
  const [detailSubIndex, setDetailSubIndex] = useState(0);

  const openEntityDetail = useCallback((type: EntityKind, id: ID) => {
    setDetailOpen({ type, id });
    setDetailSubIndex(0);
  }, []);

  const detailEntity = useMemo(() => {
    if (!detailOpen) return null;
    if (detailOpen.type === "character")
      return characterById.get(detailOpen.id) ?? null;
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

  // ✅ 실제 존재하는 엔티티만 카운트 (삭제된 연결 제외)
  const stats = useMemo(() => {
    const characters = (world?.worldCharacters ?? []).filter(
      (r: { characterId: ID }) => characterById.has(r.characterId)
    ).length;
    const creatures = (world?.worldCreatures ?? []).filter(
      (r: { creatureId: ID }) => creatureById.has(r.creatureId)
    ).length;
    const nouns = (world?.properNouns ?? []).length;
    return { characters, creatures, nouns };
  }, [world, characterById, creatureById]);

  // ✅ hero media
  const heroBg = useResolvedImage(world?.backgroundImage ?? "");
  const heroIcon = useResolvedImage(world?.iconImage ?? "");

  const scrollToContent = useCallback(() => {
    tabsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  // ✅ 아이콘/배경 편집 모달
  const [isEditingMedia, setIsEditingMedia] = useState(false);
  const [bgDraft, setBgDraft] = useState("");
  const [iconDraft, setIconDraft] = useState("");

  const openMediaModal = useCallback(() => {
    setBgDraft(world?.backgroundImage ?? "");
    setIconDraft(world?.iconImage ?? "");
    setIsEditingMedia(true);
  }, [world]);

  const saveMedia = useCallback(() => {
    updateWorld({ backgroundImage: bgDraft, iconImage: iconDraft });
    setIsEditingMedia(false);
  }, [updateWorld, bgDraft, iconDraft]);

  // ✅ "로딩 vs 진짜 not found" 판별: isLoaded 기준
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!match || !worldId) return;

    if (!isLoaded) {
      setNotFound(false);
      return;
    }
    setNotFound(!world);
  }, [match, worldId, isLoaded, world]);

  const isLocating = !!match && !!worldId && !world && !notFound;

  if (!match) return null;

  if (!worldId) {
    return (
      <div className="min-h-[100svh] gyeol-bg text-white relative overflow-hidden">
        <LoadingOverlay show text="경로를 찾는 중" />
      </div>
    );
  }

  if (!world && notFound) {
    return (
      <div className="min-h-[100svh] gyeol-bg text-white p-6 md:p-10 h-full flex items-center justify-center">
        <div className="max-w-xl mx-auto space-y-4 flex flex-col items-center text-center">
          <div className="text-xl md:text-2xl font-bold">
            월드를 찾을 수 없습니다
          </div>
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

  return (
    <div className="relative min-h-[100svh] gyeol-bg text-white">
      {world && (
        <>
          {/* #region Cinematic Hero */}
          <section
            ref={heroRef}
            className="relative h-[72svh] min-h-[460px] max-h-[820px] w-full overflow-hidden bg-black"
          >
            {/* 빠져들기 오버레이가 걷히는 동안 초점이 맞춰지며 '도착'하는 연출 */}
            {heroBg ? (
              <motion.img
                key={`${world.id}:${heroBg}`}
                src={heroBg}
                alt=""
                draggable={false}
                initial={{ scale: 1.22, filter: "blur(14px) brightness(0.4)" }}
                animate={{ scale: 1, filter: "blur(0px) brightness(1)" }}
                transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0 h-full w-full object-cover"
                style={{ transformOrigin: "50% 45%" }}
              />
            ) : (
              <div className="absolute inset-0 gyeol-bg" />
            )}

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-background/30 to-black/40" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />

            {/* top bar */}
            <div className="absolute inset-x-0 top-0 z-10">
              <div className="mx-auto flex w-full max-w-7xl items-center gap-2 px-4 sm:px-6 md:px-10 lg:px-12 pt-5">
                <button
                  type="button"
                  onClick={() => setLocation("/worlds")}
                  className="inline-flex items-center gap-1.5 h-9 pl-2.5 pr-3.5 rounded-full bg-black/40 border border-white/15 backdrop-blur-md text-sm text-white/85 hover:bg-black/60 hover:text-white transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  세계관
                </button>
                {editMode && (
                  <button
                    type="button"
                    onClick={openMediaModal}
                    className="inline-flex items-center gap-2 h-9 px-3.5 rounded-full bg-black/40 border border-white/15 backdrop-blur-md text-xs font-medium text-white/85 hover:bg-black/60 hover:text-white transition-colors"
                  >
                    <ImageIcon className="h-3.5 w-3.5" />
                    아이콘 · 배경 변경
                  </button>
                )}
              </div>
            </div>

            {/* title block */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.9,
                delay: 0.55,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="absolute inset-x-0 bottom-0 z-10"
            >
              <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 md:px-10 lg:px-12 pb-10 sm:pb-14">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 sm:h-14 sm:w-14 shrink-0 overflow-hidden rounded-2xl border border-white/15 bg-black/40 shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
                    {heroIcon ? (
                      <img
                        src={heroIcon}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">
                    World
                  </div>
                </div>

                <EditableText
                  as="h1"
                  align="left"
                  editable={editMode}
                  value={world.name ?? ""}
                  onChange={v => updateWorld({ name: v })}
                  placeholder="세계관 이름"
                  maxLength={60}
                  className="mt-4 w-fit max-w-full font-display text-4xl sm:text-6xl md:text-7xl font-semibold tracking-[-0.03em] leading-[1.08] break-keep drop-shadow-[0_4px_30px_rgba(0,0,0,0.6)]"
                />

                <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-white/75">
                  <HeroChip icon={<UserRound className="h-3.5 w-3.5" />}>
                    캐릭터 {stats.characters}
                  </HeroChip>
                  <HeroChip icon={<Sparkles className="h-3.5 w-3.5" />}>
                    크리쳐 {stats.creatures}
                  </HeroChip>
                  <HeroChip icon={<Library className="h-3.5 w-3.5" />}>
                    세계관 요소 {stats.nouns}
                  </HeroChip>
                </div>
              </div>
            </motion.div>

            {/* scroll cue */}
            <motion.button
              type="button"
              aria-label="아래로"
              onClick={scrollToContent}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4, duration: 0.6 }}
              className="absolute bottom-4 left-1/2 z-10 hidden -translate-x-1/2 sm:grid place-items-center h-9 w-9 rounded-full text-white/50 hover:text-white transition-colors"
            >
              <ChevronDown className="h-5 w-5 animate-bounce" />
            </motion.button>
          </section>
          {/* #endregion */}

          {/* #region Sticky Tabs */}
          <div
            ref={tabsRef}
            className="sticky top-0 z-30 border-b border-white/[0.06] bg-background/75 backdrop-blur-xl"
          >
            <div className="mx-auto flex w-full max-w-7xl items-center gap-1 px-4 sm:px-6 md:px-10 lg:px-12">
              {DETAIL_TABS.map(t => {
                const active = t.key === tab;
                const Icon = t.icon;
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => !active && setTab(t.key)}
                    className={cn(
                      "relative inline-flex items-center gap-2 h-14 px-4 text-sm font-medium transition-colors",
                      active
                        ? "text-white"
                        : "text-white/45 hover:text-white/80"
                    )}
                    aria-current={active ? "page" : undefined}
                  >
                    <Icon className="h-4 w-4" />
                    {t.label}
                    {active && (
                      <motion.span
                        layoutId="world-detail-tab"
                        className="absolute inset-x-3 -bottom-px h-[2px] rounded-full bg-brand"
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 40,
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          {/* #endregion */}

          {/* #region Content */}
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 md:px-10 lg:px-12 py-8 sm:py-12">
            {(visitedTabs.has("overview") || tab === "overview") && (
              <div className={tabPaneClass(tab === "overview")}>
                <WorldOverviewTab
                  world={world}
                  editMode={editMode}
                  updateWorld={updateWorld}
                  data={data}
                  onOpenEntity={openEntityDetail}
                />
              </div>
            )}

            {(visitedTabs.has("events") || tab === "events") && (
              <div className={tabPaneClass(tab === "events")}>
                <WorldEventsTab
                  world={world}
                  editMode={editMode}
                  updateWorld={updateWorld}
                />
              </div>
            )}

            {(visitedTabs.has("properNouns") || tab === "properNouns") && (
              <div className={tabPaneClass(tab === "properNouns")}>
                <WorldProperNounsTab
                  world={world}
                  editMode={editMode}
                  updateWorld={updateWorld}
                  data={data}
                />
              </div>
            )}

            {(visitedTabs.has("chronology") || tab === "chronology") && (
              <div className={tabPaneClass(tab === "chronology")}>
                <WorldChronologyTab
                  world={world}
                  editMode={editMode}
                  updateWorld={updateWorld}
                />
              </div>
            )}
          </div>
          {/* #endregion */}

          <EditWorldMediaModal
            open={isEditingMedia && editMode}
            onClose={() => setIsEditingMedia(false)}
            onSave={saveMedia}
            backgroundUrl={bgDraft}
            setBackgroundUrl={setBgDraft}
            iconUrl={iconDraft}
            setIconUrl={setIconDraft}
          />

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

      <LoadingOverlay show={isLocating} title="세계관" text="길을 찾는 중" />
    </div>
  );
}

function tabPaneClass(active: boolean) {
  return active
    ? "block animate-in fade-in slide-in-from-bottom-2 duration-500"
    : "hidden";
}

function HeroChip({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full bg-white/10 border border-white/10 backdrop-blur">
      {icon}
      {children}
    </span>
  );
}
