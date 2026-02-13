import * as React from "react";
import { cn } from "@/lib/utils";

type GButtonVariant = "default" | "danger" | "primary" | "dark" | "ghost";
type GButtonSize = "sm" | "md" | "icon";

type Props = {
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  icon?: React.ReactNode;
  text?: string; // 없어도 됨
  variant?: GButtonVariant;
  size?: GButtonSize;
  disabled?: boolean;
  title?: string;
  type?: "button" | "submit" | "reset";
  className?: string;
};

const variantClass: Record<GButtonVariant, string> = {
  // 기본(밝은 회색)
  default:
    "bg-white/90 text-zinc-900 border border-white/60 backdrop-blur " +
    "shadow-[0_2px_4px_rgba(0,0,0,0.20)] hover:shadow-[0_2px_6px_rgba(0,0,0,0.22)]",
  // 추가/강조(파랑)
  primary:
    "bg-blue-600 text-white border border-blue-500/60 " +
    "shadow-[0_10px_24px_rgba(0,0,0,0.18)]",
  // 삭제/위험(빨강)
  danger:
    "bg-red-600 text-white border border-red-500/60 " +
    "shadow-[0_10px_24px_rgba(0,0,0,0.18)]",
  // 검정 버튼
  dark:
    "bg-zinc-950 text-white border border-white/10 " +
    "shadow-[0_10px_24px_rgba(0,0,0,0.22)]",
  // 투명(배경 위 글래스 느낌)
  ghost:
    "bg-white/20 text-white backdrop-blur " +
    "shadow-[0_10px_24px_rgba(0,0,0,0.18)]",
};

const sizeClass: Record<GButtonSize, string> = {
  sm: "h-9 px-3 text-sm rounded-xl",
  md: "h-10 px-4 text-sm rounded-xl",
  icon: "h-11 w-11 p-0 rounded-4xl",
};

export default function GButton({
  onClick,
  icon,
  text,
  variant = "default",
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
        // base
        "inline-flex items-center justify-center gap-2 font-medium",
        "transition-all duration-200 select-none",
        "hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(0,0,0,0.22)]",
        "active:translate-y-0 active:shadow-[0_8px_18px_rgba(0,0,0,0.16)]",
        "focus:outline-none focus:ring-2 focus:ring-white/40",
        "disabled:opacity-50 disabled:pointer-events-none disabled:transform-none",
        // skin
        variantClass[variant],
        // size
        sizeClass[size],
        // icon-only이면 gap 제거
        isIconOnly ? "gap-0" : "",
        className
      )}
    >
      {icon ? (
        <span className={cn("inline-flex items-center justify-center", isIconOnly ? "" : "-ml-0.5")}>
          {icon}
        </span>
      ) : null}

      {text ? <span className="whitespace-nowrap">{text}</span> : null}
    </button>
  );
}