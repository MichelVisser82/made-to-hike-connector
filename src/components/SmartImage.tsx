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
  const [singleImageMode, setSingleImageMode] = useState(false);

  useEffect(() => {
    // Skip rotation if we're in single image mode and already have an image
    if (singleImageMode && selectedImage) {
      return;
    }

    const fetchImage = async () => {
      try {
        setLoading(true);
        
        // Define region tags to exclude when looking for a specific region
        const regionTags = ['dolomites', 'pyrenees', 'scotland', 'location:dolomites', 'location:pyrenees', 'location:scotland'];
        
        const isRegionSearch = tags && tags.some(tag => 
          regionTags.some(regionTag => 
            tag.toLowerCase() === regionTag.toLowerCase().replace('location:', '')
          )
        );
        
        // Helper function to check if image has conflicting region tags
        const hasConflictingRegion = (image: WebsiteImage, targetTags: string[]) => {
          if (!isRegionSearch) return false;
          
          const targetRegions = targetTags.map(tag => tag.toLowerCase());
          const otherRegions = regionTags
            .map(tag => tag.toLowerCase().replace('location:', ''))
            .filter(region => !targetRegions.includes(region));
          
          return image.tags.some(imageTag => 
            otherRegions.some(otherRegion => 
              imageTag.toLowerCase().includes(otherRegion)
            )
          );
        };
        
        // First try to get image with specific tag matching
        let image = null;
        let availableImages: WebsiteImage[] = [];
        
        if (tags && tags.length > 0) {
          // Try to find image with matching tags first
          const allImages = await getRandomImage({ 
            category, 
            usage_context: usageContext 
          });
          
          if (allImages && !hasConflictingRegion(allImages, tags)) {
            const hasMatchingTag = allImages.tags.some(tag => 
              tags.some(searchTag => 
                tag.toLowerCase().includes(searchTag.toLowerCase())
              )
            );
            
            if (hasMatchingTag) {
              image = allImages;
              availableImages = [allImages];
            }
          }
          
          // If no matching image found in primary category, try other categories
          if (!image) {
            const fallbackCategories = ['landscape', 'mountains', 'adventure'];
            for (const fallbackCategory of fallbackCategories) {
              const fallbackImage = await getRandomImage({ 
                category: fallbackCategory, 
                usage_context: usageContext 
              });
              
              if (fallbackImage && !hasConflictingRegion(fallbackImage, tags)) {
                const hasMatchingTag = fallbackImage.tags.some(tag => 
                  tags.some(searchTag => 
                    tag.toLowerCase().includes(searchTag.toLowerCase())
                  )
                );
                
                if (hasMatchingTag) {
                  image = fallbackImage;
                  availableImages = [fallbackImage];
                  break;
                }
              }
            }
          }
        }
        
        // Final fallback - get any image from primary category (if not region search)
        if (!image && !isRegionSearch) {
          image = await getRandomImage({ category, usage_context: usageContext });
          if (image) {
            availableImages = [image];
          }
        }
        
        // Check if we only have one available image
        if (availableImages.length === 1) {
          setSingleImageMode(true);
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
  }, [category, usageContext, tags?.join(','), singleImageMode, selectedImage]);

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