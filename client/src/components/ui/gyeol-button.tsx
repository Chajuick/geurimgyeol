import * as React from "react";
import { cn } from "@/lib/utils";

type GButtonVariant = "neutral" | "primary" | "danger" | "ghost" | "onlyText";
type GButtonSize = "sm" | "md" | "icon";

type Props = {
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  icon?: React.ReactNode;
  text?: string;
  variant?: GButtonVariant;
  size?: GButtonSize;
  disabled?: boolean;
  title?: string;
  type?: "button" | "submit" | "reset";
  className?: string;
};

const SIZE: Record<GButtonSize, string> = {
  sm: "gyeol-button--sm",
  md: "gyeol-button--md",
  icon: "gyeol-button--icon",
};

function tokens(variant: GButtonVariant) {
  // ✅ 흰/검 배경 어디서든 보이는 neutral 기본
  const neutral = {
    bg: "rgba(32,32,40,0.86)", // 🔥 더 밝은 딥톤
    fg: "rgba(255,255,255,0.94)",

    bd: "rgba(255,255,255,0.26)", // 🔥 외곽선 강화
    in: "rgba(0,0,0,0.55)", // 🔥 내부 대비 증가

    hbg: "rgba(40,40,50,0.92)",
    hbd: "rgba(255,255,255,0.38)",

    glow: "rgba(255,255,255,0.12)",
  };
  if (variant === "primary")
    return {
      // 🔶 WARN tone (amber)
      bg: "rgba(245,158,11,0.16)", // amber-500 tint
      fg: "rgba(255,251,235,0.95)", // amber-50~100 계열

      bd: "rgba(253,224,71,0.32)", // amber-300 border
      in: "rgba(0,0,0,0.28)",

      hbg: "rgba(245,158,11,0.24)", // hover 더 밝게
      hbd: "rgba(253,224,71,0.48)",

      glow: "rgba(245,158,11,0.20)", // amber glow
    };

  if (variant === "danger")
    return {
      bg: "rgba(239,68,68,0.16)",
      fg: "rgba(255,255,255,0.94)",
      bd: "rgba(252,165,165,0.30)",
      in: "rgba(0,0,0,0.28)",
      hbg: "rgba(239,68,68,0.22)",
      hbd: "rgba(252,165,165,0.42)",
      glow: "rgba(239,68,68,0.18)",
    };

  return neutral;
}

export default function GButton({
  onClick,
  icon,
  text,
  variant = "neutral",
  size = "md",
  disabled = false,
  title,
  type = "button",
  className,
}: Props) {
  const isIconOnly = size === "icon" || (!!icon && !text);
  const v = tokens(variant);

  const rootVariantClass =
    variant === "onlyText"
      ? "gyeol-button--onlyText"
      : variant === "ghost"
        ? "gyeol-button--ghost"
        : "gyeol-button--solid";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title || text}
      className={cn(
        "group gyeol-button [contain:paint]",
        SIZE[size],
        isIconOnly ? "gyeol-button--iconOnly" : "",
        rootVariantClass,
        className
      )}
      style={
        variant === "onlyText"
          ? undefined
          : ({
              ["--g-bg" as any]: v.bg,
              ["--g-fg" as any]: v.fg,
              ["--g-bd" as any]: v.bd,
              ["--g-in" as any]: v.in,
              ["--g-hbg" as any]: v.hbg,
              ["--g-hbd" as any]: v.hbd,
              ["--g-glow" as any]: v.glow,
            } as React.CSSProperties)
      }
    >
      {/* frame / fx (onlyText는 제외) */}
      {variant !== "onlyText" && (
        <>
          <span aria-hidden className="gyeol-button__frame" />
          {variant !== "ghost" && (
            <span aria-hidden className="gyeol-button__top" />
          )}
          <span aria-hidden className="gyeol-button__glow" />
          <span aria-hidden className="gyeol-button__focus" />
        </>
      )}

      <span
        className={cn(
          "relative inline-flex items-center justify-center",
          isIconOnly ? "" : "gap-2"
        )}
      >
        {icon ? (
          <span
            className={cn(
              "inline-flex items-center justify-center",
              isIconOnly ? "" : "-ml-0.5"
            )}
          >
            {icon}
          </span>
        ) : null}
        {text ? <span className="whitespace-nowrap">{text}</span> : null}
      </span>
    </button>
  );
}
