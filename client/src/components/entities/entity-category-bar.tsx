import React, { useEffect, useMemo } from "react";
import type { CategoryGroup } from "@/components/entities/category-group-edit-modal";
import { cn } from "@/lib/utils";

const ALL = "전체";

export default function EntityCategoryBar(props: {
  categories: CategoryGroup[];

  // filter state (controlled)
  activeMain: string;
  activeSub: string;
  setActiveMain: (v: string) => void;
  setActiveSub: (v: string) => void;

  className?: string;
}) {
  const {
    categories,
    activeMain,
    activeSub,
    setActiveMain,
    setActiveSub,
    className,
  } = props;

  // ✅ 전체 sub 목록
  const allSubs = useMemo(() => {
    const all = categories.flatMap(c => c.subs || []);
    return Array.from(new Set(all));
  }, [categories]);

  // ✅ main -> subs map
  const mainToSubs = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const cg of categories) map.set(cg.main, cg.subs || []);
    return map;
  }, [categories]);

  // ✅ activeMain이 유효하지 않으면 리셋
  useEffect(() => {
    if (activeMain !== ALL && !categories.find(c => c.main === activeMain)) {
      setActiveMain(ALL);
      setActiveSub(ALL);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories]);

  const subsOfActiveMain = useMemo(() => {
    if (activeMain === ALL) return [ALL, ...allSubs];
    return [ALL, ...(mainToSubs.get(activeMain) || [])];
  }, [activeMain, mainToSubs, allSubs]);

  return (
    <div className={cn("w-full max-w-full min-w-0", className)}>
      <div className="mt-2 space-y-4">
        {/* main */}
        <div className="w-full max-w-full min-w-0 overflow-x-auto overflow-y-hidden scrollbar-none pb-2 overscroll-x-contain">
          <div className="inline-flex gap-1 whitespace-nowrap">
            <button
              onClick={() => {
                setActiveMain(ALL);
                setActiveSub(ALL);
              }}
              className={[
                "px-4 h-9 rounded-full text-sm font-medium transition-colors duration-200 flex-shrink-0",
                activeMain === ALL
                  ? "bg-white/[0.12] text-white border border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                  : "bg-white/[0.04] text-white/70 border border-white/[0.08] hover:bg-white/[0.08] hover:text-white",
              ].join(" ")}
            >
              전체
            </button>

            {categories.map(c => {
              const active = c.main === activeMain;
              return (
                <button
                  key={c.main}
                  onClick={() => {
                    setActiveMain(c.main);
                    setActiveSub(ALL);
                  }}
                  className={[
                    "px-4 h-9 rounded-full text-sm font-medium transition-colors duration-200 flex-shrink-0",
                    active
                      ? "bg-white/[0.12] text-white border border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                      : "bg-white/[0.04] text-white/70 border border-white/[0.08] hover:bg-white/[0.08] hover:text-white",
                  ].join(" ")}
                >
                  {c.main}
                </button>
              );
            })}
          </div>
        </div>

        {/* sub */}
        <div className="w-full max-w-full min-w-0 overflow-x-auto overflow-y-hidden scrollbar-none pb-1 overscroll-x-contain [mask-image:linear-gradient(to_right,black_92%,transparent)]">
          <div className="inline-flex gap-1 whitespace-nowrap">
            {subsOfActiveMain.map(s => {
              const active = s === activeSub;
              return (
                <button
                  key={s}
                  onClick={() => setActiveSub(s)}
                  className={[
                    "px-3 h-7 rounded-lg text-xs transition-colors duration-200 flex-shrink-0",
                    active
                      ? "bg-brand/15 text-indigo-100 ring-1 ring-inset ring-brand/30"
                      : "text-white/45 hover:bg-white/[0.05] hover:text-white",
                  ].join(" ")}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
