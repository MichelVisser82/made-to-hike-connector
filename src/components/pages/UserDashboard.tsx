import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { HikerTodaySection } from '@/components/dashboard/hiker/HikerTodaySection';
import { HikerTripsSection } from '@/components/dashboard/hiker/HikerTripsSection';
import { HikerBookingsSection } from '@/components/dashboard/hiker/HikerBookingsSection';
import { HikerReviewsSection } from '@/components/dashboard/hiker/HikerReviewsSection';
import { HikerInboxSection } from '@/components/dashboard/hiker/HikerInboxSection';
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
  const [bookings, setBookings] = useState<any[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  useEffect(() => {
    setSearchParams({ section: activeSection });
  }, [activeSection, setSearchParams]);

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
          .select(`*, tour:tours(*)`)
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

  const upcomingTrips = bookings.filter(b => 
    new Date(b.booking_date) >= new Date() && b.status !== 'cancelled'
  );
  const completedTrips = bookings.filter(b => b.status === 'completed').length;

  const handleViewTrip = (trip: any) => {
    if (trip.tour?.slug) navigate(`/tours/${trip.tour.slug}`);
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'today':
        return <HikerTodaySection userId={user.id} upcomingTrips={upcomingTrips} completedTrips={completedTrips} badgesEarned={8} savedTours={15} onViewTrip={handleViewTrip} onMessageGuide={(id) => setActiveSection('inbox')} />;
      case 'my-trips':
        return <HikerTripsSection userId={user.id} onViewTour={(id) => navigate(`/tours/${id}`)} onMessageGuide={(id) => setActiveSection('inbox')} />;
      case 'bookings':
        return <HikerBookingsSection userId={user.id} onViewBooking={(id) => navigate(`/dashboard/booking/${id}`)} onContactGuide={(id) => setActiveSection('inbox')} />;
      case 'reviews':
        return <HikerReviewsSection userId={user.id} onWriteReview={(id) => console.log('Review:', id)} />;
      case 'inbox':
        return <HikerInboxSection userId={user.id} />;
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
