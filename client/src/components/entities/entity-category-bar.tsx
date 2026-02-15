import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Pencil } from "lucide-react";
import GButton from "@/components/ui/gyeol-button";
import CategoryGroupEditModal, {
  CategoryGroup,
} from "@/components/entities/category-group-edit-modal";

const ALL = "전체";

export default function EntityCategoryBar(props: {
  titleTop?: string;              // "CHARACTERS" / "CREATURES"
  titleMain: string;              // "캐릭터 소개" / "크리쳐 도감"
  editMode: boolean;

  // categories source
  categories: CategoryGroup[];

  // filter state (controlled)
  activeMain: string;
  activeSub: string;
  setActiveMain: (v: string) => void;
  setActiveSub: (v: string) => void;

  // category editor save handler
  onSaveCategories: (next: CategoryGroup[]) => void;

  // right side actions (ex: Add button)
  rightActions?: React.ReactNode;

  // layout tweak (네가 쓰던 md:ml-20 같은 거)
  className?: string;
}) {
  const {
    titleTop = "ENTITIES",
    titleMain,
    editMode,
    categories,
    activeMain,
    activeSub,
    setActiveMain,
    setActiveSub,
    onSaveCategories,
    rightActions,
    className,
  } = props;

  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [draftCategories, setDraftCategories] =
    useState<CategoryGroup[]>(categories);

  // ✅ 전체 sub 목록
  const allSubs = useMemo(() => {
    const all = categories.flatMap((c) => c.subs || []);
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
    setDraftCategories(categories);

    if (activeMain !== ALL && !categories.find((c) => c.main === activeMain)) {
      setActiveMain(ALL);
      setActiveSub(ALL);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories]);

  const subsOfActiveMain = useMemo(() => {
    if (activeMain === ALL) return [ALL, ...allSubs];
    return [ALL, ...(mainToSubs.get(activeMain) || [])];
  }, [activeMain, mainToSubs, allSubs]);

  const saveCategories = useCallback(() => {
    onSaveCategories(draftCategories);
    setIsEditingCategory(false);
  }, [draftCategories, onSaveCategories]);

  return (
    <>
      <div
        className={[
          "fixed top-0 inset-x-0 z-20 gyeol-bg backdrop-blur border-b border-white/5 opacity-95",
          className || "",
        ].join(" ")}
      >
        <div className="px-12 pt-12 pb-8">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="text-lg text-white/60 mb-2">{titleTop}</p>
              <h1 className="text-4xl text-white font-extrabold tracking-tight">
                {titleMain}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              {editMode && (
                <GButton
                  variant="ghost"
                  icon={<Pencil className="w-4 h-4" />}
                  text="카테고리 편집"
                  onClick={() => setIsEditingCategory(true)}
                />
              )}
              {rightActions}
            </div>
          </div>

          {/* ✅ 필터 바 */}
          {!isEditingCategory && (
            <div className="mt-8 space-y-4">
              {/* main */}
              <div className="overflow-x-auto whitespace-nowrap no-scrollbar scroll-dark pb-2">
                <div className="flex flex-nowrap gap-3 min-w-max">
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

                  {categories.map((c) => {
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
              <div className="overflow-x-auto whitespace-nowrap no-scrollbar scroll-dark pb-2">
                <div className="flex flex-nowrap gap-2 min-w-max">
                  {subsOfActiveMain.map((s) => {
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
          )}
        </div>
      </div>

      {/* ✅ 카테고리 편집 모달 */}
      {editMode && isEditingCategory && (
        <CategoryGroupEditModal
          open
          title="카테고리 편집"
          draft={draftCategories}
          setDraft={setDraftCategories}
          onClose={() => setIsEditingCategory(false)}
          onSave={saveCategories}
          mainLabel="메인"
          subLabel="서브"
        />
      )}
    </>
  );
}