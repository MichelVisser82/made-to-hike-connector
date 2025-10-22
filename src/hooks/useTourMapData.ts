import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TourMapSettings, TourHighlight } from '@/types/map';

export function useTourMapData(tourId: string) {
  return useQuery({
    queryKey: ['tour-map-data', tourId],
    queryFn: async () => {
      // Fetch map settings
      const { data: mapSettings, error: settingsError } = await supabase
        .from('tour_map_settings')
        .select('*')
        .eq('tour_id', tourId)
        .single();

      if (settingsError && settingsError.code !== 'PGRST116') {
        throw settingsError;
      }

      // If no map settings exist, return null
      if (!mapSettings) {
        return null;
      }

      // Fetch public highlights only (non-booked users)
      const { data: highlights, error: highlightsError } = await supabase
        .from('tour_highlights')
        .select('*')
        .eq('tour_id', tourId)
        .eq('is_public', true)
        .order('sequence_order');

      if (highlightsError) {
        throw highlightsError;
      }

      // Get featured highlights based on IDs
      const featuredHighlights = highlights?.filter(h => 
        mapSettings.featured_highlight_ids?.includes(h.id)
      ) || [];

      return {
        mapSettings: {
          ...mapSettings,
          tourId: mapSettings.tour_id,
          showMeetingPoint: mapSettings.show_meeting_point,
          routeDisplayMode: mapSettings.route_display_mode as any,
          regionCenterLat: mapSettings.region_center_lat,
          regionCenterLng: mapSettings.region_center_lng,
          regionRadiusKm: mapSettings.region_radius_km,
          featuredHighlightIds: mapSettings.featured_highlight_ids
        } as TourMapSettings,
        featuredHighlights: highlights?.map(h => ({
          ...h,
          tourId: h.tour_id,
          dayNumber: h.day_number,
          elevationM: h.elevation_m,
          isPublic: h.is_public,
          guideNotes: h.guide_notes,
          photos: h.photos as any,
          sequenceOrder: h.sequence_order
        })) as TourHighlight[] || []
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
