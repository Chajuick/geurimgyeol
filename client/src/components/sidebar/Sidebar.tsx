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

type NavItem = {
  label: string;
  path: string; // base path
  icon: React.ComponentType<{ size?: number }>;
};

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
  } = props;

  const base = cn(
    "w-full flex items-center px-3 py-2 rounded-md",
    "transition-colors duration-150",
    active
      ? "bg-black text-white"
      : "text-muted-foreground hover:bg-zinc-200 hover:text-black",
    className
  );

  const content = (
    <>
      <div className="w-8 flex justify-center flex-shrink-0">{icon}</div>

      <div
        className={cn(
          "overflow-hidden transition-all duration-200",
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
      onClick={onClick}
      className={base}
      title={title ?? label}
    >
      {content}
    </button>
  );
}

/** ✅ query 제거 */
function stripQuery(path: string) {
  return path.split("?")[0];
}

/** ✅ basePath 하위 경로도 active 처리 */
function isActivePath(location: string, basePath: string) {
  const loc = stripQuery(location);

  // 홈은 정확히만
  if (basePath === "/") return loc === "/";

  return loc === basePath || loc.startsWith(basePath + "/");
}

/** ✅ worlds 기본 진입 경로 계산
 * - worlds가 있으면: 마지막 선택된 월드 -> 없으면 첫 월드 -> fallback "/worlds"
 */
function getWorldsEntryPath(
  worlds: { id: string }[] | undefined,
  selectedWorldId?: string
) {
  const list = worlds ?? [];
  if (!list.length) return "/worlds";

  const chosen =
    (selectedWorldId && list.find(w => w.id === selectedWorldId)?.id) ||
    list[0]?.id;

  return chosen ? `/worlds/${chosen}` : "/worlds";
}

export default function Sidebar() {
  const [isOpen, setIsOpen] = React.useState(true);
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const [location, setLocation] = useLocation();
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const [resetOpen, setResetOpen] = React.useState(false);

  const { data, editMode, setEditMode, exportToZip, importFromZip, resetData } =
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

  const sidebarWidthClass = React.useMemo(() => {
    if (!isOpen) return "w-0 md:w-20";
    if (isCollapsed) return "w-full md:w-20";
    return "w-full md:w-64";
  }, [isOpen, isCollapsed]);

  const spacerWidthClass = React.useMemo(() => {
    return isCollapsed ? "w-20" : "w-64";
  }, [isCollapsed]);

  const closeMobile = React.useCallback(() => setIsOpen(false), []);
  const toggleMobile = React.useCallback(() => setIsOpen(v => !v), []);
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
      {
        icon: <RotateCcw size={18} />,
        label: "초기화",
        onClick: () => setResetOpen(true),
      },
    ],
    [exportToZip, onPickZip]
  );

  // ✅ 마지막으로 보던 월드 기억(로컬스토리지)
  const LAST_WORLD_KEY = "gyeol:lastWorldId";

  const updateLastWorldId = React.useCallback((id?: string) => {
    if (!id) return;
    try {
      localStorage.setItem(LAST_WORLD_KEY, id);
    } catch {}
  }, []);

  const readLastWorldId = React.useCallback((): string | undefined => {
    try {
      return localStorage.getItem(LAST_WORLD_KEY) || undefined;
    } catch {
      return undefined;
    }
  }, []);

  // ✅ 현재 위치가 /worlds/:id 인 경우 lastWorldId 갱신
  React.useEffect(() => {
    const loc = stripQuery(location);
    const m = loc.match(/^\/worlds\/([^/]+)$/);
    if (!m) return;
    updateLastWorldId(m[1]);
  }, [location, updateLastWorldId]);

  // ✅ worlds 탭을 눌렀을 때: 마지막 월드(or 첫 월드)로 진입
  const onGoWorlds = React.useCallback(() => {
    const last = readLastWorldId();
    const entry = getWorldsEntryPath(data?.worlds, last);

    setLocation(entry);
    if (window.matchMedia("(max-width: 767px)").matches) closeMobile();
  }, [data?.worlds, setLocation, closeMobile, readLastWorldId]);

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

      {/* 모바일 토글 */}
      <div className="fixed top-4 right-6 z-50 md:hidden">
        <GButton
          onClick={toggleMobile}
          size="icon"
          variant={isOpen ? "neutral" : "ghost"}
          icon={isOpen ? <X size={18} /> : <Menu size={18} />}
          title={isOpen ? "닫기" : "메뉴"}
          className="p-2 h-auto w-auto"
        />
      </div>

      {/* 모바일 백드롭 */}
      {isOpen && (
        <button
          type="button"
          aria-label="사이드바 닫기"
          onClick={closeMobile}
          className="fixed inset-0 z-20 bg-black/40 md:hidden"
        />
      )}

      {/* 사이드바 */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen z-30",
          "bg-background border-r border-border",
          "transition-all duration-300 ease-in-out overflow-hidden",
          sidebarWidthClass
        )}
        aria-label="사이드바"
      >
        <div className="h-full flex flex-col p-3">
          {/* 헤더 */}
          <div className="flex items-center justify-between h-14 px-2">
            <div
              className={cn(
                "overflow-hidden transition-all duration-200",
                isCollapsed ? "max-w-0 opacity-0" : "max-w-[200px] opacity-100"
              )}
            >
              <h1 className="text-lg font-semibold whitespace-nowrap">결</h1>
              <p className="text-xs text-muted-foreground whitespace-nowrap">
                이야기로 엮은 내 결
              </p>
            </div>

            {/* 데스크탑 접기 */}
            <button
              type="button"
              onClick={toggleCollapsed}
              className="p-1 rounded hover:bg-zinc-200 transition-colors hidden md:block"
              aria-label={isCollapsed ? "사이드바 펼치기" : "사이드바 접기"}
              title={isCollapsed ? "펼치기" : "접기"}
            >
              <ChevronLeft
                size={18}
                className={cn(
                  "w-8 transition-transform duration-300",
                  isCollapsed && "rotate-180"
                )}
              />
            </button>
          </div>

          {/* 네비 */}
          <nav className="flex-1 mt-6 space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const active = isActivePath(location, item.path);

              const onClick = () => {
                setLocation(item.path);
                if (window.matchMedia("(max-width: 767px)").matches) {
                  closeMobile();
                }
              };

              return (
                <SidebarRow
                  key={item.path}
                  icon={<Icon size={18} />}
                  label={item.label}
                  collapsed={isCollapsed}
                  active={active}
                  onClick={onClick}
                />
              );
            })}
          </nav>

          {/* 모드 토글 */}
          <div className="mt-4">
            <SidebarRow
              icon={editMode ? <Pencil size={18} /> : <Eye size={18} />}
              label={editMode ? "편집 모드" : "감상 모드"}
              collapsed={isCollapsed}
              className={cn(
                "hover:brightness-95",
                editMode ? "bg-zinc-900 text-white" : "bg-zinc-200 text-black",
                editMode
                  ? "hover:bg-zinc-700 hover:text-white"
                  : "hover:bg-zinc-200"
              )}
              onClick={() => setEditMode(!editMode)}
            />
          </div>

          {/* 편집 도구 */}
          {editMode && (
            <div className="mt-3 space-y-1">
              {tools.map(t => (
                <SidebarRow
                  key={t.label}
                  icon={t.icon}
                  label={t.label}
                  collapsed={isCollapsed}
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
        </div>
      </aside>

      {/* 데스크탑 spacer */}
      <div
        className={cn(
          "hidden md:block transition-all duration-300",
          spacerWidthClass
        )}
      />
    </>
  );
}
