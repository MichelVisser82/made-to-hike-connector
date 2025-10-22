import { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Coordinate } from '@/utils/routeAnalysis';
import { suggestDaySplits, analyzeRoute, getRouteBoundingBox } from '@/utils/routeAnalysis';
import { AccommodationMarker, AccommodationClickHandler } from './AccommodationMarker';
import { Sparkles, Check, Edit3, Home, Trash2 } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { toast } from 'sonner';

interface DaySplitterProps {
  trackpoints: Coordinate[];
  daysCount: number;
  currentSplits?: number[]; // Existing splits to display
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

export function DaySplitter({ trackpoints, daysCount, currentSplits, onSplitsConfirmed, onBack }: DaySplitterProps) {
  const suggestions = useMemo(() => 
    suggestDaySplits(trackpoints, daysCount), 
    [trackpoints, daysCount]
  );
  
  // Use current splits if available, otherwise use suggestions
  const [splitIndices, setSplitIndices] = useState<number[]>(
    currentSplits && currentSplits.length > 0 
      ? currentSplits 
      : suggestions.map(s => s.splitIndex)
  );
  const [mode, setMode] = useState<'suggestions' | 'manual'>('suggestions');
  const [accommodations, setAccommodations] = useState<Map<number, { lat: number; lng: number; name?: string }>>(new Map());
  const [addingAccommodation, setAddingAccommodation] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

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
    setHasUnsavedChanges(false);
    toast.success('Day splits saved successfully!');
  };

  const handleCustomize = () => {
    setMode('manual');
  };

  const handleRegenerateSplits = () => {
    const newSuggestions = suggestDaySplits(trackpoints, daysCount);
    setSplitIndices(newSuggestions.map(s => s.splitIndex));
    setMode('suggestions');
    setHasUnsavedChanges(true);
  };

  const handleDeleteSplit = (index: number) => {
    if (splitIndices.length <= 1) {
      toast.error('Cannot delete - need at least one split point');
      return;
    }
    const newSplits = splitIndices.filter((_, i) => i !== index);
    setSplitIndices(newSplits);
    setHasUnsavedChanges(true);
    toast.success('Split point removed');
  };

  const handleAddAccommodation = (lat: number, lng: number) => {
    const dayNumber = segments.findIndex((seg, idx) => {
      const splitIdx = splitIndices[idx];
      return splitIdx ? lat >= trackpoints[seg.start].lat && lat <= trackpoints[splitIdx].lat : false;
    }) + 1 || 1;
    
    const newAccommodations = new Map(accommodations);
    newAccommodations.set(dayNumber, { lat, lng, name: '' });
    setAccommodations(newAccommodations);
    setAddingAccommodation(false);
  };

  const handleUpdateAccommodation = (dayNumber: number, name: string) => {
    const acc = accommodations.get(dayNumber);
    if (acc) {
      const newAccommodations = new Map(accommodations);
      newAccommodations.set(dayNumber, { ...acc, name });
      setAccommodations(newAccommodations);
    }
  };

  const handleRemoveAccommodation = (dayNumber: number) => {
    const newAccommodations = new Map(accommodations);
    newAccommodations.delete(dayNumber);
    setAccommodations(newAccommodations);
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
            <Button 
              variant={addingAccommodation ? "default" : "outline"}
              size="sm"
              onClick={() => setAddingAccommodation(!addingAccommodation)}
            >
              <Home className="h-4 w-4 mr-2" />
              {addingAccommodation ? 'Cancel' : 'Add Accommodation'}
            </Button>
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
              {hasUnsavedChanges && ' *'}
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

            <AccommodationClickHandler 
              enabled={addingAccommodation}
              onAddAccommodation={handleAddAccommodation}
            />

            {/* Full route */}
            <Polyline
              positions={routeCoordinates}
              pathOptions={{
                color: '#800020',
                weight: 5,
                opacity: 0.9
              }}
            />

            {/* Accommodation markers */}
            {Array.from(accommodations.entries()).map(([dayNumber, acc]) => (
              <AccommodationMarker
                key={dayNumber}
                position={[acc.lat, acc.lng]}
                name={acc.name}
                onUpdate={(name) => handleUpdateAccommodation(dayNumber, name)}
                onRemove={() => handleRemoveAccommodation(dayNumber)}
              />
            ))}

            {/* Split markers */}
            {splitIndices.map((idx, i) => {
              const point = trackpoints[idx];
              return (
                <Marker
                  key={`${i}-${idx}`}
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
                      setHasUnsavedChanges(true);
                      toast.info('Split point moved - click "Confirm Splits" to save');
                    }
                  }}
                >
                  <Popup>
                    <div className="text-center p-2 min-w-[150px]">
                      <p className="font-semibold mb-2">Day {i + 1} → Day {i + 2}</p>
                      {mode === 'manual' && (
                        <>
                          <p className="text-xs text-muted-foreground mb-3">
                            Drag to adjust split point
                          </p>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteSplit(i)}
                            className="w-full"
                          >
                            <Trash2 className="h-3 w-3 mr-2" />
                            Delete Split
                          </Button>
                        </>
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
