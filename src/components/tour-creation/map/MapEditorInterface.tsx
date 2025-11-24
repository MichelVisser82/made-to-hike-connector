import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GPXUploader } from './GPXUploader';
import { DaySplitter } from './DaySplitter';
import { HighlightEditor } from './HighlightEditor';
import { PrivacySettingsPanel } from './PrivacySettingsPanel';
import { MapPreview } from './MapPreview';
import { GPXParseResult, TourHighlight } from '@/types/map';
import { Coordinate, analyzeRoute } from '@/utils/routeAnalysis';
import { Map, Upload, Sparkles, MapPin, Lock, Eye, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

  const handleSplitsConfirmed = async (splits: number[]) => {
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

    // Immediately save day routes to database if we have a tourId
    if (tourId) {
      try {
        // Delete existing day routes for this tour first
        await supabase
          .from('tour_day_routes')
          .delete()
          .eq('tour_id', tourId);

        // Insert new day routes
        if (segments.length > 0) {
          const routesToInsert = segments.map(segment => {
            const analysis = analyzeRoute(segment.coordinates);
            return {
              tour_id: tourId,
              day_number: segment.dayNumber,
              route_coordinates: segment.coordinates as any,
              distance_km: analysis.totalDistance,
              elevation_gain_m: analysis.elevationGain,
              elevation_loss_m: analysis.elevationLoss,
              estimated_duration_hours: Math.round((analysis.totalDistance / 4 + analysis.elevationGain / 600) * 10) / 10
            };
          });

          const { error } = await supabase
            .from('tour_day_routes')
            .insert(routesToInsert);

          if (error) {
            console.error('Error saving day routes:', error);
            toast.error('Failed to save day routes');
            throw error;
          }

          toast.success('Day routes saved successfully!');
        }
      } catch (error) {
        console.error('Failed to save day routes:', error);
        toast.error('Failed to save day routes');
      }
    }
  };

  const handleHighlightsConfirmed = async (newHighlights: Partial<TourHighlight>[]) => {
    setHighlights(newHighlights);
    
    // Immediately save to database if we have a tourId
    if (tourId) {
      try {
        // Delete existing highlights for this tour first
        await supabase
          .from('tour_highlights')
          .delete()
          .eq('tour_id', tourId);

        // Insert new highlights
        if (newHighlights.length > 0) {
          const highlightsToInsert = newHighlights.map((h, index) => ({
            tour_id: tourId,
            day_number: h.dayNumber || null,
            name: h.name,
            description: h.description,
            category: h.category,
            latitude: h.latitude,
            longitude: h.longitude,
            elevation_m: h.elevationM || null,
            is_public: h.isPublic || false,
            guide_notes: h.guideNotes || null,
            photos: h.photos || [],
            sequence_order: h.sequenceOrder ?? index
          }));

          const { error } = await supabase
            .from('tour_highlights')
            .insert(highlightsToInsert);

          if (error) {
            console.error('Error saving highlights:', error);
            toast.error('Failed to save highlights');
            throw error;
          }

          toast.success('Highlights saved successfully!');
        }
      } catch (error) {
        console.error('Failed to save highlights:', error);
        toast.error('Failed to save highlights');
      }
    }
  };

  const handlePrivacyConfirmed = async (settings: any) => {
    // Immediately save map settings to database if we have a tourId
    if (tourId) {
      try {
        const mapSettings = {
          tour_id: tourId,
          route_display_mode: settings.routeDisplayMode || 'region_overview',
          region_center_lat: gpxData!.analysis.boundingBox.center.lat,
          region_center_lng: gpxData!.analysis.boundingBox.center.lng,
          region_radius_km: gpxData!.analysis.boundingBox.radius,
          show_meeting_point: settings.showMeetingPoint ?? true,
          featured_highlight_ids: settings.featuredHighlightIds || []
        };

        // Check if settings already exist
        const { data: existingSettings } = await supabase
          .from('tour_map_settings')
          .select('id')
          .eq('tour_id', tourId)
          .maybeSingle();

        if (existingSettings) {
          // Update existing settings
          const { error } = await supabase
            .from('tour_map_settings')
            .update(mapSettings)
            .eq('tour_id', tourId);

          if (error) throw error;

          toast.success('Map settings saved successfully!');
        } else {
          // Insert new settings
          const { error } = await supabase
            .from('tour_map_settings')
            .insert(mapSettings);

          if (error) throw error;

          toast.success('Map settings saved successfully!');
        }
      } catch (error) {
        console.error('Failed to save map settings:', error);
        toast.error('Failed to save map settings');
      }
    }

    // Compile all data for parent component
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
            Upload a GPX file to create an interactive route map with daily segments and highlights
          </p>
        </div>
      </div>

      <Card className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload GPX
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
                  Upload a GPX file to see your interactive map preview here.
                  Once you add route data, you'll be able to split it into days, add highlights, and configure privacy settings.
                </p>
                <button
                  onClick={() => setActiveTab('upload')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  <Upload className="h-4 w-4" />
                  Upload GPX
                </button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="upload" className="mt-6">
            <GPXUploader tourId={tourId} onUploadSuccess={handleGPXUpload} />
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
