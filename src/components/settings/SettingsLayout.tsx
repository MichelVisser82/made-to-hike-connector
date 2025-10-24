import { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { User, Bell, Shield, CreditCard, Calendar, Globe, UserCircle } from 'lucide-react';
import { MainLayout } from '../layout/MainLayout';
import { cn } from '@/lib/utils';
import type { DashboardMode } from '@/types/dashboard';

interface SettingsLayoutProps {
  children: ReactNode;
  userRole: DashboardMode;
}

export function SettingsLayout({ children, userRole }: SettingsLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const guideNavItems = [
    { id: 'account', label: 'Account', icon: User, path: '/settings/account' },
    { id: 'profile', label: 'Profile', icon: UserCircle, path: '/settings/profile' },
    { id: 'notifications', label: 'Notifications', icon: Bell, path: '/settings/notifications' },
    { id: 'payment', label: 'Payment & Payouts', icon: CreditCard, path: '/settings/payment' },
    { id: 'privacy', label: 'Privacy & Data', icon: Shield, path: '/settings/privacy' },
    { id: 'availability', label: 'Availability', icon: Calendar, path: '/settings/availability' },
    { id: 'language', label: 'Language & Region', icon: Globe, path: '/settings/language' },
  ];

  const hikerNavItems = [
    { id: 'account', label: 'Account', icon: User, path: '/settings/account' },
    { id: 'profile', label: 'Profile Preferences', icon: UserCircle, path: '/settings/profile' },
    { id: 'notifications', label: 'Notifications', icon: Bell, path: '/settings/notifications' },
    { id: 'privacy', label: 'Privacy & Data', icon: Shield, path: '/settings/privacy' },
    { id: 'language', label: 'Language & Region', icon: Globe, path: '/settings/language' },
  ];

  const navItems = userRole === 'guide' ? guideNavItems : hikerNavItems;

  return (
    <MainLayout dashboardMode={userRole}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-playfair text-charcoal mb-2">Settings</h1>
            <p className="text-charcoal/60">
              Manage your account, preferences, and privacy
            </p>
          </div>

          {/* Desktop: Sidebar + Content */}
          <div className="grid lg:grid-cols-[240px_1fr] gap-8">
            {/* Sidebar Navigation */}
            <nav className="hidden lg:block space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.path)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors",
                      isActive
                        ? "bg-burgundy text-white"
                        : "text-charcoal/70 hover:bg-burgundy/5 hover:text-burgundy"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Mobile: Horizontal scroll tabs */}
            <div className="lg:hidden overflow-x-auto mb-6 -mx-4 px-4">
              <div className="flex gap-2 min-w-max">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => navigate(item.path)}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors",
                        isActive
                          ? "bg-burgundy text-white"
                          : "bg-cream text-charcoal/70 hover:bg-burgundy/10"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Main Content Area */}
            <div className="space-y-6">
              {children}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
