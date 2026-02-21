// src/components/editor/CategoryGroupEditModal.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import Modal from "@/components/ui/modal";
import GButton from "@/components/ui/gyeol-button";
import ConfirmModal from "@/components/ui/confirm-modal";
import { Plus, X, Trash2 } from "lucide-react";

export type CategoryGroup = { main: string; subs: string[] };

type Props = {
  open: boolean;
  title?: string;

  draft: CategoryGroup[];
  setDraft: React.Dispatch<React.SetStateAction<CategoryGroup[]>>;

  onClose: () => void;
  onSave: () => void;

  mainLabel?: string;
  subLabel?: string;
};

function cx(...v: Array<string | false | null | undefined>) {
  return v.filter(Boolean).join(" ");
}

/**
 * ✅ 안정 키
 * - ideally id가 있어야 하지만, 기존 타입을 유지하면서 꼬임 최소화
 * - main이 바뀌면 키도 바뀌므로 subDraft 값이 초기화될 수 있음(의도적으로 안전)
 * - 중복 main 대비 idx를 섞어 충돌 방지
 */
function mainKey(idx: number, main: string) {
  return `${idx}::${(main || "").trim()}`;
}

type CardProps = {
  idx: number;
  cg: CategoryGroup;
  mainLabel: string;
  subLabel: string;

  inputCls: string;
  softBtnClass: string;

  curSub: string;
  setCurSub: (v: string) => void;

  renameMain: (idx: number, v: string) => void;
  askDeleteMain: (idx: number) => void;

  addSub: (idx: number, sub: string) => void;
  removeSub: (idx: number, sub: string) => void;
};

