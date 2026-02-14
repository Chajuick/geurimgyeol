// src/components/editor/CategoryGroupEditModal.tsx
import React from "react";
import Modal from "@/components/ui/modal";
import GButton from "@/components/ui/gyeol-button";
import { Plus, X } from "lucide-react";

export type CategoryGroup = { main: string; subs: string[] };

type Props = {
  open: boolean;
  title?: string;

  draft: CategoryGroup[];
  setDraft: React.Dispatch<React.SetStateAction<CategoryGroup[]>>;

  onClose: () => void;
  onSave: () => void;

  // 라벨 커스터마이징(원하면)
  mainLabel?: string;
  subLabel?: string;
};

export default function CategoryGroupEditModal({
  open,
  title = "카테고리 편집",
  draft,
  setDraft,
  onClose,
  onSave,
  mainLabel = "메인",
  subLabel = "서브",
}: Props) {
  const addMain = () =>
    setDraft((d) => [...d, { main: `새 ${mainLabel}`, subs: [] }]);

  const renameMain = (idx: number, v: string) => {
    setDraft((d) => d.map((x, i) => (i === idx ? { ...x, main: v } : x)));
  };

  const removeMain = (idx: number) => {
    setDraft((d) => d.filter((_, i) => i !== idx));
  };

  const addSub = (idx: number) => {
    const sub = prompt(`추가할 ${subLabel} 카테고리 이름`)?.trim();
    if (!sub) return;

    setDraft((d) =>
      d.map((x, i) => {
        if (i !== idx) return x;
        const subs = Array.from(new Set([...(x.subs || []), sub]));
        return { ...x, subs };
      })
    );
  };

  const removeSub = (mainIdx: number, sub: string) => {
    setDraft((d) =>
      d.map((x, i) => {
        if (i !== mainIdx) return x;
        return { ...x, subs: (x.subs || []).filter((s) => s !== sub) };
      })
    );
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      maxWidthClassName="max-w-3xl"
      footer={
        <div className="flex items-center gap-2 w-full">
          <GButton
            variant="default"
            text="닫기"
            onClick={onClose}
            className="flex-1"
          />
          <GButton
            variant="dark"
            text="저장"
            onClick={onSave}
            className="flex-1"
          />
        </div>
      }
    >
      <div className="space-y-5 text-black">
        <div className="flex justify-end">
          <GButton
            variant="dark"
            icon={<Plus className="w-4 h-4" />}
            text={`${mainLabel} 추가`}
            onClick={addMain}
          />
        </div>

        {draft.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            카테고리가 없습니다. “{mainLabel} 추가”를 눌러주세요.
          </div>
        ) : (
          <div className="space-y-4">
            {draft.map((cg, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-border bg-background/50 p-4 space-y-3"
              >
                <div className="flex items-center gap-2">
                  <input
                    value={cg.main}
                    onChange={(e) => renameMain(idx, e.target.value)}
                    className="flex-1 h-10 px-3 rounded-xl border border-border bg-background"
                    placeholder={`${mainLabel} 카테고리 이름`}
                  />
                  <GButton
                    variant="dark"
                    text={`${subLabel} 추가`}
                    onClick={() => addSub(idx)}
                  />
                  <GButton
                    variant="danger"
                    text={`${mainLabel} 삭제`}
                    onClick={() => removeMain(idx)}
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {(cg.subs || []).length === 0 ? (
                    <span className="text-xs text-muted-foreground">
                      {subLabel} 카테고리가 없습니다.
                    </span>
                  ) : (
                    (cg.subs || []).map((s) => (
                      <span
                        key={s}
                        className="inline-flex items-center gap-2 px-3 h-8 rounded-full bg-zinc-950 text-zinc-200 border border-zinc-800 text-xs"
                      >
                        {s}
                        <button
                          type="button"
                          onClick={() => removeSub(idx, s)}
                          className="opacity-70 hover:opacity-100"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}