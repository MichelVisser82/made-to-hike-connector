import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Upload, Image as ImageIcon, Check, Sparkles } from 'lucide-react';
import heic2any from 'heic2any';
import { gps } from 'exifr';

interface ItineraryImageSelectorProps {
  selectedImageUrl?: string;
  existingTourImages: string[];
  onImageSelect: (url: string) => void;
  dayNumber: number;
}

export function ItineraryImageSelector({
  selectedImageUrl,
  existingTourImages,
  onImageSelect,
  dayNumber
}: ItineraryImageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

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

  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        let { width, height } = img;
        const maxDimension = 1200;
        
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

  const analyzeImage = async (file: File, gpsData: any) => {
    try {
      const compressedFile = await compressImage(file);
      const base64 = await fileToBase64(compressedFile);
      
      const { data, error } = await supabase.functions.invoke('analyze-image-metadata', {
        body: {
          imageBase64: base64,
          filename: file.name,
          gpsData,
          context: `itinerary day ${dayNumber}`
        }
      });

      if (error) throw error;
      return data.suggestions;
    } catch (error) {
      console.error('Analysis error:', error);
      return null;
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Convert HEIC if needed
      const convertedFile = await convertHEIC(file);
      if (file.name !== convertedFile.name) {
        toast({
          title: "Image converted",
          description: `Converted ${file.name} to JPEG`,
        });
      }

      // Extract GPS and analyze
      const gpsData = await extractGPSData(convertedFile);
      const compressedFile = await compressImage(convertedFile);
      
      toast({
        title: "Analyzing image...",
        description: "AI is generating metadata",
      });

      const suggestions = await analyzeImage(compressedFile, gpsData);

      // Upload to storage
      const fileExt = compressedFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `guides/${user.id}/tours/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('tour-images')
        .upload(filePath, compressedFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('tour-images')
        .getPublicUrl(filePath);

      // Save metadata
      await supabase
        .from('website_images')
        .insert({
          file_name: compressedFile.name,
          file_path: filePath,
          bucket_id: 'tour-images',
          category: 'tour',
          uploaded_by: user.id,
          usage_context: ['tour', 'itinerary'],
          alt_text: suggestions?.alt_text || `Day ${dayNumber} itinerary image`,
          description: suggestions?.description || '',
          tags: suggestions?.tags || [],
          is_active: true,
        });

      onImageSelect(publicUrl);
      setIsOpen(false);
      
      toast({
        title: "Upload complete",
        description: "Image uploaded and analyzed successfully",
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div>
          {selectedImageUrl ? (
            <div className="relative group cursor-pointer">
              <div className="aspect-[3/2] rounded-lg overflow-hidden">
                <img 
                  src={selectedImageUrl} 
                  alt={`Day ${dayNumber}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                <Button variant="secondary" size="sm">
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Change Image
                </Button>
              </div>
            </div>
          ) : (
            <Button 
              type="button" 
              variant="outline" 
              className="w-full border-dashed"
            >
              <ImageIcon className="w-4 h-4 mr-2" />
              Add Day Image
              <Badge variant="secondary" className="ml-2">
                <Sparkles className="w-3 h-3" />
              </Badge>
            </Button>
          )}
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select or Upload Image for Day {dayNumber}</DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">
            <Sparkles className="w-4 h-4 inline mr-1" />
            Tip: Choose a photo that captures the day's highlight—like a scenic viewpoint or the cozy accommodation!
          </p>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Upload new image */}
          <div>
            <h3 className="font-medium mb-3">Upload New Image</h3>
            <label className="block">
              <div className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors">
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  JPEG, PNG, HEIC up to 20MB
                </p>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/jpeg,image/png,image/heic"
                onChange={handleFileUpload}
                disabled={uploading}
              />
            </label>
          </div>

          {/* Select from existing images */}
          {existingTourImages.length > 0 && (
            <div>
              <h3 className="font-medium mb-3">Select from Tour Images</h3>
              <div className="grid grid-cols-3 gap-4">
                {existingTourImages.map((url, index) => (
                  <Card
                    key={index}
                    className={`relative cursor-pointer overflow-hidden group ${
                      selectedImageUrl === url ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => {
                      onImageSelect(url);
                      setIsOpen(false);
                    }}
                  >
                    <div className="aspect-[3/2] w-full">
                      <img 
                        src={url} 
                        alt={`Tour image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {selectedImageUrl === url && (
                      <div className="absolute top-2 right-2 bg-primary rounded-full p-1">
                        <Check className="w-4 h-4 text-primary-foreground" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
