// src/pages/Home.tsx

// #region Imports
import { Edit2, HelpCircle } from "lucide-react";
import { useEffect, useState } from "react";

import ImageUpload from "@/components/ImageUpload";
import GButton from "@/components/ui/gyeol-button";
import Modal from "@/components/ui/modal";
import HomeHelpContent from "@/content/help/home-help";

import { usePortfolioContext } from "@/contexts/PortfolioContext";
import { patchSettings } from "@/lib/patchers";

import LOGO_IMG from "@/assets/logo/logo.png";
// #endregion

// #region Styles
const css = `
/* #region Base */
.gyeol-hero{
  position: relative;
  width: 100%;
  height: 100svh;
  display: grid;
  place-items: center;
  overflow: hidden;
  background: #000;
}

.gyeol-vignette{
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(
    70%_55%_at_50%_45%,
    rgba(255,255,255,0.06),
    rgba(0,0,0,0)_55%,
    rgba(0,0,0,0.85)_100%
  );
}

.gyeol-aura{
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: .35;
  background: radial-gradient(circle_at_50%_38%,
    rgba(120,90,255,0.12),
    transparent 60%
  );
}

.gyeol-center{
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  user-select: none;
}
/* #endregion */

/* #region Logo (no mask tricks, no box artifacts) */
.gyeol-logoWrap{
  position: relative;
  display: grid;
  place-items: center;
  filter: drop-shadow(0 20px 40px rgba(0,0,0,.55));
}

/* ✅ “네모 티”가 절대 안 나는 이유:
   - radial gradient + blur + opacity 만 쓰고
   - mix-blend-mode나 mask 같은 브라우저 의존 기능을 안 씀
*/
.gyeol-logoGlow{
  position: absolute;
  inset: -70px;
  pointer-events: none;
  background: radial-gradient(circle,
    rgba(180,160,255,0.12) 0%,
    rgba(140,120,255,0.05) 40%,
    transparent 70%
  );
  filter: blur(6px);
  opacity: .55;
  animation: gyeolGlowBreath 3.8s ease-in-out infinite;
}

.gyeol-logo{
  width: 200px;
  height: auto;
  display: block;
  animation: gyeolFloat 6.8s ease-in-out infinite;
  transform-origin: 50% 55%;
}
/* #endregion */

/* #region Title */
.gyeol-title{
  margin-top: 28px;
  position: relative;
  display: inline-block;
  font-family: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
  font-weight: 600;
  letter-spacing: 0.10em;
  font-size: 42px;
  line-height: 1;

  background: linear-gradient(
    135deg,
    rgba(255,255,255,.96) 0%,
    rgba(200,210,245,.88) 38%,
    rgba(255,255,255,.92) 70%,
    rgba(190,200,235,.86) 100%
  );
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;

  text-shadow: 0 14px 34px rgba(0,0,0,.55);
}

.gyeol-titleHint{
  margin-top: 10px;
  font-size: 12px;
  letter-spacing: 0.16em;
  color: rgba(235,235,245,0.62);
}
/* #endregion */

/* #region Keyframes */
@keyframes gyeolGlowBreath{
  0%,100% { opacity: .35; transform: scale(1); }
  50%     { opacity: .85; transform: scale(1.08); }
}

@keyframes gyeolFloat{
  0%,100% { transform: translateY(0px) scale(0.995); }
  50%     { transform: translateY(-3px) scale(1.01); }
}
/* #endregion */

/* #region A11y */
@media (prefers-reduced-motion: reduce){
  .gyeol-logoGlow, .gyeol-logo{
    animation: none !important;
  }
}
/* #endregion */
`;
// #endregion

// #region Component
export default function Home() {
  // #region Context / State
  const { data, setData, editMode } = usePortfolioContext();

  const appliedBg = data.settings.heroBackgroundImage;

  const [isEditingBg, setIsEditingBg] = useState(false);
  const [draftBgUrl, setDraftBgUrl] = useState(appliedBg || "");
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  // #endregion

  // #region Effects
  useEffect(() => {
    if (!isEditingBg) setDraftBgUrl(appliedBg || "");
  }, [appliedBg, isEditingBg]);
  // #endregion

  // #region Handlers
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
  // #endregion

  // #region Render
  return (
    <div className="min-h-[100svh] bg-background">
      {/* #region Main Hero Section */}
      <section className="relative w-full h-[100svh] overflow-hidden">
        {/* top-left actions */}
        <div className="absolute top-5 left-6 z-20 flex items-center gap-2">
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

        {/* Hero */}
        <div className="gyeol-hero">
          <div className="gyeol-vignette" />
          <div className="gyeol-aura" />

          <div className="gyeol-center">
            {/* ✅ 로고: 네모 문제 없는 '호흡 글로우 + 미세 플로팅' */}
            <div className="gyeol-logoWrap">
              <div className="gyeol-logoGlow" />
              <img
                src={LOGO_IMG}
                alt="GYEOL"
                className="gyeol-logo"
                draggable={false}
              />
            </div>

            <div className="text-center">
              <div className="gyeol-title">GYEOL</div>
              {/* <div className="gyeol-titleHint">그려나가는 내 결</div> */}
            </div>
          </div>

          <style>{css}</style>
        </div>
      </section>
      {/* #endregion */}

      {/* #region 배경 변경 모달 */}
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
        <ImageUpload
          value={draftBgUrl}
          onChange={setDraftBgUrl}
          className="p-2"
        />
        <div className="mt-2 text-xs text-muted-foreground">
          참고: 지금은 배경 적용부를 주석처리했어. (요청대로) <br />
          나중에 배경도 다시 쓰려면 주석만 풀면 됨.
        </div>
      </Modal>
      {/* #endregion */}

      {/* #region 도움말 모달 */}
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
      {/* #endregion */}
    </div>
  );
  // #endregion
}
// #endregion
