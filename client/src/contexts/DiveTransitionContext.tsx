import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { motion, useAnimate, useReducedMotion } from "framer-motion";
import { useLocation } from "wouter";

import { useResolvedImage } from "@/hooks/useResolvedImage";

/* =========================================================
   🌀 Dive Transition
   - 카드/배너의 이미지를 화면 전체로 확대하며 "빠져드는" 전환
   - 라우트가 바뀌는 동안에도 유지되도록 App 최상단에서 렌더
========================================================= */

type DiveRequest = {
  /** 시작 위치 (보통 클릭한 배너의 getBoundingClientRect) */
  rect: DOMRect;
  /** 확대할 이미지 (img: 키 / URL 모두 가능) */
  image: string;
  /** 전환 후 이동할 경로 */
  to: string;
  /** 시작 모서리 반경(px) */
  radius?: number;
};

type DiveContextType = {
  dive: (req: DiveRequest) => void;
  /** 전환 진행 중 여부 (라우트 기본 페이드 생략용) */
  diving: boolean;
};

const DiveContext = createContext<DiveContextType | undefined>(undefined);

export function useDiveTransition() {
  const ctx = useContext(DiveContext);
  if (!ctx) {
    throw new Error(
      "useDiveTransition must be used within DiveTransitionProvider"
    );
  }
  return ctx;
}

const EASE_IN_OUT = [0.76, 0, 0.24, 1] as const;
const EASE_OUT = [0.16, 1, 0.3, 1] as const;

function DiveOverlay({
  req,
  onNavigate,
  onDone,
}: {
  req: DiveRequest;
  onNavigate: () => void;
  onDone: () => void;
}) {
  // ⚠️ 원래 페이지가 unmount되며 objectURL을 revoke해도 안전하도록 자체 resolve
  const url = useResolvedImage(req.image);
  const [scope, animate] = useAnimate();
  const { rect, radius = 28 } = req;

  // 이미지 resolve가 늦거나 실패해도 멈추지 않도록 짧은 대기 후 진행
  const [waitedEnough, setWaitedEnough] = useState(!req.image);
  useEffect(() => {
    if (waitedEnough) return;
    const t = window.setTimeout(() => setWaitedEnough(true), 400);
    return () => window.clearTimeout(t);
  }, [waitedEnough]);

  const ready = !!url || waitedEnough;
  const [started, setStarted] = useState(false);

  // 이동은 정확히 한 번만
  const navigatedRef = useRef(false);
  const navigateOnce = useCallback(() => {
    if (navigatedRef.current) return;
    navigatedRef.current = true;
    onNavigate();
  }, [onNavigate]);

  // 안전장치: 어떤 이유로든 연출이 끝나지 않으면 강제로 이동 + 정리
  useEffect(() => {
    const t = window.setTimeout(() => {
      navigateOnce();
      onDone();
    }, 4000);
    return () => window.clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!ready || started) return;
    setStarted(true);
  }, [ready, started]);

  useEffect(() => {
    if (!started) return;
    let cancelled = false;

    const run = async () => {
      try {
        await play();
      } catch {
        /* 애니메이션 실패 시에도 아래 finally로 이동/정리 보장 */
      } finally {
        if (!cancelled) {
          navigateOnce();
          onDone();
        }
      }
    };

    const play = async () => {
      // 이미지가 없으면 어둠으로만 빠져든다
      if (url) {
        const pre = new Image();
        pre.src = url;
        // 큰 이미지는 디코딩이 길어 반응이 늦어지므로 짧게만 기다린다
        await Promise.race([
          pre.decode().catch(() => undefined),
          new Promise(r => window.setTimeout(r, 250)),
        ]);
      }
      if (cancelled || !scope.current) return;

      const vw = window.innerWidth;
      const vh = window.innerHeight;

      // 1) 배너 위에 겹쳐 나타나며 텍스트를 덮는다
      await animate(
        scope.current,
        { opacity: 1 },
        { duration: 0.16, ease: "easeOut" }
      );

      // 2) 화면 전체로 펼쳐지며 이미지 안쪽으로 파고든다
      await Promise.all([
        animate(
          scope.current,
          { top: 0, left: 0, width: vw, height: vh, borderRadius: 0 },
          { duration: 0.75, ease: EASE_IN_OUT }
        ),
        animate(
          "[data-dive-img]",
          { scale: 1.35, filter: "blur(2px) brightness(0.75)" },
          { duration: 0.75, ease: EASE_IN_OUT }
        ),
        animate(
          "[data-dive-tunnel]",
          { opacity: 1 },
          { duration: 0.75, ease: "easeIn" }
        ),
      ]);
      if (cancelled) return;

      // 3) 가장 깊은 지점에서 페이지 교체
      navigateOnce();
      await animate(
        "[data-dive-img]",
        { scale: 1.6, filter: "blur(10px) brightness(0.35)" },
        { duration: 0.45, ease: "easeIn" }
      );
      if (cancelled) return;

      // 4) 통과하듯 사라지며 새 페이지 공개
      await animate(
        scope.current,
        { opacity: 0 },
        { duration: 0.6, ease: EASE_OUT }
      );
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [started]); // eslint-disable-line react-hooks/exhaustive-deps

  return createPortal(
    <>
      {/* 연출 중 다른 클릭으로 이중 이동되지 않도록 화면 전체 입력 차단 */}
      <div aria-hidden className="fixed inset-0 z-[89] cursor-wait" />
      <motion.div
        ref={scope}
        aria-hidden
        className="fixed z-[90] overflow-hidden bg-black pointer-events-auto"
        style={{
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
          borderRadius: radius,
          opacity: 0,
        }}
      >
        {/* 애니메이션 대상이 항상 존재하도록 img는 늘 렌더 */}
        <img
          data-dive-img
          src={url || undefined}
          alt=""
          draggable={false}
          // 큰 이미지의 동기 디코딩이 메인 스레드를 막아 연출이 끊기지 않도록
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover will-change-transform"
          style={{ transformOrigin: "50% 45%", opacity: url ? 1 : 0 }}
        />
        {/* 가장자리부터 어두워지는 터널 */}
        <div
          data-dive-tunnel
          className="absolute inset-0 opacity-0"
          style={{
            background:
              "radial-gradient(circle at 50% 45%, transparent 0%, rgba(0,0,0,0.25) 35%, rgba(0,0,0,0.92) 80%)",
          }}
        />
      </motion.div>
    </>,
    document.body
  );
}

export function DiveTransitionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [, setLocation] = useLocation();
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState<DiveRequest | null>(null);

  const dive = useCallback(
    (req: DiveRequest) => {
      if (reduceMotion) {
        setLocation(req.to);
        return;
      }
      setActive(prev => prev ?? req);
    },
    [reduceMotion, setLocation]
  );

  return (
    <DiveContext.Provider value={{ dive, diving: !!active }}>
      {children}
      {active && (
        <DiveOverlay
          req={active}
          onNavigate={() => setLocation(active.to)}
          onDone={() => setActive(null)}
        />
      )}
    </DiveContext.Provider>
  );
}
