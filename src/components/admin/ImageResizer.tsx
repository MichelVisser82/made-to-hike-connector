import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { useWebsiteImages } from '@/hooks/useWebsiteImages';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Zap, RefreshCw, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface ProcessingResult {
  id: string;
  filename: string;
  status: 'pending' | 'processing' | 'success' | 'error';
  originalSize?: number;
  newSize?: number;
  error?: string;
}

export function ImageResizer() {
  const { images, fetchImages } = useWebsiteImages();
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<ProcessingResult[]>([]);
  const [progress, setProgress] = useState(0);

  const compressImage = (file: File, category: string): Promise<File> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        let { width, height } = img;
        
        // Define optimal sizes by category
        const maxDimensions: Record<string, number> = {
          hero: 1920,
          landscape: 1600,
          hiking: 1200,
          portrait: 800,
          detail: 800,
          equipment: 600,
          nature: 1200,
          mountains: 1600,
          trails: 1200,
          adventure: 1200
        };
        
        const maxDimension = maxDimensions[category] || 1200;
        
        // Only resize if the image is larger than the target
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = (height * maxDimension) / width;
            width = maxDimension;
          } else {
            width = (width * maxDimension) / height;
            height = maxDimension;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Image compression failed'));
            return;
          }
          
          const compressedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now()
          });
          
          resolve(compressedFile);
        }, 'image/jpeg', 0.85);
      };
      
      img.onerror = () => reject(new Error('Image loading failed'));
      img.src = URL.createObjectURL(file);
    });
  };

  const downloadAndResizeImage = async (image: any): Promise<ProcessingResult> => {
    const result: ProcessingResult = {
      id: image.id,
      filename: image.file_name,
      status: 'processing'
    };

    try {
      // Download the current image
      const { data: fileData, error: downloadError } = await supabase.storage
        .from('website-images')
        .download(image.file_path);

      if (downloadError) throw downloadError;

      const originalSize = fileData.size;
      result.originalSize = originalSize;

      // Convert blob to file
      const file = new File([fileData], image.file_name, { type: fileData.type });

      // Resize the image
      const resizedFile = await compressImage(file, image.category);
      result.newSize = resizedFile.size;

      // Only upload if the new size is significantly different (more than 10% difference)
      const sizeDifference = Math.abs(originalSize - resizedFile.size) / originalSize;
      if (sizeDifference < 0.1) {
        result.status = 'success';
        result.error = 'No resize needed';
        return result;
      }

      // Upload the resized image
      const { error: uploadError } = await supabase.storage
        .from('website-images')
        .update(image.file_path, resizedFile, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      result.status = 'success';
      return result;

    } catch (error) {
      result.status = 'error';
      result.error = error instanceof Error ? error.message : 'Unknown error';
      return result;
    }
  };

  const processAllImages = async () => {
    if (images.length === 0) {
      toast.error('No images to process');
      return;
    }

    setProcessing(true);
    setProgress(0);
    
    const initialResults: ProcessingResult[] = images.map(img => ({
      id: img.id,
      filename: img.file_name,
      status: 'pending'
    }));
    
    setResults(initialResults);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      
      try {
        const result = await downloadAndResizeImage(image);
        
        setResults(prev => prev.map(r => 
          r.id === image.id ? result : r
        ));

        if (result.status === 'success') {
          successCount++;
        } else {
          errorCount++;
        }

        setProgress(((i + 1) / images.length) * 100);

        // Small delay to prevent overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        console.error(`Failed to process ${image.file_name}:`, error);
        errorCount++;
      }
    }

    setProcessing(false);
    toast.success(`Processed ${images.length} images: ${successCount} successful, ${errorCount} errors`);
    
    // Refresh the images list
    await fetchImages();
  };

  const getStatusIcon = (status: ProcessingResult['status']) => {
    switch (status) {
      case 'pending':
        return <div className="w-4 h-4 rounded-full bg-gray-300" />;
      case 'processing':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Resize Existing Images
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800">
              <strong>Warning:</strong> This will resize all existing images to optimal web dimensions based on their categories. 
              Images will be compressed to JPEG format with 85% quality. This action cannot be undone.
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Found {images.length} images to process
              </p>
            </div>
            <Button 
              onClick={processAllImages}
              disabled={processing || images.length === 0}
              className="flex items-center gap-2"
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Resize All Images
                </>
              )}
            </Button>
          </div>

          {processing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Processing Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {results.map((result) => (
                <div 
                  key={result.id} 
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(result.status)}
                    <div>
                      <p className="font-medium text-sm">{result.filename}</p>
                      {result.originalSize && result.newSize && (
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(result.originalSize)} → {formatFileSize(result.newSize)}
                          {result.originalSize > result.newSize && (
                            <span className="text-green-600 ml-1">
                              (-{Math.round((1 - result.newSize / result.originalSize) * 100)}%)
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={
                        result.status === 'success' ? 'default' : 
                        result.status === 'error' ? 'destructive' : 
                        'secondary'
                      }
                    >
                      {result.status}
                    </Badge>
                    {result.error && (
                      <p className="text-xs text-red-600 max-w-xs truncate" title={result.error}>
                        {result.error}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}