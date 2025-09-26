import { useState, useEffect } from 'react';
import { useWebsiteImages, type WebsiteImage } from '@/hooks/useWebsiteImages';

interface SmartImageProps {
  category?: string;
  usageContext?: string;
  tags?: string[];
  className?: string;
  fallbackSrc?: string;
  alt?: string;
  priority?: 'high' | 'medium' | 'low';
}

export function SmartImage({ 
  category,
  usageContext, 
  tags,
  className = '',
  fallbackSrc,
  alt,
  priority = 'medium'
}: SmartImageProps) {
  const { getRandomImage, getImageUrl } = useWebsiteImages();
  const [selectedImage, setSelectedImage] = useState<WebsiteImage | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        setLoading(true);
        const image = await getRandomImage({ 
          category, 
          usage_context: usageContext 
        });
        
        if (image) {
          // Additional filtering by tags if provided
          if (tags && tags.length > 0) {
            const hasMatchingTag = image.tags.some(tag => 
              tags.some(searchTag => 
                tag.toLowerCase().includes(searchTag.toLowerCase())
              )
            );
            
            if (hasMatchingTag) {
              setSelectedImage(image);
              setImageUrl(getImageUrl(image));
            } else {
              // Try again without tag filtering
              const fallbackImage = await getRandomImage({ category, usage_context: usageContext });
              if (fallbackImage) {
                setSelectedImage(fallbackImage);
                setImageUrl(getImageUrl(fallbackImage));
              }
            }
          } else {
            setSelectedImage(image);
            setImageUrl(getImageUrl(image));
          }
        }
      } catch (error) {
        console.error('Error fetching smart image:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchImage();
  }, [category, usageContext, tags?.join(',')]);

  if (loading) {
    return (
      <div className={`bg-gray-200 animate-pulse ${className}`}>
        <div className="w-full h-full bg-gray-300"></div>
      </div>
    );
  }

  if (!imageUrl && fallbackSrc) {
    return (
      <img
        src={fallbackSrc}
        alt={alt || 'Fallback image'}
        className={className}
      />
    );
  }

  if (!imageUrl) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <span className="text-gray-500 text-sm">No image available</span>
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={selectedImage?.alt_text || alt || selectedImage?.description || 'Smart selected image'}
      className={className}
      loading={priority === 'high' ? 'eager' : 'lazy'}
    />
  );
}