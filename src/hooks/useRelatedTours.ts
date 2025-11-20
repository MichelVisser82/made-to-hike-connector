import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tour } from '@/types';

interface RegionParams {
  country: string;
  region?: string | null;
  subregion: string;
}

/**
 * Hook to fetch related tours for a tour detail page using structured region hierarchy
 * Prioritizes tours in the same region hierarchy, then fills with popular tours from other regions
 * 
 * @param currentTourId - ID of the current tour to exclude from results
 * @param regionParams - Structured region parameters (country, region, subregion)
 * @returns Array of up to 3 related tours
 */
export function useRelatedTours(currentTourId: string, regionParams?: RegionParams) {
  return useQuery({
    queryKey: ['related-tours', currentTourId, regionParams],
    queryFn: async () => {
      let relatedTours: Tour[] = [];

      // First, try to get tours from the same region hierarchy
      if (regionParams) {
        let query = supabase
          .from('tours')
          .select('*')
          .eq('is_active', true)
          .eq('is_custom_tour', false)
          .neq('id', currentTourId);

        // Match country
        query = query.eq('region_country', regionParams.country);

        // If region exists, match it; otherwise match null
        if (regionParams.region) {
          query = query.eq('region_region', regionParams.region);
        } else {
          query = query.is('region_region', null);
        }

        // Match subregion
        query = query.eq('region_subregion', regionParams.subregion);

        const { data: regionalTours, error: regionalError } = await query
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
          .eq('is_custom_tour', false)
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
