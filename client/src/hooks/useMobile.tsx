import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const mql = window.matchMedia(
      `(max-width: ${MOBILE_BREAKPOINT - 1}px)`
    );

    // 초기값
    setIsMobile(mql.matches);

    const handler = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
    };

    // 최신 브라우저
    mql.addEventListener("change", handler);

    // 구형 Safari fallback
    // @ts-ignore
    mql.addListener?.(handler);

    return () => {
      mql.removeEventListener("change", handler);
      // @ts-ignore
      mql.removeListener?.(handler);
    };
  }, []);

  return isMobile;
}