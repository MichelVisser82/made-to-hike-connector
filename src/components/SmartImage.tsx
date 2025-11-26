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
          !['landscape', 'mountain', 'mountains', 'hiking', 'trail', 'adventure', 'alpine'].includes(tag.toLowerCase())
        ).map(tag => tag.toLowerCase().replace(/\s+/g, '-')) || [];
        
        console.log('Looking for images with region keywords:', regionKeywords);
        
        if (regionKeywords.length > 0) {
          // Search for images with matching location tags
          const allImages = await fetchImages({ limit: 100 });
          
          // Multi-level matching strategy
          let matchingImages: typeof allImages = [];
          
          // Level 1: Exact hierarchical match (location:country-subregion)
          matchingImages = allImages.filter(img => {
            return img.tags.some(imgTag => {
              const normalizedImgTag = imgTag.toLowerCase().replace(/\s+/g, '-');
              return regionKeywords.some(keyword => 
                normalizedImgTag === `location:${keyword}` ||
                normalizedImgTag === keyword
              );
            });
          });
          
          console.log(`Level 1 (exact match): Found ${matchingImages.length} images`);
          
          // Level 2: Subregion-only match if no exact matches
          if (matchingImages.length === 0) {
            const subregionKeywords = regionKeywords.map(kw => kw.split('-').pop()).filter(Boolean);
            matchingImages = allImages.filter(img => {
              return img.tags.some(imgTag => {
                const normalizedImgTag = imgTag.toLowerCase().replace(/\s+/g, '-');
                return subregionKeywords.some(subregion => 
                  normalizedImgTag.includes(subregion as string) ||
                  normalizedImgTag === `location:${subregion}`
                );
              });
            });
            console.log(`Level 2 (subregion match): Found ${matchingImages.length} images`);
          }
          
          // Level 3: Country match if still no matches
          if (matchingImages.length === 0) {
            const countryKeywords = regionKeywords.map(kw => kw.split('-')[0]);
            matchingImages = allImages.filter(img => {
              return img.tags.some(imgTag => {
                const normalizedImgTag = imgTag.toLowerCase().replace(/\s+/g, '-');
                return countryKeywords.some(country => 
                  normalizedImgTag.includes(country)
                );
              });
            });
            console.log(`Level 3 (country match): Found ${matchingImages.length} images`);
          }
          
          // Filter out wrong regions to prevent mismatches
          const wrongRegionKeywords = [
            'scotland', 'highlands', 'scottish',
            'dolomites', 'italy', 'italian',
            'pyrenees', 'spain', 'spanish', 'france', 'french',
            'switzerland', 'swiss', 'alps',
            'norway', 'norwegian', 'lofoten',
            'iceland', 'icelandic'
          ];
          
          matchingImages = matchingImages.filter(img => {
            const hasWrongRegion = img.tags.some(imgTag => {
              const tag = imgTag.toLowerCase();
              return wrongRegionKeywords.some(wrongRegion => 
                tag.includes(wrongRegion) && !regionKeywords.some(kw => kw.includes(wrongRegion))
              );
            });
            return !hasWrongRegion;
          });
          
          console.log(`After filtering wrong regions: ${matchingImages.length} images`);
          
          if (matchingImages.length > 0) {
            image = matchingImages[Math.floor(Math.random() * matchingImages.length)];
            console.log('Selected region-matched image:', image.file_name, 'with tags:', image.tags);
          }
        }
        
        // Fallback to category/context if region matching didn't find anything
        if (!image) {
          if (regionKeywords.length === 0) {
            console.log('No region tags provided, using category/context fallback');
            image = await getRandomImage({ category, usage_context: usageContext });

            if (!image && category) {
              image = await getRandomImage({ category });
            }

            // Final generic fallback
            if (!image) {
              image = await getRandomImage({});
            }
          } else {
            // We had explicit region tags but found no matching images.
            // To avoid showing photos from the wrong region (e.g. Pyrenees for Dolomites),
            // we intentionally do NOT fall back to generic random images here.
            console.log('Region tags provided but no region-matched image found; skipping generic fallback to prevent cross-region mixups');
          }
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