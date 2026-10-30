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

type ButtonTokens = {
  bg: string;
  fg: string;
  bd: string;
  hbg: string;
  hbd: string;
  hfg?: string;
  shadow?: string;
};

const TOKENS: Record<GButtonVariant, ButtonTokens> = {
  // 기본: 은은한 유리 톤
  neutral: {
    bg: "rgba(255,255,255,0.05)",
    fg: "rgba(255,255,255,0.88)",
    bd: "rgba(255,255,255,0.09)",
    hbg: "rgba(255,255,255,0.09)",
    hbd: "rgba(255,255,255,0.16)",
    hfg: "#fff",
    shadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
  },
  // 주요 액션: 브랜드 톤 유리 (눈에 띄되 튀지 않게)
  primary: {
    bg: "rgba(165,180,252,0.12)",
    fg: "rgb(224,231,255)",
    bd: "rgba(165,180,252,0.26)",
    hbg: "rgba(165,180,252,0.2)",
    hbd: "rgba(165,180,252,0.42)",
    hfg: "#fff",
    shadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
  },
  danger: {
    bg: "rgba(248,113,113,0.1)",
    fg: "rgb(252,165,165)",
    bd: "rgba(248,113,113,0.2)",
    hbg: "rgba(248,113,113,0.18)",
    hbd: "rgba(248,113,113,0.35)",
    hfg: "rgb(254,202,202)",
  },
  ghost: {
    bg: "transparent",
    fg: "rgba(255,255,255,0.7)",
    bd: "rgba(255,255,255,0.1)",
    hbg: "rgba(255,255,255,0.06)",
    hbd: "rgba(255,255,255,0.16)",
    hfg: "#fff",
  },
  onlyText: {
    bg: "transparent",
    fg: "rgba(255,255,255,0.6)",
    bd: "transparent",
    hbg: "transparent",
    hbd: "transparent",
    hfg: "#fff",
  },
};

function toStyle(t: ButtonTokens): React.CSSProperties {
  const vars: Record<string, string> = {
    "--g-bg": t.bg,
    "--g-fg": t.fg,
    "--g-bd": t.bd,
    "--g-hbg": t.hbg,
    "--g-hbd": t.hbd,
  };
  if (t.hfg) vars["--g-hfg"] = t.hfg;
  if (t.shadow) vars["--g-shadow"] = t.shadow;
  return vars as React.CSSProperties;
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

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title || text}
      className={cn(
        "gyeol-button",
        SIZE[size],
        isIconOnly && "gyeol-button--iconOnly",
        className
      )}
      style={toStyle(TOKENS[variant])}
    >
      {icon ? (
        <span
          className={cn(
            "inline-flex items-center justify-center [&_svg]:shrink-0",
            !isIconOnly && "-ml-0.5"
          )}
        >
          {icon}
        </span>
      ) : null}
      {text ? <span>{text}</span> : null}
    </button>
  );
}
