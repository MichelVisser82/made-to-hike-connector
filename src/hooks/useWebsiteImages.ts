import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface WebsiteImage {
  id: string;
  file_name: string;
  file_path: string;
  bucket_id: string;
  category: string;
  tags: string[];
  alt_text?: string;
  description?: string;
  usage_context: string[];
  priority: number;
  is_active: boolean;
}

export function useWebsiteImages() {
  const [images, setImages] = useState<WebsiteImage[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchImages = async (filters?: {
    category?: string;
    usage_context?: string;
    tags?: string[];
    limit?: number;
  }) => {
    try {
      setLoading(true);
      let query = supabase
        .from('website_images')
        .select('*')
        .eq('is_active', true)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      if (filters?.usage_context) {
        query = query.contains('usage_context', [filters.usage_context]);
      }

      if (filters?.tags && filters.tags.length > 0) {
        query = query.overlaps('tags', filters.tags);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) throw error;

      setImages(data || []);
      return data || [];
    } catch (error) {
      console.error('Error fetching images:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (image: WebsiteImage) => {
    return supabase.storage.from(image.bucket_id).getPublicUrl(image.file_path).data.publicUrl;
  };

  const getImagesByContext = async (context: string, limit = 10) => {
    return fetchImages({ usage_context: context, limit });
  };

  const getImagesByCategory = async (category: string, limit = 10) => {
    return fetchImages({ category, limit });
  };

  const getRandomImage = async (filters?: { category?: string; usage_context?: string }) => {
    const imageList = await fetchImages(filters);
    if (imageList.length === 0) return null;
    
    // Prioritize images with higher priority scores
    const weightedImages = imageList.flatMap(img => 
      Array(Math.max(1, img.priority || 1)).fill(img)
    );
    
    const randomIndex = Math.floor(Math.random() * weightedImages.length);
    return weightedImages[randomIndex];
  };

  const uploadImage = async (
    file: File,
    metadata: {
      category: string;
      tags?: string[];
      alt_text?: string;
      description?: string;
      usage_context?: string[];
      priority?: number;
    }
  ) => {
    try {
      setLoading(true);
      
      // Determine bucket based on category
      let bucket_id = 'website-images';
      if (metadata.category === 'hero') bucket_id = 'hero-images';
      if (metadata.category === 'tour') bucket_id = 'tour-images';

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${metadata.category}/${fileName}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from(bucket_id)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Save metadata to database
      const { data, error: dbError } = await supabase
        .from('website_images')
        .insert({
          file_name: file.name,
          file_path: filePath,
          bucket_id,
          category: metadata.category,
          tags: metadata.tags || [],
          alt_text: metadata.alt_text,
          description: metadata.description,
          usage_context: metadata.usage_context || [],
          priority: metadata.priority || 0,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      await fetchImages();
      return data;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  return {
    images,
    loading,
    fetchImages,
    getImageUrl,
    getImagesByContext,
    getImagesByCategory,
    getRandomImage,
    uploadImage,
  };
}