import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { CalendarDateView } from '@/types/tourDateSlot';
import { addDays } from 'date-fns';

interface UseGuideCalendarViewOptions {
  guideId: string | undefined;
  startDate?: Date;
  endDate?: Date;
}

export function useGuideCalendarView({ 
  guideId, 
  startDate = new Date(),
  endDate = addDays(new Date(), 90)
}: UseGuideCalendarViewOptions) {
  return useQuery({
    queryKey: ['guide-calendar-view', guideId, startDate, endDate],
    queryFn: async () => {
      if (!guideId) throw new Error('Guide ID is required');

      const { data, error } = await supabase.rpc('get_guide_all_date_slots', {
        p_guide_id: guideId,
        p_start_date: startDate.toISOString().split('T')[0],
        p_end_date: endDate.toISOString().split('T')[0]
      });

      if (error) throw error;

      return (data || []).map((slot: any) => ({
        slotId: slot.slot_id,
        tourId: slot.tour_id,
        tourTitle: slot.tour_title,
        date: new Date(slot.slot_date),
        spotsTotal: slot.spots_total,
        spotsBooked: slot.spots_booked,
        spotsRemaining: slot.spots_remaining,
        price: Number(slot.price),
        currency: slot.currency,
        discountPercentage: slot.discount_percentage,
        availabilityStatus: slot.availability_status as 'available' | 'limited' | 'booked'
      })) as CalendarDateView[];
    },
    enabled: !!guideId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
