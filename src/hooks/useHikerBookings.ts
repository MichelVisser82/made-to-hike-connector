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
  payment_type: string;
  stripe_payment_intent_id: string | null;
  final_payment_status: string | null;
  final_payment_amount: number | null;
  final_payment_due_date: string | null;
  deposit_amount: number | null;
  created_at: string;
  special_requests: string | null;
  tour_id: string;
  tours: {
    id: string;
    title: string;
    slug: string;
    duration: string;
    meeting_point: string;
    meeting_point_lat: number | null;
    meeting_point_lng: number | null;
    guide_id: string;
    difficulty: string;
    currency: string;
    hero_image: string | null;
    images: string[];
    itinerary: any;
    guide_display_name?: string | null;
    guide_avatar_url?: string | null;
    guide_profiles: {
      display_name: string;
      profile_image_url: string | null;
    } | null;
  } | null;
  tour_offers: Array<{
    id: string;
    meeting_point: string;
    meeting_time: string;
    duration: string;
    group_size: number;
    preferred_date: string | null;
    tours: {
      id: string;
      title: string;
      guide_id: string;
      guide_display_name?: string | null;
      guide_avatar_url?: string | null;
      guide_profiles: {
        display_name: string;
        profile_image_url: string | null;
      } | null;
    } | null;
  }>;
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
          payment_type,
          final_payment_status,
          final_payment_amount,
          final_payment_due_date,
          deposit_amount,
          stripe_payment_intent_id,
          created_at,
          special_requests,
          tour_id,
          tours (
            id,
            title,
            slug,
            duration,
            currency,
            meeting_point,
            meeting_point_lat,
            meeting_point_lng,
            guide_id,
            guide_display_name,
            guide_avatar_url,
            difficulty,
            hero_image,
            images,
            itinerary,
            guide_profiles:guide_profiles!tours_guide_id_fkey (
              display_name,
              profile_image_url
            )
          ),
          tour_offers!tour_offers_booking_id_fkey (
            id,
            meeting_point,
            meeting_time,
            duration,
            group_size,
            preferred_date,
            tours!tour_offers_tour_id_fkey (
              id,
              title,
              guide_id,
              guide_display_name,
              guide_avatar_url,
              guide_profiles!tours_guide_id_fkey (
                display_name,
                profile_image_url
              )
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
