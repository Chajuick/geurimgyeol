import React from "react";
import type { EntityBase } from "@/types";
import { Pencil } from "lucide-react";
import MiddlePanel from "./MiddlePanel";
import OverflowMarquee from "@/components/ui/overflow-marquee";

export default function LeftPanel<T extends EntityBase>(props: {
  entity: T;
  editable: boolean;
  subCategories: string[];

  displayed: string;
  primaryHex: string | null;

  imgAnimKey: number;
  shadowOn: boolean;
  mounted: boolean;

  onOpenBasic: () => void;

  profileUrl: any;
  onClickProfile: any;
}) {
  const {
    entity,
    editable,
    subCategories,
    displayed,
    primaryHex,
    imgAnimKey,
    shadowOn,
    onOpenBasic,
    profileUrl,
    onClickProfile,
  } = props;

  return (
    <div className="relative w-full h-[100svh]">
      {/* ✅ 이미지 영역: 모바일은 화면 전체 배경 / 데스크탑은 좌측 큰 영역 느낌 */}
      <div className="absolute inset-0">
        {displayed ? (
          <div
            key={imgAnimKey}
            className="w-full h-full entityFxWrap items-start md:place-items-center"
            style={
              primaryHex
                ? ({
                    ["--glow" as any]: `${primaryHex}55`,
                  } as React.CSSProperties)
                : undefined
            }
          >
            <div className="entityInner pt-4 md:p-0">
              <div
                className={[
                  "entityGlow",
                  shadowOn ? "entityGlow--on" : "",
                ].join(" ")}
                style={{
                  WebkitMaskImage: `url("${displayed}")`,
                  maskImage: `url("${displayed}")`,
                }}
              />
              <img
                src={displayed}
                alt="main"
                loading="eager"
                decoding="async"
                className={[
                  "entityImg w-full max-h-[100svh] object-contain lg:pt-10 object-top pt-4 md:pt-0",
                  // ✅ PC에서 너무 커지지 않게 제한
                  "lg:max-w-[820px] lg:mx-auto",
                  "lg:entityImg",
                ].join(" ")}
              />
            </div>
          </div>
        ) : (
          <div className="w-full h-full grid place-items-center text-sm text-white/40">
            이미지 없음
          </div>
        )}

        {/* ✅ 아래 그라디언트(모바일에서 시트 가독성 확보) */}
        <div className="absolute inset-x-0 bottom-[50vh] h-[60%] pointer-events-none lg:bottom-0">
          {/* ✅ 모바일용 (약함) */}
          <div
            className="absolute inset-0 lg:hidden"
            style={{
              background:
                "linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.1) 45%, transparent)",
            }}
          />

          {/* ✅ PC용 (기존 강도) */}
          <div
            className="absolute inset-0 hidden lg:block"
            style={{
              background:
                "linear-gradient(to top, rgba(0,0,0,0.92), rgba(0,0,0,0.55) 45%, transparent)",
            }}
          />
        </div>

        {/* ✅ 이름/태그: 모바일은 좌하단, 데스크탑은 기존처럼 살짝 안쪽 */}
        <div
          className={[
            "absolute left-2 lg:left-1/2 lg:-translate-x-1/2 bottom-[50vh] z-20",
            "lg:bottom-10",
            "max-w-[calc(100svw-1rem)] lg:max-w-[calc(100vw-520px)]",
          ].join(" ")}
        >
          <div className="flex flex-row items-end">
            <div className="mr-4 flex-shrink-0">
              <MiddlePanel
                entity={entity}
                profileUrl={profileUrl}
                onClickProfile={onClickProfile}
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <div className="min-w-0 flex-1">
                  <OverflowMarquee active={true} className="w-full">
                    <span className="marquee-text name font-display text-4xl lg:text-5xl font-semibold tracking-[-0.02em] drop-shadow-[0_4px_20px_rgba(0,0,0,0.6)]">
                      {entity.name}
                    </span>
                  </OverflowMarquee>
                </div>

                {editable && (
                  <button
                    type="button"
                    onClick={onOpenBasic}
                    className="h-9 w-9 shrink-0 rounded-full bg-black/40 border border-white/15 backdrop-blur-md hover:bg-white/15 transition-colors grid place-items-center"
                    title="기본 정보 편집"
                  >
                    <Pencil className="w-4 h-4 text-white/80" />
                  </button>
                )}
              </div>

              <div className="mt-3 mb-1 flex flex-wrap gap-1.5">
                {subCategories?.length ? (
                  subCategories.map(t => (
                    <span
                      key={t}
                      className="inline-flex items-center h-6 px-2.5 rounded-full bg-white/10 border border-white/10 backdrop-blur text-[11px] text-white/80"
                    >
                      {t}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-white/40">태그 없음</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
