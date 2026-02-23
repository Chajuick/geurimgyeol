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
    "w-full flex items-center px-3 py-2 rounded-md",
    "transition-colors duration-150",
    active
      ? "bg-black text-white"
      : "text-muted-foreground hover:bg-zinc-200 hover:text-black",
    disabled &&
      "opacity-60 cursor-not-allowed hover:bg-transparent hover:text-inherit",
    className
  );

  const content = (
    <>
      <div className="w-8 flex justify-center flex-shrink-0">{icon}</div>

      <div
        className={cn(
          "overflow-hidden transition-[max-width,opacity,margin] duration-200",
          collapsed ? "max-w-0 opacity-0" : "ml-3 max-w-[200px] opacity-100"
        )}
      >
        <span className="whitespace-nowrap text-sm">{label}</span>
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
  const [isCollapsed, setIsCollapsed] = React.useState(false);

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
          "정말 초기화할까요?\n현재 데이터와 이미지가 삭제되고, 기본 상태로 복구됩니다."
        }
        confirmText="초기화"
        cancelText="취소"
        danger
        onConfirm={onConfirmReset}
        onClose={() => setResetOpen(false)}
      />

      {/* ✅ 모바일 토글 버튼 */}
      <div className="fixed top-5 right-8 z-[60] md:hidden">
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
          "bg-background border-r border-border",
          "w-full",
          desktopWidthClass,
          "transform-gpu will-change-transform",
          "transition-transform duration-300 ease-in-out",
          mobileSlideClass,
          "md:translate-x-0"
        )}
        aria-label="사이드바"
      >
        <div className="h-full flex flex-col p-3">
          {/* Header */}
          <div className="flex items-center justify-between h-14 px-2">
            <div
              className={cn(
                "overflow-hidden transition-[max-width,opacity] duration-200",
                collapsed ? "max-w-0 opacity-0" : "max-w-[220px] opacity-100"
              )}
            >
              <h1 className="text-lg font-semibold whitespace-nowrap">결</h1>
              <p className="text-xs text-muted-foreground whitespace-nowrap">
                그려나가는 내 결
              </p>
            </div>

            {/* Desktop collapse */}
            <button
              type="button"
              onClick={toggleCollapsed}
              className="p-1 rounded hover:bg-zinc-200 transition-colors hidden md:block"
              aria-label={collapsed ? "사이드바 펼치기" : "사이드바 접기"}
              title={collapsed ? "펼치기" : "접기"}
            >
              <ChevronLeft
                size={18}
                className={cn(
                  "w-8 transition-transform duration-300",
                  collapsed && "rotate-180"
                )}
              />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 mt-6 space-y-1">
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
          <div className="mt-4">
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
              className={cn(
                "hover:brightness-95",
                effectiveEditMode
                  ? "bg-zinc-900 text-white"
                  : "bg-zinc-200 text-black",
                effectiveEditMode
                  ? "hover:bg-zinc-700 hover:text-white"
                  : "hover:bg-zinc-200"
              )}
              onClick={() => setEditMode(!effectiveEditMode)}
            />
          </div>

          {/* Tools (prod에서는 숨김, 편집모드에서만) */}
          {!LOCK_VIEW_MODE && effectiveEditMode && (
            <div className="mt-3 space-y-1">
              {tools.map(t => (
                <SidebarRow
                  key={t.label}
                  icon={t.icon}
                  label={t.label}
                  collapsed={collapsed}
                  className="bg-zinc-200 hover:bg-zinc-300 text-black hover:text-black"
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
          <div className="mt-3">
            <SidebarRow
              icon={<RotateCcw size={18} />}
              label="초기화"
              collapsed={collapsed}
              className="bg-zinc-200 hover:bg-zinc-300 text-black hover:text-black"
              onClick={() => setResetOpen(true)}
            />
          </div>
        </div>
      </aside>
    </>
  );
}
