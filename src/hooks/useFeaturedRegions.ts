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

      if (regionsError) throw regionsError;

      // Then, get distinct region combinations from active tours
      const { data: tours, error: toursError } = await supabase
        .from('tours')
        .select('region_country, region_region, region_subregion')
        .eq('is_active', true)
        .eq('is_custom_tour', false);

      if (toursError) throw toursError;

      // Create a set of regions that have tours
      const regionsWithTours = new Set(
        tours?.map(t => `${t.region_country}|${t.region_region}|${t.region_subregion}`).filter(Boolean) || []
      );

      // Filter featured regions to only include those with tours
      const filteredRegions = (featuredRegions || []).filter(region => {
        const key = `${region.country}|${region.region}|${region.subregion}`;
        return regionsWithTours.has(key);
      });

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