const CategoryGroupCard = React.memo(function CategoryGroupCard({
  idx,
  cg,
  mainLabel,
  subLabel,
  inputCls,
  softBtnClass,
  curSub,
  setCurSub,
  renameMain,
  askDeleteMain,
  addSub,
  removeSub,
}: CardProps) {
  const subs = cg.subs || [];

  return (
    <div
      className={cx(
        "rounded-3xl border border-white/10",
        "bg-black/25 p-4 space-y-4",
        "shadow-[0_18px_70px_rgba(0,0,0,0.55)]",
        "relative overflow-hidden"
      )}
    >
      {/* card accent */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute -top-20 -right-24 w-72 h-72 rounded-full blur-3xl opacity-20"
          style={{
            background:
              "radial-gradient(circle at center, rgba(255,255,255,0.18), transparent 60%)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-50" />
      </div>

      {/* 메인 */}
      <div className="relative flex items-center gap-2 min-w-0">
        <input
          value={cg.main}
          onChange={(e) => renameMain(idx, e.target.value)}
          className={cx(inputCls, "flex-1 min-w-0")}
          placeholder={`${mainLabel} 카테고리 이름`}
        />

        <GButton
          variant="danger"
          icon={<Trash2 className="w-4 h-4" />}
          text={`${mainLabel} 삭제`}
          onClick={() => askDeleteMain(idx)}
          className="shrink-0"
        />
      </div>

      {/* 서브 추가 */}
      <div className="relative flex items-center gap-2 min-w-0">
        <input
          value={curSub}
          onChange={(e) => setCurSub(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addSub(idx, curSub);
              setCurSub("");
            }
          }}
          className={cx(inputCls, "min-w-0")}
          placeholder={`${subLabel} 추가 (Enter로 추가)`}
        />
        <GButton
          variant="neutral"
          text={`${subLabel} 추가`}
          onClick={() => {
            addSub(idx, curSub);
            setCurSub("");
          }}
          className={cx("shrink-0", softBtnClass)}
        />
      </div>

      {/* 서브 chips */}
      <div className="relative flex flex-wrap gap-2">
        {subs.length === 0 ? (
          <span className="text-xs text-white/40">{subLabel} 카테고리가 없습니다.</span>
        ) : (
          subs.map((s) => (
            <span
              key={s}
              className={cx(
                "inline-flex items-center gap-2 px-3 h-8 rounded-full",
                "bg-white/5 text-white/85 border border-white/10",
                "text-xs"
              )}
            >
              {s}
              <button
                type="button"
                onClick={() => removeSub(idx, s)}
                className="opacity-70 hover:opacity-100 transition"
                title="삭제"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))
        )}
      </div>
    </div>
  );
},
  // ✅ memo 비교: 이 카드의 표시값이 바뀌었을 때만 리렌더
  (prev, next) => {
    if (prev.idx !== next.idx) return false;
    if (prev.cg !== next.cg) return false; // draft 업데이트가 참조 유지하면 이게 잘 먹음
    if (prev.curSub !== next.curSub) return false;
    return true;
  });

export default function CategoryGroupEditModal({
  open,
  title = "카테고리 편집",
  draft,
  setDraft,
  onClose,
  onSave,
  mainLabel = "메인 카테고리",
  subLabel = "서브 카테고리",
}: Props) {
  // confirm state (메인 삭제 확인)
  const [confirmDeleteMainIdx, setConfirmDeleteMainIdx] = useState<number | null>(
    null
  );

  // ✅ 메인별 서브 입력 상태(키: mainKey)
  const [subDraft, setSubDraft] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) {
      setSubDraft({});
      setConfirmDeleteMainIdx(null);
    }
  }, [open]);

  // ✅ 다크 인풋 톤(게임 UI)
  const inputCls = useMemo(
    () =>
      cx(
        "w-full h-10 px-3 rounded-xl",
        "bg-black/25 text-white",
        "border border-white/10",
        "placeholder:text-white/30",
        "outline-none",
        "focus:ring-2 focus:ring-white/15 focus:border-white/20",
        "transition"
      ),
    []
  );

  const softBtnClass = useMemo(
    () => cx("bg-white/10 hover:bg-white/15 text-white border border-white/10"),
    []
  );

  // ✅ 메인 추가
  const addMain = useCallback(() => {
    setDraft((d) => [...d, { main: `새 ${mainLabel}`, subs: [] }]);
  }, [setDraft, mainLabel]);

  const renameMain = useCallback(
    (idx: number, v: string) => {
      setDraft((d) =>
        d.map((x, i) => {
          if (i !== idx) return x;
          if (x.main === v) return x; // ✅ 변화 없으면 참조 유지
          return { ...x, main: v };
        })
      );

      // ✅ main이 바뀌면 key도 바뀌므로 기존 입력은 자연스럽게 분리됨(꼬임 방지)
    },
    [setDraft]
  );

  const removeMain = useCallback(
    (idx: number) => {
      setDraft((d) => d.filter((_, i) => i !== idx));
    },
    [setDraft]
  );

  // ✅ 서브 추가: 중복이면 아무것도 안함(참조 유지)
  const addSub = useCallback(
    (idx: number, sub: string) => {
      const v = (sub || "").trim();
      if (!v) return;

      setDraft((d) =>
        d.map((x, i) => {
          if (i !== idx) return x;
          const subs = x.subs || [];
          if (subs.includes(v)) return x; // ✅ 변화 없으면 참조 유지
          return { ...x, subs: [...subs, v] };
        })
      );
    },
    [setDraft]
  );

  const removeSub = useCallback(
    (idx: number, sub: string) => {
      setDraft((d) =>
        d.map((x, i) => {
          if (i !== idx) return x;
          const subs = x.subs || [];
          if (!subs.includes(sub)) return x; // ✅ 변화 없으면 참조 유지
          return { ...x, subs: subs.filter((s) => s !== sub) };
        })
      );
    },
    [setDraft]
  );

  const askDeleteMain = useCallback((idx: number) => {
    setConfirmDeleteMainIdx(idx);
  }, []);

  const confirmTargetName =
    confirmDeleteMainIdx != null ? draft[confirmDeleteMainIdx]?.main : "";

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title={title}
        maxWidthClassName="max-w-3xl"
        footer={
          <div className="flex items-center gap-2 w-full">
            <GButton
              variant="neutral"
              text="닫기"
              onClick={onClose}
              className={cx("flex-1", softBtnClass)}
            />
            <GButton
              variant="ghost"
              text="저장"
              onClick={onSave}
              className="flex-1"
            />
          </div>
        }
      >
        <div className="relative text-white">
          {/* subtle frame bg */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
            <div className="absolute inset-0 bg-zinc-950/40" />
            <div
              className="absolute -top-40 -right-40 w-[520px] h-[520px] rounded-full blur-3xl opacity-30"
              style={{
                background:
                  "radial-gradient(circle at center, rgba(255,255,255,0.22), transparent 60%)",
              }}
            />
            <div
              className="absolute -bottom-48 -left-48 w-[560px] h-[560px] rounded-full blur-3xl opacity-20"
              style={{
                background:
                  "radial-gradient(circle at center, rgba(120,160,255,0.18), transparent 60%)",
              }}
            />
            <div className="absolute inset-0 border border-white/10 rounded-2xl" />
            <div className="absolute inset-0 ring-1 ring-white/5 rounded-2xl" />
          </div>

          {/* 상단 sticky */}
          <div
            className={cx(
              "sticky top-0 z-10 -mt-2",
              "px-2 py-3",
              "bg-zinc-950/85 backdrop-blur-xl",
              "border-b border-white/10"
            )}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="px-3 text-xs text-white/60">
                {mainLabel}/{subLabel}를 추가/삭제/이름 변경할 수 있어요.
              </div>

              <GButton
                variant="ghost"
                icon={<Plus className="w-4 h-4" />}
                text={`${mainLabel} 추가`}
                onClick={addMain}
                className="overflow-hidden"
              />
            </div>
          </div>

          <div className="p-5 space-y-4 relative">
            {draft.length === 0 ? (
              <div className="text-sm text-white/50">
                카테고리가 없습니다. 상단의 “{mainLabel} 추가”를 눌러주세요.
              </div>
            ) : (
              <div className="space-y-4 px-4">
                {draft.map((cg, idx) => {
                  const k = mainKey(idx, cg.main);
                  const curSub = subDraft[k] ?? "";

                  return (
                    <CategoryGroupCard
                      key={k}
                      idx={idx}
                      cg={cg}
                      mainLabel={mainLabel}
                      subLabel={subLabel}
                      inputCls={inputCls}
                      softBtnClass={softBtnClass}
                      curSub={curSub}
                      setCurSub={(v) =>
                        setSubDraft((s) => (s[k] === v ? s : { ...s, [k]: v }))
                      }
                      renameMain={renameMain}
                      askDeleteMain={askDeleteMain}
                      addSub={addSub}
                      removeSub={removeSub}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </Modal>

      <ConfirmModal
        open={confirmDeleteMainIdx != null}
        title={`${mainLabel} 삭제`}
        description={
          confirmTargetName
            ? `“${confirmTargetName}” ${mainLabel} 카테고리를 삭제하시겠습니까?\n(포함된 ${subLabel} 목록도 함께 사라집니다)`
            : `선택한 ${mainLabel} 카테고리를 삭제하시겠습니까?\n(포함된 ${subLabel} 목록도 함께 사라집니다)`
        }
        confirmText="삭제"
        cancelText="취소"
        danger
        onClose={() => setConfirmDeleteMainIdx(null)}
        onConfirm={() => {
          if (confirmDeleteMainIdx == null) return;
          removeMain(confirmDeleteMainIdx);
          setConfirmDeleteMainIdx(null);
        }}
      />
    </>
  );
}