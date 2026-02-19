import Modal from "@/components/ui/modal";
import GButton from "@/components/ui/gyeol-button";
import ImageUpload from "@/components/ImageUpload";
import { inputCls, textareaCls } from "@/components/ui/form";

type Props = {
  open: boolean;
  onClose: () => void;

  name: string;
  setName: (v: string) => void;

  desc: string;
  setDesc: (v: string) => void;

  iconImage: string;
  setIconImage: (v: string) => void;

  bgImage: string;
  setBgImage: (v: string) => void;

  onSubmit: () => void;
};

export default function AddWorldModal(props: Props) {
  const {
    open,
    onClose,
    name,
    setName,
    desc,
    setDesc,
    iconImage,
    setIconImage,
    bgImage,
    setBgImage,
    onSubmit,
  } = props;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="세계관 추가"
      maxWidthClassName="max-w-md"
      footer={
        <div className="flex justify-end gap-2">
          <GButton variant="ghost" text="취소" onClick={onClose} />
          <GButton variant="primary" text="추가" onClick={onSubmit} />
        </div>
      }
    >
      <div className="space-y-6">
        <ImageUpload
          label="세계관 아이콘 (권장: 64×64)"
          value={iconImage}
          onChange={setIconImage}
          aspect="video"
          kind="profile"
        />

        <ImageUpload
          label="세계관 배경 이미지 (권장: 1920×1080)"
          value={bgImage}
          onChange={setBgImage}
          aspect="video"
          kind="background"
        />

        <div>
          <div className="mb-2 text-xs text-white/60">세계관 이름</div>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="세계관 이름"
            className={inputCls}
            onKeyDown={e => e.key === "Enter" && onSubmit()}
          />
        </div>

        <div>
          <div className="mb-2 text-xs text-white/60">설정</div>
          <textarea
            value={desc}
            onChange={e => setDesc(e.target.value)}
            placeholder="세계관 설정을 입력하세요"
            className={textareaCls}
          />
        </div>
      </div>
    </Modal>
  );
}
