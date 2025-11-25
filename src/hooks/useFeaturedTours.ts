import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tour } from '@/types';

/**
 * Fetches featured tours for the landing page
 * Returns active tours with guide information, sorted by rating and reviews
 */
export function useFeaturedTours(limit = 3) {
  return useQuery({
    queryKey: ['featured-tours', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tours')
        .select(`
          *,
          guide_profiles!tours_guide_id_fkey(display_name, certifications, verified)
        `)
        .eq('is_active', true)
        .order('rating', { ascending: false })
        .order('reviews_count', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data || []) as (Tour & { guide_profiles: any })[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
