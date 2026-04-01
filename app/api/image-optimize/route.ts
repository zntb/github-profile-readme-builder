import { NextRequest, NextResponse } from 'next/server';

import { ImageOptimizationOptions, optimizeImage } from '@/lib/image-optimization';

/**
 * POST handler for image optimization
 * Accepts an image file and optimization options, returns optimized image
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Parse optimization options from form data
    const options: ImageOptimizationOptions = {
      format: (formData.get('format') as ImageOptimizationOptions['format']) || 'webp',
      quality: formData.get('quality') ? parseInt(formData.get('quality') as string) : 80,
      maxWidth: formData.get('maxWidth') ? parseInt(formData.get('maxWidth') as string) : 1200,
      maxHeight: formData.get('maxHeight') ? parseInt(formData.get('maxHeight') as string) : 1200,
      preserveAspectRatio: formData.get('preserveAspectRatio') !== 'false',
      progressive: formData.get('progressive') !== 'false',
    };

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Check file size (max 10MB)
    if (buffer.length > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 });
    }

    // Validate file type
    const validTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/bmp',
      'image/tiff',
    ];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Supported: JPEG, PNG, GIF, WebP, BMP, TIFF' },
        { status: 400 },
      );
    }

    // Optimize the image
    const result = await optimizeImage(buffer, options);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Image optimization error:', error);
    return NextResponse.json({ error: 'Failed to optimize image' }, { status: 500 });
  }
}

/**
 * GET handler - returns supported formats and options
 */
export async function GET() {
  return NextResponse.json({
    supportedFormats: [
      { value: 'webp', label: 'WebP', description: 'Best balance of quality and size' },
      { value: 'jpeg', label: 'JPEG', description: 'Good for photos' },
      { value: 'png', label: 'PNG', description: 'Best for transparency' },
      { value: 'avif', label: 'AVIF', description: 'Best compression, newer format' },
    ],
    qualityRange: { min: 60, max: 100, default: 80 },
    sizeLimits: { maxWidth: 4000, maxHeight: 4000, default: 1200 },
  });
}
