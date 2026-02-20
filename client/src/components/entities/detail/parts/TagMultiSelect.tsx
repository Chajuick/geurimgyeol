import React, { useMemo, useState } from "react";
import { Check, Search, Tags, X } from "lucide-react";

export default function TagMultiSelect(props: {
  label?: string;
  options: string[];
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const { label = "태그", options, value, onChange } = props;
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    const base = (options || []).filter(Boolean);
    if (!qq) return base.slice(0, 200);
    return base.filter(t => t.toLowerCase().includes(qq)).slice(0, 200);
  }, [options, q]);

  const toggle = (t: string) => {
    const has = value.includes(t);
    const next = has ? value.filter(x => x !== t) : [...value, t];
    onChange(next);
  };

  const remove = (t: string) => onChange(value.filter(x => x !== t));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-white/60">{label}</p>
        <button
          type="button"
          onClick={() => setOpen(v => !v)}
          className="h-9 px-3 rounded-xl bg-white/10 border border-white/10 hover:bg-white/15 transition text-xs inline-flex items-center gap-2"
          title="태그 선택"
        >
          <Tags className="w-4 h-4" />
          {open ? "닫기" : "선택"}
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {value.length === 0 ? (
          <span className="text-xs text-white/35">선택된 태그 없음</span>
        ) : (
          value.map(t => (
            <button
              key={t}
              type="button"
              onClick={() => remove(t)}
              className="px-3 h-8 rounded-full bg-white/10 border border-white/10 hover:bg-white/15 transition inline-flex items-center gap-2 text-xs"
              title="클릭: 제거"
            >
              <span className="text-white/85">{t}</span>
              <X className="w-3.5 h-3.5 text-white/60" />
            </button>
          ))
        )}
      </div>

      {open && (
        <div className="mt-2 rounded-2xl border border-white/10 bg-black/25 overflow-hidden">
          <div className="p-3 border-b border-white/10 flex items-center gap-2">
            <Search className="w-4 h-4 text-white/50" />
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-black/25 border border-white/10 text-white outline-none focus:ring-2 focus:ring-white/20"
              placeholder="카테고리 검색"
            />
          </div>

          {options.length === 0 ? (
            <div className="p-4 text-sm text-white/40">
              카테고리가 존재 하지 않습니다! 서브 카테고리를 추가해주세요.
            </div>
          ) : (
            <div className="max-h-[260px] overflow-y-auto p-2 scroll-dark">
              {filtered.length === 0 ? (
                <div className="p-4 text-sm text-white/40">검색 결과 없음</div>
              ) : (
                <div className="space-y-1">
                  {filtered.map(t => {
                    const checked = value.includes(t);
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => toggle(t)}
                        className={[
                          "w-full h-11 px-3 rounded-xl",
                          "flex items-center justify-between",
                          "border transition",
                          checked
                            ? "bg-white/10 border-white/25"
                            : "bg-black/20 border-white/10 hover:border-white/20 hover:bg-white/5",
                        ].join(" ")}
                      >
                        <span className="text-sm text-white/85">{t}</span>
                        <span
                          className={[
                            "h-6 w-6 rounded-lg grid place-items-center border",
                            checked
                              ? "border-white/30 bg-white/10"
                              : "border-white/10 bg-black/20",
                          ].join(" ")}
                        >
                          {checked && (
                            <Check className="w-4 h-4 text-white/85" />
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
