import { useMemo } from 'react';
import { MapContainer, TileLayer, Circle, Marker, Popup } from 'react-leaflet';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Lock, MapPin } from 'lucide-react';
import { TourMapSettings, TourHighlight, HIGHLIGHT_CATEGORY_ICONS } from '@/types/map';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface PublicTourMapSectionProps {
  mapSettings?: TourMapSettings;
  featuredHighlights?: TourHighlight[];
  meetingPoint?: { lat: number; lng: number };
  daySummaries?: Array<{
    dayNumber: number;
    distanceKm: number;
    elevationGainM: number;
    estimatedHours: number;
  }>;
}

export function PublicTourMapSection({
  mapSettings,
  featuredHighlights = [],
  meetingPoint,
  daySummaries = []
}: PublicTourMapSectionProps) {
  if (!meetingPoint) {
    return null;
  }

  const center: [number, number] = [meetingPoint.lat, meetingPoint.lng];

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Meeting Location
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] rounded-lg overflow-hidden">
          <MapContainer
            center={center}
            zoom={14}
            className="h-full w-full"
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={center}>
              <Popup>
                <div className="text-center p-2">
                  <MapPin className="h-5 w-5 mx-auto mb-2 text-primary" />
                  <p className="font-medium">Meeting Point</p>
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        </div>
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            <MapPin className="inline h-4 w-4 mr-2" />
            The exact meeting point details will be provided after booking confirmation.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
