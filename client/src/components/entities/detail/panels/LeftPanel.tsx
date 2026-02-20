import React from "react";
import type { EntityBase } from "@/types";
import { Pencil } from "lucide-react";

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
  } = props;

  return (
    <div className="h-full col-span-12 lg:col-span-5 flex flex-col justify-start">
      <div className="relative">
        <div
          className="w-full flex items-center justify-center h-[calc(100vh-120px)]"
          key={displayed}
        >
          {displayed ? (
            <div
              key={imgAnimKey}
              className="entityFxWrap"
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
                  className="entityImg"
                />
              </div>
            </div>
          ) : (
            <div className="text-sm text-white/40">이미지 없음</div>
          )}

          <div
            className="absolute left-1/2 bottom-6 -translate-x-1/2 w-[420px] h-[80px] rounded-full blur-2xl opacity-60"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(0,0,0,0.8), transparent)",
            }}
          />
        </div>

        <div className="absolute left-0 bottom-0 p-4 space-y-3 translate-x-[20%] w-[520px] max-w-[80vw]">
          <div className="flex items-center gap-2">
            <div className="text-3xl font-semibold tracking-tight">
              {entity.name}
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

          <div className="flex flex-wrap gap-2">
            {(subCategories || []).map(t => (
              <span
                key={t}
                className="px-3 h-7 inline-flex items-center rounded-full bg-white/10 border border-white/10 text-xs text-white/80"
              >
                {t}
              </span>
            ))}
            {(subCategories || []).length === 0 && (
              <span className="text-xs text-white/35">태그 없음</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
