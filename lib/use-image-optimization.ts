import { useCallback, useState } from 'react';

import { optimizeImage } from '@/lib/image-optimization';

export interface UseImageOptimizationOptions {
  /** Whether optimization is enabled */
  enabled: boolean;
  /** Output format */
  format: 'jpeg' | 'png' | 'webp' | 'avif' | 'gif';
  /** Quality (1-100) */
  quality: number;
  /** Maximum width */
  maxWidth: number;
  /** Maximum height */
  maxHeight: number;
}

export interface UseImageOptimizationResult {
  /** Whether optimization is in progress */
  isOptimizing: boolean;
  /** Original file size */
  originalSize: number | null;
  /** Optimized file size */
  optimizedSize: number | null;
  /** Compression ratio (0-1) */
  compressionRatio: number | null;
  /** Optimization error if any */
  error: string | null;
  /** Optimize a file */
  optimize: (file: File) => Promise<File | null>;
  /** Reset state */
  reset: () => void;
}

/**
 * Hook for client-side image optimization using Web APIs
 * Falls back to server-side optimization if needed
 */
export function useImageOptimization(
  options: UseImageOptimizationOptions,
): UseImageOptimizationResult {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [originalSize, setOriginalSize] = useState<number | null>(null);
  const [optimizedSize, setOptimizedSize] = useState<number | null>(null);
  const [compressionRatio, setCompressionRatio] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const optimize = useCallback(
    async (file: File): Promise<File | null> => {
      if (!options.enabled) {
        return file;
      }

      setIsOptimizing(true);
      setError(null);
      setOriginalSize(file.size);

      try {
        // Read the file as ArrayBuffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Use the optimization utility
        const result = await optimizeImage(buffer, {
          format: options.format,
          quality: options.quality,
          maxWidth: options.maxWidth,
          maxHeight: options.maxHeight,
          preserveAspectRatio: true,
          progressive: true,
        });

        setOptimizedSize(result.optimizedSize);
        setCompressionRatio(result.compressionRatio);

        // Convert base64 back to File
        const byteCharacters = atob(result.data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: result.contentType });

        // Create optimized file with appropriate extension
        const extension = result.contentType.split('/')[1];
        const optimizedFileName = file.name.replace(/\.[^/.]+$/, '') + `.${extension}`;

        return new File([blob], optimizedFileName, {
          type: result.contentType,
          lastModified: Date.now(),
        });
      } catch (err) {
        console.error('Optimization error:', err);
        setError('Failed to optimize image. Using original.');
        // Return original file on error
        return file;
      } finally {
        setIsOptimizing(false);
      }
    },
    [options.enabled, options.format, options.quality, options.maxWidth, options.maxHeight],
  );

  const reset = useCallback(() => {
    setOriginalSize(null);
    setOptimizedSize(null);
    setCompressionRatio(null);
    setError(null);
  }, []);

  return {
    isOptimizing,
    originalSize,
    optimizedSize,
    compressionRatio,
    error,
    optimize,
    reset,
  };
}

/**
 * Format bytes to human readable string
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Calculate expected savings
 */
export function calculateSavings(original: number, optimized: number): string {
  const savings = ((original - optimized) / original) * 100;
  return savings > 0 ? `${savings.toFixed(1)}% smaller` : 'No savings';
}
