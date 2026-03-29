import { NextRequest, NextResponse } from 'next/server';
import { UTApi } from 'uploadthing/server';

// Sanitize user input for safe logging (prevents log injection attacks)
function sanitizeForLogging(value: unknown): string {
  if (typeof value === 'string') {
    // Remove or escape control characters that could inject malicious log entries
    return value.replace(/[\r\n\x00-\x1F\x7F]/g, (char) => {
      const code = char.charCodeAt(0);
      if (code < 16) return `\\x${code.toString(16).padStart(2, '0')}`;
      return `\\x${code.toString(16)}`;
    });
  }
  return String(value);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fileKey } = body;

    console.log('Delete API received fileKey:', sanitizeForLogging(fileKey));

    if (!fileKey) {
      return NextResponse.json({ error: 'File key is required' }, { status: 400 });
    }

    const utapi = new UTApi();
    console.log('Deleting file from UploadThing:', sanitizeForLogging(fileKey));
    await utapi.deleteFiles(fileKey);
    console.log('File deleted successfully');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
  }
}
