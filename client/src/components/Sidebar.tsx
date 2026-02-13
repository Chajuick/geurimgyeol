import {
  Menu,
  X,
  Download,
  Save,
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
import { useState } from "react";
import { useLocation } from "wouter";
import { usePortfolioContext } from "@/contexts/PortfolioContext";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [location, setLocation] = useLocation();
  const { editMode, setEditMode, exportToJSON, exportToSingleJSON, importFromJSON, resetData } =
    usePortfolioContext();

  const navItems = [
    { label: "홈", path: "/", icon: Home },
    { label: "세계관", path: "/worlds", icon: Globe2 },
    { label: "캐릭터", path: "/characters", icon: UserRound },
    { label: "크리쳐", path: "/creatures", icon: Sparkles },
    { label: "프로필", path: "/profile", icon: IdCard },
  ];

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      importFromJSON(file);
      e.target.value = "";
    }
  };

  return (
    <>
      {/* 모바일 토글 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-6 z-40 p-2 rounded-lg bg-foreground text-background md:hidden"
      >
        {isOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* 사이드바 */}
      <aside
        className={`
          fixed left-0 top-0 h-screen
          bg-background border-r border-border
          transition-all duration-300 ease-in-out
          z-30
          ${isOpen ? (isCollapsed ? "w-20" : "w-64") : "w-0 md:w-20"}
          overflow-hidden
        `}
      >
        <div className="h-full flex flex-col p-3">
          {/* 상단 로고 */}
          <div className="flex items-center justify-between h-14 px-2">
            <div
              className={`
                overflow-hidden transition-all duration-200
                ${isCollapsed ? "max-w-0 opacity-0" : "max-w-[200px] opacity-100"}
              `}
            >
              <h1 className="text-lg font-semibold whitespace-nowrap">
                그림결
              </h1>
              <p className="text-xs text-muted-foreground whitespace-nowrap">
                포트폴리오
              </p>
            </div>

            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 rounded hover:bg-zinc-200 transition-colors hidden md:block"
            >
              <ChevronLeft
                size={18}
                className={`w-8 transition-transform duration-300 ${
                  isCollapsed ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>

          {/* 네비게이션 */}
          <nav className="flex-1 mt-6 space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const active = location === item.path;

              return (
                <button
                  key={item.path}
                  onClick={() => setLocation(item.path)}
                  className={`
                    w-full flex items-center
                    px-3 py-2 rounded-md
                    transition-colors duration-150
                    gyeol-navigation-item
                    ${
                      active
                        ? "bg-black text-white"
                        : "text-muted-foreground hover:bg-zinc-200 hover:text-black"
                    }
                  `}
                >
                  {/* 아이콘 고정 영역 */}
                  <div className="w-8 flex justify-center flex-shrink-0">
                    <Icon size={18} />
                  </div>

                  {/* 텍스트 영역 */}
                  <div
                    className={`
                      overflow-hidden transition-all duration-200
                      ${
                        isCollapsed
                          ? "max-w-0 opacity-0"
                          : "ml-3 max-w-[200px] opacity-100"
                      }
                    `}
                  >
                    <span className="whitespace-nowrap text-sm">
                      {item.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </nav>

          {/* 모드 토글 */}
          <div className="mt-4">
              <button
                onClick={() => setEditMode(!editMode)}
                className={`
                  w-full flex items-center px-3 py-2 rounded-md
                  transition-all duration-150
                  hover:brightness-95
                  ${editMode
                    ? "bg-zinc-900 text-white"
                    : "bg-zinc-200 text-black"}
                `}
              >
              <div className="w-8 flex justify-center flex-shrink-0">
                {editMode ? <Pencil size={18} /> : <Eye size={18} />}
              </div>

              <div
                className={`
                  overflow-hidden transition-all duration-200
                  ${
                    isCollapsed
                      ? "max-w-0 opacity-0"
                      : "ml-3 max-w-[200px] opacity-100"
                  }
                `}
              >
                <span className="whitespace-nowrap text-sm">
                  {editMode ? "편집 모드" : "감상 모드"}
                </span>
              </div>
            </button>
          </div>

          {/* 편집 도구 */}
          {editMode && (
            <div className="mt-3 space-y-1">
              {[
                { icon: Save, label: "백업", action: exportToJSON },
                { icon: Download, label: "내보내기", action: exportToSingleJSON },
                {
                  icon: Upload,
                  label: "가져오기",
                  action: undefined,
                  isImport: true,
                },
                {
                  icon: RotateCcw,
                  label: "초기화",
                  action: () => {
                    if (window.confirm("정말 초기화하시겠습니까?")) {
                      resetData();
                    }
                  },
                },
              ].map((tool, idx) => {
                const Icon = tool.icon;

                if (tool.isImport) {
                  return (
                    <label
                      key={idx}
                      className="
                        w-full flex items-center
                        px-3 py-2 rounded-md
                        bg-zinc-200
                        hover:bg-zinc-300
                        transition-colors duration-150
                      "
                    >
                      <div className="w-8 flex justify-center flex-shrink-0">
                        <Icon size={18} />
                      </div>

                      <div
                        className={`
                          overflow-hidden transition-all duration-200
                          ${
                            isCollapsed
                              ? "max-w-0 opacity-0"
                              : "ml-3 max-w-[200px] opacity-100"
                          }
                        `}
                      >
                        <span className="whitespace-nowrap text-sm">
                          {tool.label}
                        </span>
                      </div>

                      <input
                        type="file"
                        accept=".json"
                        onChange={handleImport}
                        className="hidden"
                      />
                    </label>
                  );
                }

                return (
                  <button
                    key={idx}
                    onClick={tool.action}
                    className="
                      w-full flex items-center
                      px-3 py-2 rounded-md
                      bg-zinc-200
                      hover:bg-zinc-300
                      transition-colors duration-150
                    "
                  >
                    <div className="w-8 flex justify-center flex-shrink-0">
                      <Icon size={18} />
                    </div>

                    <div
                      className={`
                        overflow-hidden transition-all duration-200
                        ${
                          isCollapsed
                            ? "max-w-0 opacity-0"
                            : "ml-3 max-w-[200px] opacity-100"
                        }
                      `}
                    >
                      <span className="whitespace-nowrap text-sm">
                        {tool.label}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </aside>

      {/* 데스크탑 spacer */}
      <div
        className={`
          hidden md:block ${isCollapsed ? "w-20" : "w-20"}
          transition-all duration-300 ease-in-out
        `}
      />
    </>
  );
}
