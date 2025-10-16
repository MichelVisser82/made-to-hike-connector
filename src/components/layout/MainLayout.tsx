import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppNavigation } from './AppNavigation';
import { Footer } from './Footer';
import type { DashboardSection, DashboardMode } from '@/types/dashboard';

interface MainLayoutProps {
  children: ReactNode;
  dashboardMode?: DashboardMode;
  activeSection?: DashboardSection;
  onSectionChange?: (section: DashboardSection) => void;
  showVerificationBadge?: boolean;
  isVerified?: boolean;
}

export function MainLayout({ 
  children, 
  dashboardMode,
  activeSection,
  onSectionChange,
  showVerificationBadge,
  isVerified 
}: MainLayoutProps) {
  const navigate = useNavigate();

  const handleNavigate = (page: string) => {
    window.scrollTo(0, 0);
    // Map page names to actual routes
    if (page === 'tours') {
      navigate('/tours');
    } else if (page === 'guides') {
      navigate('/guides');
    } else if (page === 'certifications') {
      navigate('/certifications');
    } else {
      navigate('/');
    }
  };

  const handleNavigateToSearch = (filters?: any) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.set(key, value as string);
      });
    }
    window.scrollTo(0, 0);
    navigate(`/tours${params.toString() ? '?' + params.toString() : ''}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AppNavigation 
        dashboardMode={dashboardMode}
        activeSection={activeSection}
        onSectionChange={onSectionChange}
        showVerificationBadge={showVerificationBadge}
        isVerified={isVerified}
      />
      <main className="flex-1">{children}</main>
      {!dashboardMode && (
        <Footer 
          onNavigate={handleNavigate}
          onNavigateToSearch={handleNavigateToSearch}
        />
      )}
    </div>
  );
}
