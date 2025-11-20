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
      const { data, error } = await supabase
        .from('hiking_regions')
        .select('*')
        .eq('is_featured', true)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as FeaturedRegion[];
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