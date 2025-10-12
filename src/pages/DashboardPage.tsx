import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { TodaySection } from '@/components/dashboard/TodaySection';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import type { DashboardSection } from '@/types/dashboard';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const [activeSection, setActiveSection] = useState<DashboardSection>('today');

  // Mock data - will be replaced with real data hooks
  const mockStats = {
    todayTours: 2,
    pendingBookings: 5,
    weekEarnings: 3450,
    unreadMessages: 8,
    nextTourTime: '8:00 AM',
    urgentMessages: 2,
  };

  const mockSchedule = [
    {
      id: '1',
      time: '08:00 AM',
      title: 'Highland Trek Adventure',
      status: 'confirmed' as const,
      guestName: 'Emma Williams',
      participantCount: 4,
      location: 'Ben Nevis Base',
      tourId: 'tour-1',
    },
    {
      id: '2',
      time: '02:00 PM',
      title: 'Coastal Path Hiking',
      status: 'pending' as const,
      guestName: 'James Anderson',
      participantCount: 2,
      location: 'Durness Beach',
      tourId: 'tour-2',
    },
  ];

  const mockWeather = {
    condition: 'Partly cloudy',
    high: 18,
    low: 12,
  };

  const mockNotifications = [
    {
      id: '1',
      type: 'booking' as const,
      message: 'New booking request for Highland Trek',
      time: '2h ago',
      isRead: false,
    },
    {
      id: '2',
      type: 'review' as const,
      message: 'New 5-star review from Emma Williams',
      time: '5h ago',
      isRead: false,
    },
    {
      id: '3',
      type: 'message' as const,
      message: 'Message from James Anderson',
      time: '1d ago',
      isRead: true,
    },
  ];

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleNavigateToProfile = () => {
    // Navigate to guide profile edit
    navigate('/dashboard?section=profile');
  };

  const handleSectionChange = (section: DashboardSection) => {
    setActiveSection(section);
    // Update URL with query parameter
    navigate(`/dashboard?section=${section}`);
  };

  const dashboardUser = {
    id: user?.id || '',
    email: user?.email || '',
    name: profile?.name || '',
    firstName: profile?.name?.split(' ')[0],
    lastName: profile?.name?.split(' ')[1],
  };

  return (
    <DashboardShell
      user={dashboardUser}
      activeSection={activeSection}
      onSectionChange={handleSectionChange}
      notifications={mockNotifications}
      onNavigateToProfile={handleNavigateToProfile}
      onLogout={handleLogout}
    >
      {activeSection === 'today' && (
        <TodaySection
          guideName={profile?.name?.split(' ')[0] || 'Guide'}
          currentDate={new Date()}
          upcomingTours={mockSchedule}
          stats={mockStats}
          weather={mockWeather}
          notifications={mockNotifications}
          onCreateTour={() => navigate('/dashboard?section=tours&action=create')}
          onManageAvailability={() => navigate('/dashboard?section=tours')}
          onViewEarnings={() => handleSectionChange('money')}
          onSectionNavigate={handleSectionChange}
        />
      )}

      {activeSection === 'tours' && (
        <div className="p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-playfair text-charcoal mb-4">Tours Section</h2>
          <p className="text-charcoal/60">Tours management coming soon...</p>
        </div>
      )}

      {activeSection === 'bookings' && (
        <div className="p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-playfair text-charcoal mb-4">Bookings Section</h2>
          <p className="text-charcoal/60">Bookings management coming soon...</p>
        </div>
      )}

      {activeSection === 'money' && (
        <div className="p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-playfair text-charcoal mb-4">Money Section</h2>
          <p className="text-charcoal/60">Financial overview coming soon...</p>
        </div>
      )}

      {activeSection === 'inbox' && (
        <div className="p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-playfair text-charcoal mb-4">Inbox Section</h2>
          <p className="text-charcoal/60">Messages and reviews coming soon...</p>
        </div>
      )}
    </DashboardShell>
  );
}
