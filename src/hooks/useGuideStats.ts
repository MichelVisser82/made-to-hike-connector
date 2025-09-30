import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { GuideStats } from '@/types/guide';

export function useGuideStats(guideId: string | undefined) {
  return useQuery({
    queryKey: ['guide-stats', guideId],
    queryFn: async () => {
      if (!guideId) throw new Error('Guide ID is required');

      // Get tours count
      const { count: toursCount } = await supabase
        .from('tours')
        .select('*', { count: 'exact', head: true })
        .eq('guide_id', guideId)
        .eq('is_active', true);

      // Get average rating and total bookings
      const { data: reviews } = await supabase
        .from('reviews')
        .select('rating')
        .eq('guide_id', guideId);

      const { data: bookings } = await supabase
        .from('bookings')
        .select('participants')
        .eq('tour_id', guideId)
        .eq('status', 'completed');

      const averageRating = reviews && reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

      const totalHikers = bookings
        ? bookings.reduce((sum, b) => sum + (b.participants || 0), 0)
        : 0;

      return {
        tours_completed: toursCount || 0,
        average_rating: averageRating,
        total_hikers: totalHikers,
      } as GuideStats;
    },
    enabled: !!guideId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
