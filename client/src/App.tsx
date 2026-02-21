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
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { PortfolioProvider } from "./contexts/PortfolioContext";
import { usePortfolio } from "./hooks/usePortfolio";
import { useCallback } from "react";

function Router() {
  return (
    <Switch>
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
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <AppContent />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
