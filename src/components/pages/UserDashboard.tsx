import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { HikerTodaySection } from '@/components/dashboard/hiker/HikerTodaySection';
import { HikerTripsSection } from '@/components/dashboard/hiker/HikerTripsSection';
import { HikerBookingsSection } from '@/components/dashboard/hiker/HikerBookingsSection';
import { HikerReviewsSection } from '@/components/dashboard/hiker/HikerReviewsSection';
import { HikerInboxSection } from '@/components/dashboard/hiker/HikerInboxSection';
import { HikerReferralDashboard } from '@/components/referral/HikerReferralDashboard';
import { useSavedTours } from '@/hooks/useSavedTours';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@/types';
import type { Tour } from '@/types';
import type { DashboardSection } from '@/types/dashboard';

interface UserDashboardProps {
  user: User;
  onNavigateToSearch: () => void;
  onTourClick: (tour: Tour) => void;
}

export function UserDashboard({ user, onNavigateToSearch, onTourClick }: UserDashboardProps) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeSection, setActiveSection] = useState<DashboardSection>(
    (searchParams.get('section') as DashboardSection) || 'today'
  );
  const [defaultTab, setDefaultTab] = useState<string | undefined>(undefined);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  
  // Fetch saved tours count
  const { savedTours } = useSavedTours(user.id);

  useEffect(() => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('section', activeSection);
    setSearchParams(newParams);
  }, [activeSection]);

  useEffect(() => {
    const section = searchParams.get('section') as DashboardSection;
    if (section && section !== activeSection) {
      setActiveSection(section);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const { data, error } = await supabase
          .from('bookings')
          .select(`
            *, 
            tour:tours(*),
            tour_date_slots(slot_date)
          `)
          .eq('hiker_id', user.id)
          .order('booking_date', { ascending: true });
        if (error) throw error;
        setBookings(data || []);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoadingBookings(false);
      }
    };
    fetchBookings();
  }, [user.id]);

  const upcomingTrips = bookings.filter(b => {
    // Use tour start date from date slot, fallback to booking_date if not available
    const tripStartDate = b.tour_date_slots?.slot_date || b.booking_date;
    return new Date(tripStartDate) >= new Date() && b.status !== 'cancelled';
  });
  const completedTrips = bookings.filter(b => b.status === 'completed').length;

  const handleViewTrip = (trip: any) => {
    navigate(`/dashboard/trip/${trip.id}`);
  };

  const handleNavigateToSection = (section: string, tab?: string) => {
    setDefaultTab(tab);
    setActiveSection(section as DashboardSection);
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'today':
        return <HikerTodaySection userId={user.id} upcomingTrips={upcomingTrips} completedTrips={completedTrips} badgesEarned={8} savedTours={savedTours.length} onViewTrip={handleViewTrip} onMessageGuide={(id) => setActiveSection('inbox')} onNavigateToSection={handleNavigateToSection} />;
      case 'my-trips':
        return <HikerTripsSection userId={user.id} onViewTour={(id) => navigate(`/tours/${id}`)} onMessageGuide={(id) => setActiveSection('inbox')} defaultTab={defaultTab} />;
      case 'bookings':
        return <HikerBookingsSection userId={user.id} onViewBooking={(id) => navigate(`/dashboard/trip/${id}`)} onContactGuide={(id) => setActiveSection('inbox')} />;
      case 'reviews':
        return <HikerReviewsSection 
          userId={user.id} 
          onWriteReview={(id) => console.log('Review:', id)} 
          openBookingId={searchParams.get('bookingId') || undefined}
          onClearBookingId={() => {
            const newParams = new URLSearchParams(searchParams);
            newParams.delete('bookingId');
            setSearchParams(newParams);
          }}
        />;
      case 'inbox':
        return <HikerInboxSection userId={user.id} />;
      case 'referrals':
        return <HikerReferralDashboard userId={user.id} />;
      default:
        return null;
    }
  };

  return (
    <MainLayout dashboardMode="hiker" activeSection={activeSection} onSectionChange={setActiveSection}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">{renderSection()}</div>
      </div>
    </MainLayout>
  );
}
