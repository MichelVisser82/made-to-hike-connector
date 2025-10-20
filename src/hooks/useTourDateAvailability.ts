import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { TourDateAvailability } from '@/types/tourDateSlot';

export function useTourDateAvailability(tourId: string | undefined) {
  return useQuery({
    queryKey: ['tour-date-availability', tourId],
    queryFn: async () => {
      if (!tourId) throw new Error('Tour ID is required');

      const { data, error } = await supabase.rpc('get_tour_date_availability', {
        p_tour_id: tourId
      });

      if (error) throw error;

      return (data || []).map((slot: any) => ({
        slotId: slot.slot_id,
        slotDate: new Date(slot.slot_date),
        spotsTotal: slot.spots_total,
        spotsBooked: slot.spots_booked,
        spotsRemaining: slot.spots_remaining,
        price: Number(slot.price),
        currency: slot.currency,
        discountPercentage: slot.discount_percentage,
        discountLabel: slot.discount_label,
        isEarlyBird: slot.is_early_bird,
        isAvailable: slot.is_available
      })) as TourDateAvailability[];
    },
    enabled: !!tourId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
