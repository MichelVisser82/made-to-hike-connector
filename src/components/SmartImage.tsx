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
        
        let image = null;
        
        // Extract region keywords from tags for better matching
        const regionKeywords = tags?.filter(tag => 
          !['landscape', 'mountain', 'mountains'].includes(tag.toLowerCase())
        ).map(tag => tag.toLowerCase().replace(/\s+/g, '-')) || [];
        
        console.log('Looking for images with region keywords:', regionKeywords);
        
        if (regionKeywords.length > 0) {
          // Search for images with matching location tags
          const allImages = await fetchImages({ limit: 100 });
          
          // Filter images that match ANY of our region keywords
          const matchingImages = allImages.filter(img => {
            // Check if image has any tags matching our region keywords
            const hasMatchingRegion = img.tags.some(imgTag => {
              const normalizedImgTag = imgTag.toLowerCase().replace(/\s+/g, '-');
              
              // Check for exact matches or location: prefix matches
              return regionKeywords.some(keyword => 
                normalizedImgTag === keyword ||
                normalizedImgTag === `location:${keyword}` ||
                normalizedImgTag.includes(keyword)
              );
            });
            
            // Also ensure we're not getting images from wrong regions
            const hasWrongRegion = img.tags.some(imgTag => {
              const tag = imgTag.toLowerCase();
              // List of known region tags that shouldn't mix
              const knownRegions = ['scotland', 'scottish', 'pyrenees', 'dolomites', 'switzerland', 'norway', 'iceland', 'lofoten', 'appenzell'];
              return knownRegions.some(region => 
                tag.includes(region) && !regionKeywords.some(kw => kw.includes(region))
              );
            });
            
            return hasMatchingRegion && !hasWrongRegion;
          });
          
          console.log(`Found ${matchingImages.length} images matching region keywords`);
          
          if (matchingImages.length > 0) {
            image = matchingImages[Math.floor(Math.random() * matchingImages.length)];
            console.log('Selected region-matched image:', image.file_name, 'with tags:', image.tags);
          }
        }
        
        // Only use category/context fallbacks if no region matching was attempted
        if (!image && regionKeywords.length === 0) {
          image = await getRandomImage({ category, usage_context: usageContext });
        }
        
        if (!image && regionKeywords.length === 0) {
          image = await getRandomImage({ category });
        }
        
        // Final fallback only if we have no region constraints
        if (!image && regionKeywords.length === 0) {
          image = await getRandomImage({});
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