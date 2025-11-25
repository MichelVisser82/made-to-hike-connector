import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tour } from '@/types';
import type { GuideCertification } from '@/types/guide';

export interface TourWithGuideCerts extends Tour {
  guide_certifications?: GuideCertification[];
}

/**
 * Hook to fetch featured tours for landing page display
 * Returns top-rated active tours across different regions with guide certification data
 */
export function useFeaturedTours(limit = 6) {
  return useQuery({
    queryKey: ['featured-tours', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tours')
        .select(`
          *,
          guide_profiles!tours_guide_id_fkey (
            certifications
          )
        `)
        .eq('is_active', true)
        .eq('is_custom_tour', false)
        .order('rating', { ascending: false })
        .order('reviews_count', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching featured tours:', error);
        throw error;
      }

      // Transform the data to include guide certifications at tour level
      const toursWithCerts = data?.map((tour: any) => ({
        ...tour,
        guide_certifications: tour.guide_profiles?.certifications || []
      })) || [];

      return toursWithCerts as TourWithGuideCerts[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
