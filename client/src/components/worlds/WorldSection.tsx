import * as React from "react";

/** 좌측 제목 열 + 우측 내용 열을 공유하는 세로 섹션 (세계관 목록/상세 공용) */
export default function WorldSection({
  title,
  caption,
  action,
  children,
}: {
  title: string;
  caption?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)] gap-x-10 gap-y-5 border-t border-white/[0.07] pt-8 sm:pt-10">
      <div className="flex lg:flex-col items-start justify-between lg:justify-start gap-3">
        <div>
          <h3 className="flex items-center gap-2.5 text-lg font-semibold tracking-[-0.01em] text-white/95 font-sans">
            <span aria-hidden className="h-4 w-[3px] rounded-full bg-brand" />
            {title}
          </h3>
          {caption && (
            <div className="mt-1.5 pl-[13px] text-xs text-white/40">
              {caption}
            </div>
          )}
        </div>
        {action && <div className="lg:mt-2 lg:pl-[13px]">{action}</div>}
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}
