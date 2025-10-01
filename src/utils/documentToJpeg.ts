/**
 * Converts various document formats (PDF, PNG, etc.) to JPEG
 * This ensures all certificate uploads are stored in a uniform format
 */

/**
 * Converts a PDF file to JPEG by rendering the first page
 */
async function pdfToJpeg(file: File): Promise<Blob> {
  return new Promise(async (resolve, reject) => {
    try {
      // Use PDF.js to render PDF to canvas
      const pdfjsLib = await import('pdfjs-dist');
      
      // Set worker source - use the bundled worker
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.min.mjs',
        import.meta.url
      ).toString();
      
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const page = await pdf.getPage(1); // Get first page
      
      // Calculate scale for high quality (max 2000px width)
      const viewport = page.getViewport({ scale: 1 });
      const scale = Math.min(2000 / viewport.width, 3); // Max 3x scale
      const scaledViewport = page.getViewport({ scale });
      
      // Create canvas
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Could not get canvas context');
      
      canvas.height = scaledViewport.height;
      canvas.width = scaledViewport.width;
      
      // Render PDF page to canvas
      await page.render({
        canvasContext: context,
        viewport: scaledViewport,
      } as any).promise;
      
      // Convert canvas to JPEG blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to convert canvas to blob'));
          }
        },
        'image/jpeg',
        0.92 // High quality JPEG
      );
    } catch (error) {
      console.error('Error converting PDF to JPEG:', error);
      reject(error);
    }
  });
}

/**
 * Converts any image format to JPEG
 */
async function imageToJpeg(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      
      // Calculate dimensions (max 2000px on longest side)
      let width = img.naturalWidth;
      let height = img.naturalHeight;
      const maxDimension = 2000;
      
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }
      
      // Create canvas and draw image
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      // Fill white background (for transparency)
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);
      
      // Draw image
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to JPEG
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to convert image to blob'));
          }
        },
        'image/jpeg',
        0.92 // High quality JPEG
      );
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    
    img.src = url;
  });
}

/**
 * Main conversion function - converts any supported file to JPEG
 */
export async function convertToJpeg(file: File): Promise<{ blob: Blob; fileName: string }> {
  const fileType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();
  
  console.log('Converting file to JPEG:', { name: file.name, type: fileType });
  
  try {
    let jpegBlob: Blob;
    
    // Handle PDF files
    if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      console.log('Converting PDF to JPEG...');
      jpegBlob = await pdfToJpeg(file);
    }
    // Handle image files
    else if (fileType.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif|bmp)$/i.test(fileName)) {
      console.log('Converting image to JPEG...');
      jpegBlob = await imageToJpeg(file);
    }
    // Unsupported format
    else {
      throw new Error(`Unsupported file format: ${fileType || fileName}`);
    }
    
    // Generate new filename with .jpg extension
    const originalName = file.name.replace(/\.[^/.]+$/, '');
    const newFileName = `${originalName}.jpg`;
    
    console.log('Conversion successful:', { originalSize: file.size, newSize: jpegBlob.size, newFileName });
    
    return {
      blob: jpegBlob,
      fileName: newFileName,
    };
  } catch (error) {
    console.error('Error in convertToJpeg:', error);
    throw error;
  }
}

/**
 * Check if a file needs conversion
 */
export function needsConversion(file: File): boolean {
  const fileType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();
  
  // Already a JPEG
  if ((fileType === 'image/jpeg' || fileType === 'image/jpg') && fileName.endsWith('.jpg')) {
    return false;
  }
  
  // Needs conversion
  return true;
}
