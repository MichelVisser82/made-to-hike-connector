import { useState, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, useMapEvents } from 'react-leaflet';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Coordinate, analyzeRoute, getRouteBoundingBox } from '@/utils/routeAnalysis';
import { MousePointer, Trash2, Undo, Check } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '@/integrations/supabase/client';

interface ManualRouteDrawerProps {
  onRouteConfirmed: (trackpoints: Coordinate[]) => void;
  onBack: () => void;
}

function ClickHandler({ onAddPoint }: { onAddPoint: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onAddPoint(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
}

// Component to handle scroll with modifier key
function ScrollWheelHandler() {
  const map = useMapEvents({});
  
  useMemo(() => {
    map.scrollWheelZoom.disable();
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        map.scrollWheelZoom.enable();
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (!e.metaKey && !e.ctrlKey) {
        map.scrollWheelZoom.disable();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [map]);
  
  return null;
}

export function ManualRouteDrawer({ onRouteConfirmed, onBack }: ManualRouteDrawerProps) {
  const [points, setPoints] = useState<Coordinate[]>([]);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
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

  const analysis = useMemo(() => {
    if (points.length < 2) return null;
    return analyzeRoute(points);
  }, [points]);

  const bounds = useMemo(() => {
    if (points.length === 0) return [[-26.5, 133], [-26.5, 133]] as [[number, number], [number, number]];
    return getRouteBoundingBox(points);
  }, [points]);

  const handleAddPoint = (lat: number, lng: number) => {
    setPoints([...points, { lat, lng, elevation: 0 }]);
  };

  const handleRemovePoint = (index: number) => {
    setPoints(points.filter((_, i) => i !== index));
  };

  const handleUndo = () => {
    setPoints(points.slice(0, -1));
  };

  const handleClearAll = () => {
    setPoints([]);
  };

  const handleConfirm = () => {
    if (points.length < 2) return;
    onRouteConfirmed(points);
  };

  const pointIcon = (index: number) => L.divIcon({
    className: 'custom-marker',
    html: `
      <div class="flex items-center justify-center w-8 h-8 bg-blue-500 text-white border-2 border-white rounded-full shadow-lg font-bold text-xs cursor-move">
        ${index + 1}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold mb-1">Draw Your Route</h3>
            <p className="text-sm text-muted-foreground">
              Click on the map to add waypoints. Drag markers to adjust.
            </p>
          </div>
          <div className="flex gap-2">
            {points.length > 0 && (
              <>
                <Button variant="outline" size="sm" onClick={handleUndo}>
                  <Undo className="h-4 w-4 mr-2" />
                  Undo
                </Button>
                <Button variant="outline" size="sm" onClick={handleClearAll}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              </>
            )}
            <Button 
              onClick={handleConfirm}
              disabled={points.length < 2}
            >
              <Check className="h-4 w-4 mr-2" />
              Confirm Route
            </Button>
          </div>
        </div>

        {/* Map */}
        <div className="h-[500px] rounded-lg overflow-hidden border relative z-0">
          <MapContainer
            center={points.length > 0 ? [points[0].lat, points[0].lng] : [46.5, 11.3]}
            zoom={points.length === 0 ? 8 : 12}
            className="h-full w-full cursor-crosshair relative z-0"
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
            
            <ClickHandler onAddPoint={handleAddPoint} />
            <ScrollWheelHandler />

            {/* Route line */}
            {points.length > 1 && (
              <Polyline
                positions={points.map(p => [p.lat, p.lng] as [number, number])}
                pathOptions={{
                  color: '#800020',
                  weight: 5,
                  opacity: 0.9
                }}
              />
            )}

            {/* Point markers */}
            {points.map((point, index) => (
              <Marker
                key={index}
                position={[point.lat, point.lng]}
                icon={pointIcon(index)}
                draggable={true}
                eventHandlers={{
                  dragstart: () => setDraggingIndex(index),
                  dragend: (e) => {
                    const marker = e.target;
                    const position = marker.getLatLng();
                    const newPoints = [...points];
                    newPoints[index] = { lat: position.lat, lng: position.lng, elevation: 0 };
                    setPoints(newPoints);
                    setDraggingIndex(null);
                  }
                }}
              />
            ))}
          </MapContainer>
        </div>

        {/* Stats */}
        {analysis && (
          <div className="grid grid-cols-3 gap-4 mt-6">
            <Card className="p-4 bg-muted/50">
              <div className="text-sm text-muted-foreground mb-1">Total Distance</div>
              <div className="text-2xl font-bold">{analysis.totalDistance.toFixed(1)} km</div>
            </Card>
            <Card className="p-4 bg-muted/50">
              <div className="text-sm text-muted-foreground mb-1">Waypoints</div>
              <div className="text-2xl font-bold">{points.length}</div>
            </Card>
            <Card className="p-4 bg-muted/50">
              <div className="text-sm text-muted-foreground mb-1">Est. Duration</div>
              <div className="text-2xl font-bold">
                {Math.ceil(analysis.totalDistance / 4)} hrs
              </div>
            </Card>
          </div>
        )}

        {points.length === 0 && (
          <div className="mt-6 p-8 border-2 border-dashed rounded-lg text-center">
            <MousePointer className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Click anywhere on the map to start drawing your route
            </p>
          </div>
        )}
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
      </div>
    </div>
  );
}
