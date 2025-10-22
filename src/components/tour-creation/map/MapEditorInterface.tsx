import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GPXUploader } from './GPXUploader';
import { GPXParseResult } from '@/types/map';
import { Coordinate } from '@/utils/routeAnalysis';
import { Map, Upload, Sparkles } from 'lucide-react';

interface MapEditorInterfaceProps {
  tourId: string;
  daysCount: number;
  onDataChange: (data: any) => void;
}

export function MapEditorInterface({ tourId, daysCount, onDataChange }: MapEditorInterfaceProps) {
  const [gpxData, setGpxData] = useState<GPXParseResult | null>(null);
  const [activeTab, setActiveTab] = useState<string>('upload');

  const handleGPXUpload = (result: GPXParseResult) => {
    setGpxData(result);
    setActiveTab('split');
    
    // Pass data up to parent
    onDataChange({
      gpxData: result,
      trackpoints: result.trackpoints
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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload GPX
            </TabsTrigger>
            <TabsTrigger value="split" disabled={!gpxData} className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Split Days
            </TabsTrigger>
            <TabsTrigger value="highlights" disabled={!gpxData} className="flex items-center gap-2">
              <Map className="h-4 w-4" />
              Add Highlights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="mt-6">
            <GPXUploader tourId={tourId} onUploadSuccess={handleGPXUpload} />
          </TabsContent>

          <TabsContent value="split" className="mt-6">
            {gpxData && (
              <div className="p-8 text-center">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Route Analysis Complete</h3>
                  <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mt-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-2xl font-bold text-primary">
                        {gpxData.analysis.totalDistance.toFixed(1)} km
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">Total Distance</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-2xl font-bold text-primary">
                        {gpxData.analysis.elevationGain} m
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">Elevation Gain</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-2xl font-bold text-primary">
                        {gpxData.trackpoints.length}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">GPS Points</p>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Day splitting and highlights features coming in next phase
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="highlights" className="mt-6">
            <div className="p-8 text-center text-muted-foreground">
              Highlight editor coming in next phase
            </div>
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
