import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface HikerBooking {
  id: string;
  booking_reference: string;
  booking_date: string;
  participants: number;
  total_price: number;
  currency: string;
  status: string;
  payment_status: string;
  stripe_payment_intent_id: string | null;
  created_at: string;
  special_requests: string | null;
  tours: {
    id: string;
    title: string;
    duration: string;
    meeting_point: string;
    guide_id: string;
    guide_profiles: {
      display_name: string;
      profile_image_url: string | null;
    } | null;
  } | null;
}

export function useHikerBookings(hikerId: string | undefined) {
  const [bookings, setBookings] = useState<HikerBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!hikerId) {
      setLoading(false);
      return;
    }

    fetchBookings();
  }, [hikerId]);

  const fetchBookings = async () => {
    if (!hikerId) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('bookings')
        .select(`
          id,
          booking_reference,
          booking_date,
          participants,
          total_price,
          currency,
          status,
          payment_status,
          stripe_payment_intent_id,
          created_at,
          special_requests,
          tours (
            id,
            title,
            duration,
            meeting_point,
            guide_id,
            guide_profiles:guide_profiles!tours_guide_id_fkey (
              display_name,
              profile_image_url
            )
          )
        `)
        .eq('hiker_id', hikerId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setBookings(data || []);
    } catch (err) {
      console.error('Error fetching hiker bookings:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return {
    bookings,
    loading,
    error,
    refetch: fetchBookings
  };
}
