import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tour } from '@/types';

/**
 * Hook to fetch featured tours for landing page display
 * Returns top-rated active tours across different regions
 */
export function useFeaturedTours(limit = 6) {
  return useQuery({
    queryKey: ['featured-tours', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tours')
        .select('*')
        .eq('is_active', true)
        .eq('is_custom_tour', false)
        .order('rating', { ascending: false })
        .order('reviews_count', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching featured tours:', error);
        throw error;
      }

      return data as Tour[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
