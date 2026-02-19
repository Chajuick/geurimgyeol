import { useEffect, useRef } from "react";
import { usePersistFn } from "./usePersistFn";

export interface UseCompositionReturn<
  T extends HTMLInputElement | HTMLTextAreaElement,
> {
  onCompositionStart: React.CompositionEventHandler<T>;
  onCompositionEnd: React.CompositionEventHandler<T>;
  onKeyDown: React.KeyboardEventHandler<T>;
  isComposing: () => boolean;
  // (선택) 편의용
  // composingRef: React.MutableRefObject<boolean>;
}

export interface UseCompositionOptions<
  T extends HTMLInputElement | HTMLTextAreaElement,
> {
  onKeyDown?: React.KeyboardEventHandler<T>;
  onCompositionStart?: React.CompositionEventHandler<T>;
  onCompositionEnd?: React.CompositionEventHandler<T>;
}

type Timer = ReturnType<typeof setTimeout>;

function clearTimer(t: React.MutableRefObject<Timer | null>) {
  if (t.current) {
    clearTimeout(t.current);
    t.current = null;
  }
}

export function useComposition<
  T extends HTMLInputElement | HTMLTextAreaElement = HTMLInputElement,
>(options: UseCompositionOptions<T> = {}): UseCompositionReturn<T> {
  const {
    onKeyDown: originalOnKeyDown,
    onCompositionStart: originalOnCompositionStart,
    onCompositionEnd: originalOnCompositionEnd,
  } = options;

  const composing = useRef(false);
  const t1 = useRef<Timer | null>(null);
  const t2 = useRef<Timer | null>(null);

  // ✅ 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      clearTimer(t1);
      clearTimer(t2);
    };
  }, []);

  const onCompositionStart = usePersistFn((e: React.CompositionEvent<T>) => {
    // 입력 시작 시 기존 타이머 제거
    clearTimer(t1);
    clearTimer(t2);

    composing.current = true;
    originalOnCompositionStart?.(e);
  });

  const onCompositionEnd = usePersistFn((e: React.CompositionEvent<T>) => {
    // ✅ Safari에서 compositionEnd가 onKeyDown보다 먼저 오는 케이스 대응:
    // 2-tick 뒤에 composing=false로 내림
    clearTimer(t1);
    clearTimer(t2);

    t1.current = setTimeout(() => {
      t2.current = setTimeout(() => {
        composing.current = false;
        t2.current = null;
      }, 0);
      t1.current = null;
    }, 0);

    originalOnCompositionEnd?.(e);
  });

  const onKeyDown = usePersistFn((e: React.KeyboardEvent<T>) => {
    // ✅ IME 조합 중: ESC / Enter(Shift+Enter 제외) 이벤트 버블링 차단
    if (
      composing.current &&
      (e.key === "Escape" || (e.key === "Enter" && !e.shiftKey))
    ) {
      e.stopPropagation();
      return;
    }
    originalOnKeyDown?.(e);
  });

  const isComposing = usePersistFn(() => composing.current);

  return {
    onCompositionStart,
    onCompositionEnd,
    onKeyDown,
    isComposing,
  };
}