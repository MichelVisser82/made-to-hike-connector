import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TourOffer {
  id: string;
  guide_id: string;
  hiker_email: string;
  conversation_id: string;
  tour_id: string | null;
  total_price: number;
  price_per_person: number;
  group_size: number;
  duration: string;
  meeting_point: string;
  meeting_time: string;
  itinerary: string;
  included_items: string;
  personal_note: string | null;
  currency: string | null;
  preferred_date: string | null;
  offer_status: string | null;
  created_at: string | null;
  accepted_at: string | null;
  declined_at: string | null;
  expires_at: string | null;
  booking_id: string | null;
  tours?: {
    title: string;
  } | null;
}

export function useGuideTourOffers(guideId: string | undefined) {
  return useQuery({
    queryKey: ['guide-tour-offers', guideId],
    queryFn: async () => {
      if (!guideId) return [];

      const { data, error } = await supabase
        .from('tour_offers')
        .select(`
          *,
          tours:tour_id (
            title
          )
        `)
        .eq('guide_id', guideId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tour offers:', error);
        throw error;
      }

      return (data || []) as TourOffer[];
    },
    enabled: !!guideId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
