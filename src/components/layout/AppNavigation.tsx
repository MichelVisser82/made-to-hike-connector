import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { type User } from '@/types';
import type { DashboardSection, DashboardMode } from '@/types/dashboard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { 
  Mountain, 
  Home, 
  Users as UsersIcon, 
  Euro, 
  MessageSquare,
  ChevronDown,
  User as UserIcon,
  Settings,
  LogOut,
  Bell,
  HelpCircle
} from 'lucide-react';

interface AppNavigationProps {
  onDashboardClick?: () => void;
  onSearchClick?: () => void;
  onLogoClick?: () => void;
  currentPage?: string;
  dashboardMode?: DashboardMode;
  activeSection?: DashboardSection;
  onSectionChange?: (section: DashboardSection) => void;
  showVerificationBadge?: boolean;
  isVerified?: boolean;
}

export function AppNavigation({ 
  onDashboardClick, 
  onSearchClick,
  onLogoClick,
  currentPage,
  dashboardMode,
  activeSection,
  onSectionChange,
  showVerificationBadge,
  isVerified
}: AppNavigationProps) {
  const navigate = useNavigate();
  const { user: authUser, signOut } = useAuth();
  const { profile } = useProfile();
  const [unreadCount, setUnreadCount] = useState(0);

  const user = profile || (authUser && authUser.email_confirmed_at ? {
    id: authUser.id,
    email: authUser.email || '',
    name: authUser.user_metadata?.name || authUser.email || '',
    role: (authUser.user_metadata?.role || 'hiker') as 'hiker' | 'guide' | 'admin',
    verified: false
  } as User : null);

  // Fetch unread messages count
  useEffect(() => {
    if (!user?.id) return;

    const fetchUnreadCount = async () => {
      const { data: conversations } = await supabase
        .from('conversations')
        .select('id')
        .or(`hiker_id.eq.${user.id},guide_id.eq.${user.id}`);

      if (conversations) {
        const conversationIds = conversations.map(c => c.id);
        
        const { count } = await supabase
          .from('messages')
          .select('id', { count: 'exact', head: true })
          .in('conversation_id', conversationIds)
          .neq('sender_id', user.id)
          .is('read_receipts', null);
        
        setUnreadCount(count || 0);
      }
    };

    fetchUnreadCount();

    // Subscribe to new messages
    const channel = supabase
      .channel('unread-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        () => fetchUnreadCount()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const handleLogout = async () => {
    await signOut();
    navigate('/', { replace: true });
    window.location.reload();
  };

  const handleDashboard = () => {
    if (onDashboardClick) {
      onDashboardClick();
    } else {
      // Navigate to dashboard route
      navigate('/dashboard');
    }
  };

  const handleSearch = () => {
    if (onSearchClick) {
      onSearchClick();
    } else {
      navigate('/tours');
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

  const dashboardNavItems = [
    { id: 'today' as DashboardSection, label: 'Today', icon: Home },
    { id: 'tours' as DashboardSection, label: 'Tours', icon: Mountain },
    { id: 'bookings' as DashboardSection, label: 'Bookings', icon: UsersIcon },
    { id: 'money' as DashboardSection, label: 'Money', icon: Euro },
    { id: 'inbox' as DashboardSection, label: 'Inbox', icon: MessageSquare },
  ];

  // Guide Dashboard Mode - Show all navigation items
  if (dashboardMode === 'guide') {
    return (
      <nav className="border-b bg-white/95 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Logo */}
            <a
              href="/"
              onClick={handleLogoClick}
              className="flex items-center gap-3 hover:opacity-80 cursor-pointer"
            >
              <Mountain className="w-7 h-7 text-burgundy" />
              <span className="text-xl text-burgundy font-playfair">Made to Hike</span>
            </a>

            {/* Center: Dashboard Navigation (Desktop) */}
            <nav className="hidden md:flex items-center gap-6">
              {dashboardNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (onSectionChange) {
                        onSectionChange(item.id);
                      } else {
                        // Navigate to dashboard with section parameter
                        navigate(`/dashboard?section=${item.id}`);
                      }
                    }}
                    className={`
                      flex items-center gap-2 px-3 py-2 rounded-lg transition-colors
                      ${isActive 
                        ? 'text-burgundy bg-burgundy/5' 
                        : 'text-charcoal/60 hover:text-burgundy hover:bg-burgundy/5'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Right: Notifications, Help, and User Profile Dropdown */}
            <div className="flex items-center gap-3">
              {/* Inbox Button with Unread Badge */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative text-charcoal/70 hover:bg-burgundy/5 hover:text-burgundy"
                onClick={() => {
                  if (onSectionChange) {
                    onSectionChange('inbox');
                  } else {
                    navigate('/dashboard?section=inbox');
                  }
                }}
              >
                <MessageSquare className="w-5 h-5" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 min-w-[20px] flex items-center justify-center p-0 bg-burgundy text-white text-xs">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Badge>
                )}
              </Button>

              {/* Notifications Bell */}
              <Button variant="ghost" size="icon" className="relative text-charcoal/70 hover:bg-burgundy/5 hover:text-burgundy">
                <Bell className="w-5 h-5" />
              </Button>

              {/* Help Button */}
              <Button variant="ghost" size="icon" className="text-charcoal/70 hover:bg-burgundy/5 hover:text-burgundy">
                <HelpCircle className="w-5 h-5" />
              </Button>

              {/* Verification Badge */}
              {showVerificationBadge && (
                <Badge variant={isVerified ? 'default' : 'secondary'}>
                  {isVerified ? 'Verified' : 'Pending Verification'}
                </Badge>
              )}

              {/* User Profile Dropdown */}
              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-[200px] justify-between border-burgundy/20 hover:bg-burgundy/5 hover:border-burgundy/40"
                    >
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={(user as any).avatarUrl} />
                          <AvatarFallback className="bg-burgundy text-white text-sm">
                            {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-charcoal font-medium truncate">
                          {user.name}
                        </span>
                      </div>
                      <ChevronDown className="w-4 h-4 text-charcoal/50" />
                    </Button>
                  </DropdownMenuTrigger>
                  
                  <DropdownMenuContent 
                    align="end" 
                    className="w-[200px] bg-white border-burgundy/20"
                  >
                    <DropdownMenuItem 
                      onClick={() => navigate('/profile')}
                      className="cursor-pointer hover:bg-burgundy/5 focus:bg-burgundy/5"
                    >
                      <UserIcon className="w-4 h-4 mr-2" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem 
                      onClick={() => navigate('/settings')}
                      className="cursor-pointer hover:bg-burgundy/5 focus:bg-burgundy/5"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator className="bg-burgundy/10" />
                    
                    <DropdownMenuItem 
                      onClick={handleLogout}
                      className="cursor-pointer hover:bg-burgundy/5 focus:bg-burgundy/5 text-burgundy focus:text-burgundy"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // Admin or Hiker Dashboard Mode - Show header without dashboard navigation
  if (dashboardMode === 'admin' || dashboardMode === 'hiker') {
    return (
      <nav className="border-b bg-white/95 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Logo */}
            <a
              href="/"
              onClick={handleLogoClick}
              className="flex items-center gap-3 hover:opacity-80 cursor-pointer"
            >
              <Mountain className="w-7 h-7 text-burgundy" />
              <span className="text-xl text-burgundy font-playfair">Made to Hike</span>
            </a>

            {/* Right: Notifications, Help, and User Profile Dropdown */}
            <div className="flex items-center gap-3">
              {/* Inbox Button with Unread Badge */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative text-charcoal/70 hover:bg-burgundy/5 hover:text-burgundy"
                onClick={() => navigate('/dashboard?section=inbox')}
              >
                <MessageSquare className="w-5 h-5" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 min-w-[20px] flex items-center justify-center p-0 bg-burgundy text-white text-xs">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Badge>
                )}
              </Button>

              {/* Notifications Bell */}
              <Button variant="ghost" size="icon" className="relative text-charcoal/70 hover:bg-burgundy/5 hover:text-burgundy">
                <Bell className="w-5 h-5" />
              </Button>

              {/* Help Button */}
              <Button variant="ghost" size="icon" className="text-charcoal/70 hover:bg-burgundy/5 hover:text-burgundy">
                <HelpCircle className="w-5 h-5" />
              </Button>

              {/* User Profile Dropdown */}
              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-[200px] justify-between border-burgundy/20 hover:bg-burgundy/5 hover:border-burgundy/40"
                    >
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={(user as any).avatarUrl} />
                          <AvatarFallback className="bg-burgundy text-white text-sm">
                            {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-charcoal font-medium truncate">
                          {user.name}
                        </span>
                      </div>
                      <ChevronDown className="w-4 h-4 text-charcoal/50" />
                    </Button>
                  </DropdownMenuTrigger>
                  
                  <DropdownMenuContent 
                    align="end" 
                    className="w-[200px] bg-white border-burgundy/20"
                  >
                    <DropdownMenuItem 
                      onClick={() => navigate('/profile')}
                      className="cursor-pointer hover:bg-burgundy/5 focus:bg-burgundy/5"
                    >
                      <UserIcon className="w-4 h-4 mr-2" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem 
                      onClick={() => navigate('/settings')}
                      className="cursor-pointer hover:bg-burgundy/5 focus:bg-burgundy/5"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator className="bg-burgundy/10" />
                    
                    <DropdownMenuItem 
                      onClick={handleLogout}
                      className="cursor-pointer hover:bg-burgundy/5 focus:bg-burgundy/5 text-burgundy focus:text-burgundy"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // Default public navigation
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
                  className="bg-burgundy text-white px-4 py-2 rounded-lg text-sm hover:bg-burgundy/90"
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
