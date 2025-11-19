import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';

interface HikingLocationMapProps {
  latitude: number;
  longitude: number;
  title?: string;
  height?: string;
  zoom?: number;
  showControls?: boolean;
}

export const HikingLocationMap = ({
  latitude,
  longitude,
  title,
  height = '400px',
  zoom = 13,
  showControls = true
}: HikingLocationMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('[HikingLocationMap] Component mounted with:', { latitude, longitude, title });
    
    if (!latitude || !longitude) {
      console.error('[HikingLocationMap] Missing coordinates');
      setError('Invalid coordinates');
      setIsLoading(false);
      return;
    }

    if (!mapContainer.current) return;

    const initMap = async () => {
      try {
        console.log('[HikingLocationMap] Fetching Mapbox token...');
        
        // Fetch Mapbox token from edge function
        const { data, error: functionError } = await supabase.functions.invoke('get-mapbox-token');
        
        if (functionError || !data?.token) {
          console.error('[HikingLocationMap] Failed to fetch Mapbox token:', functionError);
          setError('Unable to load map');
          setIsLoading(false);
          return;
        }

        console.log('[HikingLocationMap] Mapbox token retrieved, initializing map...');
        mapboxgl.accessToken = data.token;

        // Cleanup existing map and marker
        if (marker.current) {
          marker.current.remove();
          marker.current = null;
        }
        if (map.current) {
          map.current.remove();
          map.current = null;
        }

        // Initialize map
        map.current = new mapboxgl.Map({
          container: mapContainer.current!,
          style: 'mapbox://styles/mapbox/outdoors-v12',
          center: [longitude, latitude],
          zoom: zoom,
          scrollZoom: false
        });

        // Add navigation controls if enabled
        if (showControls) {
          map.current.addControl(
            new mapboxgl.NavigationControl({
              visualizePitch: false,
            }),
            'top-right'
          );
        }

        // Add marker
        marker.current = new mapboxgl.Marker({
          color: '#7C2D12'
        })
          .setLngLat([longitude, latitude])
          .addTo(map.current);

        // Add popup if title is provided
        if (title) {
          const popup = new mapboxgl.Popup({
            offset: 25,
            closeButton: false,
            closeOnClick: false
          }).setHTML(`<div class="font-medium text-sm">${title}</div>`);
          
          marker.current.setPopup(popup);
          popup.addTo(map.current);
        }

        console.log('[HikingLocationMap] Map initialization complete!');
        setIsLoading(false);
      } catch (error: any) {
        console.error('[HikingLocationMap] Map initialization error:', error);
        setError(error?.message || 'Failed to load map');
        setIsLoading(false);
      }
    };

    initMap();

    // Cleanup
    return () => {
      if (marker.current) {
        marker.current.remove();
      }
      if (map.current) {
        map.current.remove();
      }
    };
  }, [latitude, longitude, title, zoom, showControls]);

  if (error) {
    return (
      <div 
        style={{ height }} 
        className="flex items-center justify-center bg-cream rounded-lg border border-burgundy/10"
      >
        <p className="text-sm text-charcoal/60">{error}</p>
      </div>
    );
  }

  return (
    <div style={{ height }} className="relative">
      {isLoading && (
        <Skeleton className="absolute inset-0 rounded-lg" />
      )}
      <div 
        ref={mapContainer} 
        className="absolute inset-0 rounded-lg"
        style={{ opacity: isLoading ? 0 : 1, transition: 'opacity 0.3s' }}
      />
    </div>
  );
};
