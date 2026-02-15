import ImageUpload from "@/components/ImageUpload";
import { usePortfolioContext } from "@/contexts/PortfolioContext";
import { Edit2, HelpCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useResolvedImage } from "@/hooks/useResolvedImage";
import GButton from "@/components/ui/gyeol-button";
import Modal from "@/components/ui/modal";

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
    setData({
      ...data,
      settings: {
        ...data.settings,
        heroBackgroundImage: draftBgUrl,
      },
    });
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
        className="relative w-full h-screen flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: resolvedBg
            ? `url(${resolvedBg})`
            : "linear-gradient(135deg, #0b0b0f 0%, #121218 50%, #0b0b0f 100%)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/25" />

        {/* Buttons */}

        <div className="absolute top-6 right-6 z-20 flex items-center gap-2">
          <GButton
            variant="ghost"
            size="icon"
            icon={<HelpCircle className="w-5 h-5" />}
            onClick={() => setIsHelpOpen(true)}
            title="도움말"
          />
          {editMode && (
            <GButton
              variant="ghost"
              size="icon"
              icon={<Edit2 className="w-5 h-5" />}
              onClick={openBgModal}
              title="배경 이미지 변경"
            />
          )}
        </div>

      </section>

      {/* ✅ 배경 변경 모달도 Modal로 통일 */}
      <Modal
        open={isEditingBg && editMode}
        onClose={cancelBackground}
        title="배경 이미지 변경"
        maxWidthClassName="max-w-md"
        footer={
          <div className="flex justify-end gap-2">
            <GButton variant="default" text="취소" onClick={cancelBackground} />
            <GButton variant="dark" text="업로드" onClick={saveBackground} />
          </div>
        }
      >
        <ImageUpload value={draftBgUrl} onChange={setDraftBgUrl} />
      </Modal>

      {/* ✅ 도움말 모달 */}
      <Modal
        open={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        title={editMode ? "사용 가이드 (편집 모드)" : "관람 안내"}
        maxWidthClassName="max-w-2xl"
        footer={
          <div className="flex justify-end gap-2">
            <GButton
              variant="dark"
              text="닫기"
              onClick={() => setIsHelpOpen(false)}
            />
          </div>
        }
      >
        {/* ✅ 다크 게임 UI 톤 텍스트 스타일 */}
        <div className="text-sm text-white/70 leading-relaxed">
          {editMode ? (
            <div className="space-y-6">
              <section className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <h3 className="text-base font-semibold text-white mb-2">
                  1) 네비게이션 사용
                </h3>
                <ul className="list-disc pl-5 space-y-1 text-white/70">
                  <li>
                    왼쪽 사이드바에서{" "}
                    <span className="text-white/90 font-semibold">
                      홈 / 세계관 / 캐릭터 / 크리쳐 / 프로필
                    </span>
                    로 이동할 수 있어요.
                  </li>
                  <li>
                    상단의{" "}
                    <span className="text-white/90 font-semibold">편집 모드</span>
                    를 켜면 추가/수정/삭제 기능이 활성화됩니다.
                  </li>
                </ul>
              </section>

              <section className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <h3 className="text-base font-semibold text-white mb-2">
                  2) 콘텐츠 구성 팁
                </h3>
                <ul className="list-disc pl-5 space-y-1 text-white/70">
                  <li>
                    <span className="text-white/90 font-semibold">세계관</span>:
                    배경/아이콘을 먼저 넣고, 설정을 짧게 요약한 뒤 디테일을 추가해요.
                  </li>
                  <li>
                    <span className="text-white/90 font-semibold">
                      캐릭터/크리쳐
                    </span>
                    : 프로필은 얼굴/전신, 메인은 “대표 장면”, 서브는 변형/소품/관계 컷으로 구성하면 좋아요.
                  </li>
                  <li>
                    이미지는 가능하면{" "}
                    <span className="text-white/90 font-semibold">WebP</span> 또는
                    적당한 해상도로(예: 1920px 이하) 올리면 전시 빌드 용량이 관리됩니다.
                  </li>
                </ul>
              </section>

              <section className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <h3 className="text-base font-semibold text-white mb-2">
                  3) 저장 방식(중요)
                </h3>
                <div className="space-y-2 text-white/70">
                  <p>
                    앱은 서버 없이 동작해요. 편집 중 이미지는{" "}
                    <span className="text-white/90 font-semibold">IndexedDB(로컬)</span>
                    에 저장되고, 데이터(JSON)는 로컬에 저장됩니다.
                  </p>
                  <p>
                    “전시용”으로 빌드해서 공개하려면,{" "}
                    <span className="text-white/90 font-semibold">내려받기</span>로
                    이미지가 포함된 단일 JSON을 만든 뒤 기본 데이터로 교체해 빌드하면 돼요.
                  </p>
                </div>
              </section>

              <section className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <h3 className="text-base font-semibold text-white mb-2">
                  4) 전시용 빌드 절차
                </h3>
                <ol className="list-decimal pl-5 space-y-1 text-white/70">
                  <li>
                    사이드바에서{" "}
                    <span className="text-white/90 font-semibold">내려받기</span>{" "}
                    실행 →{" "}
                    <span className="text-white/90 font-semibold">
                      geurim-gyeol-portfolio-embedded.json
                    </span>{" "}
                    다운로드
                  </li>
                  <li>
                    해당 파일 내용을 복사해서{" "}
                    <span className="text-white/90 font-semibold">
                      src/lib/defaultData.ts
                    </span>
                    의 DEFAULT_PORTFOLIO_DATA에 덮어쓰기
                  </li>
                  <li>
                    <span className="text-white/90 font-semibold">빌드</span>하면,
                    관람자는 파일 업로드 없이 바로 작품을 감상할 수 있어요
                  </li>
                </ol>

                <p className="mt-3 text-xs text-white/40">
                  * “백업(zip)”은 다른 PC에서 이어서 편집할 때(이미지+데이터 복원) 쓰는 용도예요.
                </p>
              </section>
            </div>
          ) : (
            <div className="space-y-6">
              <section className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <h3 className="text-base font-semibold text-white mb-2">
                  관람 안내
                </h3>
                <ul className="list-disc pl-5 space-y-1 text-white/70">
                  <li>
                    왼쪽 네비게이션에서{" "}
                    <span className="text-white/90 font-semibold">
                      세계관 / 캐릭터 / 크리쳐
                    </span>{" "}
                    페이지로 이동해 주세요.
                  </li>
                  <li>각 카드(썸네일)를 눌러 상세 정보를 확인할 수 있어요.</li>
                  <li>
                    이미지는 작품의 분위기에 맞게 구성되어 있으니, 페이지마다 연출을 비교하며 봐주시면 좋습니다.
                  </li>
                </ul>
              </section>

              <section className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <h3 className="text-base font-semibold text-white mb-2">
                  추천 감상 순서
                </h3>
                <ol className="list-decimal pl-5 space-y-1 text-white/70">
                  <li>
                    <span className="text-white/90 font-semibold">세계관</span>에서
                    배경과 설정을 먼저 보고
                  </li>
                  <li>
                    <span className="text-white/90 font-semibold">캐릭터</span>에서
                    등장인물의 성격/관계를 확인한 다음
                  </li>
                  <li>
                    <span className="text-white/90 font-semibold">크리쳐</span>로
                    세계의 생태/위협/미스터리를 확장해 보세요.
                  </li>
                </ol>
              </section>

              <p className="text-xs text-white/40 pb-2">
                ※ 이 페이지는 감상 전용으로 제공됩니다.
              </p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}