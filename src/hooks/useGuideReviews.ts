import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface GuideReview {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  hiker_id: string;
  hiker_name?: string;
  hiker_avatar?: string;
}

export function useGuideReviews(guideId: string | undefined, limit = 3) {
  return useQuery({
    queryKey: ['guide-reviews', guideId, limit],
    queryFn: async () => {
      if (!guideId) throw new Error('Guide ID is required');

      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select('id, overall_rating, comment, created_at, hiker_id')
        .eq('guide_id', guideId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (reviewsError) throw reviewsError;
      if (!reviewsData) return [];

      // Fetch hiker profiles separately
      const hikerIds = reviewsData.map(r => r.hiker_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name, avatar_url')
        .in('id', hikerIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      return reviewsData.map(review => ({
        id: review.id,
        rating: review.overall_rating,
        comment: review.comment || '',
        created_at: review.created_at,
        hiker_id: review.hiker_id,
        hiker_name: profileMap.get(review.hiker_id)?.name,
        hiker_avatar: profileMap.get(review.hiker_id)?.avatar_url,
      })) as GuideReview[];
    },
    enabled: !!guideId,
    staleTime: 5 * 60 * 1000,
  });
}
