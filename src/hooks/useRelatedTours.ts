import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tour } from '@/types';

/**
 * Hook to fetch related tours for a tour detail page
 * Prioritizes tours in the same region, then fills with popular tours from other regions
 * 
 * @param currentTourId - ID of the current tour to exclude from results
 * @param region - Region to find related tours in
 * @returns Array of up to 3 related tours
 */
export function useRelatedTours(currentTourId: string, region?: string) {
  return useQuery({
    queryKey: ['related-tours', currentTourId, region],
    queryFn: async () => {
      const relatedTours: Tour[] = [];

      // First, try to get tours from the same region
      if (region) {
        const { data: regionalTours, error: regionalError } = await supabase
          .from('tours')
          .select('*')
          .eq('region', region)
          .eq('is_active', true)
          .neq('id', currentTourId)
          .order('rating', { ascending: false })
          .order('reviews_count', { ascending: false })
          .limit(3);

        if (regionalError) throw regionalError;
        
        if (regionalTours) {
          relatedTours.push(...(regionalTours as Tour[]));
        }
      }

      // If we have fewer than 3 tours, fill with popular tours from other regions
      if (relatedTours.length < 3) {
        // Get IDs of tours we already have to prevent duplicates
        const existingTourIds = [currentTourId, ...relatedTours.map(t => t.id)];
        
        const { data: popularTours, error: popularError } = await supabase
          .from('tours')
          .select('*')
          .eq('is_active', true)
          .not('id', 'in', `(${existingTourIds.join(',')})`)
          .order('reviews_count', { ascending: false })
          .order('rating', { ascending: false })
          .limit(3 - relatedTours.length);

        if (popularError) throw popularError;

        if (popularTours) {
          relatedTours.push(...(popularTours as Tour[]));
        }
      }

      return relatedTours as Tour[];
    },
    enabled: !!currentTourId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
