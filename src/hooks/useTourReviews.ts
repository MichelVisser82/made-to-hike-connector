import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatPublicName } from '@/lib/utils';

export interface TourReview {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  hiker_id: string;
  hiker_name?: string;
  hiker_avatar?: string;
}

export function useTourReviews(tourId: string | undefined, limit = 3) {
  return useQuery({
    queryKey: ['tour-reviews', tourId, limit],
    queryFn: async () => {
      if (!tourId) throw new Error('Tour ID is required');

      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select('id, overall_rating, comment, created_at, hiker_id')
        .eq('tour_id', tourId)
        .eq('review_type', 'hiker_to_guide')
        .eq('review_status', 'published')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (reviewsError) throw reviewsError;
      if (!reviewsData || reviewsData.length === 0) return [];

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
        hiker_name: formatPublicName(profileMap.get(review.hiker_id)?.name),
        hiker_avatar: profileMap.get(review.hiker_id)?.avatar_url,
      })) as TourReview[];
    },
    enabled: !!tourId,
    staleTime: 5 * 60 * 1000,
  });
}
