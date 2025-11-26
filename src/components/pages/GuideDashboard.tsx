import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
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
import { useStripeConnect } from '@/hooks/useStripeConnect';

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
  const [toursActiveTab, setToursActiveTab] = useState<'my-tours' | 'custom-tours' | 'calendar' | 'image-library'>('my-tours');
  
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

  // Check Stripe connection status
  const { data: stripeData } = useStripeConnect();

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
        .select(`
          *,
          bookings:bookings(count)
        `)
        .eq('guide_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform data to include booking count
      const toursWithBookings = data?.map(tour => ({
        ...tour,
        bookings_count: tour.bookings?.[0]?.count || 0
      })) || [];
      
      setTours(toursWithBookings as Tour[] || []);
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
    if (bookings.length === 0) {
      toast({
        title: 'No Data',
        description: 'No bookings to export',
        variant: 'destructive',
      });
      return;
    }

    const headers = [
      'Booking Reference',
      'Date',
      'Tour Name',
      'Guest Name',
      'Guest Email',
      'Participants',
      'Status',
      'Payment Status',
      'Amount',
      'Currency'
    ];

    const rows = bookings.map(booking => [
      booking.booking_reference || '',
      format(new Date(booking.booking_date), 'yyyy-MM-dd'),
      booking.tour?.title || '',
      booking.guest?.name || '',
      booking.guest?.email || '',
      booking.participants.toString(),
      booking.status,
      booking.payment_status || '',
      booking.total_price.toFixed(2),
      booking.currency || 'EUR'
    ]);

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `madetohike-bookings-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: 'Export Successful',
      description: `Exported ${bookings.length} bookings`,
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
          gross_income: 45000,
          net_income: 38250,
          total_bookings: 45,
        },
        {
          id: 'doc-2',
          name: '2024 Annual Statement',
          type: 'PDF',
          year: 2024,
          file_path: '/documents/2024-annual.pdf',
          created_at: '2024-12-31T00:00:00Z',
          gross_income: 38000,
          net_income: 32300,
          total_bookings: 38,
        },
        {
          id: 'doc-3',
          name: '2024 Tax Certificate',
          type: 'PDF',
          year: 2024,
          file_path: '/documents/2024-tax.pdf',
          created_at: '2024-12-31T00:00:00Z',
          gross_income: 15000,
          net_income: 12750,
          total_bookings: 15,
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
    if (!transactions || transactions.length === 0) {
      toast({
        title: 'No Data',
        description: 'No financial data to export',
        variant: 'destructive',
      });
      return;
    }

    const headers = [
      'Date',
      'Tour',
      'Guest',
      'Gross Amount',
      'Platform Fee (15%)',
      'Net Amount',
      'Status',
      'Currency'
    ];

    const rows = transactions.map(item => [
      format(new Date(item.date), 'yyyy-MM-dd'),
      item.tour_title || '',
      item.guest_name || '',
      item.gross_amount.toFixed(2),
      item.platform_fee.toFixed(2),
      item.net_amount.toFixed(2),
      item.status || '',
      item.currency || 'EUR'
    ]);

    // Calculate totals
    const totalGross = transactions.reduce((sum, item) => sum + item.gross_amount, 0);
    const totalPlatformFee = transactions.reduce((sum, item) => sum + item.platform_fee, 0);
    const totalNet = transactions.reduce((sum, item) => sum + item.net_amount, 0);

    // Add summary row
    rows.push([
      '',
      '',
      'TOTAL',
      totalGross.toFixed(2),
      totalPlatformFee.toFixed(2),
      totalNet.toFixed(2),
      '',
      ''
    ]);

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `madetohike-financial-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: 'Export Successful',
      description: `Exported ${transactions.length} transactions`,
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

      // Transform reviews - Note: Full review management is now in ReviewsTab
      const transformedReviews: Review[] = reviewsData?.map(review => ({
        id: review.id,
        guest_name: review.profiles?.name || 'Anonymous',
        tour_title: review.tours.title,
        rating: review.overall_rating,
        comment: review.comment || '',
        date: review.created_at,
        reply: undefined, // Reply functionality available in ReviewsTab
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

      // Use real conversations from useConversations hook
      // Transform liveConversations to match the Conversation type expected by InboxSection
      const transformedConversations: Conversation[] = liveConversations.map(conv => {
        // Get the other participant's profile
        const otherProfile = conv.profiles;
        
        return {
          id: conv.id,
          guest_id: conv.hiker_id || '',
          guest_name: otherProfile?.name || conv.anonymous_name || 'Guest',
          tour_id: conv.tour_id || '',
          tour_title: conv.tours?.title || 'Tour',
          last_message: '', // Will be populated by messages query if needed
          last_message_time: conv.last_message_at || conv.created_at || new Date().toISOString(),
          is_unread: (conv.unread_count || 0) > 0,
          messages: [], // Messages are fetched separately when viewing conversation
        };
      });
      
      setConversations(transformedConversations);

      // Fetch real notification preferences from database
      const { data: prefsData } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      // Define default preferences structure
      const defaultPreferences: NotificationPreference[] = [
        {
          id: 'pref-1',
          title: 'New Booking Requests',
          description: 'Get notified when someone requests to book your tour',
          email: prefsData?.email_on_new_message ?? true,
          sms: false, // SMS not yet implemented
          push: false, // Push not yet implemented
        },
        {
          id: 'pref-2',
          title: 'Messages from Guests',
          description: 'Receive notifications for new messages',
          email: prefsData?.email_on_new_message ?? true,
          sms: false,
          push: false,
        },
        {
          id: 'pref-3',
          title: 'Reviews',
          description: 'Get notified when guests leave reviews',
          email: true, // Always on for now
          sms: false,
          push: false,
        },
        {
          id: 'pref-4',
          title: 'Payout Updates',
          description: 'Track your earnings and payouts',
          email: true, // Always on for now
          sms: false,
          push: false,
        },
      ];

      setNotificationPreferences(defaultPreferences);

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
  
  // Get bookings for the next 30 days
  const next30Days = new Date();
  next30Days.setDate(next30Days.getDate() + 30);
  next30Days.setHours(23, 59, 59, 999);
  
  const upcomingBookings = bookings
    .filter(b => {
      const bookingDate = new Date(b.booking_date);
      bookingDate.setHours(0, 0, 0, 0);
      return bookingDate >= today && bookingDate <= next30Days;
    })
    .sort((a, b) => new Date(a.booking_date).getTime() - new Date(b.booking_date).getTime()); // Sort by date ascending

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
    todayTours: upcomingBookings.length,
    pendingBookings: pendingBookings.length,
    weekEarnings: weekEarnings,
    unreadMessages: totalUnreadMessages,
  };

  // Group bookings by tour_id and booking_date to show tours instead of individual bookings
  const tourScheduleMap = new Map<string, {
    tourId: string;
    tourTitle: string;
    bookingDate: string;
    location: string;
    bookingIds: string[];
    guestNames: string[];
    totalParticipants: number;
    statuses: string[];
  }>();

  upcomingBookings.forEach(booking => {
    const key = `${booking.tour_id}-${booking.booking_date}`;
    
    if (tourScheduleMap.has(key)) {
      const existing = tourScheduleMap.get(key)!;
      existing.bookingIds.push(booking.id);
      existing.guestNames.push(booking.guest?.name || 'Guest');
      existing.totalParticipants += booking.participants;
      existing.statuses.push(booking.status);
    } else {
      tourScheduleMap.set(key, {
        tourId: booking.tour_id,
        tourTitle: booking.tour?.title || 'Tour',
        bookingDate: booking.booking_date,
        location: booking.tour?.meeting_point || 'Location',
        bookingIds: [booking.id],
        guestNames: [booking.guest?.name || 'Guest'],
        totalParticipants: booking.participants,
        statuses: [booking.status],
      });
    }
  });

  const mockSchedule: TodayScheduleItem[] = Array.from(tourScheduleMap.values()).map(tour => {
    // Determine overall status: if any confirmed, show confirmed; if all cancelled, show cancelled
    const hasConfirmed = tour.statuses.includes('confirmed');
    const allCancelled = tour.statuses.every(s => s === 'cancelled');
    const status = hasConfirmed ? 'confirmed' : allCancelled ? 'cancelled' : tour.statuses[0];
    
    // Format guest names - show count if more than 2
    const guestDisplay = tour.guestNames.length > 2 
      ? `${tour.guestNames.length} bookings` 
      : tour.guestNames.join(', ');
    
    return {
      id: tour.bookingIds[0], // Use first booking ID
      time: format(new Date(tour.bookingDate), 'MMM dd'),
      title: tour.tourTitle,
      status: status as 'confirmed' | 'pending' | 'completed',
      guestName: guestDisplay,
      participantCount: tour.totalParticipants,
      location: tour.location,
      tourId: tour.tourId,
    };
  });
  
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
              onCreateTour={() => {
                // Validate Stripe capabilities before allowing tour creation
                if (!stripeData?.stripe_account_id || stripeData?.stripe_kyc_status !== 'verified') {
                  toast({ 
                    title: "Verification Required",
                    description: "Please complete your Stripe account verification before creating tours.",
                    variant: "destructive"
                  });
                  setActiveSection('money');
                  return;
                }
                navigate('/tour-creation');
              }}
              onManageAvailability={() => {
                setToursActiveTab('calendar');
                setActiveSection('tours');
              }}
              onViewEarnings={() => setActiveSection('money')}
              onSectionNavigate={(section) => setActiveSection(section as DashboardSection)}
              stripeConnected={!!stripeData?.stripe_account_id && stripeData?.stripe_kyc_status === 'verified'}
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
                onCreateTour={() => {
                  // Validate Stripe capabilities before allowing tour creation
                  if (!stripeData?.stripe_account_id || stripeData?.stripe_kyc_status !== 'verified') {
                    toast({ 
                      title: "Verification Required",
                      description: "Please complete your Stripe account verification before creating tours.",
                      variant: "destructive"
                    });
                    setActiveSection('money');
                    return;
                  }
                  navigate('/tour-creation');
                }}
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
              payouts={[]}
              topTours={topTours}
              taxDocuments={taxDocuments}
              stripeData={null}
              tours={tours}
              lastUpdated={new Date()}
              loading={loadingMoney}
              onExportReport={handleExportReport}
              onRequestPayout={handleRequestPayout}
              onDownloadDocument={handleDownloadDocument}
              onGenerateTaxDoc={async () => {}}
              onRefresh={() => fetchFinancialData()}
              onUpdatePayoutSchedule={async () => {}}
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
