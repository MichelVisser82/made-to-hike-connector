import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface ImageSelectorModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (imageId: string, imageUrl: string) => void;
  currentImageUrl?: string;
  category?: string;
  title?: string;
  description?: string;
}

interface WebsiteImage {
  id: string;
  file_path: string;
  bucket_id: string;
  category: string;
  alt_text: string | null;
}

export function ImageSelectorModal({ 
  open, 
  onClose, 
  onSelect, 
  currentImageUrl,
  category = 'hero',
  title = 'Select Image from Library',
  description = 'Choose an image from your Image Library'
}: ImageSelectorModalProps) {
  const [images, setImages] = useState<WebsiteImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      fetchImages();
    }
  }, [open]);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('website_images')
        .select('id, file_path, bucket_id, category, alt_text')
        .eq('uploaded_by', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (filePath: string, bucketId: string) => {
    const { data } = supabase.storage
      .from(bucketId)
      .getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSelect = () => {
    if (!selectedImageId) return;
    const selectedImage = images.find(img => img.id === selectedImageId);
    if (selectedImage) {
      const imageUrl = getImageUrl(selectedImage.file_path, selectedImage.bucket_id);
      onSelect(selectedImageId, imageUrl);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No images found in your library.</p>
            <p className="text-sm mt-2">Upload images first to select them here.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {images.map((image) => {
                const imageUrl = getImageUrl(image.file_path, image.bucket_id);
                const isCurrentImage = currentImageUrl === imageUrl;
                const isSelected = selectedImageId === image.id;
                
                return (
                  <div
                    key={image.id}
                    onClick={() => setSelectedImageId(image.id)}
                    className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                      isSelected 
                        ? 'border-primary ring-2 ring-primary ring-offset-2' 
                        : isCurrentImage
                        ? 'border-accent'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <img
                      src={imageUrl}
                      alt={image.alt_text || 'Library image'}
                      className="w-full h-40 object-cover"
                    />
                    {isCurrentImage && (
                      <div className="absolute top-2 right-2 bg-accent text-accent-foreground text-xs px-2 py-1 rounded">
                        Current
                      </div>
                    )}
                    {isSelected && (
                      <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                        <div className="bg-primary text-primary-foreground rounded-full p-2">
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleSelect} 
                disabled={!selectedImageId}
              >
                Select Image
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
