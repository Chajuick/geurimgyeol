import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import ProjectForm from "./pages/ProjectForm";
import Gallery from "./pages/Gallery";
import Profile from "./pages/Profile";
import { useEffect } from "react";
import { useStore } from "@/lib/store";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/projects" component={Projects} />
        <Route path="/projects/new" component={ProjectForm} />
        <Route path="/projects/:id" component={ProjectDetail} />
        <Route path="/projects/:id/edit" component={ProjectForm} />
        <Route path="/gallery" component={Gallery} />
        <Route path="/profile" component={Profile} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  const loadData = useStore((state) => state.loadData);

  // 앱 시작 시 public/data/portfolio.json에서 데이터 로드
  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
