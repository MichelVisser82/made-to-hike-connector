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
    if (!mapContainer.current || map.current) return;

    const initMap = async () => {
      try {
        // Initialize map first
        map.current = L.map(mapContainer.current!, {
          center: [latitude, longitude],
          zoom: zoom,
          zoomControl: showControls,
          scrollWheelZoom: false
        });

        // Try to fetch Thunderforest API key
        let apiKey: string | null = null;
        try {
          const { data, error: functionError } = await supabase.functions.invoke('get-thunderforest-key');
          if (functionError) {
            console.warn('Thunderforest key fetch error:', functionError);
          }
          apiKey = data?.key;
        } catch (keyError) {
          console.warn('Failed to fetch Thunderforest key, using fallback:', keyError);
        }

        // Use Thunderforest if key available, otherwise fallback to OpenStreetMap
        if (apiKey) {
          L.tileLayer(
            `https://tile.thunderforest.com/outdoors/{z}/{x}/{y}.png?apikey=${apiKey}`,
            {
              attribution: 'Maps © <a href="https://www.thunderforest.com">Thunderforest</a>, Data © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
              maxZoom: 18
            }
          ).addTo(map.current);
        } else {
          // Fallback to OpenStreetMap
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
          }).addTo(map.current);
        }

        // Add marker
        const marker = L.marker([latitude, longitude]).addTo(map.current);
        
        if (title) {
          marker.bindPopup(title);
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Map initialization error:', error);
        setError('Failed to load map');
        setIsLoading(false);
      }
    };

    initMap();

    // Cleanup
    return () => {
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
