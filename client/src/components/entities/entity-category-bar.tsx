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
        <div className="w-full max-w-full min-w-0 overflow-x-auto overflow-y-hidden no-scrollbar scroll-dark pb-2 overscroll-x-contain">
          <div className="inline-flex gap-3 whitespace-nowrap">
            <button
              onClick={() => {
                setActiveMain(ALL);
                setActiveSub(ALL);
              }}
              className={[
                "px-5 h-10 rounded-full text-sm font-medium transition-all duration-200 flex-shrink-0",
                activeMain === ALL
                  ? "bg-white/10 text-white border border-white/20 shadow-md"
                  : "bg-zinc-900 text-zinc-300 border border-zinc-600 hover:bg-zinc-800 hover:text-white",
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
                    "px-5 h-10 rounded-full text-sm font-medium transition-all duration-200 flex-shrink-0",
                    active
                      ? "bg-white/10 text-white border border-white/20 shadow-md"
                      : "bg-zinc-900 text-zinc-300 border border-zinc-600 hover:bg-zinc-800 hover:text-white",
                  ].join(" ")}
                >
                  {c.main}
                </button>
              );
            })}
          </div>
        </div>

        {/* sub */}
        <div className="w-full max-w-full min-w-0 overflow-x-auto overflow-y-hidden no-scrollbar scroll-dark pb-2 overscroll-x-contain">
          <div className="inline-flex gap-2 whitespace-nowrap">
            {subsOfActiveMain.map(s => {
              const active = s === activeSub;
              return (
                <button
                  key={s}
                  onClick={() => setActiveSub(s)}
                  className={[
                    "px-4 h-8 rounded-full text-xs transition-all duration-200 flex-shrink-0",
                    active
                      ? "bg-zinc-700 text-white"
                      : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:bg-zinc-800 hover:text-white",
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
