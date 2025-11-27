import { supabase } from '@/integrations/supabase/client';

export interface ImageSEOMetadata {
  alt_text: string | null;
  description: string | null;
  tags: string[] | null;
}

/**
 * Fetches image metadata from website_images table by URL
 * Used for structured data and geographic tag extraction only
 * NOT for og:description or og:image:alt (use tour content for those)
 */
export async function getImageMetadataByUrl(imageUrl: string): Promise<ImageSEOMetadata | null> {
  if (!imageUrl) return null;

  try {
    // Extract file path from Supabase storage URL
    // Format: https://ohecxwxumzpfcfsokfkg.supabase.co/storage/v1/object/public/website-images/path/to/file.jpg
    const urlParts = imageUrl.split('/storage/v1/object/public/website-images/');
    if (urlParts.length < 2) return null;

    const filePath = urlParts[1];

    // Query website_images table
    const { data, error } = await supabase
      .from('website_images')
      .select('alt_text, description, tags')
      .eq('file_path', filePath)
      .maybeSingle();

    if (error) {
      console.error('Error fetching image metadata:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error parsing image URL:', error);
    return null;
  }
}

/**
 * Extracts geographic tags from image metadata
 * Useful for enhancing location-based SEO
 */
export function extractGeoTags(metadata: ImageSEOMetadata | null): string[] {
  if (!metadata?.tags) return [];

  const geoKeywords = ['scotland', 'dolomites', 'pyrenees', 'alps', 'highlands', 'mountains', 'peak', 'summit'];
  
  return metadata.tags.filter(tag => 
    geoKeywords.some(keyword => tag.toLowerCase().includes(keyword))
  );
}
