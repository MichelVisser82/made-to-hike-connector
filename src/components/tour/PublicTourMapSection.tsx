import { useMemo, useState, useEffect } from 'react';
import { MapContainer, TileLayer, Circle, Marker, Popup } from 'react-leaflet';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Lock, MapPin } from 'lucide-react';
import { TourMapSettings, TourHighlight, HIGHLIGHT_CATEGORY_ICONS } from '@/types/map';
import { supabase } from '@/integrations/supabase/client';
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
  const [thunderforestKey, setThunderforestKey] = useState<string | null>(null);

  useEffect(() => {
    const fetchThunderforestKey = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-thunderforest-key');
        if (!error && data?.key) {
          setThunderforestKey(data.key);
        }
      } catch (err) {
        console.warn('Failed to fetch Thunderforest key:', err);
      }
    };
    
    fetchThunderforestKey();
  }, []);

  const center: [number, number] = useMemo(() => {
    if (mapSettings?.regionCenterLat && mapSettings?.regionCenterLng) {
      return [mapSettings.regionCenterLat, mapSettings.regionCenterLng];
    }
    if (meetingPoint) {
      return [meetingPoint.lat, meetingPoint.lng];
    }
    return [46.5, 11.3]; // Default to Dolomites
  }, [mapSettings, meetingPoint]);

  const radiusMeters = useMemo(() => {
    return (mapSettings?.regionRadiusKm || 10) * 1000;
  }, [mapSettings]);

  const showMeetingPoint = mapSettings?.showMeetingPoint !== false && meetingPoint;

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Tour Route Map</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative">
          {/* Mystery Badge */}
          <div className="absolute top-4 right-4 z-[1000] bg-background/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border flex items-center gap-2">
            <Lock className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Full route revealed after booking</span>
          </div>

          {/* Map */}
          <div className="h-[500px]">
            <MapContainer
              center={center}
              zoom={12}
              maxZoom={13}
              className="h-full w-full"
              scrollWheelZoom={false}
            >
              {thunderforestKey ? (
                <TileLayer
                  attribution='Maps © <a href="https://www.thunderforest.com">Thunderforest</a>, Data © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url={`https://{s}.tile.thunderforest.com/landscape/{z}/{x}/{y}.png?apikey=${thunderforestKey}`}
                  maxZoom={18}
                  subdomains={['a', 'b', 'c']}
                />
              ) : (
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
              )}

              {/* Region boundary circle */}
              {mapSettings?.routeDisplayMode === 'region_overview' && (
                <Circle
                  center={center}
                  radius={radiusMeters}
                  pathOptions={{
                    color: '#10b981',
                    fillColor: '#10b981',
                    fillOpacity: 0.05,
                    weight: 2,
                    dashArray: '10, 10'
                  }}
                />
              )}

              {/* Meeting point marker */}
              {showMeetingPoint && (
                <Marker position={[meetingPoint.lat, meetingPoint.lng]}>
                  <Popup>
                    <div className="text-center p-2">
                      <MapPin className="h-5 w-5 mx-auto mb-2 text-primary" />
                      <p className="font-medium">Meeting Point</p>
                    </div>
                  </Popup>
                </Marker>
              )}

              {/* Featured highlights */}
              {featuredHighlights.map((highlight) => (
                <Marker
                  key={highlight.id}
                  position={[highlight.latitude, highlight.longitude]}
                >
                  <Popup>
                    <div className="p-2 min-w-[200px]">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{HIGHLIGHT_CATEGORY_ICONS[highlight.category]}</span>
                        <h4 className="font-semibold">{highlight.name}</h4>
                      </div>
                      {highlight.description && (
                        <p className="text-sm text-muted-foreground">{highlight.description}</p>
                      )}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        {/* Day Summaries Tabs */}
        {daySummaries.length > 0 && (
          <div className="p-6 border-t">
            <h3 className="font-semibold mb-4">Daily Overview</h3>
            <Tabs defaultValue="day-1">
              <TabsList className="w-full">
                {daySummaries.map((day) => (
                  <TabsTrigger key={day.dayNumber} value={`day-${day.dayNumber}`} className="flex-1">
                    Day {day.dayNumber}
                  </TabsTrigger>
                ))}
              </TabsList>
              {daySummaries.map((day) => (
                <TabsContent key={day.dayNumber} value={`day-${day.dayNumber}`} className="mt-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <p className="text-2xl font-bold text-primary">{day.distanceKm} km</p>
                      <p className="text-sm text-muted-foreground mt-1">Distance</p>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <p className="text-2xl font-bold text-primary">{day.elevationGainM} m</p>
                      <p className="text-sm text-muted-foreground mt-1">Elevation</p>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <p className="text-2xl font-bold text-primary">~{day.estimatedHours} hrs</p>
                      <p className="text-sm text-muted-foreground mt-1">Duration</p>
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        )}

      </CardContent>
    </Card>
  );
}
