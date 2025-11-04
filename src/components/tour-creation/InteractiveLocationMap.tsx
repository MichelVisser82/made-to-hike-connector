import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, MapPin } from 'lucide-react';

// Fix for default marker icons in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface InteractiveLocationMapProps {
  coordinates?: { lat: number; lng: number };
  onLocationSelect: (data: {
    address: string;
    lat: number;
    lng: number;
    formatted: string;
  }) => void;
  regionHint?: 'dolomites' | 'pyrenees' | 'scotland';
}

const REGION_CENTERS = {
  dolomites: { lat: 46.5, lng: 11.3, zoom: 9 },
  pyrenees: { lat: 42.7, lng: 0.5, zoom: 9 },
  scotland: { lat: 57.0, lng: -5.0, zoom: 8 },
};

interface LocationClickHandlerProps {
  onLocationClick: (lat: number, lng: number) => void;
}

function LocationClickHandler({ onLocationClick }: LocationClickHandlerProps) {
  useMapEvents({
    click: (e) => {
      onLocationClick(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
}

interface MapCenterControllerProps {
  center: [number, number] | null;
}

function MapCenterController({ center }: MapCenterControllerProps) {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      // Zoom level 12 shows approximately 20km radius
      map.setView(center, 12, { animate: true });
    }
  }, [center, map]);
  
  return null;
}

export function InteractiveLocationMap({ 
  coordinates, 
  onLocationSelect, 
  regionHint 
}: InteractiveLocationMapProps) {
  const [thunderforestKey, setThunderforestKey] = useState<string | null>(null);
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(
    coordinates ? [coordinates.lat, coordinates.lng] : null
  );
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(
    coordinates ? [coordinates.lat, coordinates.lng] : null
  );
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const markerRef = useRef<L.Marker>(null);

  const defaultCenter = regionHint 
    ? REGION_CENTERS[regionHint] 
    : { lat: 46.5, lng: 11.3, zoom: 6 };

  useEffect(() => {
    const fetchKey = async () => {
      const { data, error } = await supabase.functions.invoke('get-thunderforest-key');
      if (data?.key) {
        setThunderforestKey(data.key);
      } else if (error) {
        console.error('Error fetching Thunderforest key:', error);
      }
    };
    fetchKey();
  }, []);

  useEffect(() => {
    if (coordinates) {
      const newPosition: [number, number] = [coordinates.lat, coordinates.lng];
      setMarkerPosition(newPosition);
      setMapCenter(newPosition);
    }
  }, [coordinates]);

  const handleReverseGeocode = async (lat: number, lng: number) => {
    setIsReverseGeocoding(true);
    try {
      const { data, error } = await supabase.functions.invoke('reverse-geocode', {
        body: { lat, lng }
      });

      if (error) throw error;

      if (data) {
        onLocationSelect({
          address: data.address,
          lat,
          lng,
          formatted: data.formatted
        });
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      // Fallback to coordinates
      onLocationSelect({
        address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        lat,
        lng,
        formatted: `Coordinates: ${lat.toFixed(6)}, ${lng.toFixed(6)}`
      });
    } finally {
      setIsReverseGeocoding(false);
    }
  };

  const handleMapClick = (lat: number, lng: number) => {
    setMarkerPosition([lat, lng]);
    handleReverseGeocode(lat, lng);
  };

  const handleMarkerDragEnd = () => {
    const marker = markerRef.current;
    if (marker) {
      const position = marker.getLatLng();
      setMarkerPosition([position.lat, position.lng]);
      handleReverseGeocode(position.lat, position.lng);
    }
  };

  if (!thunderforestKey) {
    return (
      <div className="h-96 bg-muted rounded-lg flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="relative h-96 rounded-lg overflow-hidden border border-border">
        <MapContainer
          center={[defaultCenter.lat, defaultCenter.lng]}
          zoom={defaultCenter.zoom}
          className="h-full w-full"
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='Maps &copy; <a href="https://www.thunderforest.com">Thunderforest</a>'
            url={`https://tile.thunderforest.com/landscape/{z}/{x}/{y}.png?apikey=${thunderforestKey}`}
          />
          <LocationClickHandler onLocationClick={handleMapClick} />
          <MapCenterController center={mapCenter} />
          {markerPosition && (
            <Marker
              position={markerPosition}
              draggable={true}
              eventHandlers={{
                dragend: handleMarkerDragEnd,
              }}
              ref={markerRef}
            />
          )}
        </MapContainer>
        {isReverseGeocoding && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-background/95 backdrop-blur px-4 py-2 rounded-lg shadow-lg border border-border flex items-center gap-2 z-[1000]">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Finding address...</span>
          </div>
        )}
      </div>
      <div className="flex items-start gap-2 text-sm text-muted-foreground">
        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <p>Click anywhere on the map to drop a pin, or drag the marker to adjust the exact meeting point location.</p>
      </div>
      {markerPosition && (
        <p className="text-xs text-muted-foreground">
          Coordinates: {markerPosition[0].toFixed(6)}, {markerPosition[1].toFixed(6)}
        </p>
      )}
    </div>
  );
}
