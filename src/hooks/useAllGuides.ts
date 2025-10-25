import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { GuideProfile, GuideCertification } from '@/types/guide';

export interface GuideWithStats extends GuideProfile {
  average_rating: number;
  reviews_count: number;
  tours_count: number;
  is_featured: boolean;
}

export function useAllGuides() {
  return useQuery({
    queryKey: ['all-guides'],
    queryFn: async () => {
      // Fetch verified guide profiles
      const { data: guides, error: guidesError } = await supabase
        .from('guide_profiles')
        .select('*')
        .eq('verified', true)
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (guidesError) throw guidesError;
      if (!guides) return [];

      // Fetch reviews aggregated by guide
      const guideIds = guides.map(g => g.user_id);
      
      const { data: reviewStats } = await supabase
        .from('reviews')
        .select('guide_id, overall_rating')
        .in('guide_id', guideIds);

      // Fetch tour counts
      const { data: tourCounts } = await supabase
        .from('tours')
        .select('guide_id')
        .eq('is_active', true)
        .in('guide_id', guideIds);

      // Aggregate stats per guide
      const statsMap = new Map<string, { rating: number; count: number; tours: number }>();
      
      guideIds.forEach(id => {
        const guideReviews = reviewStats?.filter(r => r.guide_id === id) || [];
        const avgRating = guideReviews.length > 0
          ? guideReviews.reduce((sum, r) => sum + r.overall_rating, 0) / guideReviews.length
          : 0;
        
        const tours = tourCounts?.filter(t => t.guide_id === id).length || 0;

        statsMap.set(id, {
          rating: avgRating,
          count: guideReviews.length,
          tours,
        });
      });

      // Combine guides with stats
      const guidesWithStats: GuideWithStats[] = guides.map(guide => {
        const stats = statsMap.get(guide.user_id) || { rating: 0, count: 0, tours: 0 };
        
        // Parse certifications from JSON
        const certs: GuideCertification[] = Array.isArray(guide.certifications) 
          ? (guide.certifications as unknown as GuideCertification[])
          : [];
        
        return {
          ...guide,
          average_rating: stats.rating,
          reviews_count: stats.count,
          tours_count: stats.tours,
          is_featured: guide.is_featured || false,
          certifications: certs,
        } as GuideWithStats;
      });

      return guidesWithStats;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
