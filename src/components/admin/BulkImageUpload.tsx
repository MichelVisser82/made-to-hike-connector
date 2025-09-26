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
import { Upload, Sparkles, Image as ImageIcon, Edit3, Check, X, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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
  };
  metadata: {
    category: string;
    tags: string;
    alt_text: string;
    description: string;
    usage_context: string;
    priority: string;
  };
  analyzing: boolean;
  error?: string;
}

export function BulkImageUpload() {
  const { uploadImage } = useWebsiteImages();
  const [images, setImages] = useState<ImageWithMetadata[]>([]);
  const [uploading, setUploading] = useState(false);
  const [optimize, setOptimize] = useState(true);

  const categories = [
    'hero', 'landscape', 'hiking', 'portrait', 'detail', 
    'equipment', 'nature', 'mountains', 'trails', 'adventure'
  ];

  const usageContexts = [
    'landing', 'tours', 'about', 'contact', 'search', 
    'booking', 'testimonials', 'gallery', 'background'
  ];

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

  const analyzeImage = async (file: File, index: number) => {
    try {
      const base64 = await fileToBase64(file);
      
      const { data, error } = await supabase.functions.invoke('analyze-image-metadata', {
        body: {
          imageBase64: base64,
          filename: file.name
        }
      });

      if (error) throw error;

      const suggestions = data.suggestions;
      
      setImages(prev => prev.map((img, i) => 
        i === index ? {
          ...img,
          suggestions,
          metadata: {
            category: suggestions.category,
            tags: suggestions.tags.join(', '),
            alt_text: suggestions.alt_text,
            description: suggestions.description,
            usage_context: suggestions.usage_context.join(', '),
            priority: suggestions.priority.toString()
          },
          analyzing: false
        } : img
      ));
    } catch (error) {
      console.error('Analysis error:', error);
      setImages(prev => prev.map((img, i) => 
        i === index ? {
          ...img,
          analyzing: false,
          error: 'Failed to analyze image'
        } : img
      ));
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;

    const files = Array.from(event.target.files);
    const newImages: ImageWithMetadata[] = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      suggestions: {
        category: 'landscape',
        tags: [],
        alt_text: '',
        description: '',
        usage_context: [],
        priority: 5
      },
      metadata: {
        category: '',
        tags: '',
        alt_text: '',
        description: '',
        usage_context: '',
        priority: '5'
      },
      analyzing: true
    }));

    setImages(prev => [...prev, ...newImages]);

    // Analyze each image
    const startIndex = images.length;
    files.forEach((file, index) => {
      analyzeImage(file, startIndex + index);
    });
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
          priority: img.suggestions.priority.toString()
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

        await uploadImage(imageData.file, metadata, optimize);
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
              accept="image/*"
              onChange={handleFileSelect}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="bulk-optimize"
              checked={optimize}
              onCheckedChange={setOptimize}
            />
            <Label htmlFor="bulk-optimize">Auto-optimize images</Label>
          </div>

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
                  <p className="font-medium truncate">{imageData.file.name}</p>
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