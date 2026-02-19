import ImageUpload from "@/components/ImageUpload";
import { usePortfolioContext } from "@/contexts/PortfolioContext";
import { Edit2, HelpCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useResolvedImage } from "@/hooks/useResolvedImage";
import GButton from "@/components/ui/gyeol-button";
import Modal from "@/components/ui/modal";
import HomeHelpContent from "@/content/help/home-help";
import { patchSettings } from "@/lib/patchers";
import { cssVar } from "@/lib/cssVars";

export default function Home() {
  const { data, setData, editMode } = usePortfolioContext();

  const appliedBg = data.settings.heroBackgroundImage;
  const resolvedBg = useResolvedImage(appliedBg);

  const [isEditingBg, setIsEditingBg] = useState(false);
  const [draftBgUrl, setDraftBgUrl] = useState(appliedBg || "");
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  useEffect(() => {
    if (!isEditingBg) setDraftBgUrl(appliedBg || "");
  }, [appliedBg, isEditingBg]);

  const openBgModal = () => {
    setDraftBgUrl(appliedBg || "");
    setIsEditingBg(true);
  };

  const saveBackground = () => {
    setData(prev => patchSettings(prev, { heroBackgroundImage: draftBgUrl }));
    setIsEditingBg(false);
  };

  const cancelBackground = () => {
    setDraftBgUrl(appliedBg || "");
    setIsEditingBg(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Main Hero Section */}
      <section
        className="gyeol-bg relative w-full h-screen flex items-center justify-center"
        style={
          resolvedBg
            ? cssVar("--gyeol-bg-image", `url(${resolvedBg})`)
            : undefined
        }
      >
        <div className="absolute top-6 right-6 z-20 flex items-center gap-2">
          <GButton
            variant="neutral"
            size="icon"
            icon={<HelpCircle className="w-5 h-5" />}
            onClick={() => setIsHelpOpen(true)}
            title="도움말"
          />
          {editMode && (
            <GButton
              variant="neutral"
              size="icon"
              icon={<Edit2 className="w-5 h-5" />}
              onClick={openBgModal}
              title="배경 이미지 변경"
            />
          )}
        </div>
      </section>

      {/* 배경 변경 모달 */}
      <Modal
        open={isEditingBg && editMode}
        onClose={cancelBackground}
        title="배경 이미지 변경"
        maxWidthClassName="max-w-md"
        footer={
          <div className="flex justify-end gap-2">
            <GButton variant="danger" text="취소" onClick={cancelBackground} />
            <GButton variant="neutral" text="업로드" onClick={saveBackground} />
          </div>
        }
      >
        <ImageUpload value={draftBgUrl} onChange={setDraftBgUrl} />
      </Modal>

      {/* 도움말 모달 (내용은 너가 분리한 컴포넌트로 교체 추천) */}
      <Modal
        open={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        title={editMode ? "사용 가이드 (편집 모드)" : "관람 안내"}
        maxWidthClassName="max-w-2xl"
        footer={
          <div className="flex justify-end gap-2">
            <GButton
              variant="neutral"
              text="닫기"
              onClick={() => setIsHelpOpen(false)}
            />
          </div>
        }
      >
        <HomeHelpContent editMode={editMode} />
      </Modal>
    </div>
  );
}
