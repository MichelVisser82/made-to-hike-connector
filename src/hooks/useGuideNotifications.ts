import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { useSeenNotifications } from './useSeenNotifications';
import type { Notification } from '@/types/dashboard';

interface RawBooking {
  id: string;
  created_at: string;
  booking_reference: string | null;
  status: string;
  profiles: { name: string } | null;
}

interface RawReview {
  id: string;
  created_at: string;
  overall_rating: number;
  tours: { title: string } | null;
}

interface RawRequest {
  id: string;
  created_at: string;
  trip_name: string;
  region: string;
  status: string;
}

export function useGuideNotifications(guideId: string) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Track seen informative notifications
  const { 
    markAsSeen, 
    isUnseen 
  } = useSeenNotifications('guide_notifications', guideId);

  const fetchNotifications = useCallback(async () => {
    if (!guideId) return;
    
    try {
      setLoading(true);
      const allNotifications: Notification[] = [];
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      // 1. ACTION-REQUIRED: Pending bookings
      const { data: pendingBookings } = await supabase
        .from('bookings')
        .select(`
          id,
          created_at,
          booking_reference,
          status,
          profiles!bookings_hiker_id_fkey(name),
          tours!inner(guide_id)
        `)
        .eq('tours.guide_id', guideId)
        .in('status', ['pending', 'pending_confirmation'])
        .order('created_at', { ascending: false });

      if (pendingBookings) {
        pendingBookings.forEach((booking: any) => {
          allNotifications.push({
            id: `booking-${booking.id}`,
            type: 'booking',
            message: `New booking from ${booking.profiles?.name || 'Guest'} awaiting response`,
            time: formatDistanceToNow(new Date(booking.created_at), { addSuffix: true }),
            isRead: false,
            actionLink: `/dashboard/bookings/${booking.id}`,
            requiresAction: true,
            actionType: 'approve_booking',
            relatedEntityId: booking.id,
          });
        });
      }

      // 2. ACTION-REQUIRED: Open custom requests (guide hasn't responded)
      const { data: openRequests } = await supabase
        .from('public_tour_requests')
        .select('id, created_at, trip_name, region, status')
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(10);

      if (openRequests) {
        // Check which requests the guide has already responded to
        const { data: responses } = await supabase
          .from('guide_request_responses')
          .select('request_id')
          .eq('guide_id', guideId);
        
        const respondedIds = new Set(responses?.map(r => r.request_id) || []);
        
        openRequests.forEach((request: RawRequest) => {
          if (!respondedIds.has(request.id)) {
            allNotifications.push({
              id: `request-${request.id}`,
              type: 'custom_request',
              message: `New custom request: "${request.trip_name}" in ${request.region}`,
              time: formatDistanceToNow(new Date(request.created_at), { addSuffix: true }),
              isRead: false,
              actionLink: '/dashboard?section=inbox&tab=requests',
              requiresAction: true,
              actionType: 'respond_request',
              relatedEntityId: request.id,
            });
          }
        });
      }

      // 3. INFORMATIVE: New reviews received (last 7 days)
      const { data: recentReviews } = await supabase
        .from('reviews')
        .select(`
          id,
          created_at,
          overall_rating,
          tours(title)
        `)
        .eq('guide_id', guideId)
        .eq('review_type', 'hiker_to_guide')
        .eq('review_status', 'published')
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: false });

      if (recentReviews) {
        recentReviews.forEach((review: any) => {
          const notificationId = `review-${review.id}`;
          if (isUnseen(notificationId)) {
            allNotifications.push({
              id: notificationId,
              type: 'review',
              message: `New ${review.overall_rating}-star review on "${review.tours?.title || 'Tour'}"`,
              time: formatDistanceToNow(new Date(review.created_at), { addSuffix: true }),
              isRead: false,
              actionLink: '/dashboard?section=inbox&tab=reviews',
              requiresAction: false,
              actionType: 'view_only',
              relatedEntityId: review.id,
            });
          }
        });
      }

      // 4. INFORMATIVE: Unread messages summary
      const { data: unreadConversations } = await supabase
        .from('conversations')
        .select(`
          id,
          updated_at,
          hiker_id,
          profiles:hiker_id(name)
        `)
        .eq('guide_id', guideId)
        .eq('status', 'active')
        .order('updated_at', { ascending: false })
        .limit(5);

      // Check for unread messages in each conversation
      if (unreadConversations) {
        for (const conv of unreadConversations) {
          const { count } = await supabase
            .from('messages')
            .select('id', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .neq('sender_id', guideId)
            .is('deleted_at', null);
          
          const { data: readReceipt } = await supabase
            .from('message_read_receipts')
            .select('read_at')
            .eq('user_id', guideId)
            .order('read_at', { ascending: false })
            .limit(1);

          // Simple unread check - if there are recent messages
          if (count && count > 0) {
            const notificationId = `message-${conv.id}`;
            if (isUnseen(notificationId)) {
              const hikerName = (conv as any).profiles?.name || 'Someone';
              allNotifications.push({
                id: notificationId,
                type: 'message',
                message: `New message from ${hikerName}`,
                time: formatDistanceToNow(new Date(conv.updated_at || new Date()), { addSuffix: true }),
                isRead: false,
                actionLink: `/dashboard?section=inbox`,
                requiresAction: false,
                actionType: 'view_only',
                relatedEntityId: conv.id,
              });
            }
          }
        }
      }

      // Sort: action-required first, then by recency
      allNotifications.sort((a, b) => {
        if (a.requiresAction && !b.requiresAction) return -1;
        if (!a.requiresAction && b.requiresAction) return 1;
        return 0; // Keep original order within same category
      });

      setNotifications(allNotifications);
    } catch (error) {
      console.error('Error fetching guide notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [guideId, isUnseen]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!guideId) return;

    const bookingsChannel = supabase
      .channel('guide-bookings-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bookings',
        },
        () => {
          fetchNotifications();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bookings',
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    const reviewsChannel = supabase
      .channel('guide-reviews-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'reviews',
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    const requestsChannel = supabase
      .channel('guide-requests-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'public_tour_requests',
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(bookingsChannel);
      supabase.removeChannel(reviewsChannel);
      supabase.removeChannel(requestsChannel);
    };
  }, [guideId, fetchNotifications]);

  const dismissNotification = useCallback((notificationId: string) => {
    // Only allow dismissing informative notifications
    const notification = notifications.find(n => n.id === notificationId);
    if (notification && !notification.requiresAction) {
      markAsSeen(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    }
  }, [notifications, markAsSeen]);

  const actionRequiredCount = useMemo(() => 
    notifications.filter(n => n.requiresAction).length
  , [notifications]);

  return {
    notifications,
    loading,
    dismissNotification,
    refreshNotifications: fetchNotifications,
    actionRequiredCount,
  };
}
