import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { TodaySection } from '@/components/dashboard/TodaySection';
import { GuideDashboard } from '@/components/pages/GuideDashboard';
import { AdminDashboard } from '@/components/pages/AdminDashboard';
import { UserDashboard } from '@/components/pages/UserDashboard';
import { BookingDetailView } from '@/components/dashboard/BookingDetailView';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import type { DashboardSection } from '@/types/dashboard';
import type { User } from '@/types';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { bookingId } = useParams();
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const [activeSection, setActiveSection] = useState<DashboardSection>(
    (searchParams.get('section') as DashboardSection) || 'today'
  );

  // Update active section when URL parameter changes
  useEffect(() => {
    const section = searchParams.get('section') as DashboardSection;
    if (section) {
      setActiveSection(section);
    }
  }, [searchParams]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/auth?mode=signin');
    }
  }, [user, navigate]);

  // Determine user role
  const role = profile?.role || user?.user_metadata?.role || 'hiker';

  // Convert profile to User type
  const mappedUser: User | null = profile ? {
    id: profile.id,
    email: profile.email,
    name: profile.name || profile.email,
    role: profile.role as 'hiker' | 'guide' | 'admin',
    verified: profile.verified || false
  } : null;

  if (!user || !mappedUser) {
    return null; // Will redirect via useEffect
  }

  // If viewing a booking detail, wrap it with layout
  if (bookingId) {
    return (
      <DashboardShell
        user={mappedUser}
        activeSection="bookings"
        onSectionChange={setActiveSection}
        onNavigateToProfile={() => navigate('/profile')}
        onLogout={signOut}
      >
        <BookingDetailView />
      </DashboardShell>
    );
  }

  // Render appropriate dashboard based on role
  if (role === 'guide') {
    return (
      <GuideDashboard
        user={mappedUser}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        onTourClick={(tour) => navigate(`/tours/${tour.slug || tour.id}`)}
        onStartVerification={() => navigate('/verification')}
        onCreateTour={() => navigate('/tour-creation')}
        onEditTour={(tour) => navigate('/tour-creation', { 
          state: { tour, editMode: true, tourId: tour.id } 
        })}
        onNavigateToGuideProfile={(guideId) => navigate(`/guides/${guideId}`)}
      />
    );
  } else if (role === 'admin') {
    return <AdminDashboard user={mappedUser} />;
  } else {
    return (
      <UserDashboard
        user={mappedUser}
        onNavigateToSearch={() => navigate('/')}
        onTourClick={() => {}}
      />
    );
  }
}
