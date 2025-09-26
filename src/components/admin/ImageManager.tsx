import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useWebsiteImages } from '@/hooks/useWebsiteImages';
import { ImageSizeGuide } from './ImageSizeGuide';
import { BulkImageUpload } from './BulkImageUpload';
import { toast } from 'sonner';
import { Upload, Image as ImageIcon, Tag, Trash2, Zap, Info, Sparkles, MapPin } from 'lucide-react';
import { parse } from 'exifr';

export function ImageManager() {
  const { images, loading, uploadImage, getImageUrl, fetchImages } = useWebsiteImages();
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [filesGpsData, setFilesGpsData] = useState<Array<{latitude: number; longitude: number} | null>>([]);
  const [converting, setConverting] = useState(false);
  const [uploadMetadata, setUploadMetadata] = useState({
    category: '',
    tags: '',
    alt_text: '',
    description: '',
    usage_context: '',
    priority: '0',
    optimize: true,
  });

  const categories = [
    'hero', 'landscape', 'hiking', 'portrait', 'detail', 
    'equipment', 'nature', 'mountains', 'trails', 'adventure'
  ];

  const usageContexts = [
    'landing', 'tours', 'about', 'contact', 'search', 
    'booking', 'testimonials', 'gallery', 'background'
  ];

  const extractGPSData = async (file: File) => {
    try {
      const exifData = await parse(file, {
        gps: true,
        pick: ['latitude', 'longitude']
      });
      
      if (exifData?.latitude && exifData?.longitude) {
        return {
          latitude: exifData.latitude,
          longitude: exifData.longitude
        };
      }
    } catch (error) {
      console.error('GPS extraction failed:', error);
    }
    return null;
  };

  const getLocationFromGPS = (latitude: number, longitude: number): string | null => {
    // Scotland Highlands boundaries (approximate)
    if (latitude >= 56.0 && latitude <= 58.7 && longitude >= -8.0 && longitude <= -2.0) {
      return 'scotland';
    }
    
    // Dolomites boundaries (approximate)
    if (latitude >= 46.0 && latitude <= 47.0 && longitude >= 10.5 && longitude <= 12.5) {
      return 'dolomites';
    }
    
    // Pyrenees boundaries (approximate)
    if (latitude >= 42.0 && latitude <= 43.5 && longitude >= -2.0 && longitude <= 3.5) {
      return 'pyrenees';
    }
    
    return null;
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;

    const files = Array.from(event.target.files);
    setConverting(true);
    
    try {
      const processedFiles: File[] = [];
      const urls: string[] = [];
      const gpsDataArray: Array<{latitude: number; longitude: number} | null> = [];

      for (const file of files) {
        // Extract GPS data from original file
        const gpsData = await extractGPSData(file);
        gpsDataArray.push(gpsData);
        
        // Convert HEIC files immediately
        const processedFile = await convertHEIC(file);
        processedFiles.push(processedFile);
        
        // Create preview URL from converted file
        const previewUrl = URL.createObjectURL(processedFile);
        urls.push(previewUrl);
        
        // Show conversion notification if file was converted
        if (file.name !== processedFile.name) {
          toast.success(`Converted ${file.name} to JPEG`);
        }
        
        // Show GPS detection notification
        if (gpsData) {
          toast.success(`GPS location detected in ${file.name}`);
        }
      }

      // Clean up old preview URLs
      previewUrls.forEach(url => URL.revokeObjectURL(url));
      
      setSelectedFiles(processedFiles);
      setPreviewUrls(urls);
      setFilesGpsData(gpsDataArray);
    } catch (error) {
      console.error('Error processing files:', error);
      toast.error('Failed to process some files');
    } finally {
      setConverting(false);
    }
  };

  const convertHEIC = async (file: File): Promise<File> => {
    if (file.type !== 'image/heic' && !file.name.toLowerCase().endsWith('.heic')) {
      return file;
    }
    
    try {
      const heic2any = (await import('heic2any')).default;
      const convertedBlob = await heic2any({
        blob: file,
        toType: 'image/jpeg',
        quality: 0.8
      }) as Blob;
      
      return new File([convertedBlob], file.name.replace(/\.heic$/i, '.jpg'), {
        type: 'image/jpeg'
      });
    } catch (error) {
      console.error('HEIC conversion failed:', error);
      toast.error(`Failed to convert HEIC image: ${file.name}`);
      throw new Error('Failed to convert HEIC image');
    }
  };

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
        
        // Resize if needed
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

  const handleUpload = async () => {
    if (selectedFiles.length === 0 || !uploadMetadata.category) {
      toast.error('Please select files and category');
      return;
    }

    setUploading(true);
    try {
      const metadata = {
        category: uploadMetadata.category,
        tags: uploadMetadata.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        alt_text: uploadMetadata.alt_text,
        description: uploadMetadata.description,
        usage_context: uploadMetadata.usage_context.split(',').map(ctx => ctx.trim()).filter(Boolean),
        priority: parseInt(uploadMetadata.priority) || 0,
      };

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const gpsData = filesGpsData[i];
        
        // Files are already converted from HEIC if needed
        let processedFile = file;
        
        // Apply compression if optimization is enabled
        if (uploadMetadata.optimize) {
          processedFile = await compressImage(processedFile, uploadMetadata.category);
        }
        
        // Add location tag based on GPS data
        let finalMetadata = { ...metadata };
        if (gpsData) {
          const location = getLocationFromGPS(gpsData.latitude, gpsData.longitude);
          if (location && !finalMetadata.tags.includes(`location:${location}`)) {
            finalMetadata.tags.push(`location:${location}`);
          }
        }
        
        const result = await uploadImage(processedFile, finalMetadata, false); // Don't double-optimize
        
        if (result.optimization) {
          toast.success(
            `Image optimized! Reduced by ${result.optimization.compression_ratio}% (${(result.optimization.original_size / 1024).toFixed(0)}KB → ${(result.optimization.optimized_size / 1024).toFixed(0)}KB)`
          );
        }
      }

      toast.success(`Successfully uploaded ${selectedFiles.length} image(s)`);
      setSelectedFiles([]);
      setPreviewUrls([]);
      setUploadMetadata({
        category: '',
        tags: '',
        alt_text: '',
        description: '',
        usage_context: '',
        priority: '0',
        optimize: true,
      });
    } catch (error) {
      toast.error('Failed to upload images');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Size Guide */}
      <div>
        <ImageSizeGuide />
      </div>
      
      {/* Upload and Management */}
      <div className="lg:col-span-2 space-y-6">
        <Tabs defaultValue="bulk" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="bulk" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              AI Bulk Upload
            </TabsTrigger>
            <TabsTrigger value="single" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Single Upload
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="bulk" className="space-y-6">
            <BulkImageUpload />
          </TabsContent>
          
          <TabsContent value="single" className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Images
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="files">Select Images</Label>
            <Input
              id="files"
              type="file"
              multiple
              accept="image/*,.heic,.HEIC"
              onChange={handleFileSelect}
              disabled={converting}
            />
            {converting && (
              <p className="text-sm text-blue-600 mt-1">
                Converting HEIC files...
              </p>
            )}
            {selectedFiles.length > 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                {selectedFiles.length} file(s) selected
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select
                value={uploadMetadata.category}
                onValueChange={(value) => 
                  setUploadMetadata(prev => ({ ...prev, category: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="priority">Priority (0-10)</Label>
              <Input
                id="priority"
                type="number"
                min="0"
                max="10"
                value={uploadMetadata.priority}
                onChange={(e) => 
                  setUploadMetadata(prev => ({ ...prev, priority: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="optimize"
              checked={uploadMetadata.optimize}
              onCheckedChange={(checked) => 
                setUploadMetadata(prev => ({ ...prev, optimize: checked }))
              }
            />
            <Label htmlFor="optimize" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Auto-optimize images (recommended)
            </Label>
          </div>
          
          {uploadMetadata.optimize && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900">Optimization will:</p>
                  <ul className="text-blue-700 mt-1 space-y-1">
                  <li>• Convert HEIC images to JPEG automatically</li>
                  <li>• Resize to optimal dimensions for category</li>
                    <li>• Compress to reduce file size (60-90% smaller)</li>
                    <li>• Convert to JPEG format for best compatibility</li>
                    <li>• Preserve image quality while reducing load times</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              value={uploadMetadata.tags}
              onChange={(e) => 
                setUploadMetadata(prev => ({ ...prev, tags: e.target.value }))
              }
              placeholder="mountain, sunset, hiking, adventure"
            />
          </div>

          <div>
            <Label htmlFor="usage_context">Usage Context (comma-separated)</Label>
            <Input
              id="usage_context"
              value={uploadMetadata.usage_context}
              onChange={(e) => 
                setUploadMetadata(prev => ({ ...prev, usage_context: e.target.value }))
              }
              placeholder="landing, tours, about"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Available: {usageContexts.join(', ')}
            </p>
          </div>

          <div>
            <Label htmlFor="alt_text">Alt Text</Label>
            <Input
              id="alt_text"
              value={uploadMetadata.alt_text}
              onChange={(e) => 
                setUploadMetadata(prev => ({ ...prev, alt_text: e.target.value }))
              }
              placeholder="Descriptive text for accessibility"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={uploadMetadata.description}
              onChange={(e) => 
                setUploadMetadata(prev => ({ ...prev, description: e.target.value }))
              }
              placeholder="Detailed description of the image"
            />
          </div>

          <Button 
            onClick={handleUpload} 
            disabled={uploading || converting || selectedFiles.length === 0 || !uploadMetadata.category}
            className="w-full"
          >
            {uploading ? 'Uploading...' : converting ? 'Converting...' : `Upload ${selectedFiles.length} Image(s)`}
          </Button>

          {/* Image Previews */}
          {previewUrls.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Preview:</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {previewUrls.map((url, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-1 rounded">
                      {selectedFiles[index]?.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Image Library ({images.length} images)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading images...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {images.map((image) => (
                <div key={image.id} className="border rounded-lg p-3 space-y-2">
                  <img
                    src={getImageUrl(image)}
                    alt={image.alt_text || image.file_name}
                    className="w-full h-40 object-cover rounded"
                  />
                  <div className="space-y-1">
                    <p className="font-medium text-sm truncate">{image.file_name}</p>
                    <p className="text-xs text-muted-foreground">
                      Category: {image.category} | Priority: {image.priority}
                    </p>
                    {image.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {image.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {image.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{image.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                    {image.usage_context.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {image.usage_context.slice(0, 2).map((context) => (
                          <Badge key={context} variant="outline" className="text-xs">
                            {context}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}