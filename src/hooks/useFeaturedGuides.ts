import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Fetches featured guides for the landing page
 * Returns verified guides with stats, sorted by experience and rating
 */
export function useFeaturedGuides(limit = 3) {
  return useQuery({
    queryKey: ['featured-guides', limit],
    queryFn: async () => {
      // Get verified guides
      const { data: guides, error: guidesError } = await supabase
        .from('guide_profiles')
        .select('*')
        .eq('verified', true)
        .eq('is_featured', true)
        .order('experience_years', { ascending: false })
        .limit(limit);

      if (guidesError) throw guidesError;
      if (!guides || guides.length === 0) return [];

      // Get tour counts for each guide
      const guideIds = guides.map(g => g.user_id);
      const { data: tours } = await supabase
        .from('tours')
        .select('guide_id')
        .in('guide_id', guideIds)
        .eq('is_active', true);

      // Get review stats for each guide
      const { data: reviews } = await supabase
        .from('reviews')
        .select('guide_id, overall_rating')
        .in('guide_id', guideIds)
        .eq('review_type', 'hiker_to_guide')
        .eq('review_status', 'published');

      // Calculate stats for each guide
      const guidesWithStats = guides.map(guide => {
        const guideTours = tours?.filter(t => t.guide_id === guide.user_id) || [];
        const guideReviews = reviews?.filter(r => r.guide_id === guide.user_id) || [];
        const avgRating = guideReviews.length > 0
          ? guideReviews.reduce((sum, r) => sum + r.overall_rating, 0) / guideReviews.length
          : 0;

        return {
          ...guide,
          tour_count: guideTours.length,
          average_rating: avgRating,
          review_count: guideReviews.length,
        };
      });

      return guidesWithStats;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
