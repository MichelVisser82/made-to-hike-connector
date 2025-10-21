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
    if (!mapContainer.current) return;
    
    // Cleanup any existing map
    if (map.current) {
      map.current.remove();
      map.current = null;
    }

    const initMap = async () => {
      console.log('Initializing map with coordinates:', latitude, longitude);
      
      try {
        if (!mapContainer.current) {
          throw new Error('Map container not found');
        }

        // Initialize map with OpenStreetMap (no API key needed)
        console.log('Creating Leaflet map...');
        map.current = L.map(mapContainer.current, {
          center: [latitude, longitude],
          zoom: zoom,
          zoomControl: showControls,
          scrollWheelZoom: false
        });

        console.log('Map created, fetching Thunderforest API key...');
        
        // Try to fetch Thunderforest API key
        let apiKey: string | null = null;
        try {
          const { data, error: functionError } = await supabase.functions.invoke('get-thunderforest-key');
          if (functionError) {
            console.warn('Thunderforest key fetch error:', functionError);
          } else {
            apiKey = data?.key;
            console.log('Thunderforest API key fetched successfully');
          }
        } catch (keyError) {
          console.warn('Failed to fetch Thunderforest key, using OpenStreetMap fallback:', keyError);
        }

        // Use Thunderforest Outdoors if key available, otherwise fallback to OpenStreetMap
        if (apiKey) {
          console.log('Adding Thunderforest Outdoors tiles with API key');
          L.tileLayer(
            `https://{s}.tile.thunderforest.com/outdoors/{z}/{x}/{y}.png?apikey=${apiKey}`,
            {
              attribution: 'Maps © <a href="https://www.thunderforest.com">Thunderforest</a>, Data © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
              maxZoom: 18,
              subdomains: ['a', 'b', 'c']
            }
          ).addTo(map.current);
        } else {
          console.log('Using OpenStreetMap fallback tiles...');
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
          }).addTo(map.current);
        }

        console.log('Tiles added, adding marker...');
        
        // Add marker
        const marker = L.marker([latitude, longitude]).addTo(map.current);
        
        if (title) {
          marker.bindPopup(title);
        }

        console.log('Map initialization complete');
        setIsLoading(false);
      } catch (error) {
        console.error('Map initialization error:', error);
        setError(`Failed to load map: ${error.message || 'Unknown error'}`);
        setIsLoading(false);
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      initMap();
    }, 100);

    return () => {
      clearTimeout(timer);
      if (map.current) {
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
