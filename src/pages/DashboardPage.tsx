import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useParams, useLocation } from 'react-router-dom';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { TodaySection } from '@/components/dashboard/TodaySection';
import { GuideDashboard } from '@/components/pages/GuideDashboard';
import { AdminDashboard } from '@/components/pages/AdminDashboard';
import { UserDashboard } from '@/components/pages/UserDashboard';
import { BookingDetailView } from '@/components/dashboard/BookingDetailView';
import { TourBookingDetailPage } from '@/components/dashboard/TourBookingDetailPage';
import { TripDetailPage } from '@/components/dashboard/hiker/TripDetailPage';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import type { DashboardSection } from '@/types/dashboard';
import type { User } from '@/types';

export default function DashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { bookingId, tourSlug } = useParams();
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

  // If viewing trip detail page (hiker's detailed booking view)
  if (bookingId && location.pathname.startsWith('/dashboard/trip/')) {
    return <TripDetailPage />;
  }

  // If viewing a booking detail by tour, wrap it with layout
  if (tourSlug) {
    return (
      <DashboardShell
        user={mappedUser}
        activeSection="bookings"
        onSectionChange={setActiveSection}
        onNavigateToProfile={() => navigate('/profile')}
        onLogout={signOut}
      >
        <TourBookingDetailPage />
      </DashboardShell>
    );
  }
  
  // If viewing a specific booking detail, wrap it with layout
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
