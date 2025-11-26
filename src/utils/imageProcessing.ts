import heic2any from 'heic2any';
import { gps } from 'exifr';
import { supabase } from '@/integrations/supabase/client';
import { convertToJpeg, needsConversion } from './documentToJpeg';

export interface GPSData {
  latitude: number;
  longitude: number;
}

export interface AIAnalysis {
  category: string;
  tags: string[];
  alt_text: string;
  description: string;
  usage_context: string[];
  priority: number;
  location?: string;
  gps?: GPSData;
}

export interface ImageMetadata {
  category: string;
  tags: string[];
  alt_text: string;
  description: string;
  usage_context: string[];
  priority: number;
}

/**
 * Convert HEIC image to JPEG format
 */
export const convertHEICToJPEG = async (file: File): Promise<File> => {
  if (file.type !== 'image/heic' && !file.name.toLowerCase().endsWith('.heic')) {
    return file;
  }
  
  try {
    const convertedBlob = await heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.8
    }) as Blob;
    
    return new File([convertedBlob], file.name.replace(/\.heic$/i, '.jpg'), {
      type: 'image/jpeg'
    });
  } catch (error) {
    console.error('HEIC conversion failed:', error);
    throw new Error('Failed to convert HEIC image');
  }
};

/**
 * Extract GPS data from image EXIF metadata
 */
export const extractGPSData = async (file: File): Promise<GPSData | null> => {
  try {
    const gpsData = await gps(file);
    if (gpsData && gpsData.latitude && gpsData.longitude) {
      return {
        latitude: gpsData.latitude,
        longitude: gpsData.longitude
      };
    }
  } catch (error) {
    console.error('GPS extraction failed:', error);
  }
  return null;
};

/**
 * Get location name from GPS coordinates in hierarchical format
 * Returns format: country-subregion (e.g., "scotland-highlands", "italy-dolomites")
 * Note: This is a simplified client-side fallback. The edge function uses database regions.
 */
export const getLocationFromGPS = (latitude: number, longitude: number): string => {
  const locations = [
    {
      name: 'scotland-highlands',
      bounds: { latMin: 56.0, latMax: 58.7, lngMin: -8.0, lngMax: -2.0 },
      center: { lat: 57.35, lng: -5.0 }
    },
    {
      name: 'italy-dolomites',
      bounds: { latMin: 46.0, latMax: 47.0, lngMin: 10.5, lngMax: 12.5 },
      center: { lat: 46.5, lng: 11.5 }
    },
    {
      name: 'spain-pyrenees',
      bounds: { latMin: 42.0, latMax: 43.5, lngMin: -2.0, lngMax: 3.5 },
      center: { lat: 42.75, lng: 0.75 }
    }
  ];

  for (const location of locations) {
    const { latMin, latMax, lngMin, lngMax } = location.bounds;
    if (latitude >= latMin && latitude <= latMax && longitude >= lngMin && longitude <= lngMax) {
      return location.name;
    }
  }

  let closestLocation = locations[0];
  let minDistance = Number.MAX_VALUE;

  for (const location of locations) {
    const distance = Math.sqrt(
      Math.pow(latitude - location.center.lat, 2) + 
      Math.pow(longitude - location.center.lng, 2)
    );
    if (distance < minDistance) {
      minDistance = distance;
      closestLocation = location;
    }
  }

  return closestLocation.name;
};

/**
 * Compress image based on category
 */
