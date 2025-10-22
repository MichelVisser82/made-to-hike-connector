import { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Coordinate } from '@/utils/routeAnalysis';
import { suggestDaySplits, analyzeRoute, getRouteBoundingBox } from '@/utils/routeAnalysis';
import { Sparkles, Check, Edit3 } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface DaySplitterProps {
  trackpoints: Coordinate[];
  daysCount: number;
  onSplitsConfirmed: (splits: number[]) => void;
  onBack: () => void;
}

// Component to fit bounds
function FitBounds({ bounds }: { bounds: [[number, number], [number, number]] }) {
  const map = useMap();
  useMemo(() => {
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [map, bounds]);
  return null;
}

export function DaySplitter({ trackpoints, daysCount, onSplitsConfirmed, onBack }: DaySplitterProps) {
  const suggestions = useMemo(() => 
    suggestDaySplits(trackpoints, daysCount), 
    [trackpoints, daysCount]
  );
  
  const [splitIndices, setSplitIndices] = useState<number[]>(
    suggestions.map(s => s.splitIndex)
  );
  const [mode, setMode] = useState<'suggestions' | 'manual'>('suggestions');
  const [accommodations, setAccommodations] = useState<Map<number, { lat: number; lng: number }>>(new Map());

  const bounds = useMemo(() => getRouteBoundingBox(trackpoints), [trackpoints]);
  
  const routeCoordinates: [number, number][] = useMemo(
    () => trackpoints.map(p => [p.lat, p.lng]),
    [trackpoints]
  );

  // Calculate segments based on current split indices
  const segments = useMemo(() => {
    const splits = [0, ...splitIndices.sort((a, b) => a - b), trackpoints.length - 1];
    return splits.slice(0, -1).map((start, idx) => {
      const end = splits[idx + 1];
      const segmentPoints = trackpoints.slice(start, end + 1);
      const analysis = analyzeRoute(segmentPoints);
      return {
        dayNumber: idx + 1,
        start,
        end,
        distance: analysis.totalDistance,
        elevation: analysis.elevationGain,
        coordinates: segmentPoints
      };
    });
  }, [splitIndices, trackpoints]);

  const handleAcceptSuggestions = () => {
    onSplitsConfirmed(splitIndices);
  };

  const handleCustomize = () => {
    setMode('manual');
  };

  const handleRegenerateSplits = () => {
    const newSuggestions = suggestDaySplits(trackpoints, daysCount);
    setSplitIndices(newSuggestions.map(s => s.splitIndex));
    setMode('suggestions');
  };

  const splitMarkerIcon = L.divIcon({
    className: 'custom-marker',
    html: `
      <div class="flex items-center justify-center w-10 h-10 bg-white border-4 border-orange-500 rounded-lg shadow-lg cursor-move">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-orange-500">
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  });

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold mb-1">Split Route into Days</h3>
            <p className="text-sm text-muted-foreground">
              We've suggested {daysCount} day splits based on distance and elevation
            </p>
          </div>
          <div className="flex gap-2">
            {mode === 'manual' && (
              <Button variant="outline" onClick={handleRegenerateSplits}>
                <Sparkles className="h-4 w-4 mr-2" />
                Auto-Split
              </Button>
            )}
            {mode === 'suggestions' && (
              <Button variant="outline" onClick={handleCustomize}>
                <Edit3 className="h-4 w-4 mr-2" />
                Customize
              </Button>
            )}
            <Button onClick={handleAcceptSuggestions}>
              <Check className="h-4 w-4 mr-2" />
              {mode === 'suggestions' ? 'Accept Splits' : 'Confirm Splits'}
            </Button>
          </div>
        </div>

        {/* Map */}
        <div className="h-[500px] rounded-lg overflow-hidden border">
          <MapContainer
            center={[bounds[0][0], bounds[0][1]]}
            zoom={12}
            className="h-full w-full"
            scrollWheelZoom={true}
          >
            <FitBounds bounds={bounds} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Full route as gray line */}
            <Polyline
              positions={routeCoordinates}
              pathOptions={{
                color: '#9ca3af',
                weight: 3,
                opacity: 0.6
              }}
            />

            {/* Split markers */}
            {splitIndices.map((idx, i) => {
              const point = trackpoints[idx];
              return (
                <Marker
                  key={i}
                  position={[point.lat, point.lng]}
                  icon={splitMarkerIcon}
                  draggable={mode === 'manual'}
                  eventHandlers={{
                    dragend: (e) => {
                      const marker = e.target;
                      const position = marker.getLatLng();
                      // Find nearest trackpoint
                      let nearestIdx = 0;
                      let minDistance = Infinity;
                      trackpoints.forEach((tp, tpIdx) => {
                        const dist = Math.sqrt(
                          Math.pow(tp.lat - position.lat, 2) + 
                          Math.pow(tp.lng - position.lng, 2)
                        );
                        if (dist < minDistance) {
                          minDistance = dist;
                          nearestIdx = tpIdx;
                        }
                      });
                      const newSplits = [...splitIndices];
                      newSplits[i] = nearestIdx;
                      setSplitIndices(newSplits);
                    }
                  }}
                >
                  <Popup>
                    <div className="text-center p-2">
                      <p className="font-semibold">Day {i + 1} → Day {i + 2}</p>
                      {mode === 'manual' && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Drag to adjust split point
                        </p>
                      )}
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>

        {/* Segments Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {segments.map((segment) => (
            <Card key={segment.dayNumber} className="p-4 bg-muted/50">
              <div className="flex items-center justify-between mb-3">
                <Badge variant="secondary" className="text-sm">
                  Day {segment.dayNumber}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {segment.end - segment.start} points
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Distance:</span>
                  <span className="font-semibold">{segment.distance.toFixed(1)} km</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Elevation:</span>
                  <span className="font-semibold">{segment.elevation} m</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Est. Duration:</span>
                  <span className="font-semibold">
                    {Math.ceil(segment.distance / 4 + segment.elevation / 600)} hrs
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
      </div>
    </div>
  );
}
