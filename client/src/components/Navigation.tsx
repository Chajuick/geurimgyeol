import { usePortfolioContext } from '@/contexts/PortfolioContext';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useLocation } from 'wouter';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [location, setLocation] = useLocation();
  const { editMode, setEditMode } = usePortfolioContext();

  const navItems = [
    { label: '홈', path: '/' },
    { label: '세계관', path: '/worlds' },
    { label: '캐릭터', path: '/characters' },
    { label: '크리쳐', path: '/creatures' },
    { label: '프로필', path: '/profile' },
  ];

  const handleNavClick = (path: string) => {
    setLocation(path);
    setIsOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="container flex items-center justify-between h-16">
        {/* Logo */}
        <div className="flex-shrink-0">
          <h1 className="text-2xl font-bold">그림결</h1>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNavClick(item.path)}
              className={`text-sm font-medium transition-colors duration-200 ${
                location === item.path
                  ? 'text-foreground border-b-2 border-foreground pb-1'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Mode Toggle & Mobile Menu */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setEditMode(!editMode)}
            className={`text-sm font-medium px-3 py-1 rounded-md transition-colors duration-200 ${
              editMode
                ? 'bg-foreground text-background'
                : 'bg-muted text-foreground hover:bg-border'
            }`}
          >
            {editMode ? '편집 모드' : '감상 모드'}
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 hover:bg-muted rounded-md transition-colors"
          >
            {isOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden border-t border-border bg-secondary">
          <div className="container py-4 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                className={`block w-full text-left px-4 py-2 rounded-md transition-colors duration-200 ${
                  location === item.path
                    ? 'bg-foreground text-background'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
