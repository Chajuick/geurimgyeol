import * as React from "react";
import {
  Menu,
  X,
  Download,
  Upload,
  RotateCcw,
  ChevronLeft,
  Pencil,
  Eye,
  Home,
  Globe2,
  UserRound,
  Sparkles,
  IdCard,
} from "lucide-react";
import { useLocation } from "wouter";
import { usePortfolioContext } from "@/contexts/PortfolioContext";
import GButton from "@/components/ui/gyeol-button";
import ConfirmModal from "@/components/ui/confirm-modal";
import { cn } from "@/lib/utils";

import LOGO_IMG from "@/assets/logo/logo.png";

// ✅ Vite: prod(build)에서는 감상모드 고정
const LOCK_VIEW_MODE = import.meta.env.PROD;

type NavItem = {
  label: string;
  path: string;
  icon: React.ComponentType<{ size?: number }>;
};

function useMediaQuery(query: string) {
  const [matches, setMatches] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);

    onChange();
    if (mql.addEventListener) mql.addEventListener("change", onChange);
    else mql.addListener(onChange);

    return () => {
      if (mql.removeEventListener) mql.removeEventListener("change", onChange);
      else mql.removeListener(onChange);
    };
  }, [query]);

  return matches;
}

function SidebarRow(props: {
  icon: React.ReactNode;
  label: string;
  collapsed: boolean;
  active?: boolean;
  onClick?: () => void;
  className?: string;
  title?: string;
  role?: "button" | "label";
  right?: React.ReactNode;
  disabled?: boolean; // ✅ 추가
}) {
  const {
    icon,
    label,
    collapsed,
    active,
    onClick,
    className,
    title,
    role = "button",
    right,
    disabled,
  } = props;

  const base = cn(
    "group relative w-full h-10 flex items-center px-3 rounded-xl",
    "transition-[background-color,color] duration-150",
    active
      ? "bg-white/[0.08] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
      : "text-white/50 hover:bg-white/[0.04] hover:text-white/90",
    disabled &&
      "opacity-50 cursor-not-allowed hover:bg-transparent hover:text-white/50",
    className
  );

  const content = (
    <>
      {/* active indicator */}
      <span
        aria-hidden
        className={cn(
          "absolute -left-3 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-brand",
          "transition-[opacity,transform] duration-200",
          active ? "opacity-100 scale-y-100" : "opacity-0 scale-y-50"
        )}
      />

      <div className="w-6 flex justify-center flex-shrink-0">{icon}</div>

      <div
        className={cn(
          "overflow-hidden transition-[max-width,opacity,margin] duration-200",
          collapsed ? "max-w-0 opacity-0" : "ml-3 max-w-[200px] opacity-100"
        )}
      >
        <span className="whitespace-nowrap text-sm font-medium">{label}</span>
      </div>

      {right}
    </>
  );

  if (role === "label") {
    return (
      <label className={base} title={title ?? label}>
        {content}
      </label>
    );
  }

  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={base}
      title={title ?? label}
      aria-disabled={disabled ? true : undefined}
    >
      {content}
    </button>
  );
}

function stripQuery(path: string) {
  return path.split("?")[0];
}

function isActivePath(location: string, basePath: string) {
  const loc = stripQuery(location);
  if (basePath === "/") return loc === "/";
  return loc === basePath || loc.startsWith(basePath + "/");
}

