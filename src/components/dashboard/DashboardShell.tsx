import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mountain, Home, Users, Euro, MessageSquare, Bell, HelpCircle, ChevronDown, User as UserIcon, Settings, LogOut, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { DashboardSection, Notification, User } from '@/types/dashboard';

interface DashboardShellProps {
  user: User;
  activeSection?: DashboardSection;
  onSectionChange: (section: DashboardSection) => void;
  notifications?: Notification[];
  onNavigateToProfile: () => void;
  onLogout: () => void;
  children: React.ReactNode;
}

export function DashboardShell({
  user,
  activeSection = 'today',
  onSectionChange,
  notifications = [],
  onNavigateToProfile,
  onLogout,
  children,
}: DashboardShellProps) {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const hasUnread = unreadCount > 0;

  const navigationItems = [
    { id: 'today' as DashboardSection, label: 'Today', icon: Home },
    { id: 'tours' as DashboardSection, label: 'Tours', icon: Mountain },
    { id: 'bookings' as DashboardSection, label: 'Bookings', icon: Users },
    { id: 'money' as DashboardSection, label: 'Money', icon: Euro },
    { id: 'inbox' as DashboardSection, label: 'Inbox', icon: MessageSquare },
  ];

  const getInitials = () => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user.name?.slice(0, 2).toUpperCase() || 'GU';
  };

  const getFullName = () => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.name || 'Guide';
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return Users;
      case 'review':
        return Star;
      case 'message':
        return MessageSquare;
      default:
        return Bell;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'booking':
        return 'bg-burgundy/10 text-burgundy';
      case 'review':
        return 'bg-gold/10 text-gold';
      case 'message':
        return 'bg-sage/10 text-sage';
      default:
        return 'bg-burgundy/10 text-burgundy';
    }
  };

  return (
    <div className="min-h-screen bg-cream-light">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white border-b border-burgundy/10 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left Side - Logo */}
            <div className="flex items-center gap-3">
              <Mountain className="w-7 h-7 text-burgundy" />
              <span className="text-xl text-burgundy font-playfair">Made to Hike</span>
            </div>

            {/* Center - Navigation (Desktop) */}
            <nav className="hidden md:flex items-center gap-6">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => navigate(`/dashboard?section=${item.id}`)}
                    className={`
                      relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors
                      ${isActive 
                        ? 'text-burgundy bg-burgundy/5' 
                        : 'text-charcoal/60 hover:text-burgundy hover:bg-burgundy/5'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Right Side - Actions */}
            <div className="flex items-center gap-3">
              {/* Notifications Bell */}
              <DropdownMenu open={showNotifications} onOpenChange={setShowNotifications}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="w-5 h-5" />
                    {hasUnread && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-burgundy rounded-full" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <div className="bg-cream/50 px-4 py-3 border-b flex items-center justify-between">
                    <span className="font-semibold text-charcoal">Notifications</span>
                    {hasUnread && (
                      <span className="bg-burgundy text-white text-xs px-2 py-1 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  
                  <div className="divide-y max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center text-charcoal/60 text-sm">
                        No notifications
                      </div>
                    ) : (
                      notifications.slice(0, 5).map((notification) => {
                        const Icon = getNotificationIcon(notification.type);
                        const colorClass = getNotificationColor(notification.type);
                        
                        return (
                          <div 
                            key={notification.id}
                            className="px-4 py-3 hover:bg-cream/50 cursor-pointer transition-colors"
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                                <Icon className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-charcoal">{notification.message}</p>
                                <p className="text-xs text-charcoal/50 mt-1">{notification.time}</p>
                              </div>
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-burgundy rounded-full flex-shrink-0 mt-1" />
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                  
                  {notifications.length > 0 && (
                    <div className="px-4 py-3 border-t">
                      <button className="text-sm text-burgundy hover:underline w-full text-center">
                        View All
                      </button>
                    </div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Help Button */}
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate('/help')}
                className="text-charcoal/70 hover:bg-burgundy/5 hover:text-burgundy"
              >
                <HelpCircle className="w-5 h-5" />
              </Button>

              {/* User Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-[200px] border-burgundy/20 rounded-lg px-3 py-2 justify-start gap-3"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatarUrl} />
                      <AvatarFallback className="bg-burgundy text-white text-sm">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-charcoal flex-1 text-left truncate">
                      {getFullName()}
                    </span>
                    <ChevronDown className="w-4 h-4 text-charcoal/60" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                  <DropdownMenuItem onClick={onNavigateToProfile} className="cursor-pointer">
                    <UserIcon className="w-4 h-4 mr-2" />
                    View Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onLogout} className="cursor-pointer text-burgundy">
                    <LogOut className="w-4 h-4 mr-2" />
                    Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {children}
      </main>
    </div>
  );
}
