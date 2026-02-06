/*
Design Philosophy: Japanese Minimalism + Wabi-Sabi
- Sidebar navigation with natural textures
- Asymmetric layout embracing imperfection
- Generous whitespace
*/

import { Link, useLocation } from 'wouter';
import { Home, FolderKanban, Image, User, Menu, X, Moon, Sun } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { useTheme } from '@/contexts/ThemeContext';

interface LayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { path: '/', label: '홈', icon: Home },
  { path: '/projects', label: '프로젝트', icon: FolderKanban },
  { path: '/gallery', label: '갤러리', icon: Image },
  { path: '/profile', label: '프로필', icon: User }
];

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  
  return (
    <div className="min-h-screen flex">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden bg-card/80 backdrop-blur-sm"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>
      
      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen w-64 bg-card border-r border-border/50
          flex flex-col transition-transform duration-300 z-40
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="p-6 border-b border-border/50">
          <h1 className="text-2xl font-semibold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
            작업실
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            나의 창작 공간
          </p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            
            return (
              <Link 
                key={item.path} 
                href={item.path}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-sm transition-all duration-300 block
                  ${isActive 
                    ? 'bg-accent text-accent-foreground shadow-sm' 
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                  }
                `}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-border/50 space-y-3">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2"
            onClick={toggleTheme}
          >
            {theme === 'light' ? (
              <>
                <Moon className="h-4 w-4" />
                <span>다크 모드</span>
              </>
            ) : (
              <>
                <Sun className="h-4 w-4" />
                <span>라이트 모드</span>
              </>
            )}
          </Button>
          <div className="text-xs text-muted-foreground">
            <p>© 2026 Illustrator Portfolio</p>
            <p className="mt-1">로컬 데이터 기반</p>
          </div>
        </div>
      </aside>
      
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="container py-8 lg:py-12 fade-in-up">
          {children}
        </div>
      </main>
    </div>
  );
}
