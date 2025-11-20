import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface FeaturedRegion {
  id: string;
  country: string;
  region: string | null;
  subregion: string;
  description: string;
  key_features: string[];
  display_order: number;
}

/**
 * Hook to fetch featured hiking regions for display in carousels, footers, etc.
 */
export function useFeaturedRegions() {
  return useQuery({
    queryKey: ['featured-regions'],
    queryFn: async () => {
      // First, get all featured regions
      const { data: featuredRegions, error: regionsError } = await supabase
        .from('hiking_regions')
        .select('*')
        .eq('is_featured', true)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (regionsError) {
        console.error('Error fetching featured regions:', regionsError);
        throw regionsError;
      }

      console.log('Featured regions from DB:', featuredRegions);

      // Then, get distinct region combinations from active tours (Country + Region only)
      const { data: tours, error: toursError } = await supabase
        .from('tours')
        .select('region_country, region_region')
        .eq('is_active', true)
        .eq('is_custom_tour', false);

      if (toursError) {
        console.error('Error fetching tours for region filtering:', toursError);
        throw toursError;
      }

      console.log('Tours for filtering:', tours);

      // Create a set of Country-Region combinations that have tours
      const regionsWithTours = new Set(
        tours?.map(t => `${t.region_country}|${t.region_region || ''}`).filter(Boolean) || []
      );

      console.log('Regions with tours (keys):', Array.from(regionsWithTours));

      // Filter featured regions to only include those with tours (matching on Country + Region)
      const filteredRegions = (featuredRegions || []).filter(region => {
        const key = `${region.country}|${region.region || ''}`;
        const hasMatch = regionsWithTours.has(key);
        console.log(`Checking region: ${region.country} - ${region.region}, key: ${key}, match: ${hasMatch}`);
        return hasMatch;
      });

      console.log('Filtered featured regions:', filteredRegions);

      return filteredRegions as FeaturedRegion[];
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

/**
 * Formats region to "Country - Region - Subregion" or "Country - Subregion"
 */
export function formatRegionPath(region: FeaturedRegion | { country: string; region: string | null; subregion: string }): string {
  if (region.region) {
    return `${region.country} - ${region.region} - ${region.subregion}`;
  }
  return `${region.country} - ${region.subregion}`;
}

/**
 * Creates URL-friendly slug from region
 */
export function regionToSlug(region: FeaturedRegion | { country: string; region: string | null; subregion: string }): string {
  const parts = [region.country, region.region, region.subregion].filter(Boolean);
  return parts.join('-').toLowerCase().replace(/\s+/g, '-');
}