import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ThumbnailSelectorModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (imageId: string, imageUrl: string) => void;
  currentThumbnailUrl?: string;
}

interface WebsiteImage {
  id: string;
  file_path: string;
  category: string;
  alt_text?: string;
}

export function ThumbnailSelectorModal({
  open,
  onClose,
  onSelect,
  currentThumbnailUrl,
}: ThumbnailSelectorModalProps) {
  const [images, setImages] = useState<WebsiteImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      fetchImages();
    }
  }, [open]);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('website_images')
        .select('id, file_path, category, alt_text')
        .eq('uploaded_by', user.id)
        .eq('is_active', true)
        .in('category', ['hero', 'landscape', 'portrait', 'action'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setImages(data || []);
    } catch (error: any) {
      console.error('Error fetching images:', error);
      toast.error('Failed to load images');
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (filePath: string) => {
    const { data } = supabase.storage
      .from('website-images')
      .getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSelect = () => {
    if (!selectedImageId) return;
    
    const selectedImage = images.find(img => img.id === selectedImageId);
    if (selectedImage) {
      const imageUrl = getImageUrl(selectedImage.file_path);
      onSelect(selectedImageId, imageUrl);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select Video Thumbnail</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No images found. Upload images to your Image Library first.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-4">
              {images.map((image) => {
                const imageUrl = getImageUrl(image.file_path);
                const isSelected = selectedImageId === image.id;
                const isCurrent = currentThumbnailUrl === imageUrl;

                return (
                  <div
                    key={image.id}
                    onClick={() => setSelectedImageId(image.id)}
                    className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                      isSelected
                        ? 'border-primary ring-2 ring-primary'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <img
                      src={imageUrl}
                      alt={image.alt_text || 'Thumbnail option'}
                      className="w-full aspect-video object-cover"
                    />
                    {isCurrent && (
                      <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                        Current
                      </div>
                    )}
                    {isSelected && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                        <div className="bg-primary text-primary-foreground rounded-full p-2">
                          ✓
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSelect} disabled={!selectedImageId}>
                Select Thumbnail
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
