import { useState } from 'react';
import { Upload, X, Image, Sparkles, Loader2, MapPin, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import type { GuideSignupData } from '@/types/guide';
import { 
  convertHEICToJPEG, 
  extractGPSData, 
  analyzeImageWithAI,
  compressImageByCategory,
  type AIAnalysis
} from '@/utils/imageProcessing';

interface Step10PortfolioProps {
  data: Partial<GuideSignupData>;
  updateData: (data: Partial<GuideSignupData>) => void;
  onNext: () => void;
  onBack: () => void;
}

interface ImageWithMetadata {
  file: File;
  preview: string;
  analyzing: boolean;
  suggestions?: AIAnalysis;
  metadata: {
    alt_text: string;
    description: string;
  };
}

export function Step10Portfolio({ data, updateData, onNext, onBack }: Step10PortfolioProps) {
  const [images, setImages] = useState<ImageWithMetadata[]>([]);
  const { toast } = useToast();

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 10) {
      toast({
        title: "Too many images",
        description: "Maximum 10 images allowed",
        variant: "destructive"
      });
      return;
    }

    const processedImages: ImageWithMetadata[] = [];

    for (const file of files) {
      try {
        // Extract GPS data
        const gpsData = await extractGPSData(file);
        
        // Convert HEIC to JPEG if needed
        const convertedFile = await convertHEICToJPEG(file);
        
        if (file.name !== convertedFile.name) {
          toast({
            title: "Image converted",
            description: `Converted ${file.name} to JPEG`,
          });
        }

        const imageData: ImageWithMetadata = {
          file: convertedFile,
          preview: URL.createObjectURL(convertedFile),
          analyzing: true,
          metadata: {
            alt_text: '',
            description: ''
          }
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

    // Analyze images with AI
    const startIndex = images.length;
    for (let i = 0; i < processedImages.length; i++) {
      const imageData = processedImages[i];
      const gpsData = await extractGPSData(imageData.file);
      const suggestions = await analyzeImageWithAI(imageData.file, gpsData);
      
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

    // Store processed files in form data
    updateData({ portfolio_images: [...(data.portfolio_images || []), ...processedImages.map(img => img.file)] });
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
    
    const updatedFiles = images.filter((_, i) => i !== index).map(img => img.file);
    updateData({ portfolio_images: updatedFiles });
  };

  const handleNext = () => {
    // Store files with their metadata for later processing during signup
    updateData({ 
      portfolio_images: images.map(img => img.file)
    });
    
    onNext();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="w-6 h-6" />
            Portfolio Photos
          </CardTitle>
          <p className="text-muted-foreground">
            Upload photos of your tours (up to 10 images) • AI-powered metadata generation
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((image, index) => (
              <div key={index} className="space-y-2">
                <div className="relative aspect-square rounded-lg overflow-hidden group border">
                  <img src={image.preview} alt={`Portfolio ${index + 1}`} className="w-full h-full object-cover" />
                  {image.analyzing && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </div>
                  )}
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7"
                    onClick={() => removeImage(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                  {image.suggestions?.location && (
                    <Badge className="absolute bottom-2 left-2" variant="secondary">
                      <MapPin className="w-3 h-3 mr-1" />
                      {image.suggestions.location}
                    </Badge>
                  )}
                </div>

                {image.suggestions && !image.analyzing && (
                  <div className="space-y-2 bg-muted/50 p-2 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        AI Suggestions
                      </span>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-6 text-xs"
                        onClick={() => applySuggestions(index)}
                      >
                        <Check className="w-3 h-3 mr-1" />
                        Apply
                      </Button>
                    </div>
                    <Input
                      placeholder="Alt text"
                      value={image.metadata.alt_text}
                      onChange={(e) => updateMetadata(index, 'alt_text', e.target.value)}
                      className="h-8 text-xs"
                    />
                    <Input
                      placeholder="Description"
                      value={image.metadata.description}
                      onChange={(e) => updateMetadata(index, 'description', e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                )}
              </div>
            ))}

            {images.length < 10 && (
              <label className="aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors">
                <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">Upload</span>
                <span className="text-xs text-muted-foreground">HEIC, JPG, PNG</span>
                <input
                  type="file"
                  accept="image/*,.heic,.HEIC"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={onBack}>Back</Button>
            <Button onClick={handleNext}>Continue</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
