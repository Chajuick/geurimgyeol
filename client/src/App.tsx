import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import Home from "@/pages/Home";
import Profile from "@/pages/Profile";
import Worlds from "@/pages/Worlds";
import Characters from "@/pages/Characters";
import Creatures from "@/pages/Creatures";
import Sidebar from "@/components/Sidebar";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { PortfolioProvider } from "./contexts/PortfolioContext";
import { usePortfolio } from "./hooks/usePortfolio";
import { useState } from "react";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/worlds"} component={Worlds} />
      <Route path={"/characters"} component={Characters} />
      <Route path={"/creatures"} component={Creatures} />
      <Route path={"/profile"} component={Profile} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const portfolioData = usePortfolio();
  const [editMode, setEditMode] = useState(portfolioData.data.settings.editMode);

  return (
    <PortfolioProvider
      value={{
        ...portfolioData,
        editMode,
        setEditMode,
      }}
    >
      <div className="min-h-screen bg-background text-foreground flex">
        <Sidebar />
        <main className="flex-1 md:ml-0 ml-0">
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
