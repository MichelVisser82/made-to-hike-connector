import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GPXUploader } from './GPXUploader';
import { DaySplitter } from './DaySplitter';
import { HighlightEditor } from './HighlightEditor';
import { PrivacySettingsPanel } from './PrivacySettingsPanel';
import { GPXParseResult, TourHighlight } from '@/types/map';
import { Coordinate } from '@/utils/routeAnalysis';
import { Map, Upload, Sparkles, MapPin, Lock } from 'lucide-react';

interface MapEditorInterfaceProps {
  tourId: string;
  daysCount: number;
  onDataChange: (data: any) => void;
}

export function MapEditorInterface({ tourId, daysCount, onDataChange }: MapEditorInterfaceProps) {
  const [gpxData, setGpxData] = useState<GPXParseResult | null>(null);
  const [activeTab, setActiveTab] = useState<string>('upload');
  const [daySplits, setDaySplits] = useState<number[]>([]);
  const [daySegments, setDaySegments] = useState<Array<{ dayNumber: number; coordinates: Coordinate[] }>>([]);
  const [highlights, setHighlights] = useState<Partial<TourHighlight>[]>([]);

  const handleGPXUpload = (result: GPXParseResult) => {
    setGpxData(result);
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
          <TabsList className="grid w-full grid-cols-4">
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
            <TabsTrigger value="privacy" disabled={!highlights.length} className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Privacy
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="mt-6">
            <GPXUploader tourId={tourId} onUploadSuccess={handleGPXUpload} />
          </TabsContent>

          <TabsContent value="split" className="mt-6">
            {gpxData && (
              <DaySplitter
                trackpoints={gpxData.trackpoints}
                daysCount={daysCount}
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
                onHighlightsConfirmed={handleHighlightsConfirmed}
                onBack={() => setActiveTab('split')}
              />
            )}
          </TabsContent>

          <TabsContent value="privacy" className="mt-6">
            {highlights.length > 0 && (
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
