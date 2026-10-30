// src/pages/Home.tsx

// #region Imports
import {
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  HelpCircle,
} from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { useCallback, useMemo, useRef, useState } from "react";
import { useLocation } from "wouter";

import StoredImage from "@/components/StoredImage";
import EditableText from "@/components/ui/editable-text";
import GButton from "@/components/ui/gyeol-button";
import Modal from "@/components/ui/modal";
import HomeHelpContent from "@/content/help/home-help";

import { usePortfolioContext } from "@/contexts/PortfolioContext";
import { useDiveTransition } from "@/contexts/DiveTransitionContext";
import { useResolvedImage } from "@/hooks/useResolvedImage";
import { patchSettings } from "@/lib/patchers";
import { cn } from "@/lib/utils";
import type { EntityBase, SettingsData } from "@/types";

import LOGO_IMG from "@/assets/logo/logo.png";
// #endregion

// #region Motion
const EASE = [0.16, 1, 0.3, 1] as const;

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.35 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE } },
};
// #endregion

// #region Parts
type RibbonEntity = EntityBase & { kind: "characters" | "creatures" };

/** 캐릭터·크리쳐 초상이 천천히 흐르는 띠 (hover 시 멈춤) */
function PortraitRibbon({
  list,
  onPick,
}: {
  list: RibbonEntity[];
  onPick: (kind: RibbonEntity["kind"]) => void;
}) {
  if (list.length === 0) return null;
  // 끊김 없는 루프를 위해 2배로 복제
  const loop = [...list, ...list];
  const duration = Math.max(30, list.length * 3);

  return (
    <div className="group/ribbon relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
      <div
        className="flex w-max gap-3 animate-[gyeol-marquee_linear_infinite] group-hover/ribbon:[animation-play-state:paused]"
        style={{ animationDuration: `${duration}s` }}
      >
        {loop.map((e, i) => {
          const isClone = i >= list.length;
          return (
            <button
              key={`${e.id}-${i}`}
              type="button"
              onClick={() => onPick(e.kind)}
              className="group/p relative h-40 w-32 sm:h-48 sm:w-36 shrink-0 overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03]"
              title={e.name}
              tabIndex={isClone ? -1 : 0}
              aria-hidden={isClone || undefined}
            >
              <StoredImage
                src={e.profileImage || e.mainImage}
                alt={e.name}
                draggable={false}
                className="h-full w-full object-cover transition-[transform,filter] duration-500 brightness-[0.85] group-hover/p:brightness-105 group-hover/p:scale-[1.06]"
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/85 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-2.5 text-left">
                <div className="truncate text-xs font-semibold text-white/90">
                  {e.name}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** 대표 그림이 들어간 입구 카드 */
function GatewayCard({
  eyebrow,
  title,
  count,
  unit,
  image,
  imagePosition = "center",
  onClick,
  className,
}: {
  eyebrow: string;
  title: string;
  count: number;
  unit: string;
  image?: string;
  imagePosition?: string;
  onClick: (el: HTMLButtonElement) => void;
  className?: string;
}) {
  return (
    <motion.button
      type="button"
      variants={item}
      onClick={e => onClick(e.currentTarget)}
      className={cn(
        "group relative overflow-hidden rounded-3xl text-left",
        "border border-white/[0.08] bg-white/[0.02]",
        "min-h-[260px] sm:min-h-[340px]",
        "transition-[border-color,transform] duration-500 hover:-translate-y-1 hover:border-white/20",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50",
        className
      )}
    >
      {image ? (
        <StoredImage
          src={image}
          alt=""
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.05]"
          style={{ objectPosition: imagePosition }}
        />
      ) : (
        <div className="absolute inset-0 gyeol-bg" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/55" />

      <div className="relative flex h-full flex-col justify-between p-6">
        <div className="flex items-start justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/60">
            {eyebrow}
          </span>
          <span className="grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-black/30 backdrop-blur transition-colors group-hover:bg-white/15">
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>

        <div>
          <div className="font-display text-3xl font-semibold tracking-[-0.02em]">
            {title}
          </div>
          <div className="mt-1 text-sm text-white/60">
            <span className="tabular-nums text-white/90">{count}</span>
            {unit}
          </div>
        </div>
      </div>
    </motion.button>
  );
}
// #endregion

// #region Component
export default function Home() {
  // #region Context / State
  const { data, setData, editMode } = usePortfolioContext();
  const [, setLocation] = useLocation();
  const { dive } = useDiveTransition();

  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const heroRef = useRef<HTMLElement | null>(null);
  const belowRef = useRef<HTMLDivElement | null>(null);

  const heroTitle = data.settings.heroTitle ?? "";
  const heroSubtitle = data.settings.heroSubtitle ?? "";

  const worlds = data.worlds || [];
  const characters = data.characters || [];
  const creatures = data.creatures || [];

  const featuredWorld = worlds[0];
  const heroImageRef =
    featuredWorld?.backgroundImage || featuredWorld?.mainImage || "";
  const heroImage = useResolvedImage(heroImageRef);

  const ribbon = useMemo<RibbonEntity[]>(
    () => [
      ...characters.map(c => ({ ...c, kind: "characters" as const })),
      ...creatures.map(c => ({ ...c, kind: "creatures" as const })),
    ],
    [characters, creatures]
  );

  const updateSettings = useCallback(
    (patch: Partial<SettingsData>) =>
      setData(prev => patchSettings(prev, patch)),
    [setData]
  );

  /** 그림이 있는 카드는 빠져들기 연출로 이동 */
  const diveInto = useCallback(
    (el: HTMLElement, image: string, to: string, radius = 24) => {
      if (!image) return setLocation(to);
      dive({ rect: el.getBoundingClientRect(), image, to, radius });
    },
    [dive, setLocation]
  );
  // #endregion

  // #region Render
  return (
    <div className="relative min-h-[100svh] gyeol-bg text-white">
      {/* #region Hero (full-bleed art) */}
      <section
        ref={heroRef}
        className="relative h-[100svh] min-h-[600px] w-full overflow-hidden bg-black"
      >
        {heroImage ? (
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 1.15, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 2.4, ease: EASE }}
          >
            {/* 아주 느린 숨쉬기 (켄 번즈) */}
            <img
              src={heroImage}
              alt=""
              draggable={false}
              className="h-full w-full object-cover animate-[gyeol-breathe_26s_ease-in-out_infinite_alternate]"
            />
          </motion.div>
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_30%,rgba(129,140,248,0.18),transparent_70%)]" />
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-background/40 to-black/30" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/75 via-black/25 to-transparent" />

        {/* top actions */}
        <div className="absolute top-4 left-4 md:left-auto md:right-6 z-20 flex items-center gap-2">
          <GButton
            variant="neutral"
            size="icon"
            icon={<HelpCircle className="w-4 h-4" />}
            onClick={() => setIsHelpOpen(true)}
            title="도움말"
          />
        </div>

        {/* title block */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="absolute inset-x-0 bottom-0 z-10"
        >
          <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 md:px-12 pb-20 sm:pb-24">
            <motion.div variants={item} className="flex items-center gap-3">
              <img
                src={LOGO_IMG}
                alt="GYEOL"
                draggable={false}
                className="h-10 w-auto drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)]"
              />
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-white/60">
                Gyeol Archive
              </span>
            </motion.div>

            <motion.div variants={item} className="mt-6 max-w-4xl">
              <EditableText
                as="h1"
                align="left"
                editable={editMode}
                value={heroTitle}
                onChange={v => updateSettings({ heroTitle: v })}
                placeholder="제목을 입력하세요"
                maxLength={40}
                className="w-fit max-w-full font-display text-5xl sm:text-7xl md:text-8xl font-semibold tracking-[-0.035em] leading-[1.05] break-keep drop-shadow-[0_6px_40px_rgba(0,0,0,0.55)]"
              />
            </motion.div>

            <motion.div variants={item} className="mt-5 max-w-xl">
              <EditableText
                as="p"
                multiline
                align="left"
                editable={editMode}
                value={heroSubtitle}
                onChange={v => updateSettings({ heroSubtitle: v })}
                placeholder="부제를 입력하세요 (Ctrl+Enter로 저장)"
                maxLength={160}
                className="w-fit max-w-full text-base sm:text-lg leading-relaxed text-white/70 break-keep"
              />
            </motion.div>

            <motion.div
              variants={item}
              className="mt-9 flex flex-wrap items-center gap-2.5"
            >
              <button
                type="button"
                onClick={() =>
                  featuredWorld && heroRef.current
                    ? diveInto(
                        heroRef.current,
                        heroImageRef,
                        `/worlds/${featuredWorld.id}`,
                        0
                      )
                    : setLocation("/worlds")
                }
                className="group inline-flex items-center gap-2 h-12 pl-6 pr-5 rounded-full border border-white/20 bg-white/10 text-sm font-semibold backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_10px_40px_rgba(0,0,0,0.35)] transition-[background-color,border-color] hover:bg-white/[0.18] hover:border-white/30"
              >
                {featuredWorld
                  ? `${featuredWorld.name} 빠져들기`
                  : "세계관 보기"}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
              <button
                type="button"
                onClick={() => setLocation("/characters")}
                className="inline-flex items-center h-12 px-5 rounded-full text-sm font-medium text-white/75 hover:text-white transition-colors"
              >
                캐릭터 둘러보기
              </button>
            </motion.div>
          </div>
        </motion.div>

        {/* scroll cue */}
        <motion.button
          type="button"
          aria-label="아래로"
          onClick={() =>
            belowRef.current?.scrollIntoView({ behavior: "smooth" })
          }
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 0.8 }}
          className="absolute bottom-5 left-1/2 z-10 -translate-x-1/2 grid place-items-center h-9 w-9 rounded-full text-white/45 hover:text-white transition-colors"
        >
          <ChevronDown className="h-5 w-5 animate-bounce" />
        </motion.button>
      </section>
      {/* #endregion */}

      {/* #region Below the fold */}
      <div ref={belowRef} className="relative pb-20">
        {/* ribbon */}
        <section className="pt-4">
          <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 md:px-12 mb-5">
            <div className="gyeol-eyebrow">Inhabitants</div>
            <h2 className="mt-2 text-2xl sm:text-3xl">이 세계에 사는 이들</h2>
          </div>
          <PortraitRibbon
            list={ribbon}
            onPick={kind => setLocation(`/${kind}`)}
          />
        </section>

        {/* gateways */}
        <motion.section
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.08 } },
          }}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="mx-auto mt-16 sm:mt-20 grid w-full max-w-7xl grid-cols-1 gap-3 sm:gap-4 px-5 sm:px-8 md:px-12 md:grid-cols-3"
        >
          <GatewayCard
            eyebrow="Worlds"
            title="세계관"
            count={worlds.length}
            unit="개의 세계"
            image={featuredWorld?.mainImage || heroImageRef}
            onClick={el =>
              diveInto(el, featuredWorld?.mainImage || heroImageRef, "/worlds")
            }
          />
          <GatewayCard
            eyebrow="Characters"
            title="캐릭터"
            count={characters.length}
            unit="명의 인물"
            image={characters[0]?.mainImage || characters[0]?.profileImage}
            imagePosition="center 20%"
            onClick={() => setLocation("/characters")}
          />
          <GatewayCard
            eyebrow="Creatures"
            title="크리쳐"
            count={creatures.length}
            unit="종의 존재"
            image={creatures[0]?.profileImage || creatures[0]?.mainImage}
            imagePosition="center 35%"
            onClick={() => setLocation("/creatures")}
          />
        </motion.section>
      </div>
      {/* #endregion */}

      {/* #region 도움말 모달 */}
      <Modal
        open={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        title={editMode ? "사용 가이드 (편집 모드)" : "관람 안내"}
        maxWidthClassName="max-w-2xl"
        footer={
          <div className="flex justify-end gap-2">
            <GButton
              variant="neutral"
              text="닫기"
              onClick={() => setIsHelpOpen(false)}
            />
          </div>
        }
      >
        <HomeHelpContent editMode={editMode} />
      </Modal>
      {/* #endregion */}
    </div>
  );
  // #endregion
}
// #endregion
