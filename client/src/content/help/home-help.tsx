import GuideSection from "@/components/help/guide-section";

export default function HomeHelpContent({ editMode }: { editMode: boolean }) {
  return (
    <div className="text-sm text-white/70 leading-relaxed">
      {editMode ? (
        <div className="space-y-6">
          <GuideSection title="1) 네비게이션 사용">
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
                <span className="text-white/90 font-semibold">편집 모드</span>를
                켜면 추가/수정/삭제 기능이 활성화됩니다.
              </li>
            </ul>
          </GuideSection>

          <GuideSection title="2) 콘텐츠 구성 팁">
            <ul className="list-disc pl-5 space-y-1 text-white/70">
              <li>
                <span className="text-white/90 font-semibold">세계관</span>:
                배경/아이콘을 먼저 넣고, 설정을 짧게 요약한 뒤 디테일을
                추가해요.
              </li>
              <li>
                <span className="text-white/90 font-semibold">
                  캐릭터/크리쳐
                </span>
                : 프로필은 얼굴/전신, 메인은 “대표 장면”, 서브는 변형/소품/관계
                컷으로 구성하면 좋아요.
              </li>
              <li>
                이미지는 가능하면{" "}
                <span className="text-white/90 font-semibold">WebP</span> 또는
                적당한 해상도로(예: 1920px 이하) 올리면 용량 관리가 쉬워요.
              </li>
            </ul>
          </GuideSection>

          <GuideSection title="3) 저장 방식(중요)">
            <div className="space-y-2 text-white/70">
              <p>
                이 앱은 서버 없이 동작해요. 편집 중{" "}
                <span className="text-white/90 font-semibold">이미지</span>는{" "}
                <span className="text-white/90 font-semibold">
                  IndexedDB(로컬)
                </span>
                에 저장되고, 데이터(JSON)는{" "}
                <span className="text-white/90 font-semibold">
                  localStorage
                </span>
                에 저장됩니다.
              </p>
              <p>
                다른 PC/브라우저에서 이어서 작업하려면{" "}
                <span className="text-white/90 font-semibold">
                  내보내기(ZIP)
                </span>
                로 백업한 뒤, 다른 환경에서{" "}
                <span className="text-white/90 font-semibold">
                  ZIP 가져오기
                </span>
                로 복원하세요.
              </p>
            </div>
          </GuideSection>

          <GuideSection title="4) 전시용 빌드 절차">
            <ol className="list-decimal pl-5 space-y-1 text-white/70">
              <li>
                사이드바(또는 설정)에서{" "}
                <span className="text-white/90 font-semibold">
                  내보내기(ZIP)
                </span>{" "}
                실행 →{" "}
                <span className="text-white/90 font-semibold">
                  geurim-gyeol-portfolio.zip
                </span>{" "}
                다운로드
              </li>
              <li>
                ZIP 파일을 프로젝트의{" "}
                <span className="text-white/90 font-semibold">
                  public/seed/seed.zip
                </span>
                으로 넣고 배포/빌드하세요.
              </li>
              <li>
                관람자는 첫 실행 시 자동으로 데이터가 주입되어 업로드 없이
                감상할 수 있어요.
              </li>
            </ol>

            <p className="mt-3 text-xs text-white/40">
              * 이미 해당 브라우저에 저장된 데이터가 있으면 seed 주입이 안 될 수
              있어요. 전시 확인은 시크릿 창 또는 “데이터 초기화” 후 테스트를
              권장해요.
            </p>
          </GuideSection>
        </div>
      ) : (
        <div className="space-y-6">
          <GuideSection title="관람 안내">
            <ul className="list-disc pl-5 space-y-1 text-white/70">
              <li>
                왼쪽 네비게이션에서{" "}
                <span className="text-white/90 font-semibold">
                  세계관 / 캐릭터 / 크리쳐
                </span>{" "}
                페이지로 이동해 주세요.
              </li>
              <li>각 카드(썸네일)를 눌러 상세 정보를 확인할 수 있어요.</li>
              <li>페이지마다 연출을 비교하며 감상해 주세요.</li>
            </ul>
          </GuideSection>

          <GuideSection title="추천 감상 순서">
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
          </GuideSection>

          <p className="text-xs text-white/40 pb-2">
            ※ 이 페이지는 감상 전용으로 제공됩니다.
          </p>
        </div>
      )}
    </div>
  );
}