export default function Sidebar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isCollapsed, setIsCollapsed] = React.useState(true);

  const isDesktop = useMediaQuery("(min-width: 768px)");
  const collapsed = isDesktop ? isCollapsed : false;

  const [location, setLocation] = useLocation();
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [resetOpen, setResetOpen] = React.useState(false);

  const { editMode, setEditMode, exportToZip, importFromZip, resetData } =
    usePortfolioContext();

  const navItems = React.useMemo<NavItem[]>(
    () => [
      { label: "홈", path: "/", icon: Home },
      { label: "세계관", path: "/worlds", icon: Globe2 },
      { label: "캐릭터", path: "/characters", icon: UserRound },
      { label: "크리쳐", path: "/creatures", icon: Sparkles },
      { label: "프로필", path: "/profile", icon: IdCard },
    ],
    []
  );

  const closeMobile = React.useCallback(() => setIsOpen(false), []);
  const toggleMobile = React.useCallback(() => {
    setIsOpen(v => !v);
    setIsCollapsed(false);
  }, []);
  const toggleCollapsed = React.useCallback(() => setIsCollapsed(v => !v), []);

  const onPickZip = React.useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleImportZip = React.useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        await importFromZip(file);
      } finally {
        e.target.value = "";
      }
    },
    [importFromZip]
  );

  const onConfirmReset = React.useCallback(() => {
    setResetOpen(false);
    resetData();
  }, [resetData]);

  // ✅ 내보내기/가져오기는 편집+dev에서만 노출
  const tools = React.useMemo(
    () => [
      {
        icon: <Download size={18} />,
        label: "내보내기(.zip)",
        onClick: exportToZip,
      },
      {
        icon: <Upload size={18} />,
        label: "가져오기(.zip)",
        onClick: onPickZip,
      },
    ],
    [exportToZip, onPickZip]
  );

  // ✅ 마지막 월드 기억
  const LAST_WORLD_KEY = "gyeol:lastWorldId";
  const updateLastWorldId = React.useCallback((id?: string) => {
    if (!id) return;
    try {
      localStorage.setItem(LAST_WORLD_KEY, id);
    } catch {}
  }, []);

  React.useEffect(() => {
    const loc = stripQuery(location);
    const m = loc.match(/^\/worlds\/([^/]+)$/);
    if (!m) return;
    updateLastWorldId(m[1]);
  }, [location, updateLastWorldId]);

  // ✅ 성능: 모바일 열렸을 때 body 스크롤 잠금
  React.useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  const mobileSlideClass = isOpen ? "translate-x-0" : "-translate-x-full";
  const desktopWidthClass = collapsed ? "md:w-20" : "md:w-64";

  // ✅ prod면 감상모드 고정이라 UI 표시도 고정
  const effectiveEditMode = LOCK_VIEW_MODE ? false : editMode;

  return (
    <>
      <ConfirmModal
        open={resetOpen}
        title="초기화"
        description={
          editMode
            ? "정말 초기화할까요?\n현재 데이터와 이미지가 삭제되고, seed.zip의 상태로 돌아갑니다."
            : "세계관을 동기화할까요?"
        }
        confirmText="초기화"
        cancelText="취소"
        danger
        onConfirm={onConfirmReset}
        onClose={() => setResetOpen(false)}
      />

      {/* ✅ 모바일 토글 버튼 */}
      <div className="fixed top-4 right-4 z-[60] md:hidden">
        <GButton
          onClick={toggleMobile}
          size="icon"
          variant="neutral"
          icon={
            isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />
          }
          title={isOpen ? "닫기" : "메뉴"}
        />
      </div>

      {/* ✅ Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-[100svh] z-50",
          "bg-sidebar/95 backdrop-blur-xl border-r border-sidebar-border",
          !collapsed && "md:shadow-[24px_0_60px_rgba(0,0,0,0.5)]",
          "w-full",
          desktopWidthClass,
          "transform-gpu will-change-transform",
          "transition-[transform,width] duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)]",
          mobileSlideClass,
          "md:translate-x-0"
        )}
        aria-label="사이드바"
      >
        <div className="relative h-full flex flex-col p-3">
          {/* Header */}
          <div className="flex items-center h-14 px-1.5">
            <button
              type="button"
              onClick={() => {
                setLocation("/");
                closeMobile();
              }}
              className="flex items-center gap-3 min-w-0 rounded-xl p-1 -m-1"
              title="홈"
            >
              <span className="grid place-items-center w-9 h-9 shrink-0 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                <img
                  src={LOGO_IMG}
                  alt=""
                  draggable={false}
                  className="w-6 h-auto"
                />
              </span>
              <span
                className={cn(
                  "overflow-hidden text-left transition-[max-width,opacity] duration-200",
                  collapsed ? "max-w-0 opacity-0" : "max-w-[160px] opacity-100"
                )}
              >
                <span className="block font-display text-[15px] font-semibold whitespace-nowrap">
                  결 <span className="text-white/35 font-normal">GYEOL</span>
                </span>
                <span className="block text-[11px] text-white/40 whitespace-nowrap">
                  그려나가는 내 결
                </span>
              </span>
            </button>
          </div>

          {/* Desktop collapse */}
          <button
            type="button"
            onClick={toggleCollapsed}
            className={cn(
              "hidden md:grid place-items-center absolute top-[22px] -right-3 z-10",
              "w-6 h-6 rounded-full border border-white/10 bg-sidebar text-white/50",
              "hover:text-white hover:border-white/20 transition-colors"
            )}
            aria-label={collapsed ? "사이드바 펼치기" : "사이드바 접기"}
            title={collapsed ? "펼치기" : "접기"}
          >
            <ChevronLeft
              size={14}
              className={cn(
                "transition-transform duration-300",
                collapsed && "rotate-180"
              )}
            />
          </button>

          {/* Nav */}
          <div
            className={cn(
              "mt-6 mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/30",
              "transition-opacity duration-200",
              collapsed ? "opacity-0" : "opacity-100"
            )}
          >
            Menu
          </div>
          <nav className="flex-1 space-y-0.5">
            {navItems.map(item => {
              const Icon = item.icon;
              const active = isActivePath(location, item.path);

              const onClick = () => {
                setLocation(item.path);
                closeMobile();
              };

              return (
                <SidebarRow
                  key={item.path}
                  icon={<Icon size={18} />}
                  label={item.label}
                  collapsed={collapsed}
                  active={active}
                  onClick={onClick}
                />
              );
            })}
          </nav>

          {/* Mode toggle (prod면 비활성) */}
          <div className="mt-4 pt-4 border-t border-white/[0.06] space-y-0.5">
            <SidebarRow
              icon={
                effectiveEditMode ? <Pencil size={18} /> : <Eye size={18} />
              }
              label={
                LOCK_VIEW_MODE
                  ? "감상 모드"
                  : effectiveEditMode
                    ? "편집 모드"
                    : "감상 모드"
              }
              collapsed={collapsed}
              disabled={LOCK_VIEW_MODE}
              title={
                LOCK_VIEW_MODE
                  ? "빌드 버전에서는 감상 모드만 사용됩니다."
                  : undefined
              }
              right={
                !collapsed && !LOCK_VIEW_MODE ? (
                  <span
                    aria-hidden
                    className={cn(
                      "ml-auto relative h-5 w-9 shrink-0 rounded-full transition-colors duration-200",
                      effectiveEditMode ? "bg-brand/80" : "bg-white/10"
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200",
                        effectiveEditMode && "translate-x-4"
                      )}
                    />
                  </span>
                ) : undefined
              }
              className={cn(effectiveEditMode && "text-brand hover:text-brand")}
              onClick={() => setEditMode(!effectiveEditMode)}
            />
          </div>

          {/* Tools (prod에서는 숨김, 편집모드에서만) */}
          {!LOCK_VIEW_MODE && effectiveEditMode && (
            <div className="space-y-0.5">
              {tools.map(t => (
                <SidebarRow
                  key={t.label}
                  icon={t.icon}
                  label={t.label}
                  collapsed={collapsed}
                  onClick={t.onClick}
                />
              ))}

              <input
                ref={fileInputRef}
                type="file"
                accept=".zip,application/zip"
                onChange={handleImportZip}
                className="hidden"
              />
            </div>
          )}

          {/* ✅ Reset: prod(감상모드 고정)에서도 항상 노출 */}
          <div className="mt-0.5">
            <SidebarRow
              icon={<RotateCcw size={18} />}
              label={editMode ? "초기화" : "동기화"}
              collapsed={collapsed}
              onClick={() => setResetOpen(true)}
            />
          </div>
        </div>
      </aside>
    </>
  );
}
