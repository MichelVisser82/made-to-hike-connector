import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface HikingRegion {
  id: string;
  country: string;
  region: string | null;
  subregion: string;
  description: string;
  key_features: string[];
  isUserSubmitted?: boolean;
  isPendingApproval?: boolean;
}

export const useHikingRegions = () => {
  return useQuery({
    queryKey: ['hiking-regions'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Fetch official regions
      const { data: officialRegions, error: officialError } = await supabase
        .from('hiking_regions')
        .select('*')
        .eq('is_active', true);

      if (officialError) throw officialError;

      // Fetch user-submitted regions (approved OR submitted by current user)
      const { data: userRegions, error: userError } = await supabase
        .from('user_submitted_regions')
        .select('*')
        .or(user ? `verification_status.eq.approved,submitted_by.eq.${user.id}` : 'verification_status.eq.approved');

      if (userError) throw userError;

      // Combine and format regions
      const formattedOfficial: HikingRegion[] = (officialRegions || []).map(r => ({
        id: r.id,
        country: r.country,
        region: r.region,
        subregion: r.subregion,
        description: r.description,
        key_features: r.key_features,
      }));

      const formattedUser: HikingRegion[] = (userRegions || []).map(r => ({
        id: r.id,
        country: r.country,
        region: r.region,
        subregion: r.subregion,
        description: r.description,
        key_features: r.key_features,
        isUserSubmitted: true,
        isPendingApproval: r.verification_status === 'pending',
      }));

      // Combine and sort
      const allRegions = [...formattedOfficial, ...formattedUser];
      allRegions.sort((a, b) => {
        if (a.country !== b.country) return a.country.localeCompare(b.country);
        if (a.region !== b.region) {
          if (!a.region) return 1;
          if (!b.region) return -1;
          return a.region.localeCompare(b.region);
        }
        return a.subregion.localeCompare(b.subregion);
      });

      return allRegions;
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