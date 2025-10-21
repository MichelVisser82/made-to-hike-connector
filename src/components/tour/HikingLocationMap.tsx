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

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const initMap = async () => {
      try {
        // Fetch Thunderforest API key from edge function
        const { data } = await supabase.functions.invoke('get-thunderforest-key');
        const apiKey = data?.key;

        if (!apiKey) {
          console.error('Thunderforest API key not available');
          setIsLoading(false);
          return;
        }

        // Initialize map
        map.current = L.map(mapContainer.current, {
          center: [latitude, longitude],
          zoom: zoom,
          zoomControl: showControls,
          scrollWheelZoom: false
        });

        // Add Thunderforest Outdoors tile layer
        L.tileLayer(
          `https://tile.thunderforest.com/outdoors/{z}/{x}/{y}.png?apikey=${apiKey}`,
          {
            attribution: 'Maps © <a href="https://www.thunderforest.com">Thunderforest</a>, Data © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
            maxZoom: 18
          }
        ).addTo(map.current);

        // Add marker
        const marker = L.marker([latitude, longitude]).addTo(map.current);
        
        if (title) {
          marker.bindPopup(title);
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Map initialization error:', error);
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

  return (
    <div 
      ref={mapContainer} 
      style={{ height, width: '100%' }}
      className="rounded-lg shadow-sm"
    />
  );
};
