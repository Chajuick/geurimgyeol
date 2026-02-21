import Modal from "@/components/ui/modal";
import GButton from "@/components/ui/gyeol-button";
import ImageUpload from "@/components/ImageUpload";

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: () => void;

  backgroundUrl: string;
  setBackgroundUrl: (v: string) => void;

  iconUrl: string;
  setIconUrl: (v: string) => void;
};

export default function EditWorldMediaModal({
  open,
  onClose,
  onSave,
  backgroundUrl,
  setBackgroundUrl,
  iconUrl,
  setIconUrl,
}: Props) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="배경/아이콘 변경"
      maxWidthClassName="max-w-2xl"
      footer={
        <div className="flex justify-end gap-2">
          <GButton variant="ghost" text="취소" onClick={onClose} />
          <GButton variant="primary" text="저장" onClick={onSave} />
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-5">
        <ImageUpload
          label="배경 이미지"
          value={backgroundUrl}
          onChange={setBackgroundUrl}
          aspect="video"
          kind="background"
        />

        <ImageUpload
          label="세계관 아이콘 (권장: 64×64)"
          value={iconUrl}
          onChange={setIconUrl}
          aspect="video"
          kind="profile"
        />
      </div>
    </Modal>
  );
}
