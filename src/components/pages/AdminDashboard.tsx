import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { type User } from '../../types';
import { MainLayout } from '../layout/MainLayout';
import type { DashboardSection } from '@/types/dashboard';
import { AdminOverviewSection } from '../admin/AdminOverviewSection';
import { AdminSupportSection } from '../admin/AdminSupportSection';
import { AdminContentSection } from '../admin/AdminContentSection';
import { AdminPlatformSection } from '../admin/AdminPlatformSection';
import { AdminAnalyticsSection } from '../admin/AdminAnalyticsSection';

interface AdminDashboardProps {
  user: User;
}

export function AdminDashboard({ user }: AdminDashboardProps) {
  const [searchParams] = useSearchParams();
  const [activeSection, setActiveSection] = useState<DashboardSection>('overview');
  
  // Auto-switch section based on URL parameters
  useEffect(() => {
    const section = searchParams.get('section');
    if (section && ['overview', 'support', 'content', 'platform', 'analytics'].includes(section)) {
      setActiveSection(section as DashboardSection);
    }
  }, [searchParams]);

  const handleSectionNavigate = (section: string) => {
    setActiveSection(section as DashboardSection);
  };
  
  return (
    <MainLayout
      dashboardMode="admin"
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      showVerificationBadge={false}
      isVerified={false}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {activeSection === 'overview' && (
            <AdminOverviewSection 
              adminName={user.name || 'Admin'}
              onSectionNavigate={handleSectionNavigate}
            />
          )}
          
          {activeSection === 'support' && <AdminSupportSection />}
          
          {activeSection === 'content' && <AdminContentSection />}
          
          {activeSection === 'platform' && <AdminPlatformSection />}
          
          {activeSection === 'analytics' && <AdminAnalyticsSection />}
        </div>
      </div>
    </MainLayout>
  );
}
