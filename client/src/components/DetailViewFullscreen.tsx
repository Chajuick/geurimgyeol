import React, { useEffect, useMemo, useState } from "react";
import ProfileCard from "@/components/ui/profile-card";
import { useResolvedImage } from "@/hooks/useResolvedImage";
import type { EntityBase } from "@/types";

function getPrimaryColor(symbolColors: any): string | null {
    if (!symbolColors) return null;

    // 배열인 경우
    if (Array.isArray(symbolColors)) {
        const c = symbolColors.find((v) => v?.hex);
        return c?.hex ?? null;
    }

    // 객체 하나인 경우
    if (typeof symbolColors === "object") {
        if ("hex" in symbolColors) return (symbolColors as any).hex ?? null;
    }

    return null;
}

export default function EntityDetailFullscreen<T extends EntityBase>(props: {
    entity: T;
    viewSubIndex: number;
    setViewSubIndex: React.Dispatch<React.SetStateAction<number>>;
    onClose: () => void;
    backText?: string;
}) {
    const { entity, viewSubIndex, setViewSubIndex, onClose } = props;

    const main = useResolvedImage(entity.mainImage || "");
    const sub = useResolvedImage(entity.subImages?.[viewSubIndex]?.image || "");
    const profile = useResolvedImage(entity.profileImage || "");

    const primaryHex = getPrimaryColor(entity.symbolColors);

    const [showSubOnMain, setShowSubOnMain] = useState(false);
    const [mounted, setMounted] = useState(false);

    const [imgAnimKey, setImgAnimKey] = useState(0);
    const [shadowOn, setShadowOn] = useState(false);

    const displayed = showSubOnMain && sub ? sub : main;

    useEffect(() => {
        const t = requestAnimationFrame(() => setMounted(true));
        return () => cancelAnimationFrame(t);
    }, []);

    useEffect(() => {
        // displayed가 바뀔 때마다: 1) 이미지 슬라이드 2) 그림자 스윕
        if (!displayed) return;
        setShadowOn(false);
        setImgAnimKey((k) => k + 1);

        const t = window.setTimeout(() => setShadowOn(true), 260); // ✅ 이미지 들어온 뒤
        return () => window.clearTimeout(t);
    }, [displayed]);

    useEffect(() => {
        if (!entity.subImages?.length) setShowSubOnMain(false);
    }, [entity.subImages?.length]);


    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    const onClickProfile = () => {
        if (!entity.subImages?.length) return;
        setShowSubOnMain((v) => !v);
    };

    // symbolColors가 배열/객체 섞여도 안전하게: "배지 리스트"는 배열일 때만
    const symbolColors = useMemo(() => {
        if (!entity.symbolColors) return [];
        if (Array.isArray(entity.symbolColors)) return entity.symbolColors.filter((c) => c?.hex);
        if (typeof entity.symbolColors === "object" && (entity.symbolColors as any).hex) return [entity.symbolColors];
        return [];
    }, [entity.symbolColors]);

    return (
        <div className="fixed inset-0 z-[9999]">
            {/* 클릭 닫기 */}
            <div className="absolute inset-0" onClick={onClose} />

            <div className="absolute inset-0 text-white overflow-hidden">
                {/* ✅ 배경(사선 애니) */}
                <div className="absolute inset-0 pointer-events-none">
                    {/* base */}
                    <div className="absolute inset-0 bg-zinc-900" />

                    {/* 사선 1 (진회색) - 먼저 */}
                    <div
                        className={[
                            "absolute inset-0 transition-all duration-500 ease-out will-change-transform",
                            mounted ? "opacity-100 translate-x-0" : "opacity-0 translate-x-[80px]",
                        ].join(" ")}
                        style={{
                            transitionDelay: "80ms",
                            background: "rgba(40,40,40,1)",
                            clipPath: "polygon(58% 0, 86% 0, 62% 100%, 35% 100%)",
                        }}
                    />

                    {/* 사선 2 (더 진한) - 다음 */}
                    <div
                        className={[
                            "absolute inset-0 transition-all duration-500 ease-out will-change-transform",
                            mounted ? "opacity-100 translate-x-0" : "opacity-0 translate-x-[110px]",
                        ].join(" ")}
                        style={{
                            transitionDelay: "220ms",
                            background: "rgba(24,24,24,1)",
                            clipPath: "polygon(73% 0, 100% 0, 100% 100%, 50% 100%)",
                        }}
                    />

                    {/* 은은한 깊이감 */}
                    <div
                        className="absolute inset-0"
                        style={{
                            background:
                                "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(0,0,0,0) 35%, rgba(0,0,0,0.25))",
                            mixBlendMode: "overlay",
                            opacity: 0.6,
                        }}
                    />
                </div>

                {/* ✅ 컨텐츠 래퍼: 사선 깔린 뒤 올라오게 */}
                <div
                    className={[
                        "relative z-10 transition-all duration-700",
                        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
                    ].join(" ")}
                    style={{ transitionDelay: "520ms" }}
                >
                    {/* 하단 그라데이션 */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <div
                            className="absolute bottom-0 left-0 right-0 h-[45%]"
                            style={{
                                background:
                                    "linear-gradient(to top, rgba(0,0,0,0.95), rgba(0,0,0,0.6), transparent)",
                            }}
                        />
                    </div>

                    {/* 상단바(현재 비어있음) */}
                    <div className="px-6 h-[60px] flex items-end justify-end relative" />

                    {/* 본문 */}
                    <div className="relative h-[calc(100vh-60px)] py-6">
                        <div className="h-full max-h-[100vh] grid grid-cols-12 gap-6">
                            <div className="col-span-1 hidden lg:block" />

                            {/* LEFT */}
                            <div className="h-full col-span-12 lg:col-span-5 flex flex-col justify-start">
                                <div className="relative">
                                    <div className="w-full flex items-center justify-center h-[calc(100vh-120px)]" key={displayed}>
                                        {displayed ? (
                                            <div
                                                key={imgAnimKey} // ✅ 바뀔 때마다 애니메이션 재실행
                                                className="entityFxWrap"
                                                style={
                                                    primaryHex
                                                        ? ({
                                                            ["--glow" as any]: `${primaryHex}55`, // 좀 더 진하게(원하면 33)
                                                        } as React.CSSProperties)
                                                        : undefined
                                                }
                                            >
                                                <div className="entityInner">
                                                    {/* ✅ 글로우(그림자) 레이어 */}
                                                    <div
                                                        className={[
                                                            "entityGlow",
                                                            shadowOn ? "entityGlow--on" : "",
                                                        ].join(" ")}
                                                        style={{
                                                            // ✅ 이미지 모양대로 마스킹 (displayed가 base64든 url이든 OK)
                                                            WebkitMaskImage: `url("${displayed}")`,
                                                            maskImage: `url("${displayed}")`,
                                                        }}
                                                    />

                                                    {/* ✅ 실제 이미지 */}
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
                                                background: "radial-gradient(ellipse at center, rgba(0,0,0,0.8), transparent)",
                                            }}
                                        />
                                    </div>

                                    <div className="absolute left-0 bottom-0 p-4 space-y-3 translate-x-[20%]">
                                        <div className="text-3xl font-semibold tracking-tight">{entity.name}</div>

                                        <div className="flex flex-wrap gap-2">
                                            {(entity.subCategories || []).map((t) => (
                                                <span
                                                    key={t}
                                                    className="px-3 h-7 inline-flex items-center rounded-full bg-white/10 border border-white/10 text-xs text-white/80"
                                                >
                                                    {t}
                                                </span>
                                            ))}
                                            {(entity.subCategories || []).length === 0 && (
                                                <span className="text-xs text-white/35">태그 없음</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* MIDDLE */}
                            <div className="col-span-12 lg:col-span-2 flex flex-col justify-end">
                                <button
                                    type="button"
                                    onClick={onClickProfile}
                                    className="text-left"
                                    title={entity.subImages?.length ? "클릭: 메인/서브 토글" : ""}
                                >
                                    <ProfileCard name={entity.name} imageUrl={profile} className="mb-12 max-w-45" />
                                </button>
                            </div>

                            {/* RIGHT */}
                            <div
                                className={[
                                    "col-span-12 lg:col-span-4 mr-6 mb-12",
                                    "relative overflow-hidden rounded-3xl",
                                    "bg-zinc-950/35 backdrop-blur-2xl",
                                    "border border-white/10 ring-1 ring-white/5",
                                    "shadow-[0_18px_70px_rgba(0,0,0,0.65)]",
                                ].join(" ")}
                            >
                                {symbolColors.length > 0 && (
                                    <div className="mb-5 rounded-2xl p-4">
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {symbolColors.map((c: any, idx: number) => (
                                                <div
                                                    key={c.hex || `${c.hex}-${idx}`}
                                                    className="flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 h-9"
                                                    title={c.name ? `${c.name} (${c.hex})` : c.hex}
                                                >
                                                    <span
                                                        className="w-4 h-4 rounded-full border border-white/20"
                                                        style={{ backgroundColor: c.hex }}
                                                    />
                                                    <span className="text-xs text-white/85">{c.name || "이름 없음"}</span>
                                                    <span className="text-[11px] text-white/35">{c.hex}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="px-4 shrink-0 lg:max-h-[240px] lg:min-h-[180px] lg:overflow-auto lg:pr-1 scroll-dark">
                                    <p className="text-sm text-white/70 text-left leading-relaxed whitespace-pre-wrap max-h-[180px] lg:max-h-none overflow-auto lg:overflow-visible">
                                        {entity.description || "설명이 없습니다"}
                                    </p>
                                </div>

                                <div className="px-4 mt-6 space-y-4 pb-6">
                                    {entity.subImages?.length > 0 ? (
                                        <>
                                            <div className="overflow-x-auto pb-2 scroll-dark">
                                                <div className="flex gap-3 min-w-max">
                                                    {entity.subImages.map((s, idx) => {
                                                        const active = idx === viewSubIndex;
                                                        return (
                                                            <button
                                                                key={idx}
                                                                type="button"
                                                                onClick={() => {
                                                                    setViewSubIndex(idx);
                                                                    setShowSubOnMain(true);
                                                                }}
                                                                className={[
                                                                    "w-32 rounded-xl overflow-hidden border transition flex-shrink-0",
                                                                    active ? "border-white/40 bg-white/10" : "border-white/10 bg-white/5 hover:border-white/25",
                                                                ].join(" ")}
                                                                title="클릭: 메인에 표시"
                                                            >
                                                                <div className="aspect-[4/4] bg-black/30 flex items-center justify-center">
                                                                    <SubThumbInner image={s.image} alt={`sub-${idx}`} />
                                                                </div>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            <div className="shrink-0 lg:max-h-[240px] lg:min-h-[180px] lg:overflow-auto lg:pr-1 scroll-dark mt-10">
                                                <p className="text-sm text-white/70 text-left leading-relaxed whitespace-pre-wrap max-h-[180px] lg:max-h-none overflow-auto lg:overflow-visible">
                                                    {entity.subImages[viewSubIndex]?.description || "설명이 없습니다"}
                                                </p>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-white/40 text-sm">서브 이미지가 없습니다.</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div
                            className="absolute left-1/2 -translate-x-1/2 top-[-12px] text-xs text-white transition-opacity duration-700 cursor-pointer opacity-40 hover:opacity-80"
                            onClick={onClose}
                        >
                            ESC를 누르거나 클릭하여 돌아가기
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SubThumbInner(props: { image: string; alt?: string }) {
    const { image, alt = "sub" } = props;
    const resolved = useResolvedImage(image || "");

    if (!resolved) {
        return <div className="w-full h-full grid place-items-center text-white/30 text-xs">NO</div>;
    }

    return <img src={resolved} alt={alt} loading="lazy" decoding="async" className="w-full h-full object-contain" />;
}