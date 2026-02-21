import React, { memo, useCallback, useMemo, useDeferredValue } from "react";
import Modal from "@/components/ui/modal";
import GButton from "@/components/ui/gyeol-button";
import AddItemCard from "@/components/worlds/AddItemCard";

type AddTab = "character" | "creature";

type Props = {
  open: boolean;
  onClose: () => void;

  addTab: AddTab;
  setAddTab: (v: AddTab) => void;

  search: string;
  setSearch: (v: string) => void;

  label: string; // "캐릭터" | "크리쳐"
  isSearching: boolean;

  items: { id: string; name?: string; profileImage?: string }[];
  onPick: (id: string) => void;
};

function AddWorldItemModalBase(props: Props) {
  const {
    open,
    onClose,
    addTab,
    setAddTab,
    search,
    setSearch,
    label,
    isSearching,
    items,
    onPick,
  } = props;

  const onChangeSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value),
    [setSearch]
  );

  // ✅ 검색 입력이 빠를 때 UI 부하 완화(옵션)
  const deferredSearch = useDeferredValue(search);

  // (items는 부모에서 이미 필터링된 리스트가 오겠지만,
  //  혹시라도 부모가 전체를 넘기면 여기서도 한번 방어 가능)
  const shownItems = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) => (it.name ?? "").toLowerCase().includes(q));
  }, [items, deferredSearch]);

  const footer = useMemo(
    () => (
      <div className="flex justify-end gap-2">
        <GButton variant="primary" text="닫기" onClick={onClose} />
      </div>
    ),
    [onClose]
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="항목 추가"
      maxWidthClassName="max-w-3xl"
      footer={footer}
    >
      {/* Tabs */}
      <div className="flex items-center gap-2 mb-4 px-2 pt-2">
        <GButton
          variant={addTab === "character" ? "primary" : "neutral"}
          text="캐릭터"
          onClick={() => setAddTab("character")}
          className="flex-1"
        />
        <GButton
          variant={addTab === "creature" ? "primary" : "neutral"}
          text="크리쳐"
          onClick={() => setAddTab("creature")}
          className="flex-1"
        />
      </div>

      {/* Search */}
      <div className="mb-4 px-2">
        <input
          value={search}
          onChange={onChangeSearch}
          placeholder={`${label} 이름 검색`}
          className="w-full h-10 px-3 rounded-xl border border-white/10 bg-black/25 text-white
            placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/15 transition"
        />
      </div>

      <div className="px-2">
        {shownItems.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
            <p className="text-sm font-medium text-white">
              {isSearching ? "검색 결과가 없습니다." : `${label}가 없습니다.`}
            </p>
            {!isSearching && (
              <p className="mt-2 text-xs text-white/50">
                먼저 <b>{label}</b> 메뉴에서 {label}를 추가해주세요!
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {shownItems.map((item) => (
              <AddItemCard
                key={item.id}
                id={item.id}
                name={item.name}
                image={item.profileImage}
                onPick={onPick} // ✅ 인라인 콜백 제거
              />
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}

export default memo(AddWorldItemModalBase);