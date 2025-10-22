import { MapContainer, TileLayer, Polyline, Marker, Popup, Circle } from 'react-leaflet';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Eye } from 'lucide-react';
import { Coordinate } from '@/utils/routeAnalysis';
import { TourHighlight, HIGHLIGHT_CATEGORY_ICONS, GPXParseResult } from '@/types/map';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface MapPreviewProps {
  gpxData: GPXParseResult;
  daySegments: Array<{ dayNumber: number; coordinates: Coordinate[] }>;
  highlights: Partial<TourHighlight>[];
  onBack: () => void;
}

const DAY_COLORS = [
  '#ef4444', // red
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#14b8a6', // teal
];

export function MapPreview({ gpxData, daySegments, highlights, onBack }: MapPreviewProps) {
  // Use day segments if available, otherwise use full route
  const hasSegments = daySegments.length > 0;
  const routeToDisplay = hasSegments 
    ? daySegments 
    : [{ dayNumber: 1, coordinates: gpxData.trackpoints }];

  // Calculate center from all coordinates
  const allCoords = routeToDisplay.flatMap(seg => seg.coordinates);
  const centerLat = allCoords.reduce((sum, c) => sum + c.lat, 0) / allCoords.length;
  const centerLng = allCoords.reduce((sum, c) => sum + c.lng, 0) / allCoords.length;
  const center: [number, number] = [centerLat, centerLng];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Route Preview</h3>
        </div>
        <Button variant="outline" onClick={onBack}>Back to Edit</Button>
      </div>

      <Card className="overflow-hidden">
        <div className="h-[600px]">
          <MapContainer
            center={center}
            zoom={12}
            className="h-full w-full"
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Draw route for each day */}
            {routeToDisplay.map((segment, idx) => (
              <Polyline
                key={`day-${segment.dayNumber}`}
                positions={segment.coordinates.map(c => [c.lat, c.lng] as [number, number])}
                pathOptions={{
                  color: DAY_COLORS[idx % DAY_COLORS.length],
                  weight: 4,
                  opacity: 0.8
                }}
              />
            ))}

            {/* Day start/end markers */}
            {routeToDisplay.map((segment, idx) => {
              const startPoint = segment.coordinates[0];
              const endPoint = segment.coordinates[segment.coordinates.length - 1];
              
              return (
                <div key={`markers-${segment.dayNumber}`}>
                  {/* Start marker */}
                  <Circle
                    center={[startPoint.lat, startPoint.lng]}
                    radius={50}
                    pathOptions={{
                      color: DAY_COLORS[idx % DAY_COLORS.length],
                      fillColor: DAY_COLORS[idx % DAY_COLORS.length],
                      fillOpacity: 0.8,
                      weight: 2
                    }}
                  >
                    <Popup>
                      <div className="text-center p-2">
                        <p className="font-semibold">Day {segment.dayNumber} Start</p>
                      </div>
                    </Popup>
                  </Circle>
                  
                  {/* End marker */}
                  {idx === routeToDisplay.length - 1 && (
                    <Circle
                      center={[endPoint.lat, endPoint.lng]}
                      radius={50}
                      pathOptions={{
                        color: '#000000',
                        fillColor: '#000000',
                        fillOpacity: 0.8,
                        weight: 2
                      }}
                    >
                      <Popup>
                        <div className="text-center p-2">
                          <p className="font-semibold">Tour End</p>
                        </div>
                      </Popup>
                    </Circle>
                  )}
                </div>
              );
            })}

            {/* Highlight markers */}
            {highlights.map((highlight, idx) => (
              highlight.latitude && highlight.longitude && (
                <Marker
                  key={`highlight-${idx}`}
                  position={[highlight.latitude, highlight.longitude]}
                >
                  <Popup>
                    <div className="p-2 min-w-[200px]">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">
                          {highlight.category ? HIGHLIGHT_CATEGORY_ICONS[highlight.category] : '📍'}
                        </span>
                        <h4 className="font-semibold">{highlight.name}</h4>
                      </div>
                      {highlight.description && (
                        <p className="text-sm text-muted-foreground">{highlight.description}</p>
                      )}
                      <Badge variant={highlight.isPublic ? "default" : "secondary"} className="mt-2">
                        {highlight.isPublic ? "Public" : "Private"}
                      </Badge>
                    </div>
                  </Popup>
                </Marker>
              )
            ))}
          </MapContainer>
        </div>
      </Card>

      {/* Legend */}
      <Card className="p-4">
        <h4 className="font-semibold mb-3">Route Legend</h4>
        {hasSegments ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {routeToDisplay.map((segment, idx) => (
              <div key={`legend-${segment.dayNumber}`} className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: DAY_COLORS[idx % DAY_COLORS.length] }}
                />
                <span className="text-sm">Day {segment.dayNumber}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Full route displayed. Use the "Split Days" tab to divide the route into multiple days.
          </p>
        )}
        {highlights.length > 0 && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-sm text-muted-foreground">
              {highlights.length} highlight{highlights.length !== 1 ? 's' : ''} added
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}