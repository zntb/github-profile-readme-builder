/**
 * Image optimization utilities
 * Uses browser Canvas API for client-side image processing
 */

// Re-export types for consistency
export interface ImageOptimizationOptions {
  format?: 'jpeg' | 'png' | 'webp' | 'avif' | 'gif';
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
  preserveAspectRatio?: boolean;
  progressive?: boolean;
}

export interface ImageOptimizationResult {
  data: string;
  contentType: string;
  originalSize: number;
  optimizedSize: number;
  compressionRatio: number;
  width: number;
  height: number;
}

/**
 * Default optimization options
 */
const DEFAULT_OPTIONS: Required<ImageOptimizationOptions> = {
  format: 'webp',
  quality: 80,
  maxWidth: 1200,
  maxHeight: 1200,
  preserveAspectRatio: true,
  progressive: true,
};

/**
 * Client-side image optimization using Canvas API
 * Works with both Buffer and ArrayBuffer
 */
export async function optimizeImage(
  inputBuffer: ArrayBuffer | Buffer,
  options: ImageOptimizationOptions = {},
): Promise<ImageOptimizationResult> {
  const config = { ...DEFAULT_OPTIONS, ...options };

  // Get the array buffer - use type assertion for Node.js Buffer compatibility
  const arrayBuffer =
    inputBuffer instanceof Buffer
      ? inputBuffer.buffer.slice(
          inputBuffer.byteOffset,
          inputBuffer.byteOffset + inputBuffer.byteLength,
        )
      : inputBuffer;

  const originalSize = arrayBuffer.byteLength;

  return new Promise((resolve, reject) => {
    // Use type assertion to ensure browser compatibility
    const blob = new Blob([arrayBuffer as ArrayBuffer]);
    const imageUrl = URL.createObjectURL(blob);

    const img = new window.Image();
    img.onload = () => {
      URL.revokeObjectURL(imageUrl);

      // Calculate new dimensions
      let width = img.width;
      let height = img.height;

      if (config.maxWidth && width > config.maxWidth) {
        const ratio = config.maxWidth / width;
        width = config.maxWidth;
        if (config.preserveAspectRatio) {
          height = Math.round(height * ratio);
        }
      }

      if (config.maxHeight && height > config.maxHeight) {
        const ratio = config.maxHeight / height;
        height = config.maxHeight;
        if (config.preserveAspectRatio) {
          width = Math.round(width * ratio);
        }
      }

      // Use canvas to resize and convert
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Draw the image resized
      ctx.drawImage(img, 0, 0, width, height);

      // Determine format and quality
      let mimeType: string;
      const quality = config.quality / 100;

      switch (config.format) {
        case 'jpeg':
          mimeType = 'image/jpeg';
          break;
        case 'png':
          mimeType = 'image/png';
          break;
        case 'gif':
          mimeType = 'image/gif';
          break;
        case 'avif':
          mimeType = 'image/avif';
          break;
        default:
          mimeType = 'image/webp';
      }

      // Convert to blob
      canvas.toBlob(
        (outputBlob) => {
          if (!outputBlob) {
            reject(new Error('Failed to create output blob'));
            return;
          }

          const reader = new FileReader();
          reader.onload = () => {
            const base64 = (reader.result as string).split(',')[1];
            const optimizedSize = outputBlob.size;

            resolve({
              data: base64,
              contentType: mimeType,
              originalSize,
              optimizedSize,
              compressionRatio: optimizedSize / originalSize,
              width,
              height,
            });
          };
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(outputBlob);
        },
        mimeType,
        quality,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(imageUrl);
      reject(new Error('Failed to load image'));
    };

    img.src = imageUrl;
  });
}

/**
 * Check if an image needs optimization
 */
export async function needsOptimization(
  buffer: ArrayBuffer | Buffer,
  maxSizeInBytes: number = 500 * 1024,
): Promise<boolean> {
  const size = buffer instanceof Buffer ? buffer.byteLength : buffer.byteLength;
  return size > maxSizeInBytes;
}

/**
 * Get recommended optimization settings based on image size
 */
export async function getRecommendedOptions(
  buffer: ArrayBuffer | Buffer,
): Promise<ImageOptimizationOptions> {
  const size = buffer instanceof Buffer ? buffer.byteLength : buffer.byteLength;

  // Large images get aggressive compression
  if (size > 2 * 1024 * 1024) {
    return {
      format: 'webp',
      quality: 70,
      maxWidth: 1200,
      maxHeight: 1200,
    };
  }

  // Medium images get standard compression
  if (size > 500 * 1024) {
    return {
      format: 'webp',
      quality: 80,
      maxWidth: 1000,
      maxHeight: 1000,
    };
  }

  // Small images get light optimization
  return {
    format: 'webp',
    quality: 85,
    maxWidth: 800,
    maxHeight: 800,
  };
}

/**
 * Supported image formats
 */
export const SUPPORTED_FORMATS = [
  { value: 'webp', label: 'WebP (Recommended)', description: 'Best balance of quality and size' },
  { value: 'jpeg', label: 'JPEG', description: 'Good for photos' },
  { value: 'png', label: 'PNG', description: 'Best for transparency' },
  { value: 'avif', label: 'AVIF', description: 'Best compression, newer format' },
  { value: 'gif', label: 'GIF', description: 'For animations' },
] as const;

/**
 * Quality presets
 */
export const QUALITY_PRESETS = [
  { value: 60, label: 'Low (60%)', description: 'Smallest file size' },
  { value: 75, label: 'Medium (75%)', description: 'Balanced' },
  { value: 80, label: 'Standard (80%)', description: 'Recommended' },
  { value: 90, label: 'High (90%)', description: 'Best quality' },
] as const;

/**
 * Size presets
 */
export const SIZE_PRESETS = [
  {
    value: { maxWidth: 400, maxHeight: 400 },
    label: 'Small (400px)',
    description: 'Avatars, icons',
  },
  {
    value: { maxWidth: 800, maxHeight: 800 },
    label: 'Medium (800px)',
    description: 'Social media',
  },
  {
    value: { maxWidth: 1200, maxHeight: 1200 },
    label: 'Large (1200px)',
    description: 'Standard images',
  },
  {
    value: { maxWidth: 1920, maxHeight: 1920 },
    label: 'Extra Large (1920px)',
    description: 'Full width',
  },
] as const;
