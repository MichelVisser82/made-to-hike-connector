import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useWebsiteImages } from '@/hooks/useWebsiteImages';
import { supabase } from '@/integrations/supabase/client';
import { Upload, Trash2, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function GuideImageLibrary() {
  const [guideId, setGuideId] = useState<string | null>(null);
  const [guideImages, setGuideImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { fetchImages, getImageUrl, uploadImage } = useWebsiteImages();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

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

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    try {
      for (const file of files) {
        await uploadImage(file, {
          category: 'tour',
          usage_context: ['tour'],
        });
      }
      
      toast({
        title: "Images uploaded successfully",
        description: `${files.length} image(s) added to your library`,
      });

      // Refresh images
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

      // Refresh images
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>My Image Library</CardTitle>
          <label>
            <Button disabled={uploading} asChild>
              <span>
                <Upload className="w-4 h-4 mr-2" />
                {uploading ? 'Uploading...' : 'Upload Images'}
              </span>
            </Button>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>
      </CardHeader>
      <CardContent>
        {guideImages.length === 0 ? (
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
                accept="image/*"
                multiple
                onChange={handleUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>
        ) : (
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
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(image.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {image.file_name}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
