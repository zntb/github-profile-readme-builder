import { NextRequest, NextResponse } from 'next/server';
import { UTApi } from 'uploadthing/server';

// Allowed hosts for SSRF protection - only allow UploadThing domains
const ALLOWED_HOSTS = ['utfs.io', 'ufs.sh', 'uploadthing.com'];

// Private IP ranges to block (SSRF protection)
const PRIVATE_IP_RANGES = [
  // 127.0.0.0/8 (loopback)
  /^127\./,
  // 10.0.0.0/8
  /^10\./,
  // 172.16.0.0/12
  /^172\.(1[6-9]|2\d|3[01])\./,
  // 192.168.0.0/16
  /^192\.168\./,
  // 169.254.0.0/16 (link-local)
  /^169\.254\./,
  // 0.0.0.0/8
  /^0\./,
  // 100.64.0.0/10 (carrier-grade NAT)
  /^100\.(6[4-9]|[7-9]\d|1[0-1]\d|12[0-7])\./,
  // 192.0.0.0/24 (IETF Protocol Assignments)
  /^192\.0\.0\./,
  // 192.0.2.0/24 (TEST-NET-1)
  /^192\.0\.2\./,
  // 198.51.100.0/24 (TEST-NET-2)
  /^198\.51\.100\./,
  // 203.0.113.0/24 (TEST-NET-3)
  /^203\.0\.113\./,
  // 224.0.0.0/4 (multicast)
  /^2[2-4]\d\./,
  // 240.0.0.0/4 (reserved)
  /^2[4-5]\d\./,
];

// Reserved/broadcast addresses
const RESERVED_HOSTNAMES = [
  'localhost',
  'localhost.localdomain',
  'broadcasthost',
  'metadata.google.internal',
  'metadata.google',
];

function isPrivateIP(ip: string): boolean {
  return PRIVATE_IP_RANGES.some((pattern) => pattern.test(ip));
}

function isHostnameBlocked(hostname: string): boolean {
  const lowerHostname = hostname.toLowerCase();

  // Check reserved hostnames
  if (RESERVED_HOSTNAMES.includes(lowerHostname)) {
    return true;
  }

  // Check if it's an IP address (IPv4)
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (ipv4Regex.test(hostname)) {
    return isPrivateIP(hostname);
  }

  // Check for localhost variants in domain
  if (lowerHostname.includes('localhost') || lowerHostname === 'local') {
    return true;
  }

  return false;
}

function isUrlAllowed(url: URL): boolean {
  const hostname = url.hostname.toLowerCase().replace(/\.$/, '');

  // First, check if hostname is blocked (private IP or reserved)
  if (isHostnameBlocked(hostname)) {
    return false;
  }

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

    // Create a new sanitized URL string after all validation
    // This ensures CodeQL sees the validated value being used
    const sanitizedUrl = validatedUrl.toString();

    const utapi = new UTApi({ token: process.env.UPLOADTHING_TOKEN });

    // Download the source image using the sanitized URL
    console.log('Downloading source image from:', sanitizedUrl);
    const response = await fetch(sanitizedUrl);
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
      // Use validated URL to extract filename (not the raw sourceUrl to avoid SSRF bypass)
      const urlPath = validatedUrl.pathname;
      const pathParts = urlPath.split('/').filter(Boolean);
      const lastPart = pathParts[pathParts.length - 1] || '';
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
