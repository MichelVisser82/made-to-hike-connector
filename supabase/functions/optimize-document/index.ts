import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Image } from "https://deno.land/x/imagescript@1.3.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OptimizeOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

const DOCUMENT_PRESETS: Record<string, OptimizeOptions> = {
  certificate: { maxWidth: 1200, maxHeight: 1600, quality: 80 },
  default: { maxWidth: 1200, maxHeight: 1600, quality: 80 },
};

/**
 * Optimize image documents (JPEG, PNG)
 */
async function optimizeImageDocument(
  imageBuffer: ArrayBuffer,
  options: OptimizeOptions
): Promise<Uint8Array> {
  const { maxWidth = 1200, maxHeight = 1600, quality = 80 } = options;
  
  console.log('Decoding image...');
  const image = await Image.decode(imageBuffer);
  
  let { width, height } = image;
  console.log(`Original dimensions: ${width}x${height}`);
  
  // Calculate new dimensions while preserving aspect ratio
  if (width > maxWidth || height > maxHeight) {
    const widthRatio = maxWidth / width;
    const heightRatio = maxHeight / height;
    const ratio = Math.min(widthRatio, heightRatio);
    
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
    
    console.log(`Resizing to: ${width}x${height}`);
    image.resize(width, height);
  }
  
  console.log(`Encoding with quality: ${quality}`);
  return await image.encodeJPEG(quality);
}

/**
 * Optimize PDF documents by compressing embedded images
 * Note: This is a simplified approach. For full PDF optimization,
 * consider using a dedicated PDF library
 */
async function optimizePDF(pdfBuffer: ArrayBuffer): Promise<Uint8Array> {
  console.log('Processing PDF...');
  // For now, return the original PDF as full PDF optimization
  // requires more complex libraries not available in Deno Deploy
  // In production, consider using external PDF optimization services
  return new Uint8Array(pdfBuffer);
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Received optimization request');
    
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const category = formData.get('category') as string || 'default';
    
    if (!file) {
      throw new Error('No file provided');
    }

    console.log(`Processing file: ${file.name} (${file.type}, ${file.size} bytes)`);
    
    const originalSize = file.size;
    const fileBuffer = await file.arrayBuffer();
    
    let optimizedBuffer: Uint8Array;
    let outputMimeType: string;
    
    // Determine file type and apply appropriate optimization
    if (file.type === 'application/pdf') {
      optimizedBuffer = await optimizePDF(fileBuffer);
      outputMimeType = 'application/pdf';
    } else if (file.type.startsWith('image/')) {
      const options = DOCUMENT_PRESETS[category] || DOCUMENT_PRESETS.default;
      optimizedBuffer = await optimizeImageDocument(fileBuffer, options);
      outputMimeType = 'image/jpeg';
    } else {
      throw new Error(`Unsupported file type: ${file.type}`);
    }
    
    const optimizedSize = optimizedBuffer.length;
    const compressionRatio = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);
    
    console.log(`Optimization complete: ${originalSize} -> ${optimizedSize} bytes (${compressionRatio}% reduction)`);
    
    return new Response(optimizedBuffer, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': outputMimeType,
        'X-Original-Size': originalSize.toString(),
        'X-Optimized-Size': optimizedSize.toString(),
        'X-Compression-Ratio': compressionRatio,
      },
    });
  } catch (error) {
    console.error('Optimization error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
