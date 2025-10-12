import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { 
  type User, 
  type Tour, 
  type BookingWithDetails,
  type Transaction,
  type Balances,
  type TopEarningTour,
  type Payout,
  type TaxDocument
} from '../../types';
import type { DashboardSection, DashboardStats, TodayScheduleItem, Notification } from '@/types/dashboard';
import { MainLayout } from '../layout/MainLayout';
import { BookingsSection } from '../dashboard/BookingsSection';
import { MoneySection } from '../dashboard/MoneySection';
import { TodaySection } from '../dashboard/TodaySection';
import { ToursSection } from '../dashboard/ToursSection';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Home, Users as UsersIcon, Euro, MessageSquare } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

interface GuideDashboardProps {
  user: User;
  onTourClick: (tour: Tour) => void;
  onStartVerification: () => void;
  onCreateTour: (tourData?: Tour) => void;
  onEditTour: (tour: Tour) => void;
  onNavigateToGuideProfile?: (guideId: string) => void;
}

export function GuideDashboard({ user, onTourClick, onStartVerification, onCreateTour, onEditTour, onNavigateToGuideProfile }: GuideDashboardProps) {
  const navigate = useNavigate();
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
  const [activeSection, setActiveSection] = useState<DashboardSection>('today');
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  
  // Money section state
  const [balances, setBalances] = useState<Balances>({
    pending: 0,
    available: 0,
    lifetime: 0,
    currency: 'EUR',
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [topTours, setTopTours] = useState<TopEarningTour[]>([]);
  const [nextPayout, setNextPayout] = useState<Payout | undefined>(undefined);
  const [taxDocuments, setTaxDocuments] = useState<TaxDocument[]>([]);
  const [loadingMoney, setLoadingMoney] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchGuideTours();
  }, [user.id]);

  useEffect(() => {
    if (activeSection === 'bookings') {
      fetchBookings();
    }
  }, [activeSection, user.id]);

  useEffect(() => {
    if (activeSection === 'money') {
      fetchFinancialData();
    }
  }, [activeSection, user.id]);

  const fetchGuideTours = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tours')
        .select('*')
        .eq('guide_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTours(data as Tour[] || []);
    } catch (error) {
      console.error('Error fetching tours:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch tours',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTour = async () => {
    if (!selectedTour) return;

    try {
      const { error } = await supabase
        .from('tours')
        .delete()
        .eq('id', selectedTour.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Tour deleted successfully',
      });
      
      setDeleteDialogOpen(false);
      setSelectedTour(null);
      fetchGuideTours();
    } catch (error) {
      console.error('Error deleting tour:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete tour',
        variant: 'destructive',
      });
    }
  };

  const handleUnpublishTour = async (tour: Tour) => {
    try {
      const { error } = await supabase
        .from('tours')
        .update({ is_active: false })
        .eq('id', tour.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Tour unpublished',
      });
      fetchGuideTours();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'Failed to unpublish tour',
        variant: 'destructive',
      });
    }
  };

  const handlePublishTour = async (tour: Tour) => {
    try {
      const { error } = await supabase
        .from('tours')
        .update({ is_active: true })
        .eq('id', tour.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Tour published',
      });
      fetchGuideTours();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'Failed to publish tour',
        variant: 'destructive',
      });
    }
  };

  const handleArchiveTour = async (tour: Tour) => {
    try {
      const { error } = await supabase
        .from('tours')
        .update({ archived: true, is_active: false })
        .eq('id', tour.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Tour archived',
      });
      fetchGuideTours();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'Failed to archive tour',
        variant: 'destructive',
      });
    }
  };

  const handleUnarchiveTour = async (tour: Tour) => {
    try {
      const { error } = await supabase
        .from('tours')
        .update({ archived: false })
        .eq('id', tour.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Tour restored',
      });
      fetchGuideTours();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'Failed to restore tour',
        variant: 'destructive',
      });
    }
  };

  const handleCopyTour = (tour: Tour) => {
    navigate('/tour-creation', { state: { tour } });
  };

  const fetchBookings = async () => {
    try {
      setLoadingBookings(true);
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          tours!inner(title, duration, region, meeting_point, guide_id),
          profiles!bookings_hiker_id_fkey(id, name, email, avatar_url)
        `)
        .eq('tours.guide_id', user.id)
        .order('booking_date', { ascending: false });

      if (error) throw error;

      // Transform data to match BookingWithDetails type
      const transformedData = data?.map(booking => ({
        ...booking,
        tour: booking.tours,
        guest: booking.profiles,
      })) as BookingWithDetails[];

      setBookings(transformedData || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch bookings',
        variant: 'destructive',
      });
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleBookingClick = (booking: BookingWithDetails) => {
    navigate(`/dashboard/booking/${booking.id}`);
  };

  const handleExportBookings = () => {
    toast({
      title: 'Export',
      description: 'Export functionality coming soon',
    });
  };

  const fetchFinancialData = async () => {
    try {
      setLoadingMoney(true);
      
      // Fetch all bookings for this guide's tours
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          *,
          tours!inner(title, guide_id),
          profiles!bookings_hiker_id_fkey(name)
        `)
        .eq('tours.guide_id', user.id);

      if (bookingsError) throw bookingsError;

      // Calculate balances
      const completedBookings = bookingsData?.filter(b => b.status === 'completed') || [];
      const confirmedBookings = bookingsData?.filter(b => b.status === 'confirmed') || [];
      const pendingBookings = bookingsData?.filter(b => b.status === 'pending') || [];

      const lifetimeTotal = completedBookings.reduce((sum, b) => sum + (b.total_price || 0), 0);
      const availableTotal = confirmedBookings.reduce((sum, b) => sum + (b.total_price || 0), 0);
      const pendingTotal = pendingBookings.reduce((sum, b) => sum + (b.total_price || 0), 0);

      setBalances({
        pending: pendingTotal,
        available: availableTotal,
        lifetime: lifetimeTotal,
        currency: 'EUR',
      });

      // Transform to transactions
      const transformedTransactions: Transaction[] = bookingsData?.map(booking => {
        const grossAmount = booking.total_price || 0;
        const platformFee = Math.round(grossAmount * 0.15); // 15% platform fee
        const netAmount = grossAmount - platformFee;

        return {
          id: `TX-${booking.id.slice(0, 8)}`,
          booking_id: booking.id,
          tour_id: booking.tour_id,
          tour_title: booking.tours.title,
          guest_name: booking.profiles?.name || 'Unknown Guest',
          date: booking.booking_date,
          gross_amount: grossAmount,
          platform_fee: platformFee,
          net_amount: netAmount,
          currency: booking.currency,
          status: booking.status as 'pending' | 'completed' | 'refunded',
          created_at: booking.created_at,
        };
      }) || [];

      setTransactions(transformedTransactions);

      // Calculate top earning tours
      const tourEarningsMap = new Map<string, { title: string; total: number; count: number }>();
      
      completedBookings.forEach(booking => {
        const tourId = booking.tour_id;
        const tourTitle = booking.tours.title;
        const amount = booking.total_price || 0;
        
        if (tourEarningsMap.has(tourId)) {
          const current = tourEarningsMap.get(tourId)!;
          tourEarningsMap.set(tourId, {
            title: tourTitle,
            total: current.total + amount,
            count: current.count + 1,
          });
        } else {
          tourEarningsMap.set(tourId, {
            title: tourTitle,
            total: amount,
            count: 1,
          });
        }
      });

      const topToursData: TopEarningTour[] = Array.from(tourEarningsMap.entries())
        .map(([tourId, data]) => ({
          tour_id: tourId,
          tour_title: data.title,
          total_earnings: data.total,
          booking_count: data.count,
        }))
        .sort((a, b) => b.total_earnings - a.total_earnings);

      setTopTours(topToursData);

      // Mock next payout (if available balance > 100)
      if (availableTotal >= 100) {
        const nextPayoutDate = new Date();
        nextPayoutDate.setDate(nextPayoutDate.getDate() + 7); // 7 days from now
        
        setNextPayout({
          id: 'payout-1',
          amount: availableTotal,
          currency: 'EUR',
          scheduled_date: nextPayoutDate.toISOString(),
          status: 'scheduled',
          created_at: new Date().toISOString(),
        });
      } else {
        setNextPayout(undefined);
      }

      // Mock tax documents
      setTaxDocuments([
        {
          id: 'doc-1',
          name: '2025 Income Summary',
          type: 'PDF',
          year: 2025,
          file_path: '/documents/2025-income.pdf',
          created_at: '2025-01-01T00:00:00Z',
        },
        {
          id: 'doc-2',
          name: '2024 Annual Statement',
          type: 'PDF',
          year: 2024,
          file_path: '/documents/2024-annual.pdf',
          created_at: '2024-12-31T00:00:00Z',
        },
        {
          id: 'doc-3',
          name: '2024 Tax Certificate',
          type: 'PDF',
          year: 2024,
          file_path: '/documents/2024-tax.pdf',
          created_at: '2024-12-31T00:00:00Z',
        },
      ]);

    } catch (error) {
      console.error('Error fetching financial data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch financial data',
        variant: 'destructive',
      });
    } finally {
      setLoadingMoney(false);
    }
  };

  const handleExportReport = () => {
    toast({
      title: 'Export',
      description: 'Export functionality coming soon',
    });
  };

  const handleRequestPayout = () => {
    toast({
      title: 'Payout Request',
      description: 'Instant payout requested. Processing may take 1-2 business days.',
    });
  };

  const handleDownloadDocument = (docId: string) => {
    const doc = taxDocuments.find(d => d.id === docId);
    toast({
      title: 'Download',
      description: `Downloading ${doc?.name || 'document'}...`,
    });
  };

  // Mock data for TODAY section
  const mockStats = {
    todayTours: 0,
    pendingBookings: 5,
    weekEarnings: 0,
    unreadMessages: 0,
  };

  const mockSchedule = [];
  const mockNotifications = [];


  return (
    <MainLayout 
      isDashboardMode={true}
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      showVerificationBadge={true}
      isVerified={user.verified}
    >
      <div className="min-h-screen bg-cream-light">
        <main className="p-6">
          {/* TODAY Section */}
          {activeSection === 'today' && (
            <TodaySection
              guideName={user.name.split(' ')[0] || 'Guide'}
              currentDate={new Date()}
              upcomingTours={mockSchedule}
              stats={mockStats}
              notifications={mockNotifications}
              onCreateTour={() => navigate('/tour-creation')}
              onManageAvailability={() => setActiveSection('tours')}
              onViewEarnings={() => setActiveSection('money')}
              onSectionNavigate={(section) => setActiveSection(section as DashboardSection)}
            />
          )}

          {/* TOURS Section */}
          {activeSection === 'tours' && (
            <>
              {!user.verified && (
                <Card className="border-burgundy/20 bg-cream mb-6">
                  <CardContent className="p-6">
                    <h3 className="font-semibold font-playfair text-lg mb-2">Complete Your Verification</h3>
                    <p className="text-charcoal/70 mb-4">
                      You need to complete the verification process to start offering tours.
                    </p>
                    <Button onClick={onStartVerification} className="bg-burgundy hover:bg-burgundy-dark text-white">
                      Start Verification Process
                    </Button>
                  </CardContent>
                </Card>
              )}
              
              <ToursSection
                tours={tours}
                loading={loading}
                onCreateTour={() => navigate('/tour-creation')}
                onEditTour={(tour) => navigate('/tour-creation', { 
                  state: { tour, editMode: true, tourId: tour.id } 
                })}
                onDeleteTour={(tour) => {
                  setSelectedTour(tour);
                  setDeleteDialogOpen(true);
                }}
                onTourClick={onTourClick}
                onPublishTour={handlePublishTour}
                onUnpublishTour={handleUnpublishTour}
                onArchiveTour={handleArchiveTour}
                onUnarchiveTour={handleUnarchiveTour}
                onCopyTour={handleCopyTour}
              />
            </>
          )}

          {/* BOOKINGS Section */}
          {activeSection === 'bookings' && (
            <BookingsSection
              bookings={bookings}
              loading={loadingBookings}
              onBookingClick={handleBookingClick}
              onExport={handleExportBookings}
            />
          )}

          {/* MONEY Section */}
          {activeSection === 'money' && (
            <MoneySection
              balances={balances}
              transactions={transactions}
              topTours={topTours}
              nextPayout={nextPayout}
              taxDocuments={taxDocuments}
              loading={loadingMoney}
              onExport={handleExportReport}
              onRequestPayout={handleRequestPayout}
              onDownloadDocument={handleDownloadDocument}
            />
          )}

          {/* INBOX Section */}
          {activeSection === 'inbox' && (
            <div className="p-8 bg-white rounded-lg shadow-md border border-burgundy/10">
              <h2 className="text-2xl font-playfair text-charcoal mb-4">Inbox Section</h2>
              <p className="text-charcoal/60">Messages and reviews coming soon...</p>
            </div>
          )}
        </main>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Tour</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to permanently delete "{selectedTour?.title}"? This action cannot be undone.
                All bookings and reviews associated with this tour will also be affected.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteTour} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MainLayout>
  );
}
