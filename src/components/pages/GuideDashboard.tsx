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
  type TaxDocument,
  type Conversation,
  type Review,
  type ReviewStats,
  type NotificationPreference,
} from '../../types';
import type { DashboardSection, DashboardStats, TodayScheduleItem, Notification } from '@/types/dashboard';
import { MainLayout } from '../layout/MainLayout';
import { BookingsSection } from '../dashboard/BookingsSection';
import { MoneySection } from '../dashboard/MoneySection';
import { InboxSection } from '../dashboard/InboxSection';
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
import { useConversations } from '@/hooks/useConversations';

interface GuideDashboardProps {
  user: User;
  activeSection?: DashboardSection;
  onSectionChange?: (section: DashboardSection) => void;
  onTourClick: (tour: Tour) => void;
  onStartVerification: () => void;
  onCreateTour: (tourData?: Tour) => void;
  onEditTour: (tour: Tour) => void;
  onNavigateToGuideProfile?: (guideId: string) => void;
}

export function GuideDashboard({ 
  user, 
  activeSection: externalActiveSection,
  onSectionChange: externalOnSectionChange,
  onTourClick, 
  onStartVerification, 
  onCreateTour, 
  onEditTour, 
  onNavigateToGuideProfile 
}: GuideDashboardProps) {
  const navigate = useNavigate();
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
  const [internalActiveSection, setInternalActiveSection] = useState<DashboardSection>('today');
  const [toursActiveTab, setToursActiveTab] = useState<'my-tours' | 'calendar' | 'image-library'>('my-tours');
  
  // Use external state if provided, otherwise use internal state
  const activeSection = externalActiveSection ?? internalActiveSection;
  const setActiveSection = externalOnSectionChange ?? setInternalActiveSection;
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

  // Inbox state
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState<ReviewStats>({
    overall: 0,
    total: 0,
    breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreference[]>([]);
  const [loadingInbox, setLoadingInbox] = useState(false);
  const { toast } = useToast();
  
  // Fetch conversations for unread message count
  const { conversations: liveConversations } = useConversations(user.id);

  useEffect(() => {
    fetchGuideTours();
    fetchBookings(); // Fetch bookings on mount for Today section
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

  useEffect(() => {
    if (activeSection === 'inbox') {
      fetchInboxData();
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
        status: booking.status as 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'pending_confirmation',
        payment_status: booking.payment_status as 'pending' | 'processing' | 'succeeded' | 'failed' | 'canceled' | null | undefined,
        participants_details: booking.participants_details as any,
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

  // Fetch inbox data
  const fetchInboxData = async () => {
    try {
      setLoadingInbox(true);

      // Fetch reviews for this guide
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles!reviews_hiker_id_fkey(name),
          tours!inner(title, guide_id)
        `)
        .eq('tours.guide_id', user.id)
        .order('created_at', { ascending: false });

      if (reviewsError) throw reviewsError;

      // Transform reviews
      const transformedReviews: Review[] = reviewsData?.map(review => ({
        id: review.id,
        guest_name: review.profiles?.name || 'Anonymous',
        tour_title: review.tours.title,
        rating: review.overall_rating,
        comment: review.comment || '',
        date: review.created_at,
        reply: undefined, // TODO: Add reply functionality
      })) || [];

      setReviews(transformedReviews);

      // Calculate review stats
      const total = transformedReviews.length;
      const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      let sum = 0;

      transformedReviews.forEach(review => {
        breakdown[review.rating as keyof typeof breakdown]++;
        sum += review.rating;
      });

      setReviewStats({
        overall: total > 0 ? sum / total : 0,
        total,
        breakdown,
      });

      // Mock conversations (TODO: Implement real messaging system)
      setConversations([
        {
          id: 'conv-1',
          guest_id: 'guest-1',
          guest_name: 'Sarah Johnson',
          tour_id: 'tour-1',
          tour_title: 'Mont Blanc Summit Trek',
          last_message: 'Thanks for the gear recommendations!',
          last_message_time: new Date(Date.now() - 3600000).toISOString(),
          is_unread: true,
          messages: [
            {
              id: 'msg-1',
              sender: 'guest',
              content: "Hi! I'm looking forward to the trek. Any specific gear recommendations?",
              timestamp: new Date(Date.now() - 7200000).toISOString(),
              booking_id: 'booking-1',
              read: true,
            },
            {
              id: 'msg-2',
              sender: 'guide',
              content: 'Great! Make sure you have well-fitted mountaineering boots and layers for changing weather.',
              timestamp: new Date(Date.now() - 3600000).toISOString(),
              booking_id: 'booking-1',
              read: true,
            },
            {
              id: 'msg-3',
              sender: 'guest',
              content: "Thanks for the recommendations! I'll make sure to pack accordingly.",
              timestamp: new Date(Date.now() - 3600000).toISOString(),
              booking_id: 'booking-1',
              read: false,
            },
          ],
        },
        {
          id: 'conv-2',
          guest_id: 'guest-2',
          guest_name: 'Michael Chen',
          tour_id: 'tour-2',
          tour_title: 'Alpine Lakes Discovery',
          last_message: 'What time should we arrive?',
          last_message_time: new Date(Date.now() - 10800000).toISOString(),
          is_unread: true,
          messages: [
            {
              id: 'msg-4',
              sender: 'guest',
              content: 'What time should we arrive?',
              timestamp: new Date(Date.now() - 10800000).toISOString(),
              booking_id: 'booking-2',
              read: false,
            },
          ],
        },
        {
          id: 'conv-3',
          guest_id: 'guest-3',
          guest_name: 'Emma Williams',
          tour_id: 'tour-3',
          tour_title: 'Highland Photography Tour',
          last_message: 'Looking forward to the trek!',
          last_message_time: new Date(Date.now() - 86400000).toISOString(),
          is_unread: false,
          messages: [
            {
              id: 'msg-5',
              sender: 'guest',
              content: 'Looking forward to the trek!',
              timestamp: new Date(Date.now() - 86400000).toISOString(),
              booking_id: 'booking-3',
              read: true,
            },
          ],
        },
      ]);

      // Mock notification preferences
      setNotificationPreferences([
        {
          id: 'pref-1',
          title: 'New Booking Requests',
          description: 'Get notified when someone requests to book your tour',
          email: true,
          sms: true,
          push: true,
        },
        {
          id: 'pref-2',
          title: 'Messages from Guests',
          description: 'Receive notifications for new messages',
          email: true,
          sms: false,
          push: true,
        },
        {
          id: 'pref-3',
          title: 'Reviews',
          description: 'Get notified when guests leave reviews',
          email: true,
          sms: false,
          push: true,
        },
        {
          id: 'pref-4',
          title: 'Payout Updates',
          description: 'Track your earnings and payouts',
          email: true,
          sms: false,
          push: false,
        },
      ]);

    } catch (error) {
      console.error('Error fetching inbox data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch inbox data',
        variant: 'destructive',
      });
    } finally {
      setLoadingInbox(false);
    }
  };

  // Inbox handlers
  const handleSendMessage = (conversationId: string, message: string) => {
    toast({
      title: 'Message sent',
      description: 'Your message has been sent to the guest',
    });
  };

  const handleCallGuest = (conversationId: string) => {
    toast({
      title: 'Call feature',
      description: 'Call functionality coming soon',
    });
  };

  const handleReplyToReview = (reviewId: string) => {
    toast({
      title: 'Reply to review',
      description: 'Reply functionality coming soon',
    });
  };

  const handleUpdateNotificationPreference = (
    preferenceId: string,
    channel: 'email' | 'sms' | 'push',
    enabled: boolean
  ) => {
    setNotificationPreferences(prev =>
      prev.map(p =>
        p.id === preferenceId ? { ...p, [channel]: enabled } : p
      )
    );
  };

  // Calculate real stats from bookings
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayBookings = bookings.filter(b => {
    const bookingDate = new Date(b.booking_date);
    bookingDate.setHours(0, 0, 0, 0);
    return bookingDate.getTime() === today.getTime();
  });

  const pendingBookings = bookings.filter(b => 
    b.status === 'pending' || b.status === 'pending_confirmation'
  );

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);
  
  const weekEarnings = bookings
    .filter(b => {
      const bookingDate = new Date(b.created_at);
      return bookingDate >= weekStart && (b.status === 'confirmed' || b.status === 'completed');
    })
    .reduce((sum, b) => sum + (b.total_price || 0), 0);

  // Calculate total unread messages from conversations
  const totalUnreadMessages = liveConversations.reduce((total, conv) => total + (conv.unread_count || 0), 0);
  
  const realStats = {
    todayTours: todayBookings.length,
    pendingBookings: pendingBookings.length,
    weekEarnings: weekEarnings,
    unreadMessages: totalUnreadMessages,
  };

  const mockSchedule: TodayScheduleItem[] = todayBookings.map(booking => ({
    id: booking.id,
    time: '09:00', // TODO: Get from booking
    title: booking.tour?.title || 'Tour',
    status: booking.status as 'confirmed' | 'pending' | 'completed',
    guestName: booking.guest?.name || 'Guest',
    participantCount: booking.participants,
    location: booking.tour?.meeting_point || 'Location',
    tourId: booking.tour_id,
  }));
  
  const mockNotifications: Notification[] = [];


  return (
    <MainLayout 
      dashboardMode="guide"
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
              stats={realStats}
              notifications={mockNotifications}
              onCreateTour={() => navigate('/tour-creation')}
              onManageAvailability={() => {
                setToursActiveTab('calendar');
                setActiveSection('tours');
              }}
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
                initialTab={toursActiveTab}
                onTabChange={setToursActiveTab}
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
              onBookingsChange={fetchBookings}
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
              guideId={user.id}
              onExport={handleExportReport}
              onRequestPayout={handleRequestPayout}
              onDownloadDocument={handleDownloadDocument}
            />
          )}

          {/* INBOX Section */}
          {activeSection === 'inbox' && (
            <InboxSection
              reviews={reviews}
              reviewStats={reviewStats}
              notificationPreferences={notificationPreferences}
              loading={loadingInbox}
              onReplyToReview={handleReplyToReview}
              onUpdateNotificationPreference={handleUpdateNotificationPreference}
            />
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
