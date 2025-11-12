import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PendingBooking {
  id: string;
  booking_reference: string;
  created_at: string;
  tour_id: string;
}

export function usePendingBookingsNotifications(guideId?: string) {
  const [pendingBookings, setPendingBookings] = useState<PendingBooking[]>([]);
  const [newPendingCount, setNewPendingCount] = useState(0);
  const [seenBookingIds, setSeenBookingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!guideId) return;

    // Fetch initial pending bookings
    const fetchPendingBookings = async () => {
      const { data } = await supabase
        .from('bookings')
        .select('id, booking_reference, created_at, tour_id, tours!inner(guide_id)')
        .eq('tours.guide_id', guideId)
        .in('status', ['pending', 'pending_confirmation'])
        .order('created_at', { ascending: false });

      if (data) {
        setPendingBookings(data);
        // Initially mark all as seen
        setSeenBookingIds(new Set(data.map(b => b.id)));
      }
    };

    fetchPendingBookings();

    // Subscribe to new bookings
    const channel = supabase
      .channel('pending-bookings-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bookings',
          filter: `status=in.(pending,pending_confirmation)`
        },
        async (payload) => {
          console.log('New booking notification:', payload);
          
          // Fetch the full booking with tour details to verify it's for this guide
          const { data: booking } = await supabase
            .from('bookings')
            .select('id, booking_reference, created_at, tour_id, tours!inner(guide_id)')
            .eq('id', payload.new.id)
            .eq('tours.guide_id', guideId)
            .single();

          if (booking) {
            setPendingBookings(prev => [booking, ...prev]);
            
            // If not seen before, increment counter
            if (!seenBookingIds.has(booking.id)) {
              setNewPendingCount(prev => prev + 1);
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bookings'
        },
        async (payload) => {
          // Remove from pending list if status changed
          if (!['pending', 'pending_confirmation'].includes(payload.new.status)) {
            setPendingBookings(prev => prev.filter(b => b.id !== payload.new.id));
            setNewPendingCount(prev => Math.max(0, prev - 1));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [guideId]);

  const markAllAsSeen = () => {
    setSeenBookingIds(new Set(pendingBookings.map(b => b.id)));
    setNewPendingCount(0);
  };

  return {
    pendingBookings,
    newPendingCount,
    markAllAsSeen
  };
}
