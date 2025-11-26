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
  hero_image?: string | null;
  tour_title?: string;
  tour_slug?: string;
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

      // Then, get tours with hero images for each region
      const { data: tours, error: toursError } = await supabase
        .from('tours')
        .select('region_country, region_region, hero_image, title, slug')
        .eq('is_active', true)
        .eq('is_custom_tour', false)
        .not('hero_image', 'is', null);

      if (toursError) {
        console.error('Error fetching tours for region filtering:', toursError);
        throw toursError;
      }

      console.log('Tours for filtering:', tours);

      // Create a map of Country-Region to a representative tour
      const regionToTourMap = new Map<string, typeof tours[0]>();
      tours?.forEach(tour => {
        const key = `${tour.region_country}|${tour.region_region || ''}`;
        if (!regionToTourMap.has(key)) {
          regionToTourMap.set(key, tour);
        }
      });

      console.log('Region to tour map:', Array.from(regionToTourMap.keys()));

      // Enhance featured regions with tour hero images
      const enhancedRegions = (featuredRegions || [])
        .map(region => {
          const key = `${region.country}|${region.region || ''}`;
          const tour = regionToTourMap.get(key);
          if (!tour) return null;
          
          return {
            ...region,
            hero_image: tour.hero_image,
            tour_title: tour.title,
            tour_slug: tour.slug
          } as FeaturedRegion;
        })
        .filter((region): region is NonNullable<typeof region> => region !== null);

      console.log('Enhanced featured regions with hero images:', enhancedRegions);

      return enhancedRegions;
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