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
  date_slot_id: string | null;
  // Document & preparation fields
  waiver_uploaded_at: string | null;
  waiver_data: any | null;
  insurance_uploaded_at: string | null;
  insurance_file_url: string | null;
  participants_details: any[] | null;
  tour_date_slots: {
    slot_date: string;
  } | null;
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
    itinerary: string | null;
    guide_id: string;
    offer_guide_profile?: {
      display_name: string;
      profile_image_url: string | null;
    } | null;
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
          date_slot_id,
          waiver_uploaded_at,
          waiver_data,
          insurance_uploaded_at,
          insurance_file_url,
          participants_details,
          tour_date_slots (
            slot_date
          ),
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
            itinerary,
            guide_id,
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

      const rawData = (data || []) as any[];

      // Collect all unique guide IDs from tour offers
      const guideIds = Array.from(new Set(
        rawData.flatMap((booking) =>
          (booking.tour_offers || [])
            .map((offer: any) => offer.guide_id)
            .filter((id: string | null) => !!id)
        )
      )) as string[];

      let guideProfilesMap = new Map<string, { display_name: string; profile_image_url: string | null }>();

      if (guideIds.length > 0) {
        const { data: guideProfiles, error: guideError } = await supabase
          .from('guide_profiles_public')
          .select('user_id, display_name, profile_image_url')
          .in('user_id', guideIds);

        if (!guideError && guideProfiles) {
          guideProfilesMap = new Map(
            (guideProfiles as any[]).map((g) => [g.user_id, {
              display_name: g.display_name,
              profile_image_url: g.profile_image_url,
            }])
          );
        }
      }

      const bookingsWithGuides: HikerBooking[] = rawData.map((booking) => {
        const enrichedOffers = (booking.tour_offers || []).map((offer: any) => ({
          ...offer,
          offer_guide_profile: guideProfilesMap.get(offer.guide_id) || null,
        }));

        return {
          ...booking,
          tour_offers: enrichedOffers,
        } as HikerBooking;
      });

      setBookings(bookingsWithGuides);
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
