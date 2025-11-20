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

export const useCountries = (onlyWithTours: boolean = false) => {
  const { data: regions } = useHikingRegions();

  return useQuery({
    queryKey: ['countries', onlyWithTours],
    queryFn: async () => {
      if (onlyWithTours) {
        // Get distinct countries from active tours
        const { data: tours, error } = await supabase
          .from('tours')
          .select('region_country')
          .eq('is_active', true)
          .eq('is_custom_tour', false);

        if (error) throw error;

        // Extract unique countries that have tours
        const countriesWithTours = Array.from(
          new Set(tours?.map(t => t.region_country).filter(Boolean) || [])
        ).sort();

        return countriesWithTours;
      } else {
        // Get all countries from hiking_regions
        if (!regions) return [];
        
        const allCountries = Array.from(
          new Set(regions.map(r => r.country))
        ).sort();

        return allCountries;
      }
    },
    enabled: !!regions,
  });
};

export const useRegionsByCountry = (country: string | null, onlyWithTours: boolean = false) => {
  const { data: allRegions } = useHikingRegions();

  return useQuery({
    queryKey: ['regions-by-country', country, onlyWithTours],
    queryFn: async () => {
      if (!country) {
        return { regions: [], hasRegions: false };
      }

      if (onlyWithTours) {
        // Get distinct regions from active tours for this country
        const { data: tours, error } = await supabase
          .from('tours')
          .select('region_region')
          .eq('region_country', country)
          .eq('is_active', true)
          .eq('is_custom_tour', false);

        if (error) throw error;

        const uniqueRegions = Array.from(
          new Set(tours?.map(t => t.region_region).filter(Boolean) || [])
        ).sort();

        return { 
          regions: uniqueRegions,
          hasRegions: uniqueRegions.length > 0
        };
      } else {
        // Use hiking_regions data
        if (!allRegions) {
          return { regions: [], hasRegions: false };
        }

        const countryRegions = allRegions.filter(r => r.country === country);
        
        // Check if this country has parent regions
        const hasRegions = countryRegions.some(r => r.region !== null && r.region !== '');
        
        // Extract unique region names
        const uniqueRegions = Array.from(new Set(countryRegions.map(r => r.region).filter(Boolean))) as string[];

        return { regions: uniqueRegions, hasRegions };
      }
    },
    enabled: !!country && (onlyWithTours || !!allRegions),
  });
};

export const useSubregionsByRegion = (country: string | null, region: string | null, onlyWithTours: boolean = false) => {
  const { data: allRegions } = useHikingRegions();

  return useQuery({
    queryKey: ['subregions-by-region', country, region, onlyWithTours],
    queryFn: async () => {
      if (!country) {
        return { subregions: [] };
      }

      if (onlyWithTours) {
        // Get distinct subregions from active tours
        let query = supabase
          .from('tours')
          .select('region_subregion')
          .eq('region_country', country)
          .eq('is_active', true)
          .eq('is_custom_tour', false);

        // If a region is specified, filter by it
        if (region) {
          query = query.eq('region_region', region);
        }

        const { data: tours, error } = await query;

        if (error) throw error;

        const uniqueSubregions = Array.from(
          new Set(tours?.map(t => t.region_subregion).filter(Boolean) || [])
        ).sort();

        return { subregions: uniqueSubregions };
      } else {
        // Use hiking_regions data
        if (!allRegions) {
          return { subregions: [] };
        }

        let filteredRegions: HikingRegion[];

        if (region) {
          // Filter by both country and region
          filteredRegions = allRegions.filter(
            r => r.country === country && r.region === region
          );
        } else {
          // Show subregions without parent region (region is null or empty)
          filteredRegions = allRegions.filter(
            r => r.country === country && (!r.region || r.region === '')
          );
        }

        // Extract unique subregion names
        const uniqueSubregions = Array.from(new Set(filteredRegions.map(r => r.subregion)));

        return { subregions: uniqueSubregions };
      }
    },
    enabled: !!country && (onlyWithTours || !!allRegions),
  });
};

/**
 * Helper function to format region path for display
 */
export const formatRegionPath = ({ country, region, subregion }: { country: string; region?: string | null; subregion: string }): string => {
  if (region) {
    return `${country}-${region}-${subregion}`;
  }
  return `${country}-${subregion}`;
};