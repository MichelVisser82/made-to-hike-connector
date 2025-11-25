import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Fetches featured reviews for the landing page
 * Returns published reviews with tour and guide information
 */
export function useFeaturedReviews(limit = 3) {
  return useQuery({
    queryKey: ['featured-reviews', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          tours!reviews_tour_id_fkey(title),
          guide_profiles!reviews_guide_id_fkey(display_name)
        `)
        .eq('review_type', 'hiker_to_guide')
        .eq('review_status', 'published')
        .gte('overall_rating', 4.5)
        .not('comment', 'is', null)
        .order('created_at', { ascending: false })
        .limit(limit * 2); // Fetch more to ensure we have enough with comments

      if (error) throw error;

      // Filter to only reviews with substantial comments
      const filteredReviews = (data || [])
        .filter(r => r.comment && r.comment.length > 50)
        .slice(0, limit);

      return filteredReviews;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
