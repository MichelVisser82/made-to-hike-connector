import { useNavigate } from 'react-router-dom';
import { Mountain } from 'lucide-react';
import { Button } from '../ui/button';
import { type Page, type User } from '../../types';

interface NavigationProps {
  currentPage: Page;
  user: User | null;
  onNavigate: (page: Page) => void;
  onNavigateToSearch: () => void;
  onNavigateToDashboard: () => void;
  onShowAuth: () => void;
  onShowGuideSignup: () => void;
  onLogout: () => void;
}

export function Navigation({
  currentPage,
  user,
  onNavigate,
  onNavigateToSearch,
  onNavigateToDashboard,
  onShowAuth,
  onShowGuideSignup,
  onLogout
}: NavigationProps) {
  const navigate = useNavigate();
  return (
    <nav className="border-b bg-white/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="h-8 w-8 text-primary">
              <Mountain className="h-8 w-8" />
            </div>
            <div>
              <div className="text-lg font-semibold text-foreground">MadeToHike</div>
              <div className="text-xs text-muted-foreground">Guided Adventures</div>
            </div>
          </button>

          <div className="flex items-center gap-4">
            {currentPage !== 'search' && (
              <button
                onClick={onNavigateToSearch}
                className="text-sm hover:text-primary transition-colors"
              >
                Find Tours
              </button>
            )}

            {user && user.role === 'admin' && (
              <button
                onClick={() => onNavigate('admin-dashboard')}
                className="text-sm hover:text-primary transition-colors"
              >
                Admin Panel
              </button>
            )}

            {user ? (
              <div className="flex items-center gap-3">
                {user.role !== 'guide' && (
                  <button
                    onClick={onNavigateToDashboard}
                    className="text-sm hover:text-primary transition-colors"
                  >
                    Dashboard
                  </button>
                )}
                <div className="flex items-center gap-2">
                  <button
                    onClick={onNavigateToDashboard}
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                  >
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm font-medium">{user.name}</span>
                  </button>
                  <button
                    onClick={onLogout}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={onShowAuth}
                  className="text-sm hover:text-primary transition-colors"
                >
                  Sign In
                </button>
                <Button onClick={() => navigate('/guide/signup')} size="sm">
                  Become a Guide
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}