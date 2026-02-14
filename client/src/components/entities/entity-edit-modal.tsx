// src/components/editor/EntityEditModal.tsx
import React from "react";
import Modal from "@/components/ui/modal";
import GButton from "@/components/ui/gyeol-button";
import { Trash2 } from "lucide-react";

type EntityEditModalProps<T> = {
  open: boolean;
  title: string;
  maxWidthClassName?: string;

  draft: T;
  setDraft: React.Dispatch<React.SetStateAction<T>>;

  onClose: () => void;
  onSave: (draft: T) => void;

  // 수정 모드일 때만 전달
  onDelete?: () => void;
  deleteText?: string;

  renderBody: (args: {
    draft: T;
    setDraft: React.Dispatch<React.SetStateAction<T>>;
  }) => React.ReactNode;
};

export default function EntityEditModal<T>(props: EntityEditModalProps<T>) {
  const {
    open,
    title,
    maxWidthClassName = "max-w-3xl",
    draft,
    setDraft,
    onClose,
    onSave,
    onDelete,
    deleteText = "삭제",
    renderBody,
  } = props;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      maxWidthClassName={maxWidthClassName}
      footer={
        <div className="flex items-center gap-2 w-full">
          <GButton
            variant="dark"
            text="저장"
            onClick={() => onSave(draft)}
            className="flex-1"
          />

          {onDelete && (
            <GButton
              variant="danger"
              icon={<Trash2 className="w-4 h-4" />}
              text={deleteText}
              onClick={onDelete}
            />
          )}
        </div>
      }
    >
      <div className="space-y-8 text-black">{renderBody({ draft, setDraft })}</div>
    </Modal>
  );
}