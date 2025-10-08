import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { type User } from '@/types';

interface AppNavigationProps {
  onDashboardClick?: () => void;
  onSearchClick?: () => void;
  onLogoClick?: () => void;
  currentPage?: string;
}

export function AppNavigation({ 
  onDashboardClick, 
  onSearchClick,
  onLogoClick,
  currentPage 
}: AppNavigationProps) {
  const navigate = useNavigate();
  const { user: authUser, signOut } = useAuth();
  const { profile } = useProfile();

  const user = profile || (authUser && authUser.email_confirmed_at ? {
    id: authUser.id,
    email: authUser.email || '',
    name: authUser.user_metadata?.name || authUser.email || '',
    role: (authUser.user_metadata?.role || 'hiker') as 'hiker' | 'guide' | 'admin',
    verified: false
  } as User : null);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const handleDashboard = () => {
    if (onDashboardClick) {
      onDashboardClick();
    } else {
      // Navigate to homepage - MadeToHikeApp will handle routing to correct dashboard
      navigate('/');
    }
  };

  const handleSearch = () => {
    if (onSearchClick) {
      onSearchClick();
    } else {
      navigate('/');
    }
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo(0, 0);
    if (onLogoClick) {
      onLogoClick();
    } else {
      navigate('/', { replace: true });
    }
  };

  return (
    <nav className="border-b bg-white/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <a
            href="/"
            onClick={handleLogoClick}
            className="flex items-center gap-2 hover:opacity-80 cursor-pointer"
          >
            <svg className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14,6L10.25,11L14,16L15.5,14.5L13.25,11L15.5,7.5L14,6M9.5,6L8,7.5L10.25,11L8,14.5L9.5,16L13.25,11L9.5,6Z"/>
              <path d="M4.5,3C3.67,3 3,3.67 3,4.5V19.5C3,20.33 3.67,21 4.5,21H19.5C20.33,21 21,20.33 21,19.5V4.5C21,3.67 20.33,3 19.5,3H4.5Z"/>
            </svg>
            <div>
              <div className="text-lg font-semibold">MadeToHike</div>
              <div className="text-xs text-muted-foreground">Guided Adventures</div>
            </div>
          </a>

          <div className="flex items-center gap-4">
            {currentPage !== 'search' && (
              <button
                onClick={handleSearch}
                className="text-sm hover:text-primary"
              >
                Find Tours
              </button>
            )}

            {user ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleDashboard}
                  className="text-sm hover:text-primary"
                >
                  Dashboard
                </button>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/auth?mode=signin"
                  className="text-sm hover:text-primary"
                >
                  Sign In
                </Link>
                <button
                  onClick={() => navigate('/guide/signup')}
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm hover:bg-primary/90"
                >
                  Become a Guide
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
