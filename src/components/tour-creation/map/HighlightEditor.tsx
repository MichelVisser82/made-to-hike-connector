import { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TourHighlight, HighlightCategory, HIGHLIGHT_CATEGORY_LABELS, HIGHLIGHT_CATEGORY_ICONS } from '@/types/map';
import { Coordinate, getRouteBoundingBox } from '@/utils/routeAnalysis';
import { MapPin, Plus, Edit, Trash2, Eye, EyeOff, Download } from 'lucide-react';
import { HighlightImageUpload } from './HighlightImageUpload';
import { toast } from 'sonner';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface HighlightEditorProps {
  trackpoints: Coordinate[];
  daySegments: Array<{ dayNumber: number; coordinates: Coordinate[] }>;
  waypoints?: Array<{ name: string; description?: string; lat: number; lng: number }>;
  onHighlightsConfirmed: (highlights: Partial<TourHighlight>[]) => void;
  onBack: () => void;
}

// Click handler component
function MapClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onClick(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
}

export function HighlightEditor({ 
  trackpoints, 
  daySegments, 
  waypoints = [],
  onHighlightsConfirmed, 
  onBack 
}: HighlightEditorProps) {
  const [highlights, setHighlights] = useState<Partial<TourHighlight>[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHighlight, setEditingHighlight] = useState<Partial<TourHighlight> | null>(null);
  const [clickMode, setClickMode] = useState(false);

  const bounds = useMemo(() => getRouteBoundingBox(trackpoints), [trackpoints]);
  const routeCoordinates: [number, number][] = useMemo(
    () => trackpoints.map(p => [p.lat, p.lng]),
    [trackpoints]
  );

  const handleMapClick = (lat: number, lng: number) => {
    if (!clickMode) return;
    
    setEditingHighlight({
      latitude: lat,
      longitude: lng,
      isPublic: false,
      photos: [],
      sequenceOrder: highlights.length
    });
    setIsModalOpen(true);
    setClickMode(false);
  };

  const handleImportWaypoint = (waypoint: typeof waypoints[0]) => {
    setEditingHighlight({
      name: waypoint.name,
      description: waypoint.description,
      latitude: waypoint.lat,
      longitude: waypoint.lng,
      category: 'scenic_viewpoint',
      isPublic: false,
      photos: [],
      sequenceOrder: highlights.length
    });
    setIsModalOpen(true);
  };

  const handleImportAllWaypoints = () => {
    const newHighlights = waypoints.map((wp, idx) => ({
      id: `temp-wp-${Date.now()}-${idx}`,
      name: wp.name,
      description: wp.description,
      latitude: wp.lat,
      longitude: wp.lng,
      category: 'scenic_viewpoint' as HighlightCategory,
      isPublic: false,
      photos: [],
      sequenceOrder: highlights.length + idx
    }));
    
    setHighlights([...highlights, ...newHighlights]);
    toast.success(`Imported ${waypoints.length} waypoints as highlights`);
  };

  const handleSaveHighlight = () => {
    if (!editingHighlight?.name || !editingHighlight?.category) {
      return;
    }

    if (editingHighlight.id) {
      setHighlights(highlights.map(h => 
        h.id === editingHighlight.id ? editingHighlight : h
      ));
    } else {
      setHighlights([...highlights, { ...editingHighlight, id: `temp-${Date.now()}` }]);
    }

    setIsModalOpen(false);
    setEditingHighlight(null);
  };

  const handleDeleteHighlight = (id: string) => {
    setHighlights(highlights.filter(h => h.id !== id));
  };

  const handleTogglePublic = (id: string) => {
    setHighlights(highlights.map(h => 
      h.id === id ? { ...h, isPublic: !h.isPublic } : h
    ));
  };

  const getMarkerIcon = (category: HighlightCategory, isPublic: boolean) => {
    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div class="flex items-center justify-center w-10 h-10 bg-white border-3 ${isPublic ? 'border-green-500' : 'border-purple-500'} rounded-full shadow-lg">
          <span class="text-xl">${HIGHLIGHT_CATEGORY_ICONS[category]}</span>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold mb-1">Add Highlights</h3>
            <p className="text-sm text-muted-foreground">
              Click on the map or import from GPX waypoints
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={clickMode ? "default" : "outline"}
              onClick={() => setClickMode(!clickMode)}
            >
              <MapPin className="h-4 w-4 mr-2" />
              {clickMode ? 'Cancel' : 'Add Highlight'}
            </Button>
            <Button onClick={() => onHighlightsConfirmed(highlights)}>
              Continue ({highlights.length} highlights)
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
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            <MapClickHandler onClick={handleMapClick} />

            {/* Route */}
            <Polyline
              positions={routeCoordinates}
              pathOptions={{
                color: '#10b981',
                weight: 3,
                opacity: 0.7
              }}
            />

            {/* Highlights */}
            {highlights.map((highlight) => (
              <Marker
                key={highlight.id}
                position={[highlight.latitude!, highlight.longitude!]}
                icon={getMarkerIcon(highlight.category!, highlight.isPublic!)}
              >
                <Popup>
                  <div className="p-2 min-w-[200px]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{HIGHLIGHT_CATEGORY_ICONS[highlight.category!]}</span>
                      <Badge variant={highlight.isPublic ? "default" : "secondary"}>
                        {highlight.isPublic ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                      </Badge>
                    </div>
                    <h4 className="font-semibold mb-1">{highlight.name}</h4>
                    <p className="text-xs text-muted-foreground mb-3">{highlight.description}</p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingHighlight(highlight);
                          setIsModalOpen(true);
                        }}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteHighlight(highlight.id!)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Import Waypoints */}
        {waypoints.length > 0 && (
          <Card className="p-4 mt-4 bg-muted/50">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Import from GPX Waypoints ({waypoints.length})
              </h4>
              <Button
                variant="default"
                size="sm"
                onClick={handleImportAllWaypoints}
              >
                <Download className="h-3 w-3 mr-2" />
                Import All
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {waypoints.slice(0, 10).map((wp, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  onClick={() => handleImportWaypoint(wp)}
                  className="justify-start"
                >
                  <MapPin className="h-3 w-3 mr-2" />
                  {wp.name}
                </Button>
              ))}
            </div>
            {waypoints.length > 10 && (
              <p className="text-xs text-muted-foreground mt-2">
                Showing 10 of {waypoints.length} waypoints. Click "Import All" to import all at once.
              </p>
            )}
          </Card>
        )}

        {/* Highlights List */}
        {highlights.length > 0 && (
          <div className="mt-6">
            <h4 className="font-medium mb-3">
              Highlights ({highlights.filter(h => h.isPublic).length} public, {highlights.filter(h => !h.isPublic).length} secret)
            </h4>
            <div className="space-y-2">
              {highlights.map((highlight) => (
                <div key={highlight.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <span className="text-2xl">{HIGHLIGHT_CATEGORY_ICONS[highlight.category!]}</span>
                  <div className="flex-1">
                    <h5 className="font-medium">{highlight.name}</h5>
                    <p className="text-sm text-muted-foreground">
                      {HIGHLIGHT_CATEGORY_LABELS[highlight.category!]}
                      {highlight.dayNumber && ` • Day ${highlight.dayNumber}`}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleTogglePublic(highlight.id!)}
                  >
                    {highlight.isPublic ? (
                      <Eye className="h-4 w-4 text-green-500" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-purple-500" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingHighlight(highlight);
                      setIsModalOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteHighlight(highlight.id!)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Highlight Form Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingHighlight?.id ? 'Edit' : 'Add'} Highlight
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={editingHighlight?.name || ''}
                onChange={(e) => setEditingHighlight({ ...editingHighlight, name: e.target.value })}
                placeholder="e.g., Stunning Valley Viewpoint"
              />
            </div>

            <div>
              <Label htmlFor="category">Category *</Label>
              <Select
                value={editingHighlight?.category}
                onValueChange={(value) => setEditingHighlight({ ...editingHighlight, category: value as HighlightCategory })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(HIGHLIGHT_CATEGORY_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      <span className="flex items-center gap-2">
                        {HIGHLIGHT_CATEGORY_ICONS[key as HighlightCategory]} {label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={editingHighlight?.description || ''}
                onChange={(e) => setEditingHighlight({ ...editingHighlight, description: e.target.value })}
                placeholder="Describe what makes this spot special..."
                rows={3}
              />
            </div>

            {daySegments.length > 0 && (
              <div>
                <Label htmlFor="day">Assign to Day</Label>
                <Select
                  value={editingHighlight?.dayNumber?.toString()}
                  onValueChange={(value) => setEditingHighlight({ ...editingHighlight, dayNumber: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select day (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {daySegments.map((seg) => (
                      <SelectItem key={seg.dayNumber} value={seg.dayNumber.toString()}>
                        Day {seg.dayNumber}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label htmlFor="guideNotes">Guide Notes (Private)</Label>
              <Textarea
                id="guideNotes"
                value={editingHighlight?.guideNotes || ''}
                onChange={(e) => setEditingHighlight({ ...editingHighlight, guideNotes: e.target.value })}
                placeholder="Private notes for yourself (hikers won't see this)"
                rows={2}
              />
            </div>

            <HighlightImageUpload
              photos={editingHighlight?.photos || []}
              onPhotosChange={(photos) => setEditingHighlight({ ...editingHighlight, photos })}
            />

            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <Label htmlFor="isPublic" className="text-base">Show Publicly</Label>
                <p className="text-sm text-muted-foreground">
                  Public highlights are shown on tour page. Secret spots revealed after booking.
                </p>
              </div>
              <Switch
                id="isPublic"
                checked={editingHighlight?.isPublic || false}
                onCheckedChange={(checked) => setEditingHighlight({ ...editingHighlight, isPublic: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveHighlight}>
              Save Highlight
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
      </div>
    </div>
  );
}
