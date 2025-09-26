import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Image } from 'https://deno.land/x/imagescript@1.2.15/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ResizeOptions {
  width: number;
  height: number;
  quality: number;
}

const SIZE_PRESETS: Record<string, ResizeOptions> = {
  hero: { width: 1920, height: 1080, quality: 85 },
  landscape: { width: 800, height: 600, quality: 80 },
  hiking: { width: 800, height: 600, quality: 80 },
  portrait: { width: 400, height: 600, quality: 80 },
  detail: { width: 600, height: 400, quality: 85 },
  thumbnail: { width: 400, height: 300, quality: 75 },
};

async function resizeImage(
  imageBuffer: ArrayBuffer, 
  targetWidth: number, 
  targetHeight: number,
  quality: number = 80
): Promise<Uint8Array> {
  try {
    console.log(`Starting resize: ${targetWidth}x${targetHeight}, quality: ${quality}`);
    
    // Load the image
    const image = await Image.decode(new Uint8Array(imageBuffer));
    console.log(`Original image size: ${image.width}x${image.height}`);
    
    // Calculate aspect ratio preserving dimensions
    const aspectRatio = image.width / image.height;
    const targetAspectRatio = targetWidth / targetHeight;
    
    let newWidth = targetWidth;
    let newHeight = targetHeight;
    
    // If image is smaller than target, don't upscale
    if (image.width <= targetWidth && image.height <= targetHeight) {
      newWidth = image.width;
      newHeight = image.height;
      console.log('Image smaller than target, keeping original size');
    } else {
      // Preserve aspect ratio
      if (aspectRatio > targetAspectRatio) {
        // Image is wider, fit by width
        newHeight = Math.round(targetWidth / aspectRatio);
      } else {
        // Image is taller, fit by height  
        newWidth = Math.round(targetHeight * aspectRatio);
      }
    }
    
    console.log(`Resizing to: ${newWidth}x${newHeight}`);
    
    // Resize the image
    const resized = image.resize(newWidth, newHeight);
    
    // Encode as JPEG with quality setting
    const encoded = await resized.encodeJPEG(quality);
    
    console.log(`Resize complete. Original: ${imageBuffer.byteLength} bytes, New: ${encoded.length} bytes`);
    console.log(`Compression ratio: ${Math.round((1 - encoded.length / imageBuffer.byteLength) * 100)}%`);
    
    return encoded;
  } catch (error) {
    console.error('Error resizing image:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(`Image resize failed: ${errorMessage}`);
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (req.method !== 'POST') {
      return new Response('Method not allowed', { 
        status: 405, 
        headers: corsHeaders 
      });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const category = formData.get('category') as string;
    const customWidth = formData.get('width') as string;
    const customHeight = formData.get('height') as string;
    const customQuality = formData.get('quality') as string;

    if (!file) {
      return new Response('No file provided', { 
        status: 400, 
        headers: corsHeaders 
      });
    }

    console.log(`Processing file: ${file.name}, size: ${file.size} bytes, type: ${file.type}`);

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return new Response('Invalid file type. Only JPEG, PNG, and WebP are allowed.', {
        status: 400,
        headers: corsHeaders
      });
    }

    // Get resize options
    let resizeOptions: ResizeOptions;
    
    if (customWidth && customHeight) {
      // Use custom dimensions
      resizeOptions = {
        width: parseInt(customWidth),
        height: parseInt(customHeight),
        quality: customQuality ? parseInt(customQuality) : 80
      };
    } else if (category && SIZE_PRESETS[category]) {
      // Use category preset
      resizeOptions = SIZE_PRESETS[category];
    } else {
      // Default fallback
      resizeOptions = { width: 800, height: 600, quality: 80 };
    }

    console.log('Using resize options:', resizeOptions);

    // Convert file to ArrayBuffer
    const imageBuffer = await file.arrayBuffer();

    // Resize the image
    const optimizedImage = await resizeImage(
      imageBuffer,
      resizeOptions.width,
      resizeOptions.height,
      resizeOptions.quality
    );

    // Generate optimized filename
    const originalName = file.name.split('.')[0];
    const optimizedFilename = `${originalName}_optimized.jpg`;

    // Calculate size reduction
    const originalSize = file.size;
    const optimizedSize = optimizedImage.length;
    const compressionRatio = Math.round((1 - optimizedSize / originalSize) * 100);

    // Return the optimized image as binary data
    const arrayBuffer = new ArrayBuffer(optimizedImage.length);
    const view = new Uint8Array(arrayBuffer);
    view.set(optimizedImage);
    
    return new Response(arrayBuffer, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'image/jpeg',
        'X-Original-Size': originalSize.toString(),
        'X-Optimized-Size': optimizedSize.toString(),
        'X-Compression-Ratio': compressionRatio.toString(),
        'X-Optimized-Filename': optimizedFilename,
        'X-Dimensions-Width': resizeOptions.width.toString(),
        'X-Dimensions-Height': resizeOptions.height.toString(),
      },
    });

  } catch (error) {
    console.error('Error in optimize-image function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ 
        error: 'Failed to optimize image',
        details: errorMessage 
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});