export const compressImageByCategory = (file: File, category: string): Promise<File> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      let { width, height } = img;
      
      const maxDimensions: Record<string, number> = {
        hero: 1920,
        landscape: 1600,
        hiking: 1200,
        portrait: 800,
        detail: 800,
        equipment: 600,
        nature: 1200,
        mountains: 1600,
        trails: 1200,
        adventure: 1200,
        tour: 1600,
        portfolio: 1200
      };
      
      const maxDimension = maxDimensions[category] || 1200;
      
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = (height * maxDimension) / width;
          width = maxDimension;
        } else {
          width = (width * maxDimension) / height;
          height = maxDimension;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      ctx?.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Image compression failed'));
          return;
        }
        
        const compressedFile = new File([blob], file.name, {
          type: 'image/jpeg',
          lastModified: Date.now()
        });
        
        resolve(compressedFile);
      }, 'image/jpeg', 0.85);
    };
    
    img.onerror = () => reject(new Error('Image loading failed'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Convert file to base64 string
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
};

/**
 * Analyze image with AI to get metadata suggestions
 */
export const analyzeImageWithAI = async (
  file: File,
  gpsData?: GPSData | null
): Promise<AIAnalysis | null> => {
  try {
    const compressedFile = await compressImageByCategory(file, 'tour');
    const base64 = await fileToBase64(compressedFile);
    
    const { data, error } = await supabase.functions.invoke('analyze-image-metadata', {
      body: {
        imageBase64: base64,
        filename: file.name,
        gpsData: gpsData || undefined
      }
    });

    if (error) throw error;

    const suggestions = data.suggestions;
    const aiLocation = suggestions.location || 
                       (suggestions.gps?.location) || 
                       (gpsData && getLocationFromGPS(gpsData.latitude, gpsData.longitude));
    
    const cleanTags = suggestions.tags.filter((tag: string) => !tag.startsWith('location:'));
    
    return {
      ...suggestions,
      tags: cleanTags,
      location: aiLocation,
      gps: suggestions.gps || gpsData
    };
  } catch (error) {
    console.error('AI analysis error:', error);
    return null;
  }
};

/**
 * Optimize document (image or PDF) using edge function
 */
export const optimizeDocument = async (
  file: File,
  category: string = 'certificate'
): Promise<File> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    
    const { data, error } = await supabase.functions.invoke('optimize-document', {
      body: formData,
    });

    if (error) throw error;

    // Convert response to File object
    const optimizedBlob = new Blob([data], { 
      type: file.type === 'application/pdf' ? 'application/pdf' : 'image/jpeg' 
    });
    
    const optimizedFile = new File(
      [optimizedBlob], 
      file.name.replace(/\.[^.]+$/, file.type === 'application/pdf' ? '.pdf' : '.jpg'),
      { type: optimizedBlob.type }
    );
    
    return optimizedFile;
  } catch (error) {
    console.error('Document optimization failed, using original:', error);
    return file;
  }
};

/**
 * Upload document to guide-documents storage bucket
 * All files are automatically converted to JPEG for uniform handling
 */
export const uploadCertificateDocument = async (
  file: File,
  userId: string,
  optimize: boolean = true
): Promise<string> => {
  try {
    // Convert all documents to JPEG format
    const { blob: jpegBlob, fileName: jpegFileName } = await convertToJpeg(file);
    
    // Create File object from blob
    const jpegFile = new File([jpegBlob], jpegFileName, { type: 'image/jpeg' });
    
    // Generate unique filename
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const fileName = `cert-${timestamp}-${random}.jpg`;
    const filePath = `${userId}/certificates/${fileName}`;
    
    // Upload to Supabase storage
    const { error: uploadError } = await supabase.storage
      .from('guide-documents')
      .upload(filePath, jpegFile, {
        contentType: 'image/jpeg',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

    return filePath;
  } catch (error) {
    console.error('Certificate upload failed:', error);
    throw error;
  }
};

/**
 * Get public URL for document in guide-documents bucket
 */
export const getCertificateDocumentUrl = (filePath: string): string => {
  const { data } = supabase.storage
    .from('guide-documents')
    .getPublicUrl(filePath);
  
  return data.publicUrl;
};

/**
 * Upload image to website_images table with metadata
 */
export const uploadToWebsiteImages = async (
  file: File,
  metadata: ImageMetadata,
  optimize: boolean = true
): Promise<string> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const finalFile = optimize 
    ? await compressImageByCategory(file, metadata.category)
    : file;

  const fileExt = finalFile.name.split('.').pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const bucket = metadata.category === 'hero' ? 'hero-images' : 
                 metadata.category === 'portfolio' ? 'tour-images' : 
                 'tour-images';
  const filePath = `guides/${user.id}/${metadata.category}/${fileName}`;
  
  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, finalFile);

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  const { error: dbError } = await supabase
    .from('website_images')
    .insert({
      file_name: finalFile.name,
      file_path: filePath,
      bucket_id: bucket,
      category: metadata.category,
      uploaded_by: user.id,
      usage_context: metadata.usage_context,
      alt_text: metadata.alt_text,
      description: metadata.description,
      tags: metadata.tags,
      priority: metadata.priority,
      is_active: true,
    });

  if (dbError) throw dbError;

  return publicUrl;
};
