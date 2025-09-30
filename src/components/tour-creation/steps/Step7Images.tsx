import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useFormContext } from 'react-hook-form';
import { TourFormData } from '@/hooks/useTourCreation';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface Step7ImagesProps {
  onNext: () => void;
  onPrev: () => void;
}

export default function Step7Images({ onNext }: Step7ImagesProps) {
  const form = useFormContext<TourFormData>();
  const [uploading, setUploading] = useState(false);

  const uploadImage = async (file: File, isHero: boolean = false) => {
    setUploading(true);
    try {
      // Get current user (guide)
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const bucket = isHero ? 'hero-images' : 'tour-images';
      
      // Use guide-specific path: guides/{guide_id}/hero/ or guides/{guide_id}/tours/
      const filePath = `guides/${user.id}/${isHero ? 'hero' : 'tours'}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      // Track image in website_images table
      await supabase
        .from('website_images')
        .insert({
          file_name: file.name,
          file_path: filePath,
          bucket_id: bucket,
          category: 'tour',
          uploaded_by: user.id,
          usage_context: isHero ? ['hero', 'tour'] : ['tour'],
          is_active: true,
        });

      return publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const url = await uploadImage(file, true);
    if (url) {
      form.setValue('hero_image', url);
    }
  };

  const handleImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    for (const file of files) {
      const url = await uploadImage(file, false);
      if (url) {
        const current = form.getValues('images') || [];
        form.setValue('images', [...current, url]);
      }
    }
  };

  const removeImage = (index: number) => {
    const current = form.getValues('images') || [];
    form.setValue('images', current.filter((_, i) => i !== index));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tour Images</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={form.control}
          name="hero_image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hero Image (Main)</FormLabel>
              <div className="space-y-3">
                {field.value ? (
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden border">
                    <img src={field.value} alt="Hero" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => field.onChange('')}
                      className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors">
                    <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">Upload hero image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleHeroUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="images"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Images</FormLabel>
              <div className="space-y-3">
                {field.value && field.value.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {field.value.map((url, index) => (
                      <div key={index} className="relative aspect-video rounded-lg overflow-hidden border">
                        <img src={url} alt={`Tour ${index + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors">
                  <ImageIcon className="w-6 h-6 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">Add more images</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImagesUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {uploading && (
          <p className="text-sm text-muted-foreground">Uploading...</p>
        )}

        <div className="flex justify-end">
          <Button onClick={onNext} disabled={uploading}>Continue</Button>
        </div>
      </CardContent>
    </Card>
  );
}
