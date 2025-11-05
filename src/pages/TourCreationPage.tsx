import { useNavigate, useLocation } from 'react-router-dom';
import { TourCreationFlow } from '@/components/tour-creation/TourCreationFlow';
import { MainLayout } from '@/components/layout/MainLayout';
import { useProfile } from '@/hooks/useProfile';
import type { Tour } from '@/types';

export default function TourCreationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useProfile();
  
  // Get tour data from navigation state (for editing/copying)
  const locationState = location.state as { tour?: Tour; editMode?: boolean; tourId?: string } | null;
  const initialData = locationState?.tour;
  const editMode = locationState?.editMode || false;
  const tourId = locationState?.tourId;

  return (
    <MainLayout dashboardMode={profile?.role === 'admin' ? 'admin' : 'guide'}>
      <TourCreationFlow
        onComplete={() => navigate('/dashboard')}
        onCancel={() => navigate('/dashboard')}
        initialData={initialData}
        editMode={editMode}
        tourId={tourId}
      />
    </MainLayout>
  );
}
