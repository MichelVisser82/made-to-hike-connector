import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GPXUploader } from './GPXUploader';
import { ManualRouteDrawer } from './ManualRouteDrawer';
import { DaySplitter } from './DaySplitter';
import { HighlightEditor } from './HighlightEditor';
import { PrivacySettingsPanel } from './PrivacySettingsPanel';
import { MapPreview } from './MapPreview';
import { GPXParseResult, TourHighlight } from '@/types/map';
import { Coordinate, analyzeRoute } from '@/utils/routeAnalysis';
import { Map, Upload, Sparkles, MapPin, Lock, PenTool, Eye, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface MapEditorInterfaceProps {
  tourId: string;
  daysCount: number;
  onDataChange: (data: any) => void;
}

export function MapEditorInterface({ tourId, daysCount, onDataChange }: MapEditorInterfaceProps) {
  const [gpxData, setGpxData] = useState<GPXParseResult | null>(null);
  const [activeTab, setActiveTab] = useState<string>('preview');
  const [daySplits, setDaySplits] = useState<number[]>([]);
  const [daySegments, setDaySegments] = useState<Array<{ dayNumber: number; coordinates: Coordinate[] }>>([]);
  const [highlights, setHighlights] = useState<Partial<TourHighlight>[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load existing route data when editing a tour
  useEffect(() => {
    const loadExistingRouteData = async () => {
      if (!tourId) {
        setIsLoading(false);
        return;
      }

      try {
        // Fetch day routes
        const { data: dayRoutes, error: routesError } = await supabase
          .from('tour_day_routes')
          .select('*')
          .eq('tour_id', tourId)
          .order('day_number', { ascending: true });

        if (routesError) throw routesError;

        // Fetch highlights
        const { data: existingHighlights, error: highlightsError } = await supabase
          .from('tour_highlights')
          .select('*')
          .eq('tour_id', tourId)
          .order('sequence_order', { ascending: true });

        if (highlightsError) throw highlightsError;

        // If we have route data, reconstruct the GPX structure
        if (dayRoutes && dayRoutes.length > 0) {
          // Combine all day coordinates into full trackpoints
          const allTrackpoints: Coordinate[] = [];
          const segments: Array<{ dayNumber: number; coordinates: Coordinate[] }> = [];
          const splitIndices: number[] = [];

          dayRoutes.forEach((route, idx) => {
            const coords = route.route_coordinates as unknown as Coordinate[];
            const startIndex = allTrackpoints.length;
            
            allTrackpoints.push(...coords);
            segments.push({
              dayNumber: route.day_number,
              coordinates: coords
            });

            // Record split indices (except for the first day)
            if (idx > 0) {
              splitIndices.push(startIndex);
            }
          });

          // Reconstruct GPX data structure
          const analysis = analyzeRoute(allTrackpoints);
          const reconstructedGpxData: GPXParseResult = {
            trackpoints: allTrackpoints,
            waypoints: [],
            analysis: {
              totalDistance: analysis.totalDistance,
              elevationGain: analysis.elevationGain,
              elevationLoss: analysis.elevationLoss,
              boundingBox: analysis.boundingBox
            }
          };

          // Set all the state
          setGpxData(reconstructedGpxData);
          setDaySegments(segments);
          setDaySplits(splitIndices);

          // Convert highlights to the expected format
          if (existingHighlights && existingHighlights.length > 0) {
            const formattedHighlights: Partial<TourHighlight>[] = existingHighlights.map(h => ({
              id: h.id,
              tourId: h.tour_id,
              dayNumber: h.day_number,
              name: h.name,
              description: h.description,
              category: h.category as any,
              latitude: Number(h.latitude),
              longitude: Number(h.longitude),
              elevationM: h.elevation_m,
              isPublic: h.is_public,
              guideNotes: h.guide_notes,
              photos: h.photos as string[],
              sequenceOrder: h.sequence_order
            }));
            setHighlights(formattedHighlights);
          }
        }
      } catch (error) {
        console.error('Error loading route data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadExistingRouteData();
  }, [tourId]);

  const handleGPXUpload = (result: GPXParseResult) => {
    setGpxData(result);
    setActiveTab('split');
  };

  const handleManualRoute = (trackpoints: Coordinate[]) => {
    const analysis = analyzeRoute(trackpoints);
    const mockResult: GPXParseResult = {
      trackpoints,
      waypoints: [],
      analysis: {
        totalDistance: analysis.totalDistance,
        elevationGain: analysis.elevationGain,
        elevationLoss: analysis.elevationLoss,
        boundingBox: analysis.boundingBox
      }
    };
    setGpxData(mockResult);
    setActiveTab('split');
  };

  const handleSplitsConfirmed = (splits: number[]) => {
    setDaySplits(splits);
    
    // Create day segments
    const trackpoints = gpxData!.trackpoints;
    const splitIndices = [0, ...splits.sort((a, b) => a - b), trackpoints.length - 1];
    const segments = splitIndices.slice(0, -1).map((start, idx) => {
      const end = splitIndices[idx + 1];
      return {
        dayNumber: idx + 1,
        coordinates: trackpoints.slice(start, end + 1)
      };
    });
    
    setDaySegments(segments);
    setActiveTab('highlights');
  };

  const handleHighlightsConfirmed = (newHighlights: Partial<TourHighlight>[]) => {
    setHighlights(newHighlights);
    setActiveTab('privacy');
  };

  const handlePrivacyConfirmed = (settings: any) => {
    // Compile all data
    onDataChange({
      gpxData,
      trackpoints: gpxData!.trackpoints,
      dayRoutes: daySegments,
      highlights,
      mapSettings: {
        ...settings,
        regionCenter: gpxData!.analysis.boundingBox.center,
        regionRadiusKm: gpxData!.analysis.boundingBox.radius
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-primary/10 p-3">
          <Map className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Route & Interactive Map</h2>
          <p className="text-muted-foreground">
            Upload your GPX file to create an interactive route map
          </p>
        </div>
      </div>

      <Card className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload GPX
            </TabsTrigger>
            <TabsTrigger value="draw" className="flex items-center gap-2">
              <PenTool className="h-4 w-4" />
              Draw Route
            </TabsTrigger>
            <TabsTrigger value="split" disabled={!gpxData} className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Split Days
            </TabsTrigger>
            <TabsTrigger value="highlights" disabled={!daySplits.length} className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Highlights
            </TabsTrigger>
            <TabsTrigger value="privacy" disabled={!daySplits.length} className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Privacy
            </TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="mt-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <Loader2 className="h-12 w-12 text-muted-foreground animate-spin mb-4" />
                <p className="text-muted-foreground">Loading route data...</p>
              </div>
            ) : gpxData ? (
              <MapPreview
                gpxData={gpxData}
                daySegments={daySegments}
                highlights={highlights}
                onBack={() => setActiveTab('split')}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="rounded-full bg-muted p-6 mb-4">
                  <Map className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No Route Data Yet</h3>
                <p className="text-muted-foreground max-w-md mb-6">
                  Upload a GPX file or draw a route manually to see your interactive map preview here.
                  Once you add route data, you'll be able to split it into days, add highlights, and configure privacy settings.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setActiveTab('upload')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                  >
                    <Upload className="h-4 w-4" />
                    Upload GPX
                  </button>
                  <button
                    onClick={() => setActiveTab('draw')}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-md hover:bg-accent transition-colors"
                  >
                    <PenTool className="h-4 w-4" />
                    Draw Route
                  </button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="upload" className="mt-6">
            <GPXUploader tourId={tourId} onUploadSuccess={handleGPXUpload} />
          </TabsContent>

          <TabsContent value="draw" className="mt-6">
            <ManualRouteDrawer
              onRouteConfirmed={handleManualRoute}
              onBack={() => setActiveTab('upload')}
            />
          </TabsContent>

          <TabsContent value="split" className="mt-6">
            {gpxData && (
              <DaySplitter
                trackpoints={gpxData.trackpoints}
                daysCount={daysCount}
                currentSplits={daySplits}
                onSplitsConfirmed={handleSplitsConfirmed}
                onBack={() => setActiveTab('upload')}
              />
            )}
          </TabsContent>

          <TabsContent value="highlights" className="mt-6">
            {gpxData && daySegments.length > 0 && (
              <HighlightEditor
                trackpoints={gpxData.trackpoints}
                daySegments={daySegments}
                waypoints={gpxData.waypoints}
                existingHighlights={highlights}
                onHighlightsConfirmed={handleHighlightsConfirmed}
                onBack={() => setActiveTab('split')}
              />
            )}
          </TabsContent>

          <TabsContent value="privacy" className="mt-6">
            {gpxData && daySegments.length > 0 && (
              <PrivacySettingsPanel
                highlights={highlights}
                onSettingsConfirmed={handlePrivacyConfirmed}
                onBack={() => setActiveTab('highlights')}
              />
            )}
          </TabsContent>

        </Tabs>
      </Card>

      <div className="p-4 bg-muted/50 rounded-lg border">
        <p className="text-sm text-muted-foreground">
          <strong>Note:</strong> This step is optional. You can skip it and add route details later
          from your tour dashboard. Without a route map, your tour will show only the meeting point location.
        </p>
      </div>
    </div>
  );
}
