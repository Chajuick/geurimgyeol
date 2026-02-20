import * as React from "react";
import { cn } from "@/lib/utils";

type Props = {
  value: number;
  onChange: (v: number) => void;

  min?: number;
  max?: number;
  step?: number;

  disabled?: boolean;
  className?: string;
};

export default function NumberBox({
  value,
  onChange,
  min = -Infinity,
  max = Infinity,
  step = 1,
  disabled,
  className,
}: Props) {
  const clamp = (v: number) => Math.min(max, Math.max(min, v));

  const dec = () => {
    if (disabled) return;
    onChange(clamp(value - step));
  };

  const inc = () => {
    if (disabled) return;
    onChange(clamp(value + step));
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;

    // 빈 값 허용 → 0 처리
    if (raw === "") {
      onChange(0);
      return;
    }

    const num = Number(raw);
    if (!Number.isNaN(num)) onChange(clamp(num));
  };

  return (
    <div
      className={cn(
        "flex items-center gap-2",
        disabled && "opacity-50 pointer-events-none",
        className
      )}
    >
      {/* − 버튼 */}
      <button
        type="button"
        onClick={dec}
        className="
          w-9 h-9 rounded-xl
          bg-white/5 border border-white/15
          text-white/70
          flex items-center justify-center
          hover:bg-white/10 hover:text-white
          transition
        "
      >
        −
      </button>

      {/* 숫자 입력 */}
      <input
        value={value}
        onChange={handleInput}
        inputMode="numeric"
        className="
          w-16 text-center
          rounded-xl
          bg-black/25 border border-white/15
          text-white
          outline-none
          focus:ring-2 focus:ring-white/20
          transition
        "
      />

      {/* + 버튼 */}
      <button
        type="button"
        onClick={inc}
        className="
          w-9 h-9 rounded-xl
          bg-white/5 border border-white/15
          text-white/70
          flex items-center justify-center
          hover:bg-white/10 hover:text-white
          transition
        "
      >
        +
      </button>
    </div>
  );
}
