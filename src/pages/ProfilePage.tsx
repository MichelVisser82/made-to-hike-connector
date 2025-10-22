import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { MainLayout } from '@/components/layout/MainLayout';
import { GuideProfileEditForm } from '@/components/guide/GuideProfileEditForm';
import { HikerProfileEditForm } from '@/components/hiker/HikerProfileEditForm';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { DashboardMode } from '@/types/dashboard';

export default function ProfilePage() {
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const navigate = useNavigate();

  // Determine dashboard mode based on user role
  const dashboardMode: DashboardMode = profile?.role
    ? (profile.role as DashboardMode)
    : null;

  const isLoading = user && profileLoading;

  if (isLoading) {
    return (
      <MainLayout dashboardMode={dashboardMode}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (!profile) {
    return (
      <MainLayout dashboardMode={dashboardMode}>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Profile Settings</h1>
            <p className="text-muted-foreground">
              Loading profile...
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Show appropriate form based on role
  if (profile.role === 'guide') {
    return (
      <MainLayout
        dashboardMode={dashboardMode}
        showVerificationBadge={true}
        isVerified={profile.verified}
      >
        <div className="container mx-auto px-4 py-8">
          <GuideProfileEditForm
            onNavigateToGuideProfile={(guideId) => {
              navigate(`/${(profile as any).slug || guideId}`);
            }}
          />
        </div>
      </MainLayout>
    );
  }

  // Hiker profile
  return (
    <MainLayout dashboardMode={dashboardMode}>
      <div className="container mx-auto px-4 py-8">
        <HikerProfileEditForm />
      </div>
    </MainLayout>
  );
}
