import { useState, useCallback } from 'react';
import { Upload, FileUp, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { GPXParseResult } from '@/types/map';
import { toast } from 'sonner';

interface GPXUploaderProps {
  tourId: string;
  onUploadSuccess: (result: GPXParseResult) => void;
}

export function GPXUploader({ tourId, onUploadSuccess }: GPXUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  const handleFileUpload = useCallback(async (file: File) => {
    // Validate file
    if (!file.name.match(/\.(gpx|kml|fit)$/i)) {
      toast.error('Invalid file type. Please upload .gpx, .kml, or .fit file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File too large. Maximum size is 10MB');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('tourId', tourId);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const response = await supabase.functions.invoke('parse-gpx', {
        body: formData,
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (response.error) {
        throw response.error;
      }

      setUploadedFile(file.name);
      toast.success('GPX file uploaded and parsed successfully!');
      onUploadSuccess(response.data as GPXParseResult);

    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload GPX file');
    } finally {
      setIsUploading(false);
    }
  }, [tourId, onUploadSuccess]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  }, [handleFileUpload]);

  return (
    <Card className="p-8">
      <div
        className={`
          border-2 border-dashed rounded-lg p-12 text-center transition-colors
          ${isDragging ? 'border-primary bg-primary/5' : 'border-border'}
          ${isUploading ? 'opacity-50 pointer-events-none' : ''}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {isUploading ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Parsing GPX file...</p>
          </div>
        ) : uploadedFile ? (
          <div className="flex flex-col items-center gap-4">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
            <div>
              <p className="font-medium">{uploadedFile}</p>
              <p className="text-sm text-muted-foreground mt-2">
                File uploaded successfully! You can now split it into days.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setUploadedFile(null);
                document.getElementById('gpx-file-input')?.click();
              }}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Different File
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-full bg-primary/10 p-6">
              <FileUp className="h-12 w-12 text-primary" />
            </div>
            <div>
              <p className="text-lg font-semibold mb-2">Upload GPX File</p>
              <p className="text-sm text-muted-foreground mb-4">
                Drag and drop your GPX, KML, or FIT file here
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <AlertCircle className="h-4 w-4" />
                <span>Maximum file size: 10MB</span>
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => document.getElementById('gpx-file-input')?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                Browse Files
              </Button>
            </div>
          </div>
        )}

        <input
          id="gpx-file-input"
          type="file"
          accept=".gpx,.kml,.fit"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <h4 className="text-sm font-medium mb-2">💡 Tips</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Export your route from apps like Strava, Komoot, or AllTrails</li>
          <li>• File should contain trackpoints with GPS coordinates</li>
          <li>• Waypoints will be imported as potential highlights</li>
          <li>• We'll analyze distance, elevation, and suggest day splits</li>
        </ul>
      </div>
    </Card>
  );
}
