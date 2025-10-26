import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatPublicName } from '@/lib/utils';

export interface GuideReview {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  hiker_id: string;
  hiker_name?: string;
  hiker_avatar?: string;
  tour_id: string;
  tour_title?: string;
}

export function useGuideReviews(guideId: string | undefined, limit = 3) {
  return useQuery({
    queryKey: ['guide-reviews', guideId, limit],
    queryFn: async () => {
      if (!guideId) throw new Error('Guide ID is required');

      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select('id, overall_rating, comment, created_at, hiker_id, tour_id')
        .eq('guide_id', guideId)
        .eq('review_type', 'hiker_to_guide')
        .eq('review_status', 'published')
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

      // Fetch tour titles
      const tourIds = reviewsData.map(r => r.tour_id);
      const { data: tours } = await supabase
        .from('tours')
        .select('id, title')
        .in('id', tourIds);

      const tourMap = new Map(tours?.map(t => [t.id, t]) || []);

      return reviewsData.map(review => ({
        id: review.id,
        rating: review.overall_rating,
        comment: review.comment || '',
        created_at: review.created_at,
        hiker_id: review.hiker_id,
        hiker_name: formatPublicName(profileMap.get(review.hiker_id)?.name),
        hiker_avatar: profileMap.get(review.hiker_id)?.avatar_url,
        tour_id: review.tour_id,
        tour_title: tourMap.get(review.tour_id)?.title,
      })) as GuideReview[];
    },
    enabled: !!guideId,
    staleTime: 5 * 60 * 1000,
  });
}
