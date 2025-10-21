import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

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
  const map = useRef<L.Map | null>(null);
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
    
    console.log('[HikingLocationMap] Setting up map initialization...');
    
    // Cleanup any existing map
    if (map.current) {
      console.log('[HikingLocationMap] Cleaning up existing map');
      map.current.remove();
      map.current = null;
    }

    const initMap = async () => {
      try {
        // Wait for container to be available
        if (!mapContainer.current) {
          console.warn('[HikingLocationMap] Map container not yet available, waiting...');
          setTimeout(initMap, 100);
          return;
        }

        console.log('[HikingLocationMap] Map container ready! Creating Leaflet map instance...');
        
        // Initialize map
        map.current = L.map(mapContainer.current, {
          center: [latitude, longitude],
          zoom: zoom,
          zoomControl: showControls,
          scrollWheelZoom: false
        });

        console.log('[HikingLocationMap] Map instance created, fetching tiles API key...');
        
        // Try to fetch Thunderforest API key
        let apiKey: string | null = null;
        try {
          const { data, error: functionError } = await supabase.functions.invoke('get-thunderforest-key');
          if (functionError) {
            console.warn('[HikingLocationMap] Thunderforest key fetch error:', functionError);
          } else if (data?.key) {
            apiKey = data.key;
            console.log('[HikingLocationMap] Thunderforest API key retrieved successfully');
          } else {
            console.warn('[HikingLocationMap] No API key in response');
          }
        } catch (keyError) {
          console.warn('[HikingLocationMap] Failed to fetch Thunderforest key:', keyError);
        }

        // Add tile layer
        if (apiKey) {
          console.log('[HikingLocationMap] Adding Thunderforest Outdoors tiles');
          L.tileLayer(
            `https://{s}.tile.thunderforest.com/outdoors/{z}/{x}/{y}.png?apikey=${apiKey}`,
            {
              attribution: 'Maps © <a href="https://www.thunderforest.com">Thunderforest</a>, Data © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
              maxZoom: 18,
              subdomains: ['a', 'b', 'c']
            }
          ).addTo(map.current);
        } else {
          console.log('[HikingLocationMap] Using OpenStreetMap fallback');
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 19
          }).addTo(map.current);
        }

        console.log('[HikingLocationMap] Tiles added, creating marker...');
        
        // Add marker
        const marker = L.marker([latitude, longitude]).addTo(map.current);
        
        if (title) {
          marker.bindPopup(title);
        }

        console.log('[HikingLocationMap] Map initialization complete!');
        setIsLoading(false);
      } catch (error: any) {
        console.error('[HikingLocationMap] Map initialization error:', error);
        setError(error?.message || 'Failed to load map');
        setIsLoading(false);
      }
    };

    // Start initialization immediately
    console.log('[HikingLocationMap] Starting map initialization...');
    const timer = setTimeout(initMap, 0);

    return () => {
      clearTimeout(timer);
      if (map.current) {
        console.log('[HikingLocationMap] Cleaning up map on unmount');
        map.current.remove();
        map.current = null;
      }
    };
  }, [latitude, longitude, title, zoom, showControls]);

  if (isLoading) {
    return <Skeleton style={{ height, width: '100%' }} className="rounded-lg" />;
  }

  if (error) {
    return (
      <div 
        style={{ height, width: '100%' }}
        className="rounded-lg shadow-sm bg-muted flex items-center justify-center text-muted-foreground"
      >
        {error}
      </div>
    );
  }

  return (
    <div 
      ref={mapContainer} 
      style={{ height, width: '100%' }}
      className="rounded-lg shadow-sm"
    />
  );
};
