import { useState } from 'react';
import { useMapEvents, Marker, Popup } from 'react-leaflet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Home, X } from 'lucide-react';
import L from 'leaflet';

interface AccommodationMarkerProps {
  position: [number, number];
  name?: string;
  onUpdate: (name: string) => void;
  onRemove: () => void;
}

export function AccommodationMarker({ position, name, onUpdate, onRemove }: AccommodationMarkerProps) {
  const [localName, setLocalName] = useState(name || '');

  const accommodationIcon = L.divIcon({
    className: 'custom-marker',
    html: `
      <div class="flex items-center justify-center w-10 h-10 bg-white border-3 border-blue-500 rounded-full shadow-lg">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-500">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  });

  return (
    <Marker position={position} icon={accommodationIcon}>
      <Popup>
        <div className="p-2 min-w-[200px]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Home className="h-4 w-4 text-blue-500" />
              <span className="font-semibold">Accommodation</span>
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={onRemove}
              className="h-6 w-6"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          <div className="space-y-2">
            <div>
              <Label htmlFor="acc-name" className="text-xs">Location Name</Label>
              <Input
                id="acc-name"
                value={localName}
                onChange={(e) => setLocalName(e.target.value)}
                placeholder="e.g., Mountain Hut, Hotel..."
                className="h-8 text-sm"
              />
            </div>
            <Button
              size="sm"
              onClick={() => onUpdate(localName)}
              className="w-full"
            >
              Save
            </Button>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

interface AccommodationClickHandlerProps {
  enabled: boolean;
  onAddAccommodation: (lat: number, lng: number) => void;
}

export function AccommodationClickHandler({ enabled, onAddAccommodation }: AccommodationClickHandlerProps) {
  useMapEvents({
    click: (e) => {
      if (enabled) {
        onAddAccommodation(e.latlng.lat, e.latlng.lng);
      }
    }
  });
  return null;
}
