import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface RegionWithGPS {
  id: string;
  country: string;
  region: string | null;
  subregion: string;
  gps_bounds: {
    latMin: number;
    latMax: number;
    lngMin: number;
    lngMax: number;
  } | null;
}

/**
 * Hook to fetch hiking regions with GPS boundaries for location-based tagging
 */
export function useRegionGPS() {
  return useQuery({
    queryKey: ['region-gps-bounds'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hiking_regions')
        .select('id, country, region, subregion, gps_bounds')
        .eq('is_active', true)
        .not('gps_bounds', 'is', null);

      if (error) throw error;
      return data as RegionWithGPS[];
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

/**
 * Determine region from GPS coordinates by checking against all region boundaries
 * Returns hierarchical format: country-subregion (e.g., "italy-dolomites", "scotland-highlands")
 */
export function getLocationFromGPS(
  latitude: number,
  longitude: number,
  regions: RegionWithGPS[]
): string | null {
  if (!regions || regions.length === 0) return null;

  // First, try to find exact match within boundaries
  for (const region of regions) {
    if (!region.gps_bounds) continue;
    
    const { latMin, latMax, lngMin, lngMax } = region.gps_bounds;
    if (latitude >= latMin && latitude <= latMax && 
        longitude >= lngMin && longitude <= lngMax) {
      // Return in hierarchical format: country-subregion
      const countryLower = region.country.toLowerCase().replace(/\s+/g, '-');
      const subregionLower = region.subregion.toLowerCase().replace(/\s+/g, '-');
      return `${countryLower}-${subregionLower}`;
    }
  }

  // If no exact match, find closest region
  let closestRegion = regions[0];
  let minDistance = Number.MAX_VALUE;

  for (const region of regions) {
    if (!region.gps_bounds) continue;
    
    const { latMin, latMax, lngMin, lngMax } = region.gps_bounds;
    const centerLat = (latMin + latMax) / 2;
    const centerLng = (lngMin + lngMax) / 2;
    
    const distance = Math.sqrt(
      Math.pow(latitude - centerLat, 2) + 
      Math.pow(longitude - centerLng, 2)
    );
    
    if (distance < minDistance) {
      minDistance = distance;
      closestRegion = region;
    }
  }

  const countryLower = closestRegion.country.toLowerCase().replace(/\s+/g, '-');
  const subregionLower = closestRegion.subregion.toLowerCase().replace(/\s+/g, '-');
  return `${countryLower}-${subregionLower}`;
}
