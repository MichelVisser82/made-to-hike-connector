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
  const { fetchImages, getImageUrl, getRandomImage } = useWebsiteImages();
  const [selectedImage, setSelectedImage] = useState<WebsiteImage | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        setLoading(true);
        
        // Check if this is a location-based request
        const locationTag = tags?.find(tag => 
          ['dolomites', 'pyrenees', 'scotland'].includes(tag.toLowerCase())
        );
        
        let image = null;
        
        if (locationTag) {
          console.log('Looking for images with location:', locationTag);
          
          // Search for images with the exact location tag
          const allImages = await fetchImages({ limit: 100 });
          
          const locationImages = allImages.filter(img => 
            img.tags.some(imgTag => 
              imgTag.toLowerCase() === `location:${locationTag.toLowerCase()}` ||
              (imgTag.toLowerCase() === locationTag.toLowerCase() && 
               img.tags.some(t => t.toLowerCase().includes('location:')))
            )
          );
          
          console.log(`Found ${locationImages.length} images for location:${locationTag}`);
          locationImages.forEach(img => console.log('- ', img.file_name, img.tags));
          
          if (locationImages.length > 0) {
            image = locationImages[Math.floor(Math.random() * locationImages.length)];
            console.log('Selected location image:', image.file_name);
          }
        }
        
        // Fallback to original logic for non-location requests
        if (!image && !locationTag) {
          image = await getRandomImage({ category, usage_context: usageContext });
        }
        
        if (image) {
          setSelectedImage(image);
          setImageUrl(getImageUrl(image));
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