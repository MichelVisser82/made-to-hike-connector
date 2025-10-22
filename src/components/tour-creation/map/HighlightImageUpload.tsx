import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface HighlightImageUploadProps {
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  maxPhotos?: number;
}

export function HighlightImageUpload({ 
  photos = [], 
  onPhotosChange, 
  maxPhotos = 5 
}: HighlightImageUploadProps) {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const remainingSlots = maxPhotos - photos.length;
    if (files.length > remainingSlots) {
      toast.error(`Maximum ${maxPhotos} photos allowed. ${remainingSlots} slots remaining.`);
      return;
    }

    setUploading(true);
    const newPhotos: string[] = [];

    try {
      for (const file of files) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} is not an image`);
          continue;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} is too large (max 5MB)`);
          continue;
        }

        // Upload to Supabase
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const filePath = `highlights/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('tour-images')
          .upload(filePath, file);

        if (uploadError) {
          toast.error(`Failed to upload ${file.name}`);
          console.error(uploadError);
          continue;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('tour-images')
          .getPublicUrl(filePath);

        newPhotos.push(publicUrl);
      }

      if (newPhotos.length > 0) {
        onPhotosChange([...photos, ...newPhotos]);
        toast.success(`Uploaded ${newPhotos.length} photo${newPhotos.length > 1 ? 's' : ''}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload photos');
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = (photoUrl: string) => {
    onPhotosChange(photos.filter(p => p !== photoUrl));
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Photos (up to {maxPhotos})</Label>
        <p className="text-xs text-muted-foreground mb-3">
          Add photos to showcase this highlight. Max 5MB per photo.
        </p>
      </div>

      {/* Photo grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {photos.map((photo, idx) => (
            <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border">
              <img 
                src={photo} 
                alt={`Highlight photo ${idx + 1}`}
                className="w-full h-full object-cover"
              />
              <Button
                size="icon"
                variant="destructive"
                className="absolute top-1 right-1 h-6 w-6"
                onClick={() => handleRemovePhoto(photo)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      {photos.length < maxPhotos && (
        <div>
          <input
            type="file"
            id="highlight-photos"
            multiple
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            disabled={uploading}
          />
          <Button
            variant="outline"
            onClick={() => document.getElementById('highlight-photos')?.click()}
            disabled={uploading}
            className="w-full"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Add Photos ({photos.length}/{maxPhotos})
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
