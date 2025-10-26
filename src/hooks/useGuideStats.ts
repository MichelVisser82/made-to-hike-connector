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

      // Get average rating and review count from published reviews
      const { data: reviews } = await supabase
        .from('reviews')
        .select('overall_rating, category_ratings, quick_assessment')
        .eq('guide_id', guideId)
        .eq('review_type', 'hiker_to_guide')
        .eq('review_status', 'published');

      // Get total bookings for this guide's tours
      const { data: tours } = await supabase
        .from('tours')
        .select('id')
        .eq('guide_id', guideId);

      const tourIds = tours?.map(t => t.id) || [];

      const { data: bookings } = tourIds.length > 0 ? await supabase
        .from('bookings')
        .select('participants')
        .in('tour_id', tourIds)
        .eq('status', 'completed') : { data: null };

      const averageRating = reviews && reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.overall_rating, 0) / reviews.length
        : 0;

      const totalHikers = bookings
        ? bookings.reduce((sum, b) => sum + (b.participants || 0), 0)
        : 0;

      // Calculate category rating averages
      let categoryRatings = null;
      let recommendPercentage = null;
      let aboveBeyondPercentage = null;

      if (reviews && reviews.length > 0) {
        const ratingsSum = { expertise: 0, safety: 0, communication: 0, leadership: 0, value: 0 };
        let recommendCount = 0;
        let aboveBeyondCount = 0;

        reviews.forEach(review => {
          if (review.category_ratings) {
            const ratings = review.category_ratings as any;
            ratingsSum.expertise += ratings.expertise || 0;
            ratingsSum.safety += ratings.safety || 0;
            ratingsSum.communication += ratings.communication || 0;
            ratingsSum.leadership += ratings.leadership || 0;
            ratingsSum.value += ratings.value || 0;
          }
          
          if (review.quick_assessment) {
            const assessment = review.quick_assessment as any;
            if (assessment.would_recommend === true) recommendCount++;
            if (assessment.went_above_beyond === true) aboveBeyondCount++;
          }
        });

        const count = reviews.length;
        categoryRatings = {
          expertise: ratingsSum.expertise / count,
          safety: ratingsSum.safety / count,
          communication: ratingsSum.communication / count,
          leadership: ratingsSum.leadership / count,
          value: ratingsSum.value / count,
          overall: averageRating,
        };

        recommendPercentage = Math.round((recommendCount / count) * 100);
        aboveBeyondPercentage = Math.round((aboveBeyondCount / count) * 100);
      }

      return {
        tours_completed: toursCount || 0,
        average_rating: averageRating,
        total_hikers: totalHikers,
        review_count: reviews?.length || 0,
        category_ratings: categoryRatings,
        recommend_percentage: recommendPercentage,
        above_beyond_percentage: aboveBeyondPercentage,
      } as GuideStats;
    },
    enabled: !!guideId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
