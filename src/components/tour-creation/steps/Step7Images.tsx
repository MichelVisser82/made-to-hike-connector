import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useFormContext } from 'react-hook-form';
import { TourFormData } from '@/hooks/useTourCreation';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Upload, X, Image as ImageIcon, Sparkles, Loader2, MapPin, Check } from 'lucide-react';
import heic2any from 'heic2any';
import { parse, gps } from 'exifr';

interface ImageWithMetadata {
  file: File;
  preview: string;
  url?: string;
  isHero: boolean;
  suggestions?: {
    alt_text: string;
    description: string;
    tags: string[];
    location?: string;
  };
  metadata: {
    alt_text: string;
    description: string;
  };
  analyzing: boolean;
  gpsData?: {
    latitude: number;
    longitude: number;
  };
}

interface Step7ImagesProps {
  onNext: () => void;
  onPrev: () => void;
}

export default function Step7Images({ onNext }: Step7ImagesProps) {
  const form = useFormContext<TourFormData>();
  const [images, setImages] = useState<ImageWithMetadata[]>([]);
  const [uploading, setUploading] = useState(false);

  const getLocationFromGPS = (latitude: number, longitude: number): string => {
    const locations = [
      {
        name: 'scotland',
        bounds: { latMin: 56.0, latMax: 58.7, lngMin: -8.0, lngMax: -2.0 },
        center: { lat: 57.35, lng: -5.0 }
      },
      {
        name: 'dolomites',
        bounds: { latMin: 46.0, latMax: 47.0, lngMin: 10.5, lngMax: 12.5 },
        center: { lat: 46.5, lng: 11.5 }
      },
      {
        name: 'pyrenees',
        bounds: { latMin: 42.0, latMax: 43.5, lngMin: -2.0, lngMax: 3.5 },
        center: { lat: 42.75, lng: 0.75 }
      }
    ];

    for (const location of locations) {
      const { latMin, latMax, lngMin, lngMax } = location.bounds;
      if (latitude >= latMin && latitude <= latMax && longitude >= lngMin && longitude <= lngMax) {
        return location.name;
      }
    }

    let closestLocation = locations[0];
    let minDistance = Number.MAX_VALUE;

    for (const location of locations) {
      const distance = Math.sqrt(
        Math.pow(latitude - location.center.lat, 2) + 
        Math.pow(longitude - location.center.lng, 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        closestLocation = location;
      }
    }

    return closestLocation.name;
  };

  const extractGPSData = async (file: File) => {
    try {
      const gpsData = await gps(file);
      
      if (gpsData && gpsData.latitude && gpsData.longitude) {
        return {
          latitude: gpsData.latitude,
          longitude: gpsData.longitude
        };
      }
    } catch (error) {
      console.error('GPS extraction failed:', error);
    }
    return null;
  };

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

  const compressImage = (file: File, isHero: boolean): Promise<File> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        let { width, height } = img;
        const maxDimension = isHero ? 1920 : 1600;
        
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

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  const analyzeImage = async (file: File, gpsData: any, isHero: boolean) => {
    try {
      const compressedFile = await compressImage(file, isHero);
      const base64 = await fileToBase64(compressedFile);
      
      const { data, error } = await supabase.functions.invoke('analyze-image-metadata', {
        body: {
          imageBase64: base64,
          filename: file.name,
          gpsData
        }
      });

      if (error) throw error;

      return data.suggestions;
    } catch (error) {
      console.error('Analysis error:', error);
      return null;
    }
  };

  const uploadToStorage = async (file: File, isHero: boolean, metadata: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const bucket = isHero ? 'hero-images' : 'tour-images';
    const filePath = `guides/${user.id}/${isHero ? 'hero' : 'tours'}/${fileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    await supabase
      .from('website_images')
      .insert({
        file_name: file.name,
        file_path: filePath,
        bucket_id: bucket,
        category: 'tour',
        uploaded_by: user.id,
        usage_context: isHero ? ['hero', 'tour'] : ['tour'],
        alt_text: metadata.alt_text,
        description: metadata.description,
        tags: metadata.tags || [],
        is_active: true,
      });

    return publicUrl;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, isHero: boolean) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const processedImages: ImageWithMetadata[] = [];

    for (const file of files) {
      try {
        const gpsData = await extractGPSData(file);
        const convertedFile = await convertHEIC(file);
        
        if (file.name !== convertedFile.name) {
          toast({
            title: "Image converted",
            description: `Converted ${file.name} to JPEG`,
          });
        }

        const imageData: ImageWithMetadata = {
          file: convertedFile,
          preview: URL.createObjectURL(convertedFile),
          isHero,
          metadata: {
            alt_text: '',
            description: ''
          },
          analyzing: true,
          gpsData: gpsData || undefined
        };

        processedImages.push(imageData);
      } catch (error) {
        console.error('Failed to process file:', error);
        toast({
          title: "Processing failed",
          description: `Failed to process ${file.name}`,
          variant: "destructive",
        });
      }
    }

    setImages(prev => [...prev, ...processedImages]);

    const startIndex = images.length;
    for (let i = 0; i < processedImages.length; i++) {
      const imageData = processedImages[i];
      const suggestions = await analyzeImage(imageData.file, imageData.gpsData, imageData.isHero);
      
      if (suggestions) {
        setImages(prev => prev.map((img, idx) => 
          idx === startIndex + i ? {
            ...img,
            suggestions,
            metadata: {
              alt_text: suggestions.alt_text,
              description: suggestions.description
            },
            analyzing: false
          } : img
        ));
      } else {
        setImages(prev => prev.map((img, idx) => 
          idx === startIndex + i ? { ...img, analyzing: false } : img
        ));
      }
      
      if (i < processedImages.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    toast({
      title: "AI analysis complete",
      description: `Analyzed ${processedImages.length} image(s)`,
    });
  };

  const updateMetadata = (index: number, field: 'alt_text' | 'description', value: string) => {
    setImages(prev => prev.map((img, i) => 
      i === index ? {
        ...img,
        metadata: { ...img.metadata, [field]: value }
      } : img
    ));
  };

  const applySuggestions = (index: number) => {
    setImages(prev => prev.map((img, i) => 
      i === index && img.suggestions ? {
        ...img,
        metadata: {
          alt_text: img.suggestions.alt_text,
          description: img.suggestions.description
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

  const handleUpload = async () => {
    if (images.length === 0) {
      toast({
        title: "No images",
        description: "Please add at least one image",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      for (let i = 0; i < images.length; i++) {
        const imageData = images[i];
        const compressedFile = await compressImage(imageData.file, imageData.isHero);
        
        const metadata = {
          alt_text: imageData.metadata.alt_text,
          description: imageData.metadata.description,
          tags: imageData.suggestions?.tags || []
        };

        if (imageData.gpsData) {
          const location = getLocationFromGPS(imageData.gpsData.latitude, imageData.gpsData.longitude);
          metadata.tags.push(`location:${location}`);
        }

        const url = await uploadToStorage(compressedFile, imageData.isHero, metadata);

        if (imageData.isHero) {
          form.setValue('hero_image', url);
        } else {
          const current = form.getValues('images') || [];
          form.setValue('images', [...current, url]);
        }
      }

      toast({
        title: "Upload complete",
        description: `Uploaded ${images.length} image(s)`,
      });

      setImages([]);
      onNext();
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload images. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const heroImage = images.find(img => img.isHero);
  const additionalImages = images.filter(img => !img.isHero);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tour Images</CardTitle>
        <p className="text-sm text-muted-foreground">
          Supported formats: JPG, PNG, WebP, HEIC • AI-powered metadata generation
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <FormLabel>Hero Image (Main) *</FormLabel>
          <div className="space-y-3 mt-2">
            {heroImage ? (
              <div className="space-y-3">
                <div className="relative w-full aspect-video rounded-lg overflow-hidden border">
                  <img src={heroImage.preview} alt="Hero" className="w-full h-full object-cover" />
                  {heroImage.analyzing && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(images.indexOf(heroImage))}
                    className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  {heroImage.suggestions?.location && (
                    <Badge className="absolute bottom-2 left-2" variant="secondary">
                      <MapPin className="w-3 h-3 mr-1" />
                      {heroImage.suggestions.location}
                    </Badge>
                  )}
                </div>
                
                {heroImage.suggestions && (
                  <div className="space-y-2 bg-muted/50 p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        AI Suggestions
                      </span>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => applySuggestions(images.indexOf(heroImage))}
                      >
                        <Check className="w-3 h-3 mr-1" />
                        Apply
                      </Button>
                    </div>
                    <Input
                      placeholder="Alt text"
                      value={heroImage.metadata.alt_text}
                      onChange={(e) => updateMetadata(images.indexOf(heroImage), 'alt_text', e.target.value)}
                    />
                    <Input
                      placeholder="Description"
                      value={heroImage.metadata.description}
                      onChange={(e) => updateMetadata(images.indexOf(heroImage), 'description', e.target.value)}
                    />
                  </div>
                )}
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors">
                <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">Upload hero image</span>
                <span className="text-xs text-muted-foreground mt-1">HEIC, JPG, PNG, WebP</span>
                <input
                  type="file"
                  accept="image/*,.heic,.HEIC"
                  onChange={(e) => handleFileSelect(e, true)}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            )}
          </div>
        </div>

        <div>
          <FormLabel>Additional Images</FormLabel>
          <div className="space-y-3 mt-2">
            {additionalImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {additionalImages.map((image, index) => {
                  const actualIndex = images.indexOf(image);
                  return (
                    <div key={actualIndex} className="space-y-2">
                      <div className="relative aspect-video rounded-lg overflow-hidden border">
                        <img src={image.preview} alt={`Tour ${index + 1}`} className="w-full h-full object-cover" />
                        {image.analyzing && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <Loader2 className="w-6 h-6 text-white animate-spin" />
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(actualIndex)}
                          className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        {image.suggestions?.location && (
                          <Badge className="absolute bottom-1 left-1 text-xs" variant="secondary">
                            <MapPin className="w-2 h-2 mr-1" />
                            {image.suggestions.location}
                          </Badge>
                        )}
                      </div>
                      {image.suggestions && (
                        <div className="space-y-1">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="w-full text-xs"
                            onClick={() => applySuggestions(actualIndex)}
                          >
                            <Check className="w-3 h-3 mr-1" />
                            Apply AI
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors">
              <ImageIcon className="w-6 h-6 text-muted-foreground mb-2" />
              <span className="text-sm text-muted-foreground">Add more images</span>
              <span className="text-xs text-muted-foreground mt-1">HEIC, JPG, PNG, WebP</span>
              <input
                type="file"
                accept="image/*,.heic,.HEIC"
                multiple
                onChange={(e) => handleFileSelect(e, false)}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>
        </div>

        {images.some(img => img.analyzing) && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            Analyzing images with AI...
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setImages([])}
            disabled={uploading || images.length === 0}
          >
            Clear All
          </Button>
          <Button onClick={handleUpload} disabled={uploading || images.length === 0}>
            {uploading ? 'Uploading...' : 'Continue'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
