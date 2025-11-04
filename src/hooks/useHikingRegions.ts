import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface HikingRegion {
  id: string;
  country: string;
  region: string | null;
  subregion: string;
  description: string;
  key_features: string[];
}

export const useHikingRegions = () => {
  return useQuery({
    queryKey: ['hiking-regions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hiking_regions')
        .select('*')
        .eq('is_active', true)
        .order('country', { ascending: true })
        .order('region', { ascending: true, nullsFirst: false })
        .order('subregion', { ascending: true });

      if (error) throw error;
      return data as HikingRegion[];
    },
  });
};

export const useCountries = () => {
  const { data: regions } = useHikingRegions();

  const countries = regions
    ? Array.from(new Set(regions.map(r => r.country))).sort()
    : [];

  return { countries };
};

export const useRegionsByCountry = (country: string | null) => {
  const { data: regions } = useHikingRegions();

  if (!country || !regions) {
    return { regions: [], hasRegions: false };
  }

  const countryRegions = regions.filter(r => r.country === country);
  
  // Check if this country has parent regions
  const hasRegions = countryRegions.some(r => r.region !== null && r.region !== '');

  return { regions: countryRegions, hasRegions };
};

export const useSubregionsByRegion = (country: string | null, region: string | null) => {
  const { data: allRegions } = useHikingRegions();

  if (!country || !allRegions) {
    return { subregions: [] };
  }

  let subregions: HikingRegion[];

  if (region) {
    // Filter by both country and region
    subregions = allRegions.filter(
      r => r.country === country && r.region === region
    );
  } else {
    // Show subregions without parent region (region is null or empty)
    subregions = allRegions.filter(
      r => r.country === country && (!r.region || r.region === '')
    );
  }

  return { subregions };
};