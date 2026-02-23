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
    onClickProfile
  } = props;

  return (
    <div className="relative w-full h-[100svh]">
      {/* ✅ 이미지 영역: 모바일은 화면 전체 배경 / 데스크탑은 좌측 큰 영역 느낌 */}
      <div className="absolute inset-0">
        {displayed ? (
          <div
            key={imgAnimKey}
            className="w-full h-full entityFxWrap"
            style={
              primaryHex
                ? ({
                  ["--glow" as any]: `${primaryHex}55`,
                } as React.CSSProperties)
                : undefined
            }
          >
            <div className="entityInner">
              <div
                className={["entityGlow", shadowOn ? "entityGlow--on" : ""].join(" ")}
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
                  "entityImg w-full max-h-[100svh] object-contain object-top lg:pt-10 object-top",
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
              <MiddlePanel entity={entity} profileUrl={profileUrl} onClickProfile={onClickProfile} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <div className="min-w-0 flex-1">
                  <OverflowMarquee active={true} className="w-full">
                    <span className="marquee-text name text-3xl font-extrabold">{entity.name}</span>
                  </OverflowMarquee>
                </div>

                {editable && (
                  <button
                    type="button"
                    onClick={onOpenBasic}
                    className="h-9 w-9 rounded-xl bg-white/10 border border-white/10 hover:bg-white/15 transition grid place-items-center"
                    title="기본 정보 편집"
                  >
                    <Pencil className="w-4 h-4 text-white/80" />
                  </button>
                )}
              </div>

              <div className="my-2 min-w-0">
                <OverflowMarquee active={true} className="w-full">
                  <span className="marquee-text tags text-sm">
                    {subCategories?.length ? subCategories.join(" · ") : "태그 없음"}
                  </span>
                </OverflowMarquee>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}