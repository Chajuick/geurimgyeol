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
            : "linear-gradient(135deg, #f5f5f5 0%, #e5e5e5 100%)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/10" />

        {/* Buttons */}
        {editMode && (
          <div className="absolute top-6 right-6 z-20 flex items-center gap-2">
            <GButton
              variant="default"
              size="icon"
              icon={<HelpCircle className="w-5 h-5" />}
              onClick={() => setIsHelpOpen(true)}
              title="도움말"
            />

            <GButton
              variant="default"
              size="icon"
              icon={<Edit2 className="w-5 h-5" />}
              onClick={openBgModal}
              title="배경 이미지 변경"
            />
          </div>
        )}
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
        {editMode ? (
          <div className="space-y-6 text-sm text-zinc-700 dark:text-zinc-300">
            <section className="space-y-2">
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                1) 네비게이션 사용
              </h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  왼쪽 사이드바에서 <b>홈 / 세계관 / 캐릭터 / 크리쳐 / 프로필</b>
                  로 이동할 수 있어요.
                </li>
                <li>
                  상단의 <b>편집 모드</b>를 켜면 추가/수정/삭제 기능이 활성화됩니다.
                </li>
              </ul>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                2) 콘텐츠 구성 팁
              </h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <b>세계관</b>: 배경/아이콘을 먼저 넣고, 설정을 짧게 요약한 뒤 디테일을 추가해요.
                </li>
                <li>
                  <b>캐릭터/크리쳐</b>: 프로필은 얼굴/전신, 메인은 “대표 장면”, 서브는 변형/소품/관계 컷으로 구성하면 좋아요.
                </li>
                <li>
                  이미지는 가능하면 <b>WebP</b> 또는 적당한 해상도로(예: 1920px 이하) 올리면 전시 빌드 용량이 관리됩니다.
                </li>
              </ul>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                3) 저장 방식(중요)
              </h3>
              <div className="space-y-2">
                <p>
                  앱은 서버 없이 동작해요. 편집 중 이미지는 <b>IndexedDB(로컬)</b>에 저장되고,
                  데이터(JSON)는 로컬에 저장됩니다.
                </p>
                <p>
                  “전시용”으로 빌드해서 공개하려면, <b>내려받기</b>로 이미지가 포함된 단일 JSON을 만든 뒤
                  기본 데이터로 교체해 빌드하면 돼요.
                </p>
              </div>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                4) 전시용 빌드 절차
              </h3>
              <ol className="list-decimal pl-5 space-y-1">
                <li>
                  사이드바에서 <b>내려받기</b> 실행 →{" "}
                  <b>geurim-gyeol-portfolio-embedded.json</b> 다운로드
                </li>
                <li>
                  해당 파일 내용을 복사해서 <b>src/lib/defaultData.ts</b>의
                  DEFAULT_PORTFOLIO_DATA에 덮어쓰기
                </li>
                <li>
                  <b>빌드</b>하면, 관람자는 파일 업로드 없이 바로 작품을 감상할 수 있어요
                </li>
              </ol>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                * “백업(zip)”은 다른 PC에서 이어서 편집할 때(이미지+데이터 복원) 쓰는 용도예요.
              </p>
            </section>
          </div>
        ) : (
          <div className="space-y-6 text-sm text-zinc-700 dark:text-zinc-300">
            <section className="space-y-2">
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                관람 안내
              </h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  왼쪽 네비게이션에서 <b>세계관 / 캐릭터 / 크리쳐</b> 페이지로 이동해 주세요.
                </li>
                <li>각 카드(썸네일)를 눌러 상세 정보를 확인할 수 있어요.</li>
                <li>
                  이미지는 작품의 분위기에 맞게 구성되어 있으니, 페이지마다 연출을 비교하며 봐주시면 좋습니다.
                </li>
              </ul>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                추천 감상 순서
              </h3>
              <ol className="list-decimal pl-5 space-y-1">
                <li><b>세계관</b>에서 배경과 설정을 먼저 보고</li>
                <li><b>캐릭터</b>에서 등장인물의 성격/관계를 확인한 다음</li>
                <li><b>크리쳐</b>로 세계의 생태/위협/미스터리를 확장해 보세요.</li>
              </ol>
            </section>

            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              ※ 이 페이지는 감상 전용으로 제공됩니다.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}