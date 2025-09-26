import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { useWebsiteImages } from '@/hooks/useWebsiteImages';
import { toast } from 'sonner';
import { Upload, Sparkles, Image as ImageIcon, Edit3, Check, X, Loader2, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import heic2any from 'heic2any';
import { parse } from 'exifr';

interface ImageWithMetadata {
  file: File;
  preview: string;
  suggestions: {
    category: string;
    tags: string[];
    alt_text: string;
    description: string;
    usage_context: string[];
    priority: number;
    location?: string;
    gps?: {
      latitude: number;
      longitude: number;
      location?: string;
    };
  };
  metadata: {
    category: string;
    tags: string;
    alt_text: string;
    description: string;
    usage_context: string;
    priority: string;
    location?: string;
  };
  analyzing: boolean;
  error?: string;
  gpsData?: {
    latitude: number;
    longitude: number;
    location?: string;
  };
}

export function BulkImageUpload() {
  const { uploadImage } = useWebsiteImages();
  const [images, setImages] = useState<ImageWithMetadata[]>([]);
  const [uploading, setUploading] = useState(false);
  const [optimize, setOptimize] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Function to determine location based on GPS coordinates
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

  const categories = [
    'hero', 'landscape', 'hiking', 'portrait', 'detail', 
    'equipment', 'nature', 'mountains', 'trails', 'adventure'
  ];

  const usageContexts = [
    'landing', 'tours', 'about', 'contact', 'search', 
    'booking', 'testimonials', 'gallery', 'background'
  ];

  const convertHEIC = async (file: File): Promise<File> => {
    if (file.type !== 'image/heic' && !file.name.toLowerCase().endsWith('.heic')) {
      return file;
    }
    
    try {
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

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data:image/xxx;base64, prefix
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  const analyzeImage = async (file: File, index: number, gpsData?: any) => {
    try {
      // Convert HEIC if needed
      let processedFile = await convertHEIC(file);
      
      // Compress image for analysis (using default category if not set yet)
      processedFile = await compressImage(processedFile, 'landscape');
      
      const base64 = await fileToBase64(processedFile);
      
      const { data, error } = await supabase.functions.invoke('analyze-image-metadata', {
        body: {
          imageBase64: base64,
          filename: file.name,
          gpsData
        }
      });

      if (error) throw error;

      const suggestions = data.suggestions;
      
      // Extract location from AI suggestions or GPS data
      const aiLocation = suggestions.location || 
                         (suggestions.gps?.location) || 
                         (gpsData && getLocationFromGPS(gpsData.latitude, gpsData.longitude));
      
      // Remove location tags from AI suggestions
      const cleanTags = suggestions.tags.filter(tag => !tag.startsWith('location:'));
      
      setImages(prev => prev.map((img, i) => 
        i === index ? {
          ...img,
          suggestions: {
            ...suggestions,
            tags: cleanTags,
            location: aiLocation
          },
          metadata: {
            category: suggestions.category,
            tags: cleanTags.join(', '),
            alt_text: suggestions.alt_text,
            description: suggestions.description,
            usage_context: suggestions.usage_context.join(', '),
            priority: suggestions.priority.toString(),
            location: aiLocation || ''
          },
          analyzing: false,
          gpsData: suggestions.gps || gpsData
        } : img
      ));
    } catch (error) {
      console.error('Analysis error:', error);
      setImages(prev => prev.map((img, i) => 
        i === index ? {
          ...img,
          analyzing: false,
          error: error instanceof Error ? error.message : 'Failed to analyze image'
        } : img
      ));
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;

    const files = Array.from(event.target.files);
    
    // Filter out unsupported files
    const supportedFiles = files.filter(file => {
      const isSupported = file.type.startsWith('image/') || 
                         file.name.toLowerCase().endsWith('.heic');
      if (!isSupported) {
        toast.error(`Unsupported file type: ${file.name}`);
      }
      return isSupported;
    });

    if (supportedFiles.length === 0) return;

    setIsAnalyzing(true);
    const processedImages: ImageWithMetadata[] = [];

    // Process each file: convert HEIC first, then create preview
    for (let i = 0; i < supportedFiles.length; i++) {
      const file = supportedFiles[i];
      
      try {
        // Convert HEIC immediately
        const convertedFile = await convertHEIC(file);
        
        // Show conversion notification if file was converted
        if (file.name !== convertedFile.name) {
          toast.success(`Converted ${file.name} to JPEG`);
        }

        const imageData: ImageWithMetadata = {
          file: convertedFile, // Use converted file
          preview: URL.createObjectURL(convertedFile), // Preview from converted file
          suggestions: {
            category: 'landscape',
            tags: [],
            alt_text: '',
            description: '',
            usage_context: [],
            priority: 5,
            location: ''
          },
          metadata: {
            category: '',
            tags: '',
            alt_text: '',
            description: '',
            usage_context: '',
            priority: '5',
            location: ''
          },
          analyzing: true
        };

        processedImages.push(imageData);
      } catch (error) {
        console.error(`Failed to process ${file.name}:`, error);
        toast.error(`Failed to process ${file.name}`);
      }
    }

    setImages(prev => [...prev, ...processedImages]);

    // Analyze images sequentially to avoid overwhelming the system
    const startIndex = images.length;
    
    for (let i = 0; i < processedImages.length; i++) {
      const imageData = processedImages[i];
      const imageIndex = startIndex + i;
      
      try {
        // Extract GPS data from original file if it was HEIC
        const originalFile = supportedFiles[i];
        const gpsData = await extractGPSData(originalFile);
        
        // Update GPS data and location immediately if found
        if (gpsData) {
          const detectedLocation = getLocationFromGPS(gpsData.latitude, gpsData.longitude);
          setImages(prev => prev.map((img, idx) => 
            idx === imageIndex ? { 
              ...img, 
              gpsData,
              metadata: {
                ...img.metadata,
                location: detectedLocation || ''
              }
            } : img
          ));
        }
        
        // Then analyze with AI using the converted file
        await analyzeImage(imageData.file, imageIndex, gpsData);
        
        // Small delay between analyses to avoid rate limiting
        if (i < processedImages.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error(`Failed to process ${imageData.file.name}:`, error);
      }
    }
    
    setIsAnalyzing(false);
    toast.success(`Processing ${processedImages.length} images sequentially`);
  };

  const updateImageMetadata = (index: number, field: string, value: string) => {
    setImages(prev => prev.map((img, i) => 
      i === index ? {
        ...img,
        metadata: { ...img.metadata, [field]: value }
      } : img
    ));
  };

  const applyAISuggestions = (index: number) => {
    setImages(prev => prev.map((img, i) => 
      i === index ? {
        ...img,
        metadata: {
          category: img.suggestions.category,
          tags: img.suggestions.tags.join(', '),
          alt_text: img.suggestions.alt_text,
          description: img.suggestions.description,
          usage_context: img.suggestions.usage_context.join(', '),
          priority: img.suggestions.priority.toString(),
          location: img.suggestions.location || ''
        }
      } : img
    ));
  };

  const removeImage = (index: number) => {
    setImages(prev => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  };

  const handleBulkUpload = async () => {
    const validImages = images.filter(img => img.metadata.category);
    
    if (validImages.length === 0) {
      toast.error('Please set category for at least one image');
      return;
    }

    setUploading(true);
    let successCount = 0;

    try {
      for (const imageData of validImages) {
        const metadata = {
          category: imageData.metadata.category,
          tags: imageData.metadata.tags.split(',').map(tag => tag.trim()).filter(Boolean),
          alt_text: imageData.metadata.alt_text,
          description: imageData.metadata.description,
          usage_context: imageData.metadata.usage_context.split(',').map(ctx => ctx.trim()).filter(Boolean),
          priority: parseInt(imageData.metadata.priority) || 0,
        };

        // Add location to tags if set
        if (imageData.metadata.location) {
          metadata.tags.push(`location:${imageData.metadata.location}`);
        }

        // Process file for upload (files are already converted from HEIC)
        let finalFile = imageData.file;
        if (optimize) {
          finalFile = await compressImage(finalFile, imageData.metadata.category);
        }
        
        await uploadImage(finalFile, metadata, false); // Don't double-optimize
        successCount++;
      }

      toast.success(`Successfully uploaded ${successCount} images`);
      
      // Clean up
      images.forEach(img => URL.revokeObjectURL(img.preview));
      setImages([]);
    } catch (error) {
      toast.error(`Upload failed. ${successCount} of ${validImages.length} images uploaded.`);
      console.error('Bulk upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Bulk Upload with AI Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="bulk-files">Select Multiple Images</Label>
            <Input
              id="bulk-files"
              type="file"
              multiple
              accept="image/*,.heic"
              onChange={handleFileSelect}
              disabled={isAnalyzing}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="bulk-optimize"
              checked={optimize}
              onCheckedChange={setOptimize}
            />
            <Label htmlFor="bulk-optimize">Auto-optimize images (includes HEIC conversion)</Label>
          </div>

          {isAnalyzing && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted p-3 rounded">
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing images sequentially to ensure reliable analysis...
            </div>
          )}

          {images.length > 0 && (
            <Button 
              onClick={handleBulkUpload}
              disabled={uploading || images.every(img => !img.metadata.category)}
              className="w-full"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                `Upload ${images.filter(img => img.metadata.category).length} Images`
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      {images.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {images.map((imageData, index) => (
            <Card key={index} className="overflow-hidden">
              <div className="aspect-video relative">
                <img
                  src={imageData.preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => removeImage(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{imageData.file.name}</p>
                    {imageData.gpsData && (
                      <div className="flex items-center gap-1 text-xs text-green-600">
                        <MapPin className="h-3 w-3" />
                        GPS
                      </div>
                    )}
                  </div>
                  {imageData.analyzing && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Analyzing...
                    </div>
                  )}
                  {!imageData.analyzing && !imageData.error && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => applyAISuggestions(index)}
                    >
                      <Sparkles className="h-4 w-4 mr-1" />
                      Apply AI
                    </Button>
                  )}
                </div>

                {imageData.error && (
                  <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                    {imageData.error}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Category *</Label>
                    <Select
                      value={imageData.metadata.category}
                      onValueChange={(value) => updateImageMetadata(index, 'category', value)}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs">Priority</Label>
                    <Input
                      type="number"
                      min="0"
                      max="10"
                      value={imageData.metadata.priority}
                      onChange={(e) => updateImageMetadata(index, 'priority', e.target.value)}
                      className="h-8"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs">Location</Label>
                  <Select
                    value={imageData.metadata.location || 'none'}
                    onValueChange={(value) => updateImageMetadata(index, 'location', value)}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No location</SelectItem>
                      <SelectItem value="dolomites">Dolomites</SelectItem>
                      <SelectItem value="scotland">Scotland</SelectItem>
                      <SelectItem value="pyrenees">Pyrenees</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs">Tags</Label>
                  <Input
                    value={imageData.metadata.tags}
                    onChange={(e) => updateImageMetadata(index, 'tags', e.target.value)}
                    placeholder="mountain, sunset, hiking"
                    className="h-8"
                  />
                </div>

                <div>
                  <Label className="text-xs">Usage Context</Label>
                  <Input
                    value={imageData.metadata.usage_context}
                    onChange={(e) => updateImageMetadata(index, 'usage_context', e.target.value)}
                    placeholder="landing, tours, gallery"
                    className="h-8"
                  />
                </div>

                <div>
                  <Label className="text-xs">Alt Text</Label>
                  <Input
                    value={imageData.metadata.alt_text}
                    onChange={(e) => updateImageMetadata(index, 'alt_text', e.target.value)}
                    placeholder="Descriptive text for accessibility"
                    className="h-8"
                  />
                </div>

                <div>
                  <Label className="text-xs">Description</Label>
                  <Textarea
                    value={imageData.metadata.description}
                    onChange={(e) => updateImageMetadata(index, 'description', e.target.value)}
                    placeholder="Detailed description"
                    className="min-h-16 resize-none"
                  />
                </div>

                {!imageData.analyzing && imageData.suggestions.tags.length > 0 && (
                  <div className="text-xs">
                    <p className="font-medium text-muted-foreground mb-1">AI Suggestions:</p>
                    <div className="flex flex-wrap gap-1">
                      {imageData.suggestions.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}