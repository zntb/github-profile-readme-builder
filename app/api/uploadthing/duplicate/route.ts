import { NextRequest, NextResponse } from 'next/server';
import { UTApi } from 'uploadthing/server';

// Allowed hosts for SSRF protection - only allow UploadThing domains
const ALLOWED_HOSTS = ['utfs.io', 'ufs.sh', 'uploadthing.com'];

function isUrlAllowed(url: URL): boolean {
  const hostname = url.hostname.toLowerCase().replace(/\.$/, '');

  // Check if hostname is in allowed list
  if (ALLOWED_HOSTS.includes(hostname)) {
    return true;
  }

  // Check if hostname ends with an allowed domain
  return ALLOWED_HOSTS.some((allowedHost) => hostname.endsWith(`.${allowedHost}`));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sourceUrl, customFileName } = body;

    if (!sourceUrl) {
      return NextResponse.json({ error: 'Source URL is required' }, { status: 400 });
    }

    console.log('Duplicate API received:', { sourceUrl, customFileName });

    // Validate and restrict the source URL to mitigate SSRF
    let validatedUrl: URL;
    try {
      validatedUrl = new URL(sourceUrl);
    } catch {
      return NextResponse.json({ error: 'Invalid source URL format' }, { status: 400 });
    }

    // Only allow http and https protocols
    if (validatedUrl.protocol !== 'http:' && validatedUrl.protocol !== 'https:') {
      return NextResponse.json(
        { error: 'Only HTTP and HTTPS protocols are allowed' },
        { status: 400 },
      );
    }

    // Check if the hostname is allowed
    if (!isUrlAllowed(validatedUrl)) {
      return NextResponse.json({ error: 'Source URL host is not allowed' }, { status: 400 });
    }

    const utapi = new UTApi({ token: process.env.UPLOADTHING_TOKEN });

    // Download the source image
    console.log('Downloading source image from:', validatedUrl.toString());
    const response = await fetch(validatedUrl.toString());
    console.log('Download response status:', response.status, response.statusText);
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to download source image' }, { status: 500 });
    }

    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Determine content type from the source URL or response
    const contentType = response.headers.get('content-type') || 'image/png';

    // Generate filename - use custom filename or derive from source
    let fileName = customFileName;
    if (!fileName) {
      // Try to extract filename from URL
      const urlParts = sourceUrl.split('/');
      const lastPart = urlParts[urlParts.length - 1];
      // Remove any query strings or file keys
      const originalName = lastPart.includes('?') ? lastPart.split('?')[0] : lastPart;
      // Remove the file key prefix if present (uploadthing uses 'f' prefix)
      const nameParts = originalName.split('-');
      if (nameParts.length > 1 && nameParts[0] === 'f') {
        fileName = nameParts.slice(1).join('-');
      } else {
        fileName = originalName;
      }
    }

    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const uniqueFileName = `${fileName.replace(/\.[^/.]+$/, '')}-${timestamp}`;

    // Create a File object from the buffer
    const file = new File([uint8Array], uniqueFileName, {
      type: contentType,
      lastModified: Date.now(),
    });

    // Upload the duplicated file
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = await utapi.uploadFiles(file);

    // Check if result has the expected structure (result.data contains UploadedFileData with 'key' property)
    if (result && result.data && 'key' in result.data && 'ufsUrl' in result.data) {
      return NextResponse.json({
        success: true,
        url: result.data.ufsUrl,
        fileKey: result.data.key,
      });
    }

    // If we got here, the upload might have failed or returned an error
    console.error('Unexpected upload result:', result);
    return NextResponse.json(
      { error: 'Failed to upload duplicated image', details: result },
      { status: 500 },
    );
  } catch (error) {
    console.error('Error duplicating file:', error);
    return NextResponse.json({ error: 'Failed to duplicate file' }, { status: 500 });
  }
}
