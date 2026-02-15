import * as React from "react";
import { cn } from "@/lib/utils";

type GButtonVariant = "onlyText" | "default" | "danger" | "primary" | "dark" | "ghost";
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

const sizeClass: Record<GButtonSize, string> = {
  sm: "h-9 px-3 text-sm rounded-xl",
  md: "h-10 px-4 text-sm rounded-xl",
  icon: "h-11 w-11 p-0 rounded-2xl",
};

// ✅ 게임 UI: variant별 “톤 + 글로우 컬러”
// - primary/danger만 컬러 강조
// - default/ghost/dark는 금속/유리 느낌
const variantClass: Record<GButtonVariant, string> = {
  onlyText:
    "bg-transparent border border-transparent text-white/80 hover:text-white",

  default:
    cn(
      "bg-white/[0.08] text-white border border-white/12",
      "hover:bg-white/[0.12] hover:border-white/18"
    ),

  ghost:
    cn(
      "bg-transparent text-white/85 border border-white/10",
      "hover:bg-white/[0.06] hover:border-white/16"
    ),

  dark:
    cn(
      "bg-zinc-950/80 text-white border border-white/10",
      "hover:bg-zinc-950/90 hover:border-white/16"
    ),

  primary:
    cn(
      "bg-blue-500/15 text-white border border-blue-400/30",
      "hover:bg-blue-500/20 hover:border-blue-300/40",
      "shadow-[0_0_0_1px_rgba(59,130,246,0.10),0_18px_60px_rgba(0,0,0,0.55)]"
    ),

  danger:
    cn(
      "bg-red-500/55 text-white border border-red-400/30",
      "hover:bg-red-500/20 hover:border-red-300/40",
      "shadow-[0_0_0_1px_rgba(239,68,68,0.10),0_18px_60px_rgba(0,0,0,0.55)]"
    ),
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

  // ✅ variant별 glow(hover/focus)
  const glow =
    variant === "primary"
      ? "rgba(59,130,246,0.35)"
      : variant === "danger"
      ? "rgba(239,68,68,0.35)"
      : "rgba(255,255,255,0.18)";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title || text}
      className={cn(
        // base: 게임 UI 버튼 프레임
        "group relative inline-flex items-center justify-center gap-2 font-medium",
        "select-none transition duration-200",
        "outline-none",
        "disabled:opacity-45 disabled:pointer-events-none",

        // ✅ “툭 튀는 hover lift” 대신 살짝만
        "transform-gpu",
        "hover:-translate-y-[1px] active:translate-y-0",

        // ✅ 프레임+유리 질감
        "backdrop-blur-md",
        "shadow-[0_18px_60px_rgba(0,0,0,0.55)]",

        // ✅ 포커스: 링 대신 은은한 라인+글로우
        "focus-visible:ring-1 focus-visible:ring-white/25",
        "focus-visible:shadow-[0_0_0_1px_rgba(255,255,255,0.12),0_0_0_4px_rgba(255,255,255,0.06)]",

        // skin
        variantClass[variant],

        // size
        sizeClass[size],

        // icon-only이면 gap 제거
        isIconOnly ? "gap-0" : "",

        className
      )}
      style={
        // ✅ hover 글로우를 스타일로 (tailwind 커스텀 없이)
        {
          ["--gbtn-glow" as any]: glow,
        } as React.CSSProperties
      }
    >
      {/* ✅ top highlight line */}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 rounded-[inherit]",
          "before:absolute before:inset-0 before:rounded-[inherit]",
          "before:bg-gradient-to-b before:from-white/12 before:to-transparent before:opacity-60"
        )}
      />

      {/* ✅ hover 'shine sweep' */}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]",
          "opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        )}
      >
        <span
          className={cn(
            "absolute -left-1/2 top-0 h-full w-1/2",
            "bg-gradient-to-r from-transparent via-white/18 to-transparent",
            "rotate-12",
            "translate-x-0 group-hover:translate-x-[220%] transition-transform duration-500 ease-out"
          )}
        />
      </span>

      {/* ✅ hover glow (primary/danger stronger) */}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute -inset-2 rounded-[inherit] blur-xl",
          "opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        )}
        style={{
          background: `radial-gradient(circle at 50% 50%, var(--gbtn-glow), transparent 60%)`,
        }}
      />

      {icon ? (
        <span className={cn("relative inline-flex items-center justify-center", isIconOnly ? "" : "-ml-0.5")}>
          {icon}
        </span>
      ) : null}

      {text ? <span className="relative whitespace-nowrap">{text}</span> : null}
    </button>
  );
}