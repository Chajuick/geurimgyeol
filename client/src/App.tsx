import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import Home from "@/pages/Home";
import Profile from "@/pages/Profile";
import Worlds from "@/pages/Worlds";
import WorldDetail from "@/pages/world-detail/WorldDetail";
import Characters from "@/pages/Characters";
import Creatures from "@/pages/Creatures";
import Sidebar from "@/components/sidebar/Sidebar";
import { Route, Switch, useLocation } from "wouter";
import {
  AnimatePresence,
  MotionConfig,
  motion,
  type Variants,
} from "framer-motion";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { PortfolioProvider } from "./contexts/PortfolioContext";
import {
  DiveTransitionProvider,
  useDiveTransition,
} from "./contexts/DiveTransitionContext";
import { usePortfolio } from "./hooks/usePortfolio";
import { useCallback } from "react";
import { LoadingOverlay } from "./components/ui/loading-overlay";

const PAGE_EASE = [0.2, 0.8, 0.2, 1] as const;

function scrollAppToTop() {
  document.getElementById("root")?.scrollTo({ top: 0 });
}

const pageVariants: Variants = {
  initial: (diving: boolean) =>
    diving ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 },
  enter: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.42, ease: PAGE_EASE },
  },
  exit: (diving: boolean) =>
    diving
      ? { opacity: 1, transition: { duration: 0 } }
      : { opacity: 0, y: -8, transition: { duration: 0.18, ease: "easeIn" } },
};

function Router() {
  const [location] = useLocation();
  const pathKey = location.split("?")[0];
  // 빠져들기 전환 중에는 오버레이가 연출을 맡으므로 기본 페이드를 생략
  const { diving } = useDiveTransition();

  return (
    <AnimatePresence
      mode="wait"
      initial={false}
      custom={diving}
      onExitComplete={scrollAppToTop}
    >
      {/* ⚠️ filter/transform이 남으면 fixed 모달의 기준이 바뀌므로 opacity + y만 사용 */}
      <motion.div
        key={pathKey}
        custom={diving}
        variants={pageVariants}
        initial="initial"
        animate="enter"
        exit="exit"
      >
        <PageRoutes location={pathKey} />
      </motion.div>
    </AnimatePresence>
  );
}

function PageRoutes({ location }: { location: string }) {
  return (
    <Switch location={location}>
      <Route path={"/"} component={Home} />
      <Route path={"/worlds"} component={Worlds} />
      <Route path={"/worlds/:worldId"} component={WorldDetail} />{" "}
      {/* ✅ 추가 */}
      <Route path={"/characters"} component={Characters} />
      <Route path={"/creatures"} component={Creatures} />
      <Route path={"/profile"} component={Profile} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const portfolio = usePortfolio();
  const editMode = !!portfolio.data.settings.editMode;

  const setEditMode = useCallback(
    (mode: boolean) => {
      portfolio.setData(prev => ({
        ...prev,
        settings: { ...prev.settings, editMode: mode },
      }));
    },
    [portfolio]
  );

  return (
    <PortfolioProvider value={{ ...portfolio, editMode, setEditMode }}>
      <LoadingOverlay show={!portfolio.isLoaded} />
      <div className="min-h-[100svh] bg-background text-foreground relative overflow-x-clip">
        <Sidebar />
        <main className="w-full min-w-0 pl-0 md:pl-20">
          <Router />
        </main>
      </div>
    </PortfolioProvider>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <MotionConfig reducedMotion="user">
          <TooltipProvider>
            <Toaster />
            <DiveTransitionProvider>
              <AppContent />
            </DiveTransitionProvider>
          </TooltipProvider>
        </MotionConfig>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
