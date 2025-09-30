import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useWebsiteImages } from '@/hooks/useWebsiteImages';
import { supabase } from '@/integrations/supabase/client';
import { Upload, Trash2, Image as ImageIcon, Edit3, Sparkles, Loader2, MapPin, Tag, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import heic2any from 'heic2any';
import { gps } from 'exifr';

interface ImageWithMetadata {
  file: File;
  preview: string;
  suggestions?: {
    category: string;
    tags: string[];
    alt_text: string;
    description: string;
    usage_context: string[];
    priority: number;
    location?: string;
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
  gpsData?: {
    latitude: number;
    longitude: number;
  };
}

export function GuideImageLibrary() {
  const [guideId, setGuideId] = useState<string | null>(null);
  const [guideImages, setGuideImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { fetchImages, getImageUrl, uploadImage } = useWebsiteImages();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [pendingImages, setPendingImages] = useState<ImageWithMetadata[]>([]);
  const [editingImage, setEditingImage] = useState<any | null>(null);
  const [editMetadata, setEditMetadata] = useState({
    alt_text: '',
    description: '',
    tags: '',
    category: '',
    priority: '0',
  });

  const categories = [
    'hero', 'landscape', 'hiking', 'portrait', 'detail', 
    'equipment', 'nature', 'mountains', 'trails', 'adventure', 'tour'
  ];

  useEffect(() => {
    const fetchGuideImages = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setGuideId(user.id);
          const images = await fetchImages({ guide_id: user.id });
          setGuideImages(images);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchGuideImages();
  }, []);

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

  const compressImage = (file: File, category: string): Promise<File> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        let { width, height } = img;
        
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
          adventure: 1200,
          tour: 1600
        };
        
        const maxDimension = maxDimensions[category] || 1200;
        
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

  const analyzeImage = async (file: File, index: number, gpsData: any) => {
    try {
      const compressedFile = await compressImage(file, 'tour');
      const base64 = await fileToBase64(compressedFile);
      
      const { data, error } = await supabase.functions.invoke('analyze-image-metadata', {
        body: {
          imageBase64: base64,
          filename: file.name,
          gpsData
        }
      });

      if (error) throw error;

      const suggestions = data.suggestions;
      const aiLocation = suggestions.location || 
                         (suggestions.gps?.location) || 
                         (gpsData && getLocationFromGPS(gpsData.latitude, gpsData.longitude));
      
      const cleanTags = suggestions.tags.filter((tag: string) => !tag.startsWith('location:'));
      
      setPendingImages(prev => prev.map((img, i) => 
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
          },
          analyzing: false,
          gpsData: suggestions.gps || gpsData
        } : img
      ));
    } catch (error) {
      console.error('Analysis error:', error);
      setPendingImages(prev => prev.map((img, i) => 
        i === index ? { ...img, analyzing: false } : img
      ));
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
          metadata: {
            category: 'tour',
            tags: '',
            alt_text: '',
            description: '',
            usage_context: 'tour',
            priority: '5',
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

    setPendingImages(prev => [...prev, ...processedImages]);

    const startIndex = pendingImages.length;
    for (let i = 0; i < processedImages.length; i++) {
      const imageData = processedImages[i];
      await analyzeImage(imageData.file, startIndex + i, imageData.gpsData);
      
      if (i < processedImages.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    toast({
      title: "AI analysis complete",
      description: `Analyzed ${processedImages.length} image(s)`,
    });
  };

  const updatePendingMetadata = (index: number, field: string, value: string) => {
    setPendingImages(prev => prev.map((img, i) => 
      i === index ? {
        ...img,
        metadata: { ...img.metadata, [field]: value }
      } : img
    ));
  };

  const removePendingImage = (index: number) => {
    setPendingImages(prev => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  };

  const handleBulkUpload = async () => {
    if (pendingImages.length === 0) return;

    setUploading(true);
    try {
      for (const imageData of pendingImages) {
        const metadata = {
          category: imageData.metadata.category,
          tags: imageData.metadata.tags.split(',').map(tag => tag.trim()).filter(Boolean),
          alt_text: imageData.metadata.alt_text,
          description: imageData.metadata.description,
          usage_context: imageData.metadata.usage_context.split(',').map(ctx => ctx.trim()).filter(Boolean),
          priority: parseInt(imageData.metadata.priority) || 0,
        };

        if (imageData.suggestions?.location) {
          metadata.tags.push(`location:${imageData.suggestions.location}`);
        }

        const finalFile = await compressImage(imageData.file, imageData.metadata.category);
        await uploadImage(finalFile, metadata, false);
      }
      
      toast({
        title: "Images uploaded successfully",
        description: `${pendingImages.length} image(s) added to your library`,
      });

      pendingImages.forEach(img => URL.revokeObjectURL(img.preview));
      setPendingImages([]);

      if (guideId) {
        const images = await fetchImages({ guide_id: guideId });
        setGuideImages(images);
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload images. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (imageId: string) => {
    try {
      const { error } = await supabase
        .from('website_images')
        .delete()
        .eq('id', imageId);

      if (error) throw error;

      toast({
        title: "Image deleted",
        description: "Image removed from your library",
      });

      if (guideId) {
        const images = await fetchImages({ guide_id: guideId });
        setGuideImages(images);
      }
    } catch (error) {
      toast({
        title: "Delete failed",
        description: "Failed to delete image. Please try again.",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (image: any) => {
    setEditingImage(image);
    setEditMetadata({
      alt_text: image.alt_text || '',
      description: image.description || '',
      tags: Array.isArray(image.tags) ? image.tags.filter((t: string) => !t.startsWith('location:')).join(', ') : '',
      category: image.category || 'tour',
      priority: image.priority?.toString() || '0',
    });
  };

  const handleSaveEdit = async () => {
    if (!editingImage) return;

    try {
      const tags = editMetadata.tags.split(',').map(tag => tag.trim()).filter(Boolean);
      
      const { error } = await supabase
        .from('website_images')
        .update({
          alt_text: editMetadata.alt_text,
          description: editMetadata.description,
          tags,
          category: editMetadata.category,
          priority: parseInt(editMetadata.priority) || 0,
        })
        .eq('id', editingImage.id);

      if (error) throw error;

      toast({
        title: "Image updated",
        description: "Metadata saved successfully",
      });

      setEditingImage(null);

      if (guideId) {
        const images = await fetchImages({ guide_id: guideId });
        setGuideImages(images);
      }
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Failed to update image metadata.",
        variant: "destructive",
      });
    }
  };

  if (loading && !guideId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Image Library</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading your images...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>My Image Library</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                AI-powered metadata • HEIC support • GPS location detection
              </p>
            </div>
            <label>
              <Button disabled={uploading} asChild>
                <span>
                  <Upload className="w-4 h-4 mr-2" />
                  {uploading ? 'Uploading...' : 'Upload Images'}
                </span>
              </Button>
              <input
                type="file"
                accept="image/*,.heic,.HEIC"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {pendingImages.length > 0 && (
            <div className="space-y-4 border rounded-lg p-4 bg-muted/30">
              <div className="flex items-center justify-between">
                <h3 className="font-medium flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Pending Upload ({pendingImages.length})
                </h3>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      pendingImages.forEach(img => URL.revokeObjectURL(img.preview));
                      setPendingImages([]);
                    }}
                    disabled={uploading}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleBulkUpload}
                    disabled={uploading}
                  >
                    {uploading ? 'Uploading...' : `Upload ${pendingImages.length} Images`}
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {pendingImages.map((image, index) => (
                  <div key={index} className="space-y-2">
                    <div className="relative aspect-video rounded-lg overflow-hidden border">
                      <img
                        src={image.preview}
                        alt={image.metadata.alt_text || image.file.name}
                        className="w-full h-full object-cover"
                      />
                      {image.analyzing && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <Loader2 className="w-6 h-6 text-white animate-spin" />
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => removePendingImage(index)}
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
                    <div className="space-y-1">
                      <Input
                        placeholder="Category"
                        value={image.metadata.category}
                        onChange={(e) => updatePendingMetadata(index, 'category', e.target.value)}
                        className="text-xs h-7"
                      />
                      <Input
                        placeholder="Alt text"
                        value={image.metadata.alt_text}
                        onChange={(e) => updatePendingMetadata(index, 'alt_text', e.target.value)}
                        className="text-xs h-7"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {guideImages.length === 0 && pendingImages.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground mb-4">No images in your library yet</p>
              <label>
                <Button variant="outline" asChild>
                  <span>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Your First Image
                  </span>
                </Button>
                <input
                  type="file"
                  accept="image/*,.heic,.HEIC"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>
          ) : guideImages.length > 0 ? (
            <div>
              <h3 className="font-medium mb-3">Library ({guideImages.length})</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {guideImages.map((image) => (
                  <div key={image.id} className="relative group">
                    <div className="aspect-video rounded-lg overflow-hidden border">
                      <img
                        src={getImageUrl(image)}
                        alt={image.alt_text || image.file_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => openEditDialog(image)}
                      >
                        <Edit3 className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(image.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                    <div className="mt-2 space-y-1">
                      <p className="text-xs font-medium truncate">
                        {image.file_name}
                      </p>
                      {image.tags && image.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {image.tags.slice(0, 3).map((tag: string, idx: number) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {tag.startsWith('location:') ? (
                                <>
                                  <MapPin className="w-2 h-2 mr-1" />
                                  {tag.replace('location:', '')}
                                </>
                              ) : (
                                <>
                                  <Tag className="w-2 h-2 mr-1" />
                                  {tag}
                                </>
                              )}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Dialog open={!!editingImage} onOpenChange={(open) => !open && setEditingImage(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Image Metadata</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Category</Label>
              <Select
                value={editMetadata.category}
                onValueChange={(value) => setEditMetadata(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Alt Text</Label>
              <Input
                value={editMetadata.alt_text}
                onChange={(e) => setEditMetadata(prev => ({ ...prev, alt_text: e.target.value }))}
                placeholder="Descriptive text for accessibility"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={editMetadata.description}
                onChange={(e) => setEditMetadata(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Detailed description"
              />
            </div>
            <div>
              <Label>Tags (comma-separated)</Label>
              <Input
                value={editMetadata.tags}
                onChange={(e) => setEditMetadata(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="mountain, sunset, hiking"
              />
            </div>
            <div>
              <Label>Priority (0-10)</Label>
              <Input
                type="number"
                min="0"
                max="10"
                value={editMetadata.priority}
                onChange={(e) => setEditMetadata(prev => ({ ...prev, priority: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingImage(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
