import React, { useEffect, useRef, useState } from "react";

export default function OverflowMarquee({
  children,
  active,
  className = "",
}: {
  children: React.ReactNode;
  active: boolean; // selected
  className?: string;
}) {
  const lineRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [overflow, setOverflow] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (!active) {
      setOverflow(false);
      return;
    }

    let raf = 0;
    const check = () => {
      if (!lineRef.current || !trackRef.current) return;
      const isOverflow =
        trackRef.current.scrollWidth > lineRef.current.clientWidth + 1;
      setOverflow(isOverflow);
    };

    raf = requestAnimationFrame(check);

    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(check);
    });

    if (lineRef.current) ro.observe(lineRef.current);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [active, children]);

  return (
    <div
      ref={lineRef}
      className={`marquee-line ${className}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      tabIndex={0} // 키보드 접근성(선택)
    >
      <div
        ref={trackRef}
        className={`marquee-track ${
          active && overflow && hovered ? "is-marquee" : ""
        }`}
      >
        {children}
      </div>
    </div>
  );
}