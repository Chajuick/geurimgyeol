import { cx } from "class-variance-authority";

/** 공용 input */
export const inputCls = cx(
  "w-full h-10 px-3 rounded-xl",
  "bg-black/25 text-white",
  "border border-white/10",
  "placeholder:text-white/30",
  "outline-none",
  "focus:ring-2 focus:ring-white/15 focus:border-white/20",
  "transition"
);

/** 공용 textarea */
export const textareaCls = cx(
  "w-full min-h-28 p-3 rounded-xl",
  "bg-black/25 text-white",
  "border border-white/10",
  "placeholder:text-white/30",
  "outline-none",
  "focus:ring-2 focus:ring-white/15 focus:border-white/20",
  "transition",
  "resize-none"
);