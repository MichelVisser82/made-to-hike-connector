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
  const { getRandomImage, getImageUrl, fetchImages } = useWebsiteImages();
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
        const regionTags = ['dolomites', 'pyrenees', 'scotland'];
        
        const isRegionSearch = tags && tags.some(tag => 
          regionTags.some(regionTag => 
            tag.toLowerCase() === regionTag.toLowerCase()
          )
        );
        
        // Helper function to check if image matches target region
        const matchesTargetRegion = (image: WebsiteImage, targetTags: string[]) => {
          const targetRegions = targetTags.map(tag => tag.toLowerCase());
          return image.tags.some(imageTag => 
            targetRegions.some(targetRegion => 
              imageTag.toLowerCase().includes(targetRegion) ||
              imageTag.toLowerCase().includes(`location:${targetRegion}`)
            )
          );
        };
        
        // Helper function to check if image has conflicting region tags
        const hasConflictingRegion = (image: WebsiteImage, targetTags: string[]) => {
          if (!isRegionSearch) return false;
          
          const targetRegions = targetTags.map(tag => tag.toLowerCase());
          const otherRegions = regionTags.filter(region => !targetRegions.includes(region));
          
          return image.tags.some(imageTag => 
            otherRegions.some(otherRegion => 
              imageTag.toLowerCase().includes(otherRegion) ||
              imageTag.toLowerCase().includes(`location:${otherRegion}`)
            )
          );
        };
        
        let image = null;
        let availableImages: WebsiteImage[] = [];
        
        if (tags && tags.length > 0 && isRegionSearch) {
          // For region searches, fetch ALL images and filter properly
          const allImages = await fetchImages({ 
            category, 
            usage_context: usageContext,
            limit: 100 // Get more images to filter from
          });
          
          if (allImages && allImages.length > 0) {
            // Filter images that match the target region and don't have conflicting regions
            const validImages = allImages.filter(img => 
              matchesTargetRegion(img, tags) && !hasConflictingRegion(img, tags)
            );
            
            if (validImages.length > 0) {
              // Randomly select from valid images
              image = validImages[Math.floor(Math.random() * validImages.length)];
              availableImages = validImages;
            } else {
              // If no valid images in primary category, try fallback categories
              const fallbackCategories = ['landscape', 'mountains', 'adventure', 'hero'];
              for (const fallbackCategory of fallbackCategories) {
                const fallbackImages = await fetchImages({ 
                  category: fallbackCategory, 
                  usage_context: usageContext,
                  limit: 100
                });
                
                if (fallbackImages && fallbackImages.length > 0) {
                  const validFallbackImages = fallbackImages.filter(img => 
                    matchesTargetRegion(img, tags) && !hasConflictingRegion(img, tags)
                  );
                  
                  if (validFallbackImages.length > 0) {
                    image = validFallbackImages[Math.floor(Math.random() * validFallbackImages.length)];
                    availableImages = validFallbackImages;
                    break;
                  }
                }
              }
            }
          }
        } else {
          // For non-region searches, use the original random logic
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