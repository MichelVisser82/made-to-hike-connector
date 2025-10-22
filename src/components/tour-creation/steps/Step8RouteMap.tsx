import { Button } from '@/components/ui/button';
import { MapEditorInterface } from '../map/MapEditorInterface';
import { useFormContext } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useState } from 'react';

interface Step8RouteMapProps {
  onSave: () => Promise<void>;
  isSaving: boolean;
  tourId?: string;
}

export function Step8RouteMap({ onSave, isSaving, tourId }: Step8RouteMapProps) {
  const { setValue, watch } = useFormContext();
  const duration = watch('duration') || '1 day';
  
  // Parse days from duration string (e.g., "3 days" -> 3)
  const daysCount = parseInt(duration.match(/\d+/)?.[0] || '1');

  const handleDataChange = (data: any) => {
    setValue('routeData', data);
  };

  const handleSkip = async () => {
    setValue('routeData', null);
    await onSave();
  };

  const handleContinue = async () => {
    const routeData = watch('routeData');
    
    if (!routeData || !tourId) {
      await onSave();
      return;
    }

    try {
      // Save map settings
      if (routeData.mapSettings) {
        const { error: settingsError } = await supabase
          .from('tour_map_settings')
          .upsert({
            tour_id: tourId,
            show_meeting_point: routeData.mapSettings.showMeetingPoint,
            route_display_mode: routeData.mapSettings.routeDisplayMode,
            region_center_lat: routeData.mapSettings.regionCenter?.lat,
            region_center_lng: routeData.mapSettings.regionCenter?.lng,
            region_radius_km: routeData.mapSettings.regionRadiusKm,
            featured_highlight_ids: routeData.mapSettings.featuredHighlightIds || []
          }, {
            onConflict: 'tour_id'
          });

        if (settingsError) throw settingsError;
      }

      // Save day routes
      if (routeData.dayRoutes && Array.isArray(routeData.dayRoutes)) {
        for (const route of routeData.dayRoutes) {
          const { error: routeError } = await supabase
            .from('tour_day_routes')
            .upsert({
              tour_id: tourId,
              day_number: route.dayNumber,
              route_coordinates: route.coordinates,
              distance_km: route.coordinates ? calculateDistance(route.coordinates) : 0,
              elevation_gain_m: route.coordinates ? calculateElevationGain(route.coordinates) : 0,
              estimated_duration_hours: route.coordinates ? estimateDuration(route.coordinates) : 0,
              elevation_profile: route.coordinates ? generateElevationProfile(route.coordinates) : []
            }, {
              onConflict: 'tour_id,day_number'
            });

          if (routeError) throw routeError;
        }
      }

      // Save highlights
      if (routeData.highlights && Array.isArray(routeData.highlights)) {
        // Delete existing highlights for this tour first
        await supabase
          .from('tour_highlights')
          .delete()
          .eq('tour_id', tourId);

        // Insert new highlights
        for (const highlight of routeData.highlights) {
          const { error: highlightError } = await supabase
            .from('tour_highlights')
            .insert({
              tour_id: tourId,
              day_number: highlight.dayNumber,
              name: highlight.name,
              description: highlight.description,
              category: highlight.category,
              latitude: highlight.latitude,
              longitude: highlight.longitude,
              elevation_m: highlight.elevationM,
              is_public: highlight.isPublic,
              guide_notes: highlight.guideNotes,
              photos: highlight.photos || [],
              sequence_order: highlight.sequenceOrder || 0
            });

          if (highlightError) throw highlightError;
        }
      }

      toast.success('Route map data saved successfully!');
      await onSave();
    } catch (error) {
      console.error('Error saving route data:', error);
      toast.error('Failed to save route data. Please try again.');
    }
  };

  // Helper functions for calculations
  const calculateDistance = (coords: any[]) => {
    let total = 0;
    for (let i = 1; i < coords.length; i++) {
      const lat1 = coords[i - 1].lat * Math.PI / 180;
      const lat2 = coords[i].lat * Math.PI / 180;
      const deltaLat = (coords[i].lat - coords[i - 1].lat) * Math.PI / 180;
      const deltaLng = (coords[i].lng - coords[i - 1].lng) * Math.PI / 180;
      const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
                Math.cos(lat1) * Math.cos(lat2) *
                Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      total += 6371 * c;
    }
    return parseFloat(total.toFixed(2));
  };

  const calculateElevationGain = (coords: any[]) => {
    let gain = 0;
    for (let i = 1; i < coords.length; i++) {
      if (coords[i].elevation && coords[i - 1].elevation) {
        const diff = coords[i].elevation - coords[i - 1].elevation;
        if (diff > 0) gain += diff;
      }
    }
    return Math.round(gain);
  };

  const estimateDuration = (coords: any[]) => {
    const distance = calculateDistance(coords);
    const elevation = calculateElevationGain(coords);
    return parseFloat((distance / 4 + elevation / 600).toFixed(1));
  };

  const generateElevationProfile = (coords: any[]) => {
    let cumulativeDistance = 0;
    const profile = [];
    
    profile.push({
      distance: 0,
      elevation: coords[0].elevation || 0
    });

    for (let i = 1; i < coords.length; i++) {
      const lat1 = coords[i - 1].lat * Math.PI / 180;
      const lat2 = coords[i].lat * Math.PI / 180;
      const deltaLat = (coords[i].lat - coords[i - 1].lat) * Math.PI / 180;
      const deltaLng = (coords[i].lng - coords[i - 1].lng) * Math.PI / 180;
      const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
                Math.cos(lat1) * Math.cos(lat2) *
                Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      cumulativeDistance += 6371 * c;

      profile.push({
        distance: parseFloat(cumulativeDistance.toFixed(2)),
        elevation: coords[i].elevation || 0
      });
    }

    return profile;
  };

  return (
    <div className="space-y-6">
      {tourId && (
        <MapEditorInterface
          tourId={tourId}
          daysCount={daysCount}
          onDataChange={handleDataChange}
        />
      )}

      <div className="flex justify-end gap-3">
        <Button variant="ghost" onClick={handleSkip} disabled={isSaving}>
          Skip for Now
        </Button>
        <Button onClick={handleContinue} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save & Continue'}
        </Button>
      </div>
    </div>
  );
}
